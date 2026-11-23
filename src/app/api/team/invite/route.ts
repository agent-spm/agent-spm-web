import { NextResponse } from "next/server";
import crypto from "crypto";
import { requireAuthenticatedUser } from "@/lib/auth/server-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { escapeHtml, getTrustedOrigin, sanitizeIdentifier } from "@/lib/security/sanitize";
import { authApiLimiter, getClientIp } from "@/lib/security/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!authApiLimiter.check(`invite:${ip}`)) {
      return NextResponse.json(
        { error: "Too many invitation requests. Please wait a minute." },
        { status: 429 }
      );
    }

    const { ctx, errorResponse } = await requireAuthenticatedUser();
    if (errorResponse) return errorResponse;

    const body = await request.json().catch(() => ({}));
    const { email, role = "member", orgId, orgSlug } = body;

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: "A valid recipient email address is required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    // Prevent privilege escalation via invite: admins cannot invite new 'owner' roles unless already owner
    const requestedRole = String(role).toLowerCase().trim();
    const targetRole = ["admin", "member", "viewer"].includes(requestedRole)
      ? requestedRole
      : "member";

    const adminSupabase = getSupabaseServiceClient();

    // 1. Resolve target organization strictly from input (never fallback to another user's org)
    let resolvedOrg: { id: string; name: string; slug: string; seats_allowed: number } | null = null;

    if (orgId && typeof orgId === "string") {
      const { data: orgRow } = await adminSupabase
        .from("organizations")
        .select("id, name, slug, seats_allowed")
        .eq("id", orgId.trim())
        .maybeSingle();
      resolvedOrg = orgRow;
    } else if (orgSlug && typeof orgSlug === "string") {
      const cleanSlug = sanitizeIdentifier(orgSlug);
      if (cleanSlug) {
        const { data: orgRow } = await adminSupabase
          .from("organizations")
          .select("id, name, slug, seats_allowed")
          .eq("slug", cleanSlug)
          .maybeSingle();
        resolvedOrg = orgRow;
      }
    }

    if (!resolvedOrg) {
      return NextResponse.json(
        { error: "Target organization not found or invalid." },
        { status: 404 }
      );
    }

    // 2. Enforce RBAC: caller must be owner or admin of resolvedOrg
    if (!ctx.isSuperAdmin) {
      const { data: callerMembership } = await adminSupabase
        .from("organization_members")
        .select("role")
        .eq("org_id", resolvedOrg.id)
        .eq("user_id", ctx.publicUserId)
        .maybeSingle();

      if (!callerMembership || !["owner", "admin"].includes(callerMembership.role)) {
        return NextResponse.json(
          { error: "Only organization owners or administrators can invite team members." },
          { status: 403 }
        );
      }
    }

    // 3. Enforce seat allocation limit server-side
    const [{ count: memberCount }, { count: pendingCount }] = await Promise.all([
      adminSupabase
        .from("organization_members")
        .select("*", { count: "exact", head: true })
        .eq("org_id", resolvedOrg.id),
      adminSupabase
        .from("pending_invites")
        .select("*", { count: "exact", head: true })
        .eq("org_id", resolvedOrg.id),
    ]);

    if ((memberCount ?? 0) + (pendingCount ?? 0) >= (resolvedOrg.seats_allowed || 10)) {
      return NextResponse.json(
        { error: "Organization seat limit reached. Upgrade your plan to invite additional members." },
        { status: 403 }
      );
    }

    // 4. Generate cryptographically random invite token
    const token = `inv_${crypto.randomBytes(24).toString("hex")}`;

    await adminSupabase
      .from("pending_invites")
      .delete()
      .eq("org_id", resolvedOrg.id)
      .eq("email", cleanEmail);

    const { data: insertedInvite, error: insertError } = await adminSupabase
      .from("pending_invites")
      .insert({
        org_id: resolvedOrg.id,
        email: cleanEmail,
        role: targetRole,
        invited_by: ctx.publicUserId,
        token,
      })
      .select("id, email, role, created_at")
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: `Failed to store invitation: ${insertError.message}` },
        { status: 500 }
      );
    }

    await adminSupabase.from("audit_log").insert({
      actor_id: ctx.publicUserId,
      action: `invited: ${cleanEmail} as ${targetRole}`,
      target_type: "organization",
      target_name: resolvedOrg.slug,
      metadata: { severity: "info", email: ctx.user.email },
    });

    // 5. Send invitation email via Resend with HTML-escaped user strings
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Agent SPM <onboarding@resend.dev>";
    let emailDelivered = false;
    let emailWarning: string | undefined;

    if (resendApiKey) {
      const origin = getTrustedOrigin(request);
      const inviteUrl = `${origin}/signup?ref=${encodeURIComponent(
        resolvedOrg.slug
      )}&token=${encodeURIComponent(token)}&email=${encodeURIComponent(cleanEmail)}`;

      const safeInviter = escapeHtml(ctx.user.email || "An administrator");
      const safeRole = escapeHtml(targetRole);
      const safeOrgName = escapeHtml(resolvedOrg.name);

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
            subject: `Invitation to join ${resolvedOrg.name} on Agent SPM`,
            html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; border: 1px solid #eaeaea; border-radius: 12px; background: #ffffff;">
              <div style="margin-bottom: 24px;">
                <span style="font-size: 16px; font-weight: bold; color: #000; letter-spacing: -0.5px;">Agent SPM</span>
              </div>
              <h2 style="color: #000; font-size: 22px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.5px;">You've been invited to Agent SPM</h2>
              <p style="color: #555; line-height: 1.5; font-size: 14px; margin: 0 0 24px 0;">
                <strong>${safeInviter}</strong> has invited you to collaborate as a <strong>${safeRole}</strong> on <strong>${safeOrgName}</strong>.
              </p>
              <div style="margin: 28px 0;">
                <a href="${inviteUrl}" style="background-color: #1B5FED; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
                  Accept Invitation & Join Workspace
                </a>
              </div>
              <p style="color: #888; font-size: 12px; margin-top: 24px;">
                If you did not expect this invitation, you can safely ignore this email.
              </p>
            </div>
          `,
          }),
        });
        if (resendRes.ok) {
          emailDelivered = true;
        } else {
          const errPayload = await resendRes.json().catch(() => ({}));
          emailWarning =
            (typeof errPayload?.message === "string" && errPayload.message) ||
            `Resend returned HTTP ${resendRes.status}`;
          console.warn("[Resend] Invite dispatch warning:", emailWarning);
        }
      } catch (err) {
        emailWarning = err instanceof Error ? err.message : "Failed to reach Resend API";
        console.error("[Resend] Failed to dispatch invite email:", err);
      }
    } else {
      emailWarning = "RESEND_API_KEY is not configured; invite saved without email delivery.";
    }

    // Notice: Do not return raw secret invite token in response to client
    return NextResponse.json({
      success: true,
      emailDelivered,
      ...(emailWarning ? { emailWarning } : {}),
      invite: insertedInvite,
    });
  } catch (error: unknown) {
    console.error("[Invite] Route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to invite member" },
      { status: 500 }
    );
  }
}
