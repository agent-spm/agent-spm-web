"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/data/session-context";
import { CreateApiKeyModal } from "@/components/modals/CreateApiKeyModal";
import {
  KeyRound,
  Bell,
  CreditCard,
  Building2,
  User,
  Plus,
} from "lucide-react";

export default function SettingsPage() {
  const { currentOrg, currentPersona, apiKeys, revokeApiKey } = useSession();
  const [activeTab, setActiveTab] = useState<"profile" | "organization" | "keys" | "notifications" | "billing">("keys");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // Notification toggles
  const [notifications, setNotifications] = useState({
    milestones: true,
    teamMembers: true,
    securityAlerts: true,
    weeklyDigest: true,
    marketing: false,
  });

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
              onClick={() => setActiveTab(tab.id as any)}
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
                          onClick={() => revokeApiKey(key.id)}
                          className="px-2.5 py-1 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-mono transition-colors shadow-xs"
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
                  checked={(notifications as any)[item.id]}
                  onChange={(e) =>
                    setNotifications({ ...notifications, [item.id]: e.target.checked })
                  }
                  className="rounded border-black/20 text-[#1B5FED] focus:ring-0 w-4 h-4"
                />
              </label>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => alert("Notification settings saved.")}
              className="px-4 py-2 rounded-xl bg-[#1B5FED] text-white font-mono text-xs font-semibold uppercase tracking-wider shadow-sm hover:bg-[#1B5FED]/90 transition-all cursor-pointer"
            >
              Save Preferences [S]
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: BILLING PER SPEC ── */}
      {activeTab === "billing" && (
        <div className="space-y-6">
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
                seats: "10 seats",
                support: "Priority email & chat",
                current: currentOrg.plan === "pro",
              },
              {
                id: "enterprise",
                name: "Enterprise",
                price: "Custom",
                period: "annual",
                skills: "Unlimited skills",
                seats: "Unlimited seats",
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
                      href="/pricing"
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

      {/* ── TAB: PROFILE & ORG ── */}
      {(activeTab === "profile" || activeTab === "organization") && (
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-black capitalize">{activeTab} Details</h3>
          <p className="text-xs font-mono text-black/60">
            {activeTab === "profile" ? "Manage user identity and public GPG signing keys." : "Manage organization handle and billing address."}
          </p>
          <div className="p-4 rounded-xl border border-black/10 bg-black/[0.02] font-mono text-xs text-black/80 space-y-2">
            <div><strong>Handle / Slug:</strong> {activeTab === "profile" ? currentPersona.email : currentOrg.slug}</div>
            <div><strong>Display Name:</strong> {activeTab === "profile" ? currentPersona.name : currentOrg.name}</div>
            <div><strong>Registry Version:</strong> {currentOrg.registryVersion}</div>
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