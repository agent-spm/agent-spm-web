import { getSupabaseServiceClient } from "@/lib/supabase/service";

export type AdminPlanTier = "free" | "pro" | "enterprise";

export const PLAN_DEFAULTS: Record<
  AdminPlanTier,
  { seats: number; entitlementLabel: string }
> = {
  free: { seats: 3, entitlementLabel: "Free" },
  pro: { seats: 100, entitlementLabel: "Pro (Admin Grant)" },
  enterprise: { seats: 500, entitlementLabel: "Enterprise (Admin Grant)" },
};

export function normalizeAdminPlanTier(raw?: string | null): AdminPlanTier {
  const val = (raw || "").toLowerCase().trim();
  if (val.includes("enterprise")) return "enterprise";
  if (val.includes("pro")) return "pro";
  return "free";
}

export function formatStorageBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 KB";
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

/**
 * Grants or updates a workspace/user subscription plan & seat allocation cleanly across
 * public.organizations and public.entitlements, and appends an immutable audit log entry.
 */
export async function applyAdminPlanGrant(params: {
  adminSupabase: ReturnType<typeof getSupabaseServiceClient>;
  actorPublicUserId: string;
  actorEmail: string;
  plan: AdminPlanTier;
  seatsAllowed?: number;
  targetOrgId?: string;
  targetUserId?: string;
}) {
  const {
    adminSupabase,
    actorPublicUserId,
    actorEmail,
    plan,
    seatsAllowed,
    targetOrgId,
    targetUserId,
  } = params;

  const spec = PLAN_DEFAULTS[plan];
  const resolvedSeats =
    typeof seatsAllowed === "number" && Number.isFinite(seatsAllowed) && seatsAllowed > 0
      ? Math.min(Math.round(seatsAllowed), 10000)
      : spec.seats;

  const nowIso = new Date().toISOString();
  const updatedOrgIds: string[] = [];
  const affectedUserIds = new Set<string>();

  if (targetOrgId) {
    const { data: updatedOrg, error: orgErr } = await adminSupabase
      .from("organizations")
      .update({
        plan,
        seats_allowed: resolvedSeats,
        updated_at: nowIso,
      })
      .eq("id", targetOrgId)
      .select("id, slug")
      .maybeSingle();

    if (orgErr || !updatedOrg) {
      throw new Error(orgErr?.message || "Failed to update organization plan.");
    }
    updatedOrgIds.push(updatedOrg.id);

    const { data: orgOwners } = await adminSupabase
      .from("organization_members")
      .select("user_id")
      .eq("org_id", targetOrgId)
      .eq("role", "owner");

    for (const row of orgOwners || []) {
      if (row.user_id) affectedUserIds.add(row.user_id);
    }
  }

  if (targetUserId) {
    affectedUserIds.add(targetUserId);

    const { data: memberships } = await adminSupabase
      .from("organization_members")
      .select("org_id, role")
      .eq("user_id", targetUserId);

    const ownedOrgIds = (memberships || [])
      .filter((m) => m.role === "owner")
      .map((m) => m.org_id)
      .filter((id): id is string => Boolean(id));

    const targetOrgsForUser =
      ownedOrgIds.length > 0
        ? ownedOrgIds
        : (memberships || [])
            .map((m) => m.org_id)
            .filter((id): id is string => Boolean(id));

    if (targetOrgsForUser.length > 0) {
      const { error: orgErr } = await adminSupabase
        .from("organizations")
        .update({
          plan,
          seats_allowed: resolvedSeats,
          updated_at: nowIso,
        })
        .in("id", targetOrgsForUser);

      if (orgErr) {
        throw new Error(`Failed to update user organizations: ${orgErr.message}`);
      }
      updatedOrgIds.push(...targetOrgsForUser);
    }
  }

  for (const uid of affectedUserIds) {
    if (plan === "free") {
      await adminSupabase
        .from("entitlements")
        .update({ status: "canceled", updated_at: nowIso })
        .eq("user_id", uid)
        .eq("status", "active");
    } else {
      const { data: existingEnt } = await adminSupabase
        .from("entitlements")
        .select("id")
        .eq("user_id", uid)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingEnt) {
        await adminSupabase
          .from("entitlements")
          .update({
            plan: spec.entitlementLabel,
            seats: resolvedSeats,
            status: "active",
            updated_at: nowIso,
          })
          .eq("id", existingEnt.id);
      } else {
        await adminSupabase.from("entitlements").insert({
          user_id: uid,
          polar_subscription_id: `admin_grant_${uid.slice(0, 8)}_${Date.now()}`,
          seats: resolvedSeats,
          plan: spec.entitlementLabel,
          status: "active",
          updated_at: nowIso,
        });
      }
    }
  }

  await adminSupabase.from("audit_log").insert({
    actor_id: actorPublicUserId,
    action: "admin.grant_plan",
    target_type: targetOrgId ? "organization" : "user",
    target_name: targetOrgId || targetUserId || "workspace",
    metadata: {
      severity: "warning",
      email: actorEmail,
      plan,
      seatsAllowed: resolvedSeats,
      updatedOrgIds,
      affectedUserIds: Array.from(affectedUserIds),
    },
  });

  return {
    plan,
    seatsAllowed: resolvedSeats,
    updatedOrgIds: Array.from(new Set(updatedOrgIds)),
    affectedUserIds: Array.from(affectedUserIds),
  };
}
