"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/data/session-context";
import { CreateApiKeyModal } from "@/components/modals/CreateApiKeyModal";
import { useToast } from "@/components/ui/ToastProvider";
import {
  KeyRound,
  Bell,
  CreditCard,
  Building2,
  User,
  Plus,
  Save,
  CheckCircle2,
  Shield,
  ExternalLink,
} from "lucide-react";

export default function SettingsPage() {
  const { currentOrg, userProfile, currentPersona, apiKeys, revokeApiKey, refreshSession } = useSession();
  const { showToast } = useToast();
  const [savingSettings, setSavingSettings] = useState(false);

  const [activeTab, setActiveTab] = useState<"profile" | "organization" | "keys" | "notifications" | "billing">("keys");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // Editable Profile fields synced with active/impersonated user profile
  const [profileName, setProfileName] = useState(userProfile?.name || currentPersona.name || "");
  const [profileGithub, setProfileGithub] = useState(userProfile?.githubUsername || "");
  const [profileBio, setProfileBio] = useState("Full-stack engineer & AI registry architect");

  // Editable Organization fields synced with active workspace
  const [orgName, setOrgName] = useState(currentOrg.name || "");
  const [orgSlug, setOrgSlug] = useState(currentOrg.slug || "");
  const [orgBillingEmail, setOrgBillingEmail] = useState(userProfile?.email || currentPersona.email || "");

  useEffect(() => {
    setProfileName(userProfile?.name || currentPersona.name || "");
    setProfileGithub(userProfile?.githubUsername || "");
    setOrgName(currentOrg.name || "");
    setOrgSlug(currentOrg.slug || "");
    setOrgBillingEmail(userProfile?.email || currentPersona.email || "");
  }, [userProfile?.name, userProfile?.githubUsername, userProfile?.email, currentPersona.name, currentPersona.email, currentOrg.name, currentOrg.slug]);

  // Notification toggles
  const [notifications, setNotifications] = useState({
    milestones: true,
    teamMembers: true,
    securityAlerts: true,
    weeklyDigest: true,
    marketing: false,
  });

  // Keyboard shortcut [K] for API Key, [S] for Save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) return;
      if (e.metaKey || e.ctrlKey) return;

      if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        setShowApiKeyModal(true);
      } else if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        handleSavePreferences();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [notifications]);

  const handleSavePreferences = () => {
    showToast({
      title: "Notification Preferences Saved",
      message: "Alert delivery triggers and digests updated.",
      type: "success",
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/workspace/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "profile",
          orgId: currentOrg.id,
          displayName: profileName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }
      await refreshSession(currentOrg.id || null);
      showToast({
        title: "Profile Saved",
        message: `Display name updated to ${data.displayName}.`,
        type: "success",
      });
    } catch (err: unknown) {
      showToast({
        title: "Save Failed",
        message: err instanceof Error ? err.message : "Could not save profile changes.",
        type: "error",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg.id) return;
    setSavingSettings(true);
    try {
      const res = await fetch("/api/workspace/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "organization",
          orgId: currentOrg.id,
          name: orgName,
          slug: orgSlug,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update organization.");
      }
      await refreshSession(currentOrg.id);
      showToast({
        title: "Organization Saved",
        message: `Updated ${data.organization?.name} (${data.organization?.slug}) in Postgres.`,
        type: "success",
      });
    } catch (err: unknown) {
      showToast({
        title: "Save Failed",
        message: err instanceof Error ? err.message : "Could not save organization settings.",
        type: "error",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6 text-black">
      {/* ── SETTINGS TABS ── */}
      <div className="flex items-center gap-1 border-b border-black/10 pb-px font-mono text-xs overflow-x-auto">
        {[
          { id: "profile", label: "Profile", icon: User },
          { id: "organization", label: "Organization", icon: Building2 },
          { id: "keys", label: "API Keys", icon: KeyRound },
          { id: "notifications", label: "Notifications", icon: Bell },
          { id: "billing", label: "Billing", icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-[#1B5FED] text-[#1B5FED]"
                  : "border-transparent text-black/60 hover:text-black"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}

        {/* Enterprise Links */}
        <div className="ml-auto hidden sm:flex items-center gap-2 text-black/50 text-[11px] font-mono">
          <span>Enterprise Tabs:</span>
          <Link href="/app/settings/security" className="text-purple-700 font-semibold hover:underline">Security</Link>
          <span>•</span>
          <Link href="/app/settings/access" className="text-purple-700 font-semibold hover:underline">Access</Link>
          <span>•</span>
          <Link href="/app/settings/compliance" className="text-purple-700 font-semibold hover:underline">Compliance</Link>
        </div>
      </div>

      {/* ── TAB: PROFILE ── */}
      {activeTab === "profile" && (
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-semibold text-black">User Profile</h3>
            <p className="text-xs font-mono text-black/60 mt-0.5">
              Manage personal identity, verified GitHub association, and public GPG signing keys
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 font-mono text-xs max-w-xl">
            <div>
              <label className="block uppercase tracking-wider text-black/70 mb-1 font-semibold">
                Primary Account Email
              </label>
              <input
                type="email"
                disabled
                value={userProfile?.email || currentPersona.email || ""}
                className="w-full rounded-xl border border-black/15 bg-black/[0.03] px-3 py-2 text-black/60 font-mono shadow-xs cursor-not-allowed"
              />
              <span className="text-[11px] text-black/50 mt-1 block">Account authentication email is verified via Supabase.</span>
            </div>

            <div>
              <label className="block uppercase tracking-wider text-black/70 mb-1 font-semibold">
                Display Name
              </label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-black focus:border-[#1B5FED] focus:outline-none shadow-xs"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-black/70 mb-1 font-semibold">
                GitHub Username
              </label>
              <div className="flex items-center gap-2">
                <span className="text-black/50">github.com/</span>
                <input
                  type="text"
                  value={profileGithub}
                  onChange={(e) => setProfileGithub(e.target.value)}
                  className="flex-1 rounded-xl border border-black/15 bg-white px-3 py-2 text-black focus:border-[#1B5FED] focus:outline-none shadow-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block uppercase tracking-wider text-black/70 mb-1 font-semibold">
                Developer Bio
              </label>
              <textarea
                rows={2}
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-black focus:border-[#1B5FED] focus:outline-none shadow-xs font-sans text-xs"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingSettings}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white uppercase font-bold text-xs shadow-md cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── TAB: ORGANIZATION ── */}
      {activeTab === "organization" && (
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-semibold text-black">Organization Settings</h3>
            <p className="text-xs font-mono text-black/60 mt-0.5">
              Workspace configuration, scope identifiers, and contact routing
            </p>
          </div>

          <form onSubmit={handleSaveOrg} className="space-y-4 font-mono text-xs max-w-xl">
            <div>
              <label className="block uppercase tracking-wider text-black/70 mb-1 font-semibold">
                Organization Display Name
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-black focus:border-[#1B5FED] focus:outline-none shadow-xs"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-black/70 mb-1 font-semibold">
                Scope Slug
              </label>
              <input
                type="text"
                required
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value)}
                className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-black focus:border-[#1B5FED] focus:outline-none shadow-xs"
              />
              <span className="text-[11px] text-black/50 mt-1 block">Used as the package namespace prefix (e.g. {orgSlug}/skill-name).</span>
            </div>

            <div>
              <label className="block uppercase tracking-wider text-black/70 mb-1 font-semibold">
                Billing & Security Contact Email
              </label>
              <input
                type="email"
                required
                value={orgBillingEmail}
                onChange={(e) => setOrgBillingEmail(e.target.value)}
                className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-black focus:border-[#1B5FED] focus:outline-none shadow-xs"
              />
            </div>

            <div className="p-3 rounded-xl border border-black/10 bg-black/[0.01] space-y-1">
              <div className="flex justify-between">
                <span className="text-black/50">Registry API Engine:</span>
                <span className="font-semibold text-black">v{currentOrg.registryVersion} (STABLE)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/50">Assigned Quota:</span>
                <span className="font-semibold text-black">{currentOrg.skillsCount} of {currentOrg.skillsAllowed} Skills</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingSettings}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white uppercase font-bold text-xs shadow-md cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Organization</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── TAB: API KEYS PER SPEC ── */}
      {activeTab === "keys" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-semibold text-black">Registry API Keys</h3>
                <p className="text-xs font-mono text-black/60 mt-0.5">
                  Tokens used for CLI automated publishing, CI/CD pipelines, and runtime ingestion
                </p>
              </div>

              <button
                onClick={() => setShowApiKeyModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create API Key</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded">[K]</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-black/10 bg-[#F5F5F7]/80 uppercase tracking-wider text-black/60 text-[11px]">
                    <th className="py-3 px-4">Key Name</th>
                    <th className="py-3 px-4">Masked Prefix</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4">Last Used</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {apiKeys.map((key) => (
                    <tr key={key.id} className="hover:bg-black/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-black">
                        {key.name}
                      </td>
                      <td className="py-3.5 px-4 text-[#1B5FED] font-semibold">
                        {key.prefix}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                          key.type === "live"
                            ? "bg-sky-50 text-[#1B5FED] border border-sky-200"
                            : "bg-black/5 text-black/70 border border-black/10"
                        }`}>
                          {key.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-black/60">
                        {key.createdAt}
                      </td>
                      <td className="py-3.5 px-4 text-black/60">
                        {key.lastUsed}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            revokeApiKey(key.id);
                            showToast({
                              title: "API Key Revoked",
                              message: `Key "${key.name}" is no longer authorized.`,
                              type: "info",
                            });
                          }}
                          className="px-2.5 py-1 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-mono transition-colors shadow-xs cursor-pointer"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: NOTIFICATIONS PER SPEC ── */}
      {activeTab === "notifications" && (
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-semibold text-black">Notification Preferences</h3>
            <p className="text-xs font-mono text-black/60 mt-0.5">Manage in-app and email alert delivery rules</p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {[
              {
                id: "milestones",
                title: "Download Milestones",
                desc: "Send an alert when a skill crosses 1K, 10K, or 100K downloads",
              },
              {
                id: "teamMembers",
                title: "New Team Members",
                desc: "Notify when an invited teammate joins your workspace",
              },
              {
                id: "securityAlerts",
                title: "Security Alerts",
                desc: "Critical alerts for suspicious logins, key rotations, and IP anomalies",
              },
              {
                id: "weeklyDigest",
                title: "Weekly Performance Digest",
                desc: "Aggregated skill consumption report emailed every Monday 08:00 UTC",
              },
              {
                id: "marketing",
                title: "Marketing & Platform Announcements",
                desc: "Feature updates and new Agent SPM framework capabilities (off by default)",
              },
            ].map((item) => (
              <label
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-black/10 bg-black/[0.01] hover:bg-black/[0.03] transition-all cursor-pointer"
              >
                <div>
                  <div className="font-bold text-black text-xs">{item.title}</div>
                  <div className="text-[11px] text-black/60 mt-0.5 font-sans">{item.desc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[item.id as keyof typeof notifications]}
                  onChange={(e) =>
                    setNotifications({ ...notifications, [item.id]: e.target.checked })
                  }
                  className="rounded border-black/20 text-[#1B5FED] focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </label>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={handleSavePreferences}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B5FED] text-white font-mono text-xs font-semibold uppercase tracking-wider shadow-sm hover:bg-[#1B5FED]/90 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Preferences [S]</span>
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: BILLING PER SPEC ── */}
      {activeTab === "billing" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-black">Workspace Subscription Plan</h3>
              <p className="text-xs font-mono text-black/60 mt-0.5">Manage quotas, payment cards, and invoices</p>
            </div>
            <Link
              href="/app/billing"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs uppercase font-semibold shadow-xs"
            >
              <span>Dedicated Billing Dashboard</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                id: "free",
                name: "Free",
                price: "$0",
                period: "forever",
                skills: "5 skills",
                seats: "3 seats",
                support: "Community support",
                current: currentOrg.plan === "free",
              },
              {
                id: "pro",
                name: "Pro",
                price: "$29",
                period: "/ month",
                skills: "50 skills",
                seats: "100 seats",
                support: "Priority email & chat",
                current: currentOrg.plan === "pro",
              },
              {
                id: "enterprise",
                name: "Enterprise",
                price: "Custom",
                period: "annual",
                skills: "500 skills",
                seats: "500 seats",
                support: "24/7 Dedicated SLA",
                current: currentOrg.plan === "enterprise",
              },
            ].map((pl) => (
              <div
                key={pl.id}
                className={`rounded-2xl border p-6 flex flex-col justify-between ${
                  pl.current
                    ? "border-[#1B5FED] bg-[#1B5FED]/5 shadow-md ring-1 ring-[#1B5FED]"
                    : "border-black/10 bg-white shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase font-bold text-black">{pl.name}</span>
                    {pl.current && (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#1B5FED] text-white font-bold">
                        CURRENT PLAN
                      </span>
                    )}
                  </div>
                  <div className="mt-3 font-sans text-3xl font-bold text-black">
                    {pl.price} <span className="text-xs font-mono text-black/60 font-normal">{pl.period}</span>
                  </div>

                  <ul className="mt-4 space-y-2 text-xs font-mono text-black/70 border-t border-black/10 pt-4">
                    <li>• {pl.skills}</li>
                    <li>• {pl.seats}</li>
                    <li>• {pl.support}</li>
                  </ul>
                </div>

                <div className="mt-6">
                  {pl.current ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-black/5 font-mono text-xs text-black/50 font-semibold uppercase border border-black/10"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <Link
                      href="/app/billing"
                      className="block w-full py-2.5 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-center font-mono text-xs text-white font-semibold uppercase shadow-sm"
                    >
                      {pl.id === "enterprise" ? "Contact Sales" : "Upgrade Plan"}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Key Modal */}
      <CreateApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
      />
    </div>
  );
}
