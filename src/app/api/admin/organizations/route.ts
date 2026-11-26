import { NextResponse } from "next/server";
import { buildAuthIdentityLookup, requireSuperAdmin } from "@/lib/auth/admin-guard";
import {
  applyAdminPlanGrant,
  formatStorageBytes,
  normalizeAdminPlanTier,
  PLAN_DEFAULTS,
} from "@/lib/admin/plan-grants";
import { sanitizeIdentifier } from "@/lib/security/sanitize";
import { isMissingColumnError } from "@/lib/supabase/postgrest-errors";

export async function GET() {
  const { adminSupabase, errorResponse } = await requireSuperAdmin();
  if (errorResponse || !adminSupabase) return errorResponse!;

  try {
    const [
      { data: dbOrgs },
      { data: dbMembers },
      { data: dbUsers },
      { data: dbPackages },
      { data: dbVersions },
      { githubIdByUid },
    ] = await Promise.all([
      adminSupabase.from("organizations").select("*").order("created_at", { ascending: false }),
      adminSupabase.from("organization_members").select("org_id, user_id, role"),
      adminSupabase.from("users").select("id, supabase_uid, email, display_name"),
      adminSupabase.from("packages").select("id, name, owner_id, org_id, total_downloads"),
      adminSupabase.from("package_versions").select("package_name, size_bytes"),
      buildAuthIdentityLookup(adminSupabase),
    ]);

    const userById = new Map((dbUsers || []).map((u) => [u.id, u]));
    const sizeByPkgName = new Map<string, number>();
    for (const v of dbVersions || []) {
      sizeByPkgName.set(
        v.package_name,
        (sizeByPkgName.get(v.package_name) || 0) + (Number(v.size_bytes) || 0)
      );
    }

    const orgs = (dbOrgs || []).map((o) => {
      const members = (dbMembers || []).filter((m) => m.org_id === o.id);
      const ownerMem = members.find((m) => m.role === "owner") || members[0];
      const ownerUser = ownerMem ? userById.get(ownerMem.user_id) : undefined;

      const ownerIds = new Set<string>();
      for (const m of members) {
        const u = userById.get(m.user_id);
        if (u) {
          ownerIds.add(u.id);
          if (u.supabase_uid) {
            ownerIds.add(u.supabase_uid);
            const ghId = githubIdByUid.get(u.supabase_uid);
            if (ghId) ownerIds.add(ghId);
          }
        }
      }

      const cleanSlug = o.slug.replace(/^@/, "").toLowerCase();
      const orgPackages = (dbPackages || []).filter((p) => {
        if (p.org_id) return p.org_id === o.id;
        if (p.name.startsWith("@") && p.name.includes("/")) {
          return p.name.slice(1).split("/")[0].toLowerCase() === cleanSlug;
        }
        return Boolean(p.owner_id && ownerIds.has(p.owner_id));
      });

      const storageBytes = orgPackages.reduce((sum, p) => {
        const leaf = p.name.includes("/") ? p.name.split("/")[1] : p.name;
        return (
          sum +
          (sizeByPkgName.get(p.name) || sizeByPkgName.get(leaf) || 0)
        );
      }, 0);

      const planTier = normalizeAdminPlanTier(o.plan);
      const seatsAllowed = o.seats_allowed || PLAN_DEFAULTS[planTier].seats;

      return {
        id: o.id,
        slug: o.slug.startsWith("@") ? o.slug : `@${o.slug}`,
        rawSlug: cleanSlug,
        name: o.name,
        ownerEmail: ownerUser?.email || "—",
        ownerName: ownerUser?.display_name || ownerUser?.email?.split("@")[0] || "—",
        ownerUserId: ownerUser?.id || null,
        plan: planTier,
        planLabel: planTier.toUpperCase(),
        seatsUsed: members.length,
        seatsAllowed,
        seats: `${members.length} / ${seatsAllowed}`,
        skills: orgPackages.length,
        storage: formatStorageBytes(storageBytes),
        status: o.status === "suspended" ? "Suspended" : "Active",
      };
    });

    return NextResponse.json(
      { organizations: orgs },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: unknown) {
    console.error("[Admin Organizations] GET error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load organizations." },
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

    if (action === "update_plan") {
      const orgId = String(body.orgId || "").trim();
      if (!orgId) {
        return NextResponse.json({ error: "orgId is required." }, { status: 400 });
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
        targetOrgId: orgId,
      });

      return NextResponse.json({ success: true, ...result });
    }

    if (action === "provision") {
      const name = String(body.name || "").trim();
      const rawSlug = sanitizeIdentifier(String(body.slug || name))
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/^-+|-+$/g, "");
      const ownerEmail = typeof body.ownerEmail === "string" ? body.ownerEmail.trim().toLowerCase() : "";
      const plan = normalizeAdminPlanTier(body.plan);
      const seatsAllowed =
        typeof body.seatsAllowed === "number" && body.seatsAllowed > 0
          ? body.seatsAllowed
          : PLAN_DEFAULTS[plan].seats;

      if (!name || !rawSlug) {
        return NextResponse.json(
          { error: "Organization name and slug are required." },
          { status: 400 }
        );
      }

      const { data: existing } = await adminSupabase
        .from("organizations")
        .select("id")
        .eq("slug", rawSlug)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { error: `An organization with slug @${rawSlug} already exists.` },
          { status: 409 }
        );
      }

      const { data: newOrg, error: createErr } = await adminSupabase
        .from("organizations")
        .insert({
          name,
          slug: rawSlug,
          plan,
          seats_allowed: seatsAllowed,
        })
        .select("id, slug, name, plan, seats_allowed")
        .single();

      if (createErr || !newOrg) {
        return NextResponse.json(
          { error: createErr?.message || "Failed to create organization." },
          { status: 500 }
        );
      }

      if (ownerEmail) {
        const { data: ownerUser } = await adminSupabase
          .from("users")
          .select("id")
          .eq("email", ownerEmail)
          .maybeSingle();

        if (ownerUser) {
          await adminSupabase.from("organization_members").upsert(
            { org_id: newOrg.id, user_id: ownerUser.id, role: "owner" },
            { onConflict: "org_id,user_id" }
          );
          if (plan !== "free") {
            await applyAdminPlanGrant({
              adminSupabase,
              actorPublicUserId: ctx.publicUserId,
              actorEmail: ctx.user.email!,
              plan,
              seatsAllowed,
              targetOrgId: newOrg.id,
              targetUserId: ownerUser.id,
            });
          }
        }
      }

      await adminSupabase.from("audit_log").insert({
        actor_id: ctx.publicUserId,
        action: "admin.provision_org",
        target_type: "organization",
        target_name: `@${rawSlug}`,
        metadata: { severity: "info", email: ctx.user.email, orgId: newOrg.id, plan, ownerEmail },
      });

      return NextResponse.json({ success: true, organization: newOrg });
    }

    if (action === "toggle_status") {
      const orgId = String(body.orgId || "").trim();
      const nextStatus = body.status === "suspended" ? "suspended" : "active";
      if (!orgId) {
        return NextResponse.json({ error: "orgId is required." }, { status: 400 });
      }

      const { error: updateErr } = await adminSupabase
        .from("organizations")
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq("id", orgId);

      if (updateErr) {
        return NextResponse.json(
          {
            error: isMissingColumnError(updateErr, "status")
              ? "Database column public.organizations.status does not exist yet. Run migration supabase/migrations/20261126_admin_control_plane_and_tenant_scoping.sql in Supabase SQL Editor."
              : updateErr.message,
          },
          { status: 500 }
        );
      }

      await adminSupabase.from("audit_log").insert({
        actor_id: ctx.publicUserId,
        action: `admin.org_status.${nextStatus}`,
        target_type: "organization",
        target_name: orgId,
        metadata: { severity: "warning", email: ctx.user.email, status: nextStatus },
      });

      return NextResponse.json({ success: true, status: nextStatus });
    }

    return NextResponse.json({ error: "Unsupported organization admin action." }, { status: 400 });
  } catch (err: unknown) {
    console.error("[Admin Organizations] POST error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update organization." },
      { status: 500 }
    );
  }
}
