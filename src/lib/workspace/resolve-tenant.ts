import { cookies } from "next/headers";
import {
  IMPERSONATE_COOKIE_NAME,
  verifyImpersonationCookie,
  type AuthenticatedContext,
} from "@/lib/auth/server-auth";
import { buildAuthIdentityLookup } from "@/lib/auth/admin-guard";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import type {
  ApiKeyItem,
  AuditEvent,
  AuditSeverity,
  FeatureFlagItem,
  Organization,
  OrgRole,
  PendingInviteItem,
  PlanTier,
  Skill,
  SkillStatus,
  TeamMemberItem,
  Visibility,
} from "@/lib/data/mock-store";

export interface ResolvedWorkspacePayload {
  userProfile: {
    id: string;
    publicUserId?: string;
    githubId?: string;
    email: string;
    name: string;
    role: string;
    githubUsername?: string;
  };
  impersonation: {
    active: boolean;
    targetOrgId: string;
    targetOrgSlug: string;
    targetUserId?: string;
    targetUserName?: string;
    targetUserEmail?: string;
    actorEmail: string;
  } | null;
  isActualSuperAdmin: boolean;
  isMemberOfActiveOrg: boolean;
  organizations: Organization[];
  activeOrgId: string;
  skills: Skill[];
  teamMembers: TeamMemberItem[];
  pendingInvites: PendingInviteItem[];
  apiKeys: ApiKeyItem[];
  auditEvents: AuditEvent[];
  featureFlags: FeatureFlagItem[];
  maintenanceBanner: { enabled: boolean; message: string } | null;
}

function getPlanSkillQuota(plan?: string | null): number {
  const normalized = (plan || "free").toLowerCase();
  if (normalized.includes("enterprise")) return 500;
  if (normalized.includes("pro")) return 50;
  return 5;
}

function getPlanSeatQuota(plan?: string | null, seatsAllowed?: number | null): number {
  if (typeof seatsAllowed === "number" && seatsAllowed > 0) return seatsAllowed;
  const normalized = (plan || "free").toLowerCase();
  if (normalized.includes("enterprise")) return 500;
  if (normalized.includes("pro")) return 100;
  return 3;
}

function formatBytesSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

/**
 * Resolves tenant-scoped workspace state on the server.
 * Guarantees strict isolation per active organization / impersonated user.
 */
