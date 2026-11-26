import { NextResponse } from "next/server";
import { buildAuthIdentityLookup, requireSuperAdmin } from "@/lib/auth/admin-guard";
import {
  applyAdminPlanGrant,
  normalizeAdminPlanTier,
} from "@/lib/admin/plan-grants";
import { isMissingColumnError } from "@/lib/supabase/postgrest-errors";

export async function GET() {
  const { adminSupabase, errorResponse } = await requireSuperAdmin();
  if (errorResponse || !adminSupabase) return errorResponse!;

  try {
    const [
      { data: dbUsers },
      { data: dbOrgs },
      { data: dbMembers },
      { data: dbPackages },
      { data: dbEntitlements },
      { githubIdByUid },
    ] = await Promise.all([
      adminSupabase.from("users").select("*").order("created_at", { ascending: false }),
      adminSupabase.from("organizations").select("*"),
      adminSupabase.from("organization_members").select("user_id, org_id, role"),
      adminSupabase.from("packages").select("id, name, owner_id, org_id, total_downloads"),
      adminSupabase
        .from("entitlements")
        .select("user_id, plan, seats, status, updated_at")
        .order("updated_at", { ascending: false }),
      buildAuthIdentityLookup(adminSupabase),
    ]);

    const orgById = new Map((dbOrgs || []).map((o) => [o.id, o]));

    const users = (dbUsers || []).map((u) => {
      const userMems = (dbMembers || []).filter((m) => m.user_id === u.id);
      const ownedMem = userMems.find((m) => m.role === "owner") || userMems[0];
      const primaryOrg = ownedMem ? orgById.get(ownedMem.org_id) : undefined;
      const ghId = u.supabase_uid ? githubIdByUid.get(u.supabase_uid) : undefined;

      const userEntitlement = (dbEntitlements || []).find(
        (e) => e.user_id === u.id && e.status === "active"
      );

      const candidateOwnerIds = new Set(
        [u.id, u.supabase_uid, ghId].filter((v): v is string => Boolean(v))
      );
      const orgIds = new Set(userMems.map((m) => m.org_id));

      const ownedPackages = (dbPackages || []).filter(
        (p) =>
          (p.owner_id && candidateOwnerIds.has(p.owner_id)) ||
          (p.org_id && orgIds.has(p.org_id))
      );

      const totalDownloads = ownedPackages.reduce(
        (sum, p) => sum + (Number(p.total_downloads) || 0),
        0
      );

      const resolvedPlan = primaryOrg?.plan
        ? normalizeAdminPlanTier(primaryOrg.plan)
        : userEntitlement
          ? normalizeAdminPlanTier(userEntitlement.plan)
          : "free";

      return {
        id: u.id,
        supabaseUid: u.supabase_uid,
        name: u.display_name || u.email.split("@")[0],
        email: u.email,
        role: u.role || "user",
        orgId: primaryOrg?.id || null,
        org: primaryOrg
          ? primaryOrg.slug.startsWith("@")
            ? primaryOrg.slug
            : `@${primaryOrg.slug}`
          : "No Workspace",
        orgName: primaryOrg?.name || "Unassigned",
        plan: resolvedPlan,
        seatsAllowed:
          primaryOrg?.seats_allowed ||
          userEntitlement?.seats ||
          (resolvedPlan === "enterprise" ? 500 : resolvedPlan === "pro" ? 100 : 3),
        skills: ownedPackages.length,
        downloads: totalDownloads.toLocaleString(),
        downloadsRaw: totalDownloads,
        joined: u.created_at
          ? new Date(u.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "—",
        status: u.status === "suspended" ? "Suspended" : "Active",
      };
    });

    return NextResponse.json(
      { users },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: unknown) {
    console.error("[Admin Users] GET error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load users." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { ctx, adminSupabase, errorResponse } = await requireSuperAdmin();
  if (errorResponse || !ctx || !adminSupabase) return errorResponse!;

  try {
    const body = await request.json().catch(() => ({}));
    const action = String(body.action || "");

    if (action === "grant_plan") {
      const userId = String(body.userId || "").trim();
      if (!userId) {
        return NextResponse.json({ error: "userId is required." }, { status: 400 });
      }
      const plan = normalizeAdminPlanTier(body.plan);
      const seatsAllowed =
        body.seatsAllowed !== undefined ? Number(body.seatsAllowed) : undefined;

      const result = await applyAdminPlanGrant({
        adminSupabase,
        actorPublicUserId: ctx.publicUserId,
        actorEmail: ctx.user.email!,
        plan,
        seatsAllowed,
        targetUserId: userId,
      });

      return NextResponse.json({ success: true, ...result });
    }

    if (action === "bulk_grant_plan") {
      const userIds = Array.isArray(body.userIds)
        ? body.userIds.filter((id: unknown): id is string => typeof id === "string" && id.length > 0)
        : [];
      if (userIds.length === 0) {
        return NextResponse.json({ error: "No userIds provided." }, { status: 400 });
      }
      const plan = normalizeAdminPlanTier(body.plan);
      for (const uid of userIds) {
        await applyAdminPlanGrant({
          adminSupabase,
          actorPublicUserId: ctx.publicUserId,
          actorEmail: ctx.user.email!,
          plan,
          targetUserId: uid,
        });
      }
      return NextResponse.json({ success: true, count: userIds.length, plan });
    }

    if (action === "toggle_status" || action === "bulk_status") {
      const userIds: string[] =
        action === "bulk_status"
          ? Array.isArray(body.userIds)
            ? body.userIds.filter((id: unknown): id is string => typeof id === "string" && id.length > 0)
            : []
          : typeof body.userId === "string" && body.userId.trim()
            ? [body.userId.trim()]
            : [];

      if (userIds.length === 0) {
        return NextResponse.json({ error: "Target user ID is required." }, { status: 400 });
      }

      const nextStatus = body.status === "suspended" ? "suspended" : "active";

      // Guard: never suspend the currently authenticated superadmin
      if (userIds.includes(ctx.publicUserId) && nextStatus === "suspended") {
        return NextResponse.json(
          { error: "Cannot suspend your own active superadmin account." },
          { status: 400 }
        );
      }

      const { error: updateErr } = await adminSupabase
        .from("users")
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .in("id", userIds);

      if (updateErr) {
        return NextResponse.json(
          {
            error: isMissingColumnError(updateErr, "status")
              ? "Database column public.users.status does not exist yet. Run migration supabase/migrations/20261126_admin_control_plane_and_tenant_scoping.sql in Supabase SQL Editor."
              : updateErr.message,
          },
          { status: 500 }
        );
      }

      await adminSupabase.from("audit_log").insert({
        actor_id: ctx.publicUserId,
        action: `admin.user_status.${nextStatus}`,
        target_type: "user",
        target_name: `${userIds.length} account(s)`,
        metadata: { severity: "warning", email: ctx.user.email, userIds, status: nextStatus },
      });

      return NextResponse.json({ success: true, status: nextStatus, count: userIds.length });
    }

    return NextResponse.json({ error: "Unsupported admin user action." }, { status: 400 });
  } catch (err: unknown) {
    console.error("[Admin Users] POST error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update user." },
      { status: 500 }
    );
  }
}
