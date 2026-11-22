import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { user, supabaseResponse } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Preserve refreshed auth cookies, attributes, and anti-cache headers on redirect
  const redirectWithCookies = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c);
    });
    for (const headerName of ["cache-control", "expires", "pragma"]) {
      const headerVal = supabaseResponse.headers.get(headerName);
      if (headerVal) {
        redirectResponse.headers.set(headerName, headerVal);
      }
    }
    return redirectResponse;
  };

  // Protect /app and subroutes
  if (pathname.startsWith("/app")) {
    if (!user) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return redirectWithCookies(redirectUrl);
    }
  }

  // Protect /admin routes - only for authorized superadmin emails
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return redirectWithCookies(redirectUrl);
    }

    const adminEmails = (process.env.SUPERADMIN_EMAILS || "lakshitsoni26@gmail.com")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const isSuperAdmin = Boolean(user.email && adminEmails.includes(user.email.toLowerCase()));
    if (!isSuperAdmin) {
      const redirectUrl = new URL("/app", request.url);
      return redirectWithCookies(redirectUrl);
    }
  }

  // If already logged in, redirect away from /login and /signup (block protocol-relative open redirects)
  if ((pathname === "/login" || pathname === "/signup") && user) {
    const rawRedirect = request.nextUrl.searchParams.get("redirect") || "/app";
    const safeRedirect =
      rawRedirect.startsWith("/") &&
      !rawRedirect.startsWith("//") &&
      !rawRedirect.startsWith("/\\")
        ? rawRedirect
        : "/app";

    if (safeRedirect !== "/login" && safeRedirect !== "/signup") {
      const redirectUrl = new URL(safeRedirect, request.url);
      return redirectWithCookies(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
