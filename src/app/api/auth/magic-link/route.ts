import { NextResponse } from "next/server";

/**
 * Disabled unauthenticated admin magic-link generator.
 * Existing-user verification codes are handled cleanly by /api/auth/otp/send.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Magic-link minting endpoint retired. Use /api/auth/otp/send on /login." },
    { status: 410 }
  );
}