export async function resolveWorkspaceContext(
  ctx: AuthenticatedContext,
  requestedOrgId?: string | null
): Promise<ResolvedWorkspacePayload> {
  const adminSupabase = getSupabaseServiceClient();
  const cookieStore = await cookies();
  const rawImpCookie = cookieStore.get(IMPERSONATE_COOKIE_NAME)?.value;

  const activeImpersonation = ctx.isSuperAdmin
    ? verifyImpersonationCookie(rawImpCookie, ctx.user.id)
    : null;

  // Fetch all public users, orgs, and memberships needed for scoping
  const [{ data: allOrgs }, { data: allMembers }, { data: allUsers }] = await Promise.all([
    adminSupabase.from("organizations").select("*").order("created_at", { ascending: true }),
    adminSupabase.from("organization_members").select("id, org_id, user_id, role, created_at"),
    adminSupabase.from("users").select("*"),
  ]);

  const userByPublicId = new Map<string, (typeof allUsers extends Array<infer U> | null ? U : never)>();
  for (const u of allUsers || []) {
    userByPublicId.set(u.id, u);
  }

  const orgRows = allOrgs || [];
  const memberRows = allMembers || [];

  const { githubIdByUid, handleByUid } =
    ctx.isSuperAdmin || activeImpersonation
      ? await buildAuthIdentityLookup(adminSupabase)
      : {
          githubIdByUid: new Map<string, string>(
            ctx.githubId ? [[ctx.user.id, ctx.githubId]] : []
          ),
          handleByUid: new Map<string, string>(
            ctx.githubHandle ? [[ctx.user.id, ctx.githubHandle]] : []
          ),
        };

  // Resolve actor's own profile defaults
  const selfPublicUser = userByPublicId.get(ctx.publicUserId);
  const selfName =
    selfPublicUser?.display_name ||
    (typeof ctx.user.user_metadata?.full_name === "string" ? ctx.user.user_metadata.full_name : undefined) ||
    ctx.githubHandle ||
    ctx.user.email!.split("@")[0];

  let effectivePublicUserId = ctx.publicUserId;
  let effectiveSupabaseUid = ctx.user.id;
  let effectiveGithubId = ctx.githubId;
  let effectiveGithubHandle = ctx.githubHandle;
  let effectiveEmail = ctx.user.email!;
  let effectiveName = selfName;
  let effectiveRole = ctx.isSuperAdmin ? "superadmin" : selfPublicUser?.role || "owner";
  let impersonationInfo: ResolvedWorkspacePayload["impersonation"] = null;

  if (activeImpersonation) {
    const targetOrgRow = orgRows.find((o) => o.id === activeImpersonation.orgId);
    let targetUserRow = activeImpersonation.userId
      ? userByPublicId.get(activeImpersonation.userId)
      : undefined;

    if (!targetUserRow && targetOrgRow) {
      const ownerMem =
        memberRows.find((m) => m.org_id === targetOrgRow.id && m.role === "owner") ||
        memberRows.find((m) => m.org_id === targetOrgRow.id);
      if (ownerMem) {
        targetUserRow = userByPublicId.get(ownerMem.user_id);
      }
    }

    if (targetOrgRow) {
      const targetMember = memberRows.find(
        (m) => m.org_id === targetOrgRow.id && targetUserRow && m.user_id === targetUserRow.id
      );

      if (targetUserRow) {
        effectivePublicUserId = targetUserRow.id;
        effectiveSupabaseUid = targetUserRow.supabase_uid;
        effectiveGithubId = githubIdByUid.get(targetUserRow.supabase_uid);
        effectiveGithubHandle =
          handleByUid.get(targetUserRow.supabase_uid) || targetOrgRow.slug.replace(/^@/, "");
        effectiveEmail = targetUserRow.email;
        effectiveName = targetUserRow.display_name || targetUserRow.email.split("@")[0];
        effectiveRole = targetMember?.role || "owner";
      } else {
        effectivePublicUserId = "";
        effectiveSupabaseUid = "";
        effectiveGithubId = undefined;
        effectiveGithubHandle = targetOrgRow.slug.replace(/^@/, "");
        effectiveEmail = `${effectiveGithubHandle}@workspace`;
        effectiveName = targetOrgRow.name;
        effectiveRole = "owner";
      }

      impersonationInfo = {
        active: true,
        targetOrgId: targetOrgRow.id,
        targetOrgSlug: targetOrgRow.slug.startsWith("@") ? targetOrgRow.slug : `@${targetOrgRow.slug}`,
        targetUserId: targetUserRow?.id,
        targetUserName: effectiveName,
        targetUserEmail: effectiveEmail,
        actorEmail: ctx.user.email!,
      };
    }
  }

  // Determine which organizations the effective viewer can access in OrgSwitcher
  const memberOrgIdsForEffectiveUser = new Set(
    memberRows.filter((m) => m.user_id === effectivePublicUserId).map((m) => m.org_id)
  );

  const visibleOrgRows = activeImpersonation
    ? orgRows.filter(
        (o) =>
          o.id === activeImpersonation.orgId || memberOrgIdsForEffectiveUser.has(o.id)
      )
    : ctx.isSuperAdmin
      ? orgRows
      : orgRows.filter((o) => memberOrgIdsForEffectiveUser.has(o.id));

  // Select active organization:
  // 1) Impersonated org
  // 2) Explicitly requested org (if allowed)
  // 3) User's own owned/member org first (never default a superadmin into another user's org unless chosen)
  // 4) First visible org
  let activeOrgRow =
    (activeImpersonation
      ? visibleOrgRows.find((o) => o.id === activeImpersonation.orgId)
      : undefined) ||
    (requestedOrgId ? visibleOrgRows.find((o) => o.id === requestedOrgId) : undefined) ||
    visibleOrgRows.find((o) => memberOrgIdsForEffectiveUser.has(o.id)) ||
    visibleOrgRows[0] ||
    null;

  if (!activeOrgRow && visibleOrgRows.length > 0) {
    activeOrgRow = visibleOrgRows[0];
  }

  // Resolve owner/member IDs belonging strictly to each org so packages are isolated per org
  const orgOwnerIdsMap = new Map<string, Set<string>>();
  for (const o of visibleOrgRows) {
    const idSet = new Set<string>();
    const orgMembers = memberRows.filter((m) => m.org_id === o.id);
    for (const mem of orgMembers) {
      const memUser = userByPublicId.get(mem.user_id);
      if (memUser) {
        idSet.add(memUser.id);
        if (memUser.supabase_uid) {
          idSet.add(memUser.supabase_uid);
          const ghId = githubIdByUid.get(memUser.supabase_uid);
          if (ghId) idSet.add(ghId);
        }
      }
    }
    // Include active session user's own IDs when org matches personal ownership
    if (memberOrgIdsForEffectiveUser.has(o.id)) {
      if (effectivePublicUserId) idSet.add(effectivePublicUserId);
      if (effectiveSupabaseUid) idSet.add(effectiveSupabaseUid);
      if (effectiveGithubId) idSet.add(effectiveGithubId);
    }
    orgOwnerIdsMap.set(o.id, idSet);
  }

  // Fetch all packages and filter strictly by org ownership (using org_id, @slug prefix, or org member owner_ids)
  const { data: allPackages } = await adminSupabase
    .from("packages")
    .select("*")
    .order("total_downloads", { ascending: false });

  const pkgMatchesOrg = (
    pkg: { name: string; owner_id?: string | null; org_id?: string | null },
    orgRow: { id: string; slug: string }
  ): boolean => {
    if (pkg.org_id) {
      return pkg.org_id === orgRow.id;
    }
    const cleanSlug = orgRow.slug.replace(/^@/, "").toLowerCase();
    if (pkg.name.startsWith("@") && pkg.name.includes("/")) {
      const scopePart = pkg.name.slice(1).split("/")[0].toLowerCase();
      return scopePart === cleanSlug;
    }
    const ownerSet = orgOwnerIdsMap.get(orgRow.id);
    return Boolean(pkg.owner_id && ownerSet?.has(pkg.owner_id));
  };

  // Compute real skillsCount + seatsUsed for each visible org
  const organizations: Organization[] = visibleOrgRows.map((o) => {
    const orgMemberCount = memberRows.filter((m) => m.org_id === o.id).length;
    const orgPkgCount = (allPackages || []).filter((p) => pkgMatchesOrg(p, o)).length;
    return {
      id: o.id,
      name: o.name,
      slug: o.slug.startsWith("@") ? o.slug : `@${o.slug}`,
      plan: ((o.plan || "free") as PlanTier),
      skillsCount: orgPkgCount,
      skillsAllowed: getPlanSkillQuota(o.plan),
      seatsUsed: Math.max(orgMemberCount, 1),
      seatsAllowed: getPlanSeatQuota(o.plan, o.seats_allowed),
      registryVersion: "2.4.0",
      createdAt: o.created_at ? String(o.created_at).split("T")[0] : "2026-01-01",
    };
  });

  // Active org scoped packages -> map with package_versions metadata if present
  const scopedPackages = activeOrgRow
    ? (allPackages || []).filter((p) => pkgMatchesOrg(p, activeOrgRow))
    : [];

  const activeOrgSlug = activeOrgRow
    ? activeOrgRow.slug.startsWith("@")
      ? activeOrgRow.slug
      : `@${activeOrgRow.slug}`
    : "@workspace";

  const versionsByPkg = new Map<
    string,
    Array<{
      version: string;
      integrity?: string | null;
      verified?: boolean | null;
      size_bytes?: number | null;
      created_at?: string | null;
      published_by?: string | null;
    }>
  >();

  if (scopedPackages.length > 0) {
    const pkgNames = Array.from(
      new Set(
        scopedPackages.flatMap((p) => {
          const leaf = p.name.includes("/") ? p.name.split("/")[1] : p.name;
          return [p.name, leaf];
        })
      )
    );
    const { data: verRows } = await adminSupabase
      .from("package_versions")
      .select("package_name, version, integrity, verified, size_bytes, created_at, published_by")
      .in("package_name", pkgNames)
      .order("created_at", { ascending: false });

    for (const v of verRows || []) {
      const list = versionsByPkg.get(v.package_name) || [];
      list.push(v);
      versionsByPkg.set(v.package_name, list);
    }
  }

  const skills: Skill[] = scopedPackages.map((p) => {
    const isScoped = p.name.startsWith("@") && p.name.includes("/");
    const scope = isScoped ? p.name.split("/")[0] : activeOrgSlug;
    const rawName = isScoped ? p.name.split("/")[1] : p.name;
    const ownerCandidate = (allUsers || []).find(
      (u) =>
        u.supabase_uid === p.owner_id ||
        u.id === p.owner_id ||
        githubIdByUid.get(u.supabase_uid) === p.owner_id
    );
    const publisherName = ownerCandidate?.display_name || effectiveName;
    const matchedVersions = versionsByPkg.get(p.name) || versionsByPkg.get(rawName) || [];
    const pkgStatus: SkillStatus =
      p.status === "deprecated" || p.status === "draft" ? p.status : "published";

    return {
      id: p.id,
      scope,
      name: rawName,
      version: p.latest_version || matchedVersions[0]?.version || "1.0.0",
      status: pkgStatus,
      visibility: (p.visibility as Visibility) || "public",
      description: p.description || "Autonomous agent procedural execution package.",
      license: "MIT",
      readme: `# ${p.name}\n\n${p.description || "Production AI Agent Skill"}`,
      repositoryUrl: p.github_repo ? `https://github.com/${p.github_repo}` : undefined,
      keywords: ["agent", "tool", "spm", rawName],
      agentCompatibility: {
        gpt4: true,
        claude: true,
        gemini: true,
        llama: true,
        custom: true,
      },
      totalDownloads: p.total_downloads || 0,
      downloadSparkline: [0, 0, 0, 0, 0, 0, 0, p.total_downloads || 0],
      updatedAt: p.updated_at ? String(p.updated_at).split("T")[0] : new Date().toISOString().split("T")[0],
      versions:
        matchedVersions.length > 0
          ? matchedVersions.map((mv) => ({
              version: mv.version,
              digest: mv.integrity || "sha256:pending",
              signature: mv.verified || p.verified ? "verified" : "community",
              tarballSize: formatBytesSize(mv.size_bytes),
              downloads: p.total_downloads || 0,
              publishedAt: mv.created_at
                ? String(mv.created_at).split("T")[0]
                : new Date().toISOString().split("T")[0],
              publishedBy: publisherName,
            }))
          : [
              {
                version: p.latest_version || "1.0.0",
                digest: "sha256:pending",
                signature: p.verified ? "verified" : "community",
                tarballSize: "—",
                downloads: p.total_downloads || 0,
                publishedAt: p.created_at
                  ? String(p.created_at).split("T")[0]
                  : new Date().toISOString().split("T")[0],
                publishedBy: publisherName,
              },
            ],
    };
  });

  // Team members for activeOrg
  const orgMembersList = activeOrgRow
    ? memberRows.filter((m) => m.org_id === activeOrgRow.id)
    : [];

  const seenEmails = new Set<string>();
  const teamMembers: TeamMemberItem[] = [];

  for (let i = 0; i < orgMembersList.length; i++) {
    const m = orgMembersList[i];
    const memberUser = userByPublicId.get(m.user_id);
    const memberEmail = memberUser?.email || `member-${String(m.user_id).slice(0, 6)}@workspace`;
    const memberName = memberUser?.display_name || memberEmail.split("@")[0];
    if (seenEmails.has(memberEmail.toLowerCase())) continue;
    seenEmails.add(memberEmail.toLowerCase());

    teamMembers.push({
      id: m.id,
      name: memberName,
      email: memberEmail,
      role: (m.role as OrgRole) || "owner",
      joinedDate: m.created_at
        ? new Date(m.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
      skillsCount: skills.length,
      status: "active",
    });
  }

  if (teamMembers.length === 0 && effectiveEmail) {
    teamMembers.push({
      id: effectivePublicUserId || effectiveSupabaseUid || "owner",
      name: effectiveName,
      email: effectiveEmail,
      role: "owner",
      joinedDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      skillsCount: skills.length,
      status: "active",
    });
  }

  // Pending invites for activeOrg
  let pendingInvites: PendingInviteItem[] = [];
  if (activeOrgRow) {
    const { data: inviteRows } = await adminSupabase
      .from("pending_invites")
      .select("id, email, role, created_at")
      .eq("org_id", activeOrgRow.id)
      .order("created_at", { ascending: false });

    pendingInvites = (inviteRows || []).map((inv) => ({
      id: inv.id,
      email: inv.email,
      role: inv.role as OrgRole,
      sentAgo: inv.created_at
        ? new Date(inv.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "Recently",
    }));
  }

  // API keys scoped to active org and/or effective owner
  const keyOwnerIds = Array.from(
    new Set([effectivePublicUserId, effectiveSupabaseUid].filter((v): v is string => Boolean(v)))
  );
  let apiKeys: ApiKeyItem[] = [];
  if (activeOrgRow || keyOwnerIds.length > 0) {
    const { data: keysData } = await adminSupabase
      .from("api_keys")
      .select("id, name, key_prefix, type, created_at, last_used_at, user_id, org_id")
      .order("created_at", { ascending: false });

    const filteredKeys = (keysData || []).filter((k) => {
      if (activeOrgRow && k.org_id) {
        return k.org_id === activeOrgRow.id;
      }
      return keyOwnerIds.includes(k.user_id);
    });

    apiKeys = filteredKeys.map((k) => ({
      id: k.id,
      name: k.name,
      prefix: k.key_prefix,
      type: k.type,
      createdAt: new Date(k.created_at).toISOString().split("T")[0],
      lastUsed: k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : "Never",
    }));
  }

  // Audit logs scoped to effective org members / target actor
  const orgActorSet = activeOrgRow ? orgOwnerIdsMap.get(activeOrgRow.id) : undefined;
  const scopedActorIds = Array.from(
    new Set([
      ...(orgActorSet ? Array.from(orgActorSet) : []),
      ...(effectivePublicUserId ? [effectivePublicUserId] : []),
      ...(effectiveSupabaseUid ? [effectiveSupabaseUid] : []),
      ...(effectiveGithubId ? [effectiveGithubId] : []),
    ])
  );

  let auditEvents: AuditEvent[] = [];
  if (scopedActorIds.length > 0) {
    const { data: auditRows } = await adminSupabase
      .from("audit_log")
      .select("id, actor_id, action, target_type, target_name, metadata, created_at")
      .in("actor_id", scopedActorIds)
      .order("created_at", { ascending: false })
      .limit(30);

    auditEvents = (auditRows || []).map((a) => {
      const meta = (a.metadata || {}) as Record<string, unknown>;
      const actorCandidate = (allUsers || []).find(
        (u) =>
          u.id === a.actor_id ||
          u.supabase_uid === a.actor_id ||
          githubIdByUid.get(u.supabase_uid) === a.actor_id
      );
      const actorEmail =
        (typeof meta.email === "string" && meta.email) ||
        actorCandidate?.email ||
        effectiveEmail;
      const actorName =
        (typeof meta.name === "string" && meta.name) ||
        actorCandidate?.display_name ||
        actorEmail.split("@")[0];

      return {
        id: a.id,
        timestamp: a.created_at || new Date().toISOString(),
        actor: { name: actorName, email: actorEmail },
        action: a.action,
        severity: (meta.severity as AuditSeverity) || "info",
        resource: a.target_name || a.action,
        ipAddress: "—",
        countryCode: "—",
      };
    });
  }

  // Optional feature_flags & maintenance banner (safe if table not migrated yet)
  let featureFlags: FeatureFlagItem[] = [];
  try {
    const { data: flagRows } = await adminSupabase
      .from("feature_flags")
      .select("id, name, description, enabled, rollout_percent, target")
      .order("created_at", { ascending: true });
    if (flagRows) {
      featureFlags = flagRows.map((f) => ({
        id: f.id,
        name: f.name,
        description: f.description || "",
        enabled: Boolean(f.enabled),
        rolloutPercent: Number(f.rollout_percent ?? 100),
        target: (f.target as FeatureFlagItem["target"]) || "All",
      }));
    }
  } catch {
    featureFlags = [];
  }

  let maintenanceBanner: { enabled: boolean; message: string } | null = null;
  try {
    const { data: bannerRow } = await adminSupabase
      .from("platform_settings")
      .select("value")
      .eq("key", "maintenance_banner")
      .maybeSingle();
    if (bannerRow?.value && typeof bannerRow.value === "object") {
      const val = bannerRow.value as { enabled?: unknown; message?: unknown };
      maintenanceBanner = {
        enabled: Boolean(val.enabled),
        message:
          typeof val.message === "string"
            ? val.message
            : "Agent SPM Scheduled Maintenance in progress. Publishing is temporarily queued.",
      };
    }
  } catch {
    maintenanceBanner = null;
  }

  return {
    userProfile: {
      id: effectiveSupabaseUid || ctx.user.id,
      publicUserId: effectivePublicUserId || undefined,
      githubId: effectiveGithubId,
      email: effectiveEmail,
      name: effectiveName,
      role: effectiveRole,
      githubUsername: effectiveGithubHandle,
    },
    impersonation: impersonationInfo,
    isActualSuperAdmin: ctx.isSuperAdmin,
    isMemberOfActiveOrg: activeOrgRow ? memberOrgIdsForEffectiveUser.has(activeOrgRow.id) : true,
    organizations,
    activeOrgId: activeOrgRow?.id || "",
    skills,
    teamMembers,
    pendingInvites,
    apiKeys,
    auditEvents,
    featureFlags,
    maintenanceBanner,
  };
}
