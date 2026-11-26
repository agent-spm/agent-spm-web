import { NextResponse } from "next/server";
import { requireAuthorizedWorkspaceOrg } from "@/lib/workspace/org-access";
import { getClientIp, workspaceWriteLimiter } from "@/lib/security/rate-limit";
import { sanitizeIdentifier } from "@/lib/security/sanitize";

export async function PATCH(request: Request) {
  const ip = getClientIp(request);
  if (!workspaceWriteLimiter.check(`ws_settings:${ip}`)) {
    return NextResponse.json(
      { error: "Too many settings updates. Please wait a moment." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const requestedOrgId = typeof body.orgId === "string" ? body.orgId : null;
    const { access, errorResponse } = await requireAuthorizedWorkspaceOrg(requestedOrgId);
    if (errorResponse || !access) return errorResponse!;

    const { ctx, adminSupabase, effectivePublicUserId, orgRow, canAdminOrg } = access;
    const section = String(body.section || "");

    if (section === "profile") {
      const displayName = String(body.displayName || "").trim().slice(0, 120);
      if (!displayName) {
        return NextResponse.json(
          { error: "Display name is required." },
          { status: 400 }
        );
      }

      if (!effectivePublicUserId) {
        return NextResponse.json(
          { error: "No editable user profile associated with this workspace." },
          { status: 400 }
        );
      }

      const { error: updErr } = await adminSupabase
        .from("users")
        .update({ display_name: displayName, updated_at: new Date().toISOString() })
        .eq("id", effectivePublicUserId);

      if (updErr) {
        return NextResponse.json({ error: updErr.message }, { status: 500 });
      }

      await adminSupabase.from("audit_log").insert({
        actor_id: ctx.publicUserId,
        action: "profile.updated",
        target_type: "user",
        target_name: displayName,
        metadata: { severity: "info", email: ctx.user.email, orgId: orgRow.id },
      });

      return NextResponse.json({ success: true, displayName });
    }

    if (section === "organization") {
      if (!canAdminOrg) {
        return NextResponse.json(
          { error: "Only workspace owners or admins can update organization settings." },
          { status: 403 }
        );
      }

      const nextName = String(body.name || "").trim().slice(0, 120);
      const nextSlug = sanitizeIdentifier(String(body.slug || ""))
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 64);

      if (!nextName || !nextSlug) {
        return NextResponse.json(
          { error: "Organization name and valid slug are required." },
          { status: 400 }
        );
      }

      if (nextSlug !== orgRow.slug.replace(/^@/, "").toLowerCase()) {
        const { data: conflict } = await adminSupabase
          .from("organizations")
          .select("id")
          .eq("slug", nextSlug)
          .neq("id", orgRow.id)
          .maybeSingle();

        if (conflict) {
          return NextResponse.json(
            { error: `Workspace slug @${nextSlug} is already taken.` },
            { status: 409 }
          );
        }
      }

      const { error: orgErr } = await adminSupabase
        .from("organizations")
        .update({
          name: nextName,
          slug: nextSlug,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orgRow.id);

      if (orgErr) {
        return NextResponse.json({ error: orgErr.message }, { status: 500 });
      }

      await adminSupabase.from("audit_log").insert({
        actor_id: ctx.publicUserId,
        action: "organization.updated",
        target_type: "organization",
        target_name: `@${nextSlug}`,
        metadata: {
          severity: "warning",
          email: ctx.user.email,
          orgId: orgRow.id,
          name: nextName,
          slug: nextSlug,
        },
      });

      return NextResponse.json({
        success: true,
        organization: { id: orgRow.id, name: nextName, slug: `@${nextSlug}` },
      });
    }

    return NextResponse.json({ error: "Unsupported settings section." }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save settings." },
      { status: 500 }
    );
  }
}
