"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  UserPersona,
  Organization,
  Skill,
  AuditEvent,
  TeamMemberItem,
  PendingInviteItem,
  ApiKeyItem,
  WebhookEndpointItem,
  FeatureFlagItem,
  OrgRole,
  PlanTier,
  Visibility,
  AuditSeverity,
  AVAILABLE_PERSONAS,
} from "./mock-store";

const DEFAULT_WORKSPACE_ORG: Organization = {
  id: "",
  name: "Personal Workspace",
  slug: "@workspace",
  plan: "free",
  skillsCount: 0,
  skillsAllowed: 5,
  seatsUsed: 1,
  seatsAllowed: 3,
  registryVersion: "2.4.0",
  createdAt: "2026-01-01",
};

export interface UserProfile {
  id: string;
  publicUserId?: string;
  githubId?: string;
  email: string;
  name: string;
  role: string;
  githubUsername?: string;
}

interface SessionContextValue {
  currentPersona: UserPersona;
  currentOrg: Organization;
  organizations: Organization[];
  userProfile: UserProfile | null;
  skills: Skill[];
  auditEvents: AuditEvent[];
  teamMembers: TeamMemberItem[];
  pendingInvites: PendingInviteItem[];
  apiKeys: ApiKeyItem[];
  webhooks: WebhookEndpointItem[];
  featureFlags: FeatureFlagItem[];
  setPersona: (personaKey: string) => void;
  setOrg: (orgId: string) => void;
  addSkill: (newSkill: Skill) => void;
  updateSkillStatus: (skillId: string, status: "published" | "draft" | "deprecated") => void;
  deleteSkill: (skillId: string) => void;
  inviteMember: (email: string, role: string) => boolean;
  revokeInvite: (inviteId: string) => void;
  createApiKey: (name: string, type: "live" | "read-only") => Promise<string>;
  revokeApiKey: (keyId: string) => void;
  toggleFeatureFlag: (flagId: string) => void;
  recordAuditEvent: (action: string, resource: string, severity?: "info" | "warning" | "critical") => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [currentPersonaKey, setCurrentPersonaKey] = useState<string>("owner");
  const [currentOrgId, setCurrentOrgId] = useState<string>("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberItem[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInviteItem[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [webhooks] = useState<WebhookEndpointItem[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlagItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  // Load authenticated user session and tenant-scoped Supabase records
  useEffect(() => {
    const clearTenantState = () => {
      setUserProfile(null);
      setOrganizations([]);
      setCurrentOrgId("");
      setSkills([]);
      setAuditEvents([]);
      setTeamMembers([]);
      setPendingInvites([]);
      setApiKeys([]);
    };

    async function loadLiveSession() {
      try {
        // 1. Verify authenticated user first before loading tenant workspace state
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !user.email) {
          clearTenantState();
          return;
        }

        const cleanUserEmail = user.email.toLowerCase();

        // 2. Resolve public.users record using live schema columns (id, role, display_name)
        let publicUser: {
          id: string;
          role?: string | null;
          display_name?: string | null;
        } | null = null;

        const { data: byUid } = await supabase
          .from("users")
          .select("id, role, display_name")
          .eq("supabase_uid", user.id)
          .maybeSingle();

        if (byUid) {
          publicUser = byUid;
        } else {
          const { data: byEmail } = await supabase
            .from("users")
            .select("id, role, display_name")
            .eq("email", cleanUserEmail)
            .maybeSingle();
          publicUser = byEmail;
        }

        const superadminList = (process.env.NEXT_PUBLIC_SUPERADMIN_EMAILS || "lakshitsoni26@gmail.com")
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);
        const isSuperAdmin =
          superadminList.includes(cleanUserEmail) || publicUser?.role === "superadmin";

        const githubIdentity = user.identities?.find((i) => i.provider === "github");
        const githubIdentityData = githubIdentity?.identity_data as Record<string, unknown> | undefined;

        const displayName =
          publicUser?.display_name ||
          (typeof githubIdentityData?.full_name === "string" ? githubIdentityData.full_name : undefined) ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email.split("@")[0];
        const githubUsername =
          (typeof githubIdentityData?.user_name === "string"
            ? githubIdentityData.user_name
            : typeof githubIdentityData?.preferred_username === "string"
              ? githubIdentityData.preferred_username
              : undefined) ||
          user.user_metadata?.user_name ||
          user.user_metadata?.github_username ||
          undefined;
        const githubId = githubIdentity?.id ? String(githubIdentity.id) : undefined;

        setUserProfile({
          id: user.id,
          publicUserId: publicUser?.id,
          githubId,
          email: user.email,
          name: displayName,
          role: isSuperAdmin ? "superadmin" : publicUser?.role || "owner",
          githubUsername,
        });

        setCurrentPersonaKey(isSuperAdmin ? "superadmin" : "owner");

        // 3. Fetch user's real organizations from database (RLS enforces tenant membership)
        const { data: orgData } = await supabase
          .from("organizations")
          .select("id, name, slug, plan, seats_allowed")
          .order("created_at", { ascending: true })
          .limit(20);

        const activeOrgId = orgData?.[0]?.id || "";
        const activeOrgSlug =
          orgData?.[0]?.slug
            ? orgData[0].slug.startsWith("@")
              ? orgData[0].slug
              : `@${orgData[0].slug}`
            : "@workspace";

        // 4. Fetch packages scoped to authenticated user's identities (or all for superadmin)
        const ownerCandidates = Array.from(
          new Set([user.id, publicUser?.id, githubId].filter((v): v is string => Boolean(v)))
        );

        let loadedSkills: Skill[] = [];
        if (isSuperAdmin || ownerCandidates.length > 0) {
          let pkgQuery = supabase
            .from("packages")
            .select(
              "id, name, description, latest_version, total_downloads, verified, visibility, owner_id, created_at, updated_at"
            )
            .order("total_downloads", { ascending: false });

          if (!isSuperAdmin) {
            pkgQuery = pkgQuery.in("owner_id", ownerCandidates);
          }

          const { data: pkgData } = await pkgQuery;
          if (pkgData && pkgData.length > 0) {
            loadedSkills = pkgData.map((p) => {
              const isScoped = p.name.startsWith("@") && p.name.includes("/");
              const scope = isScoped ? p.name.split("/")[0] : activeOrgSlug;
              const rawName = isScoped ? p.name.split("/")[1] : p.name;
              return {
                id: p.id,
                scope,
                name: rawName,
                version: p.latest_version || "1.0.0",
                status: "published" as const,
                visibility: (p.visibility as Visibility) || "public",
                description: p.description || "Autonomous agent procedural execution package.",
                license: "MIT",
                readme: `# ${p.name}\n\n${p.description || "Production AI Agent Skill"}`,
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
                updatedAt: p.updated_at ? p.updated_at.split("T")[0] : new Date().toISOString().split("T")[0],
                versions: [
                  {
                    version: p.latest_version || "1.0.0",
                    digest: "sha256:pending",
                    signature: p.verified ? "verified" : "community",
                    tarballSize: "—",
                    downloads: p.total_downloads || 0,
                    publishedAt: p.created_at ? p.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
                    publishedBy: displayName,
                  },
                ],
              };
            });
          }
        }
        setSkills(loadedSkills);

        if (orgData && orgData.length > 0) {
          const liveOrgs: Organization[] = orgData.map((o) => ({
            id: o.id,
            name: o.name,
            slug: o.slug.startsWith("@") ? o.slug : `@${o.slug}`,
            plan: (o.plan as PlanTier) || "free",
            skillsCount: loadedSkills.length,
            skillsAllowed: o.plan === "enterprise" ? 500 : o.plan === "pro" ? 50 : 5,
            seatsUsed: 1,
            seatsAllowed: o.seats_allowed || (o.plan === "enterprise" ? 500 : o.plan === "pro" ? 100 : 3),
            registryVersion: "2.4.0",
            createdAt: new Date().toISOString().split("T")[0],
          }));
          setOrganizations(liveOrgs);
          setCurrentOrgId(liveOrgs[0].id);
        } else {
          setOrganizations([]);
          setCurrentOrgId("");
        }

        // 5. Fetch real API keys scoped to this user
        const ownerIds = Array.from(
          new Set([publicUser?.id, user.id].filter((v): v is string => Boolean(v)))
        );
        const { data: keysData } = await supabase
          .from("api_keys")
          .select("id, name, key_prefix, type, created_at, last_used_at, user_id")
          .in("user_id", ownerIds);

        if (keysData && keysData.length > 0) {
          const liveKeys: ApiKeyItem[] = keysData.map((k) => ({
            id: k.id,
            name: k.name,
            prefix: k.key_prefix,
            type: k.type,
            createdAt: new Date(k.created_at).toISOString().split("T")[0],
            lastUsed: k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : "Never",
          }));
          setApiKeys(liveKeys);
        } else {
          setApiKeys([]);
        }

        // 6. Fetch real audit logs (RLS filters non-superadmins to their own actor_id)
        const { data: auditData } = await supabase
          .from("audit_log")
          .select("id, actor_id, action, target_type, target_name, metadata, created_at")
          .order("created_at", { ascending: false })
          .limit(20);

        if (auditData && auditData.length > 0) {
          const liveAuditEvents: AuditEvent[] = auditData.map((a) => {
            const isCurrentActor =
              a.actor_id === user.id ||
              (publicUser?.id && a.actor_id === publicUser.id) ||
              (githubId && a.actor_id === githubId);
            const metaEmail = typeof a.metadata?.email === "string" ? a.metadata.email : undefined;
            const actorEmail = metaEmail || (isCurrentActor ? user.email! : "member@workspace");
            const actorName =
              (typeof a.metadata?.name === "string" ? a.metadata.name : undefined) ||
              (isCurrentActor ? displayName : actorEmail.split("@")[0] || "Team Member");
            return {
              id: a.id,
              timestamp: a.created_at || new Date().toISOString(),
              actor: {
                name: actorName,
                email: actorEmail,
              },
              action: a.action,
              severity: (a.metadata?.severity as AuditSeverity) || "info",
              resource: a.target_name || a.action,
              ipAddress: "—",
              countryCode: "—",
            };
          });
          setAuditEvents(liveAuditEvents);
        } else {
          setAuditEvents([]);
        }

        // 7. Fetch real organization members and pending invites if an org exists
        if (activeOrgId) {
          const { data: memberRows } = await supabase
            .from("organization_members")
            .select("id, role, created_at, user_id, org_id, users:user_id (id, email, display_name)")
            .eq("org_id", activeOrgId)
            .limit(50);

          if (memberRows && memberRows.length > 0) {
            const seenEmails = new Set<string>();
            const liveMembers: TeamMemberItem[] = [];

            interface MemberRow {
              id: string;
              role?: string | null;
              created_at?: string | null;
              user_id: string;
              org_id: string;
              users?:
                | { id: string; email?: string | null; display_name?: string | null }
                | Array<{ id: string; email?: string | null; display_name?: string | null }>
                | null;
            }

            for (let idx = 0; idx < memberRows.length; idx++) {
              const m = memberRows[idx] as MemberRow;
              const linkedUser = Array.isArray(m.users) ? m.users[0] : m.users;
              const isCurrent =
                (publicUser?.id && m.user_id === publicUser.id) || m.user_id === user.id;

              const memberEmail =
                linkedUser?.email ||
                (isCurrent ? user.email! : `member-${String(m.user_id).slice(0, 6)}@workspace`);
              const memberName =
                linkedUser?.display_name ||
                (isCurrent ? displayName : memberEmail.split("@")[0] || "Team Member");

              if (!seenEmails.has(memberEmail.toLowerCase())) {
                seenEmails.add(memberEmail.toLowerCase());
                liveMembers.push({
                  id: m.id || `tm_${idx}`,
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
                  skillsCount: loadedSkills.length,
                  status: "active" as const,
                });
              }
            }
            setTeamMembers(liveMembers);
            setOrganizations((prev) =>
              prev.map((org) =>
                org.id === activeOrgId ? { ...org, seatsUsed: liveMembers.length } : org
              )
            );
          } else {
            setTeamMembers([
              {
                id: publicUser?.id || user.id,
                name: displayName,
                email: user.email,
                role: "owner",
                joinedDate: new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
                skillsCount: loadedSkills.length,
                status: "active",
              },
            ]);
          }

          const { data: inviteRows } = await supabase
            .from("pending_invites")
            .select("id, email, role, created_at")
            .eq("org_id", activeOrgId);

          if (inviteRows && inviteRows.length > 0) {
            setPendingInvites(
              inviteRows.map((inv) => ({
                id: inv.id,
                email: inv.email,
                role: inv.role as OrgRole,
                sentAgo: inv.created_at
                  ? new Date(inv.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "Recently",
              }))
            );
          } else {
            setPendingInvites([]);
          }
        } else {
          setTeamMembers([
            {
              id: publicUser?.id || user.id,
              name: displayName,
              email: user.email,
              role: "owner",
              joinedDate: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              skillsCount: loadedSkills.length,
              status: "active",
            },
          ]);
          setPendingInvites([]);
        }
      } catch (e) {
        console.warn("[SPM] Supabase live session fetch skipped:", e);
      }
    }

    loadLiveSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        clearTenantState();
      } else if (event === "SIGNED_IN" && session?.user?.email) {
        loadLiveSession();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Sync persona from local storage only if authenticated
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPersona = localStorage.getItem("spm_persona");
      if (savedPersona && AVAILABLE_PERSONAS[savedPersona]) {
        setCurrentPersonaKey(savedPersona);
      }
    }
  }, []);

  const fallbackPersona: UserPersona = {
    id: "anonymous",
    name: "Guest Developer",
    email: "",
    role: "viewer",
    orgId: currentOrgId,
    isStaff: false,
    plan: "free",
  };

  const currentOrg =
    organizations.find((o) => o.id === currentOrgId) ||
    organizations[0] ||
    DEFAULT_WORKSPACE_ORG;

  const currentPersona: UserPersona = userProfile
    ? {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        role: (userProfile.role as OrgRole) || "owner",
        orgId: currentOrgId,
        isStaff:
          userProfile.role === "superadmin" ||
          (process.env.NEXT_PUBLIC_SUPERADMIN_EMAILS || "lakshitsoni26@gmail.com")
            .split(",")
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean)
            .includes(userProfile.email.toLowerCase()),
        plan: (currentOrg.plan as PlanTier) || "free",
      }
    : fallbackPersona;

  const setPersona = (key: string) => {
    if (AVAILABLE_PERSONAS[key]) {
      setCurrentPersonaKey(key);
      if (typeof window !== "undefined") {
        localStorage.setItem("spm_persona", key);
      }
      recordAuditEvent("switched persona", `Switched to persona ${AVAILABLE_PERSONAS[key].name}`);
    }
  };

  const setOrg = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId);
    if (org) {
      setCurrentOrgId(orgId);
      recordAuditEvent("switched organization", `Switched to ${org.slug}`);
    }
  };

  const recordAuditEvent = async (
    action: string,
    resource: string,
    severity: "info" | "warning" | "critical" = "info"
  ) => {
    const newEvent: AuditEvent = {
      id: `evt_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: {
        name: currentPersona.name,
        email: currentPersona.email,
        avatarUrl: currentPersona.avatarUrl,
      },
      action,
      severity,
      resource,
      ipAddress: "127.0.0.1",
      countryCode: "IN",
    };
    setAuditEvents((prev) => [newEvent, ...prev]);

    // Insert to public.audit_log if user is signed in
    if (userProfile?.id) {
      await supabase
        .from("audit_log")
        .insert({
          actor_id: userProfile.publicUserId || userProfile.id,
          action: `${action}: ${resource}`,
          target_type: "resource",
          target_name: resource,
          metadata: { severity, email: userProfile.email },
        })
        .then(() => {});
    }
  };

  const addSkill = async (newSkill: Skill) => {
    setSkills((prev) => [newSkill, ...prev]);
    recordAuditEvent("published", `${newSkill.scope}/${newSkill.name}@${newSkill.version}`, "info");

    // Insert into public.packages in Supabase
    if (userProfile?.id) {
      const fullName = `${newSkill.scope}/${newSkill.name}`;
      const { error } = await supabase.from("packages").insert({
        name: fullName,
        description: newSkill.description,
        owner_id: userProfile.githubId || userProfile.publicUserId || userProfile.id,
        visibility: newSkill.visibility || "public",
        latest_version: newSkill.version,
        total_downloads: 0,
        verified: true,
      });
      if (error) {
        console.warn("Supabase addSkill insert error:", error.message);
      }
    }
  };

  const updateSkillStatus = (
    skillId: string,
    status: "published" | "draft" | "deprecated"
  ) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === skillId ? { ...s, status } : s))
    );
    const target = skills.find((s) => s.id === skillId);
    if (target) {
      recordAuditEvent(
        status === "deprecated" ? "deprecated" : "updated status",
        `${target.scope}/${target.name}`,
        status === "deprecated" ? "warning" : "info"
      );
    }
  };

  const deleteSkill = async (skillId: string) => {
    const target = skills.find((s) => s.id === skillId);
    setSkills((prev) => prev.filter((s) => s.id !== skillId));
    if (target) {
      recordAuditEvent("deleted", `${target.scope}/${target.name}`, "critical");
      if (userProfile?.id) {
        const pkgCandidates = Array.from(
          new Set([`${target.scope}/${target.name}`, target.name])
        );
        await supabase.from("package_versions").delete().in("package_name", pkgCandidates);
        const { error } = await supabase.from("packages").delete().eq("id", skillId);
        if (error) {
          console.warn("Supabase deleteSkill error:", error.message);
        }
      }
    }
  };

  const inviteMember = (email: string, role: string) => {
    if (!currentOrg.id) {
      return false;
    }

    const tempId = `inv_${Date.now()}`;
    const newInvite: PendingInviteItem = {
      id: tempId,
      email,
      role: role as OrgRole,
      sentAgo: "Just now",
    };
    setPendingInvites((prev) => [newInvite, ...prev]);
    recordAuditEvent("invited", `${email} as ${role}`, "info");

    // Send real invitation email via Resend API route and persist to Supabase
    fetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        role,
        orgId: currentOrg.id,
        orgName: currentOrg.name,
        orgSlug: currentOrg.slug,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.invite?.id) {
          setPendingInvites((prev) =>
            prev.map((i) => (i.id === tempId ? { ...i, id: data.invite.id } : i))
          );
        }
      })
      .catch((err) => console.error("Invite dispatch error:", err));

    return true;
  };

  const revokeInvite = async (inviteId: string) => {
    const invite = pendingInvites.find((i) => i.id === inviteId);
    setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
    if (invite) {
      recordAuditEvent("revoked invite", invite.email, "warning");
    }

    // Persist deletion in Supabase pending_invites table
    try {
      await supabase.from("pending_invites").delete().eq("id", inviteId);
    } catch (err) {
      console.warn("Revoke invite db error:", err);
    }
  };

  const createApiKey = async (name: string, type: "live" | "read-only") => {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    const rawRandom = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    const fullKey = type === "live" ? `spm_live_${rawRandom}` : `spm_read_${rawRandom}`;
    const prefix = `${fullKey.substring(0, 14)}...`;
    const hashed = await sha256(fullKey);
    const localId = `key_${Date.now()}`;

    const newKeyItem: ApiKeyItem = {
      id: localId,
      name,
      prefix,
      type,
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
    };
    setApiKeys((prev) => [newKeyItem, ...prev]);
    recordAuditEvent("created API key", `${name} (${prefix})`, "info");

    // Store in Supabase api_keys table with valid public.users FK and org_id
    if (userProfile?.id) {
      const { data: insertedKey, error: insertError } = await supabase
        .from("api_keys")
        .insert({
          user_id: userProfile.publicUserId || userProfile.id,
          org_id: currentOrg.id || null,
          name,
          key_prefix: prefix,
          key_hash: hashed,
          type,
        })
        .select("id")
        .maybeSingle();

      if (insertError) {
        console.warn("Supabase createApiKey insert error:", insertError.message);
      } else if (insertedKey?.id) {
        setApiKeys((prev) =>
          prev.map((k) => (k.id === localId ? { ...k, id: insertedKey.id } : k))
        );
      }
    }

    return fullKey;
  };

  const revokeApiKey = async (keyId: string) => {
    const key = apiKeys.find((k) => k.id === keyId);
    setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
    if (key) {
      recordAuditEvent("revoked API key", key.name, "critical");
      if (userProfile?.id) {
        await supabase
          .from("api_keys")
          .delete()
          .eq("id", keyId)
          .then(() => {});
      }
    }
  };

  const toggleFeatureFlag = (flagId: string) => {
    setFeatureFlags((prev) =>
      prev.map((f) => (f.id === flagId ? { ...f, enabled: !f.enabled } : f))
    );
    const flag = featureFlags.find((f) => f.id === flagId);
    if (flag) {
      recordAuditEvent("toggled feature flag", `${flag.name} -> ${!flag.enabled}`, "warning");
    }
  };

  return (
    <SessionContext.Provider
      value={{
        currentPersona,
        currentOrg,
        organizations,
        userProfile,
        skills,
        auditEvents,
        teamMembers,
        pendingInvites,
        apiKeys,
        webhooks,
        featureFlags,
        setPersona,
        setOrg,
        addSkill,
        updateSkillStatus,
        deleteSkill,
        inviteMember,
        revokeInvite,
        createApiKey,
        revokeApiKey,
        toggleFeatureFlag,
        recordAuditEvent,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
