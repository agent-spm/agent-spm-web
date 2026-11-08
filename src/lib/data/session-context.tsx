"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
  AVAILABLE_PERSONAS,
  SEED_ORGANIZATIONS,
  SEED_SKILLS,
  SEED_AUDIT_EVENTS,
  SEED_TEAM_MEMBERS,
  SEED_PENDING_INVITES,
  SEED_API_KEYS,
  SEED_WEBHOOKS,
  SEED_FEATURE_FLAGS,
} from "./mock-store";

interface SessionContextValue {
  currentPersona: UserPersona;
  currentOrg: Organization;
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
  createApiKey: (name: string, type: "live" | "read-only") => string;
  revokeApiKey: (keyId: string) => void;
  toggleFeatureFlag: (flagId: string) => void;
  recordAuditEvent: (action: string, resource: string, severity?: "info" | "warning" | "critical") => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [currentPersonaKey, setCurrentPersonaKey] = useState<string>("owner");
  const [currentOrgId, setCurrentOrgId] = useState<string>("org_acme_labs");
  const [skills, setSkills] = useState<Skill[]>(SEED_SKILLS);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(SEED_AUDIT_EVENTS);
  const [teamMembers, setTeamMembers] = useState<TeamMemberItem[]>(SEED_TEAM_MEMBERS);
  const [pendingInvites, setPendingInvites] = useState<PendingInviteItem[]>(SEED_PENDING_INVITES);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(SEED_API_KEYS);
  const [webhooks, setWebhooks] = useState<WebhookEndpointItem[]>(SEED_WEBHOOKS);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlagItem[]>(SEED_FEATURE_FLAGS);

  // Sync persona and org from local storage if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPersona = localStorage.getItem("spm_persona");
      if (savedPersona && AVAILABLE_PERSONAS[savedPersona]) {
        setCurrentPersonaKey(savedPersona);
      }
    }
  }, []);

  const currentPersona = AVAILABLE_PERSONAS[currentPersonaKey] || AVAILABLE_PERSONAS.owner;
  const currentOrg =
    SEED_ORGANIZATIONS.find((o) => o.id === currentOrgId) || SEED_ORGANIZATIONS[0];

  const setPersona = (key: string) => {
    if (AVAILABLE_PERSONAS[key]) {
      setCurrentPersonaKey(key);
      if (typeof window !== "undefined") {
        localStorage.setItem("spm_persona", key);
      }
      recordAuditEvent("switched persona", `Switched to persona ${AVAILABLE_PERSONAS[key].name} (${AVAILABLE_PERSONAS[key].role})`);
    }
  };

  const setOrg = (orgId: string) => {
    const org = SEED_ORGANIZATIONS.find((o) => o.id === orgId);
    if (org) {
      setCurrentOrgId(orgId);
      recordAuditEvent("switched organization", `Switched to ${org.slug}`);
    }
  };

  const recordAuditEvent = (
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
      countryCode: "US",
    };
    setAuditEvents((prev) => [newEvent, ...prev]);
  };

  const addSkill = (newSkill: Skill) => {
    setSkills((prev) => [newSkill, ...prev]);
    recordAuditEvent("published", `${newSkill.scope}/${newSkill.name}@${newSkill.version}`, "info");
  };

  const updateSkillStatus = (
    skillId: string,
    status: "published" | "draft" | "deprecated"
  ) => {
    setSkills((prev) =>
      prev.map((s) => {
        if (s.id === skillId) {
          return {
            ...s,
            status,
            downloadSparkline:
              status === "deprecated"
                ? [900, 750, 600, 450, 320, 210, 150, 90, 50, 30, 20, 10, 5, 2]
                : s.downloadSparkline,
          };
        }
        return s;
      })
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

  const deleteSkill = (skillId: string) => {
    const target = skills.find((s) => s.id === skillId);
    setSkills((prev) => prev.filter((s) => s.id !== skillId));
    if (target) {
      recordAuditEvent("deleted", `${target.scope}/${target.name}`, "critical");
    }
  };

  const inviteMember = (email: string, role: string) => {
    // Check seat count (e.g. 6 active + 2 pending = 8/10)
    const currentSeatsUsed = teamMembers.length + pendingInvites.length;
    if (currentSeatsUsed >= currentOrg.seatsAllowed) {
      return false; // Quota full!
    }

    const newInvite: PendingInviteItem = {
      id: `inv_${Date.now()}`,
      email,
      role: role as any,
      sentAgo: "Just now",
    };
    setPendingInvites((prev) => [newInvite, ...prev]);
    recordAuditEvent("invited", `${email} as ${role}`, "info");
    return true;
  };

  const revokeInvite = (inviteId: string) => {
    const invite = pendingInvites.find((i) => i.id === inviteId);
    setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
    if (invite) {
      recordAuditEvent("revoked invite", invite.email, "warning");
    }
  };

  const createApiKey = (name: string, type: "live" | "read-only") => {
    const rawRandom = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const fullKey = type === "live" ? `spm_live_${rawRandom}` : `spm_read_${rawRandom}`;
    const prefix = `${fullKey.substring(0, 14)}...`;

    const newKeyItem: ApiKeyItem = {
      id: `key_${Date.now()}`,
      name,
      prefix,
      type,
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
    };
    setApiKeys((prev) => [newKeyItem, ...prev]);
    recordAuditEvent("created API key", `${name} (${prefix})`, "info");
    return fullKey;
  };

  const revokeApiKey = (keyId: string) => {
    const key = apiKeys.find((k) => k.id === keyId);
    setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
    if (key) {
      recordAuditEvent("revoked API key", key.name, "critical");
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
