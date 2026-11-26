import { NextResponse } from "next/server";
import {
  IMPERSONATE_COOKIE_NAME,
  requireAuthenticatedUser,
  signImpersonationPayload,
} from "@/lib/auth/server-auth";
import { requireSuperAdmin } from "@/lib/auth/admin-guard";

export async function POST(request: Request) {
  const { ctx, adminSupabase, errorResponse } = await requireSuperAdmin();
  if (errorResponse || !ctx || !adminSupabase) return errorResponse!;

  try {
    const body = await request.json().catch(() => ({}));
    let targetOrgId = typeof body.orgId === "string" ? body.orgId.trim() : "";
    let targetUserId = typeof body.userId === "string" ? body.userId.trim() : "";

    if (!targetOrgId && !targetUserId) {
      return NextResponse.json(
        { error: "Either orgId or userId is required." },
        { status: 400 }
      );
    }

    if (!targetOrgId && targetUserId) {
      const { data: mem } = await adminSupabase
        .from("organization_members")
        .select("org_id, role")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (mem?.org_id) {
        targetOrgId = mem.org_id;
      } else {
        // Look up user and create/locate their personal workspace if needed
        const { data: userRow } = await adminSupabase
          .from("users")
          .select("id, email, display_name")
          .eq("id", targetUserId)
          .maybeSingle();

        if (!userRow) {
          return NextResponse.json({ error: "Target user not found." }, { status: 404 });
        }

        const baseSlug = (userRow.email.split("@")[0] || "workspace")
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "-")
          .replace(/^-|-$/g, "");

        const { data: slugOrg } = await adminSupabase
          .from("organizations")
          .select("id")
          .eq("slug", baseSlug)
          .maybeSingle();

        if (slugOrg) {
          targetOrgId = slugOrg.id;
        } else {
          const { data: createdOrg, error: orgErr } = await adminSupabase
            .from("organizations")
            .insert({
              name: `${userRow.display_name || baseSlug}'s Workspace`,
              slug: `${baseSlug}-${userRow.id.slice(0, 4)}`,
              plan: "free",
              seats_allowed: 3,
            })
            .select("id")
            .single();

          if (orgErr || !createdOrg) {
            return NextResponse.json(
              { error: "User has no workspace organization to view." },
              { status: 400 }
            );
          }

          targetOrgId = createdOrg.id;
          await adminSupabase.from("organization_members").insert({
            org_id: targetOrgId,
            user_id: userRow.id,
            role: "owner",
          });
        }
      }
    }

    const { data: orgRow } = await adminSupabase
      .from("organizations")
      .select("id, slug, name")
      .eq("id", targetOrgId)
      .maybeSingle();

    if (!orgRow) {
      return NextResponse.json({ error: "Target organization not found." }, { status: 404 });
    }

    if (!targetUserId) {
      const { data: ownerMem } = await adminSupabase
        .from("organization_members")
        .select("user_id")
        .eq("org_id", targetOrgId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (ownerMem?.user_id) {
        targetUserId = ownerMem.user_id;
      }
    }

    const token = signImpersonationPayload({
      orgId: orgRow.id,
      userId: targetUserId || null,
      orgSlug: orgRow.slug,
      issuedAt: Date.now(),
      actorUid: ctx.user.id,
    });

    await adminSupabase.from("audit_log").insert({
      actor_id: ctx.publicUserId,
      action: "admin.impersonate",
      target_type: "organization",
      target_name: orgRow.slug.startsWith("@") ? orgRow.slug : `@${orgRow.slug}`,
      metadata: {
        severity: "warning",
        email: ctx.user.email,
        targetOrgId: orgRow.id,
        targetUserId: targetUserId || null,
      },
    });

    const response = NextResponse.json({
      success: true,
      orgId: orgRow.id,
      orgSlug: orgRow.slug.startsWith("@") ? orgRow.slug : `@${orgRow.slug}`,
      userId: targetUserId || null,
    });

    response.cookies.set(IMPERSONATE_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (err: unknown) {
    console.error("[Admin Impersonate] POST failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to start View As session." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const { errorResponse } = await requireAuthenticatedUser();
  if (errorResponse) return errorResponse;

  const response = NextResponse.json({ success: true });
  response.cookies.set(IMPERSONATE_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}
