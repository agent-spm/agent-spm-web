import { NextResponse } from "next/server";

/**
 * Disabled development auth bypass endpoint.
 * All GitHub authentication must flow through Supabase PKCE OAuth -> /auth/callback.
 */
export async function GET() {
  return NextResponse.json(
    { error: "This bypass endpoint has been removed. Please authenticate via GitHub OAuth on /login or /signup." },
    { status: 410 }
  );
}
