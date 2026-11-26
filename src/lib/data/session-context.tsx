"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
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

export interface ImpersonationState {
  active: boolean;
  targetOrgId: string;
  targetOrgSlug: string;
  targetUserId?: string;
  targetUserName?: string;
  targetUserEmail?: string;
  actorEmail: string;
}

export interface MaintenanceBannerState {
  enabled: boolean;
  message: string;
}

interface SessionContextValue {
  currentPersona: UserPersona;
  currentOrg: Organization;
  organizations: Organization[];
  userProfile: UserProfile | null;
  impersonation: ImpersonationState | null;
  isActualSuperAdmin: boolean;
  isMemberOfActiveOrg: boolean;
  maintenanceBanner: MaintenanceBannerState | null;
  sessionLoaded: boolean;
  skills: Skill[];
  auditEvents: AuditEvent[];
  teamMembers: TeamMemberItem[];
  pendingInvites: PendingInviteItem[];
  apiKeys: ApiKeyItem[];
  webhooks: WebhookEndpointItem[];
  featureFlags: FeatureFlagItem[];
  setPersona: (personaKey: string) => void;
  setOrg: (orgId: string) => void;
  refreshSession: (orgIdOverride?: string | null) => Promise<void>;
  startImpersonation: (params: { orgId?: string; userId?: string }) => Promise<boolean>;
  exitImpersonation: () => Promise<void>;
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
  const [, setCurrentPersonaKey] = useState<string>("owner");
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
  const [impersonation, setImpersonation] = useState<ImpersonationState | null>(null);
  const [isActualSuperAdmin, setIsActualSuperAdmin] = useState(false);
  const [isMemberOfActiveOrg, setIsMemberOfActiveOrg] = useState(true);
  const [maintenanceBanner, setMaintenanceBanner] = useState<MaintenanceBannerState | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const clearTenantState = useCallback(() => {
    setUserProfile(null);
    setImpersonation(null);
    setIsActualSuperAdmin(false);
    setIsMemberOfActiveOrg(true);
    setOrganizations([]);
    setCurrentOrgId("");
    setSkills([]);
    setAuditEvents([]);
    setTeamMembers([]);
    setPendingInvites([]);
    setApiKeys([]);
    setFeatureFlags([]);
    setMaintenanceBanner(null);
  }, []);

  const fetchAndApplyWorkspace = useCallback(
    async (orgIdOverride?: string | null) => {
      const qs = orgIdOverride ? `?orgId=${encodeURIComponent(orgIdOverride)}` : "";
      const res = await fetch(`/api/workspace/context${qs}`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          clearTenantState();
        }
        return;
      }

      const payload = await res.json();
      setUserProfile(payload.userProfile || null);
      setImpersonation(payload.impersonation || null);
      setIsActualSuperAdmin(Boolean(payload.isActualSuperAdmin));
      setIsMemberOfActiveOrg(
        payload.isMemberOfActiveOrg !== undefined ? Boolean(payload.isMemberOfActiveOrg) : true
      );
      setOrganizations(Array.isArray(payload.organizations) ? payload.organizations : []);
      setCurrentOrgId(payload.activeOrgId || "");
      setSkills(Array.isArray(payload.skills) ? payload.skills : []);
      setTeamMembers(Array.isArray(payload.teamMembers) ? payload.teamMembers : []);
      setPendingInvites(Array.isArray(payload.pendingInvites) ? payload.pendingInvites : []);
      setApiKeys(Array.isArray(payload.apiKeys) ? payload.apiKeys : []);
      setAuditEvents(Array.isArray(payload.auditEvents) ? payload.auditEvents : []);
      setFeatureFlags(Array.isArray(payload.featureFlags) ? payload.featureFlags : []);
      setMaintenanceBanner(payload.maintenanceBanner || null);
      setCurrentPersonaKey(
        payload.isActualSuperAdmin && !payload.impersonation?.active ? "superadmin" : "owner"
      );
    },
    [clearTenantState]
  );

  const loadLiveSession = useCallback(
    async (orgIdOverride?: string | null) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !user.email) {
          clearTenantState();
          setSessionLoaded(true);
          return;
        }

        await fetchAndApplyWorkspace(orgIdOverride);
      } catch (e) {
        console.warn("[SPM] Supabase live session fetch skipped:", e);
      } finally {
        setSessionLoaded(true);
      }
    },
    [supabase, clearTenantState, fetchAndApplyWorkspace]
  );

  useEffect(() => {
    loadLiveSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        clearTenantState();
        setSessionLoaded(true);
      } else if (event === "SIGNED_IN" && session?.user?.email) {
        clearTenantState();
        loadLiveSession();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, clearTenantState, loadLiveSession]);

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

  const isEffectiveStaff = isActualSuperAdmin && !impersonation?.active;

  const currentPersona: UserPersona = userProfile
    ? {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        role: (userProfile.role as OrgRole) || "owner",
        orgId: currentOrgId,
        isStaff: isEffectiveStaff,
        plan: (currentOrg.plan as PlanTier) || "free",
      }
    : fallbackPersona;

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
      ipAddress: "—",
      countryCode: "—",
    };
    setAuditEvents((prev) => [newEvent, ...prev]);

    if (userProfile?.id && !impersonation?.active) {
      await supabase
        .from("audit_log")
        .insert({
          actor_id: userProfile.publicUserId || userProfile.id,
          action: `${action}: ${resource}`,
          target_type: "resource",
          target_name: resource,
          metadata: { severity, email: userProfile.email, name: userProfile.name },
        })
        .then(() => {});
    }
  };

  const setPersona = (key: string) => {
    if (AVAILABLE_PERSONAS[key]) {
      setCurrentPersonaKey(key);
    }
  };

  const setOrg = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId);
    if (!org) return;
    setCurrentOrgId(orgId);
    // Clear tenant lists immediately while the target org loads from server
    setSkills([]);
    setTeamMembers([]);
    setPendingInvites([]);
    setApiKeys([]);
    setAuditEvents([]);
    fetchAndApplyWorkspace(orgId).catch((e) =>
      console.warn("Organization switch reload error:", e)
    );
  };

  const startImpersonation = async (params: { orgId?: string; userId?: string }) => {
    const res = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(params),
    });
    if (!res.ok) return false;
    clearTenantState();
    await loadLiveSession();
    return true;
  };

  const exitImpersonation = async () => {
    await fetch("/api/admin/impersonate", {
      method: "DELETE",
      credentials: "include",
    });
    clearTenantState();
    await loadLiveSession();
  };

  const addSkill = async (newSkill: Skill) => {
    setSkills((prev) => [newSkill, ...prev]);
    recordAuditEvent("published", `${newSkill.scope}/${newSkill.name}@${newSkill.version}`, "info");

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

  const updateSkillStatus = async (
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
      await supabase
        .from("packages")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", skillId)
        .then(() => {});
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
        impersonation,
        isActualSuperAdmin,
        isMemberOfActiveOrg,
        maintenanceBanner,
        sessionLoaded,
        skills,
        auditEvents,
        teamMembers,
        pendingInvites,
        apiKeys,
        webhooks,
        featureFlags,
        setPersona,
        setOrg,
        refreshSession: loadLiveSession,
        startImpersonation,
        exitImpersonation,
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
