import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { findAuthUserByEmail } from "@/lib/auth/server-auth";
import { getClientIp, otpSendLimiter } from "@/lib/security/rate-limit";
import crypto from "crypto";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!otpSendLimiter.check(`ip:${ip}`)) {
      return NextResponse.json(
        { error: "Too many verification code requests. Please wait a few minutes and try again." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { email, token } = body;

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!otpSendLimiter.check(`email:${cleanEmail}`)) {
      return NextResponse.json(
        { error: "Too many codes requested for this email. Please wait 5 minutes before requesting another." },
        { status: 429 }
      );
    }

    const adminSupabase = getSupabaseServiceClient();

    // Enforce GitHub-only new account registration:
    // OTP login is strictly allowed ONLY for existing registered accounts OR valid matching org invitations.
    let isAllowed = false;

    const { data: existingPubUser } = await adminSupabase
      .from("users")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingPubUser) {
      isAllowed = true;
    } else if (token && typeof token === "string") {
      const { data: inviteRow } = await adminSupabase
        .from("pending_invites")
        .select("id, email")
        .eq("token", token.trim())
        .maybeSingle();

      if (inviteRow && inviteRow.email?.toLowerCase().trim() === cleanEmail) {
        isAllowed = true;
      }
    }

    // Fallback paginated check against auth.users in case user exists in Auth without public.users row
    if (!isAllowed) {
      const authExists = await findAuthUserByEmail(adminSupabase, cleanEmail);
      if (authExists) {
        isAllowed = true;
      }
    }

    if (!isAllowed) {
      return NextResponse.json(
        {
          error:
            "No existing account found for this email. New accounts must sign up via GitHub to verify your developer identity.",
        },
        { status: 403 }
      );
    }

    // Generate cryptographically random 6-digit numeric OTP code
    const code = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await adminSupabase.from("email_otps").delete().eq("email", cleanEmail);

    const { error: insertError } = await adminSupabase.from("email_otps").insert({
      email: cleanEmail,
      code,
      expires_at: expiresAt,
    });

    if (insertError) {
      console.error("[OTP Send] DB insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to generate verification code. Please try again." },
        { status: 500 }
      );
    }

    // Dispatch exclusively via Resend (verified against public.email_otps in /api/auth/otp/verify)
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Agent SPM <onboarding@resend.dev>";
    if (!resendApiKey) {
      return NextResponse.json(
        { error: "Email delivery service is not configured. Please use GitHub login." },
        { status: 503 }
      );
    }

    try {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [cleanEmail],
          subject: `${code} is your Agent SPM verification code`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; border: 1px solid #eaeaea; border-radius: 12px; background: #ffffff;">
              <div style="margin-bottom: 24px;">
                <span style="font-size: 16px; font-weight: bold; color: #000; letter-spacing: -0.5px;">Agent SPM</span>
              </div>
              <h2 style="color: #000; font-size: 22px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.5px;">Sign in to Agent SPM</h2>
              <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0 0 24px 0;">
                Enter this 6-digit verification code to authenticate your Agent SPM session.
              </p>
              <div style="background: #f5f5f7; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <span style="font-family: monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1B5FED;">
                  ${code}
                </span>
              </div>
              <p style="color: #888; font-size: 12px; margin: 0; line-height: 1.4;">
                This code will expire in 10 minutes. If you did not request this email, no further action is required.
              </p>
            </div>
          `,
        }),
      });

      if (!resendRes.ok) {
        const resendErr = await resendRes.json().catch(() => ({}));
        console.warn("[Resend] Outbound failure:", resendRes.status, resendErr);
        return NextResponse.json(
          {
            error:
              (typeof resendErr?.message === "string" && resendErr.message) ||
              "Failed to deliver verification email. Please use Continue with GitHub.",
          },
          { status: resendRes.status === 403 ? 503 : 502 }
        );
      }
    } catch (err) {
      console.warn("[Resend] Outbound fetch error:", err);
      return NextResponse.json(
        { error: "Unable to reach email delivery service. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "6-digit verification code sent to your email.",
    });
  } catch (err: unknown) {
    console.error("[OTP Send] Exception:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send verification code." },
      { status: 500 }
    );
  }
}
