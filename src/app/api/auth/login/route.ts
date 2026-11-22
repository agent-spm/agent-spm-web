import { NextResponse } from "next/server";

/**
 * Disabled legacy password bypass endpoint.
 * Authentication uses Supabase Auth flows (/login -> GitHub OAuth, existing-user OTP, or Enterprise SAML SSO).
 */
export async function POST() {
  return NextResponse.json(
    { error: "This endpoint has been retired. Please sign in via /login." },
    { status: 410 }
  );
}
