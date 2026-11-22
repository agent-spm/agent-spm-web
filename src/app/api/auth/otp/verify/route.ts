import { NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route-client";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { findAuthUserByEmail, isSuperAdminEmail } from "@/lib/auth/server-auth";
import { getClientIp, otpVerifyLimiter } from "@/lib/security/rate-limit";
import crypto from "crypto";

function constantTimeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!otpVerifyLimiter.check(`ip:${ip}`)) {
      return NextResponse.json(
        { error: "Too many failed verification attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { email, code, orgName, scope, token } = body;

    if (!email || !code || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email and 6-digit verification code are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.toString().trim();

    if (!/^\d{6}$/.test(cleanCode)) {
      return NextResponse.json(
        { error: "Verification code must be a valid 6-digit number." },
        { status: 400 }
      );
    }

    const emailLimiterKey = `email:${cleanEmail}`;
    if (!otpVerifyLimiter.check(emailLimiterKey)) {
      const adminSupabase = getSupabaseServiceClient();
      await adminSupabase.from("email_otps").delete().eq("email", cleanEmail);
      return NextResponse.json(
        { error: "Maximum verification attempts exceeded. Please request a new code." },
        { status: 429 }
      );
    }

    const isSuperAdmin = isSuperAdminEmail(cleanEmail);
    const redirectUrl = isSuperAdmin ? "/admin" : "/app";
    const adminSupabase = getSupabaseServiceClient();

    // Block arbitrary workspace/scope creation without an invite token
    if (!token && (orgName || scope)) {
      return NextResponse.json(
        {
          error:
            "New developer namespaces (@namespace) must be verified via GitHub. Please sign up with GitHub to create your account.",
        },
        { status: 403 }
      );
    }

    // 1. Fetch active OTP from public.email_otps
    const { data: validRows } = await adminSupabase
      .from("email_otps")
      .select("id, code")
      .eq("email", cleanEmail)
      .gt("expires_at", new Date().toISOString())
      .limit(1);

    const activeOtp = validRows && validRows.length > 0 ? validRows[0] : null;
    const isValid = Boolean(activeOtp && constantTimeCompare(activeOtp.code, cleanCode));

    if (!isValid) {
      if (otpVerifyLimiter.remaining(emailLimiterKey) === 0) {
        await adminSupabase.from("email_otps").delete().eq("email", cleanEmail);
      }
      return NextResponse.json(
        { error: "Invalid or expired verification code. Please check your email or request a new code." },
        { status: 400 }
      );
    }

    // 2. Single-use invalidation + reset verify limiter
    await adminSupabase.from("email_otps").delete().eq("email", cleanEmail);
    otpVerifyLimiter.reset(emailLimiterKey);

    // 3. If token is present, validate invitation and enforce exact invited email match
    let verifiedInvite: { id: string; org_id: string; role: string; email: string } | null = null;
    if (token && typeof token === "string") {
      const { data: inviteRow } = await adminSupabase
        .from("pending_invites")
        .select("id, org_id, role, email")
        .eq("token", token.trim())
        .maybeSingle();

      if (!inviteRow || inviteRow.email.toLowerCase().trim() !== cleanEmail) {
        return NextResponse.json(
          { error: "Invalid or mismatched invitation token for this email address." },
          { status: 403 }
        );
      }
      verifiedInvite = inviteRow;
    }

    // 4. Resolve existing user in auth.users via paginated lookup
    let authUser = await findAuthUserByEmail(adminSupabase, cleanEmail);

    // Enforce GitHub-only signup: do NOT create brand-new uninvited users via raw OTP!
    if (!authUser) {
      if (!verifiedInvite) {
        return NextResponse.json(
          {
            error:
              "New account registration requires GitHub authentication. Please sign up with GitHub first.",
          },
          { status: 403 }
        );
      }

      const { data: created, error: createErr } = await adminSupabase.auth.admin.createUser({
        email: cleanEmail,
        email_confirm: true,
        user_metadata: {
          full_name: cleanEmail.split("@")[0],
          user_name: cleanEmail.split("@")[0],
          invited_only: "true",
        },
      });
      if (createErr || !created?.user) {
        return NextResponse.json(
          { error: createErr?.message || "Failed to provision invited member." },
          { status: 500 }
        );
      }
      authUser = created.user;
    }

    // 5. Resolve or create public.users row
    let publicUserId: string;
    const { data: existingPublicUser } = await adminSupabase
      .from("users")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingPublicUser) {
      publicUserId = existingPublicUser.id;
    } else {
      const { data: newPubUser, error: pubInsertError } = await adminSupabase
        .from("users")
        .insert({
          supabase_uid: authUser.id,
          email: cleanEmail,
          display_name: authUser.user_metadata?.full_name || cleanEmail.split("@")[0],
          role: isSuperAdmin ? "superadmin" : "user",
        })
        .select("id")
        .single();

      if (pubInsertError || !newPubUser) {
        return NextResponse.json(
          { error: "Failed to resolve user directory record." },
          { status: 500 }
        );
      }
      publicUserId = newPubUser.id;
    }

    // 6. Bind verified team invitation membership
    if (verifiedInvite) {
      await adminSupabase.from("organization_members").upsert(
        {
          org_id: verifiedInvite.org_id,
          user_id: publicUserId,
          role: verifiedInvite.role || "member",
        },
        { onConflict: "org_id,user_id" }
      );
      await adminSupabase.from("pending_invites").delete().eq("id", verifiedInvite.id);
    }

    // 7. Issue authenticated Supabase session cookies
    const response = NextResponse.json({ success: true, redirectUrl });
    const supabase = createSupabaseRouteClient(request, response);

    const { data: linkData, error: linkError } =
      await adminSupabase.auth.admin.generateLink({
        type: "magiclink",
        email: cleanEmail,
      });

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error("[OTP Verify] generateLink error:", linkError);
      return NextResponse.json(
        { error: "Failed to establish authenticated session." },
        { status: 500 }
      );
    }

    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: "magiclink",
    });

    if (verifyError) {
      console.error("[OTP Verify] verifyOtp error:", verifyError);
      return NextResponse.json(
        { error: "Verification failed on session creation." },
        { status: 500 }
      );
    }

    return response;
  } catch (err: unknown) {
    console.error("[OTP Verify] Exception:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "OTP verification failed" },
      { status: 500 }
    );
  }
}
