import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route-client";
import { getTrustedOrigin } from "@/lib/security/sanitize";

function purgeAuthCookies(request: NextRequest, response: NextResponse) {
  const allCookies = request.cookies.getAll();
  for (const cookie of allCookies) {
    if (
      cookie.name.startsWith("sb-") ||
      cookie.name.includes("-auth-token") ||
      cookie.name.startsWith("spm_")
    ) {
      try {
        response.cookies.delete(cookie.name);
      } catch (e) {
        // ignore
      }
      response.cookies.set(cookie.name, "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }
  }
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true, redirectUrl: "/login" });
  const supabase = createSupabaseRouteClient(request, response);

  try {
    await supabase.auth.signOut({ scope: "global" });
  } catch (e) {
    console.warn("[Auth Logout] signOut error:", e);
  }

  purgeAuthCookies(request, response);
  return response;
}

export async function GET(request: NextRequest) {
  const trustedOrigin = getTrustedOrigin(request);
  // Reject cross-site GET logout attempts (e.g. embedded <img> CSRF)
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.redirect(`${trustedOrigin}/app`);
  }
  const response = NextResponse.redirect(`${trustedOrigin}/login`);
  const supabase = createSupabaseRouteClient(request, response);

  try {
    await supabase.auth.signOut({ scope: "global" });
  } catch (e) {
    console.warn("[Auth Logout] signOut error:", e);
  }

  purgeAuthCookies(request, response);
  return response;
}
