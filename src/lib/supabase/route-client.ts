import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export function createSupabaseRouteClient(request: Request, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pbcnraifbapghtcavwqs.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookieHeader = request.headers.get("cookie") || "";
          return cookieHeader
            .split(";")
            .map((c) => c.trim())
            .filter(Boolean)
            .map((c) => {
              const eqIdx = c.indexOf("=");
              const name = eqIdx > -1 ? c.slice(0, eqIdx) : c;
              const value = eqIdx > -1 ? c.slice(eqIdx + 1) : "";
              return { name, value };
            });
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );
}
