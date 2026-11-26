"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/data/session-context";
import { useToast } from "@/components/ui/ToastProvider";
import { escapeCsvCell } from "@/lib/security/sanitize";
import {
  Bell,
  Search,
  Menu,
  ChevronRight,
  Plus,
  KeyRound,
  UserPlus,
  Check,
  ShieldAlert,
} from "lucide-react";

interface TopbarProps {
  onOpenMobileMenu?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenInviteModal?: () => void;
  onOpenApiKeyModal?: () => void;
  onOpenWebhookModal?: () => void;
}

export function Topbar({
  onOpenMobileMenu,
  onOpenCommandPalette,
  onOpenInviteModal,
  onOpenApiKeyModal,
  onOpenWebhookModal,
}: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { auditEvents, currentOrg, skills, teamMembers } = useSession();
  const { showToast } = useToast();
  const [showNotifications, setShowNotifications] = useState(false);

  const downloadCsv = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Compute breadcrumbs and primary action button
  const getPageMeta = () => {
    if (pathname === "/app") {
      return {
        title: "Overview",
        breadcrumbs: [{ label: "Dashboard", href: "/app" }, { label: "Overview", href: "/app" }],
        action: { label: "Publish Skill", shortcut: "P", onClick: () => router.push("/app/skills/publish"), icon: Plus },
      };
    }
    if (pathname === "/app/skills") {
      return {
        title: "My Skills",
        breadcrumbs: [{ label: "Dashboard", href: "/app" }, { label: "Skills", href: "/app/skills" }],
        action: { label: "Publish New Skill", shortcut: "P", onClick: () => router.push("/app/skills/publish"), icon: Plus },
      };
    }
    if (pathname === "/app/skills/publish") {
      return {
        title: "Publish Skill Wizard",
        breadcrumbs: [{ label: "Dashboard", href: "/app" }, { label: "Skills", href: "/app/skills" }, { label: "Publish", href: "/app/skills/publish" }],
        action: { label: "Save Draft", shortcut: "S", onClick: () => router.push("/app/skills") },
      };
    }
    if (pathname === "/app/skills/workspace" || pathname === "/app/dag") {
      return {
        title: "Workspace DAG Studio",
        breadcrumbs: [
          { label: "Dashboard", href: "/app" },
          { label: "Skills", href: "/app/skills" },
          { label: "DAG Studio", href: "/app/skills/workspace" },
        ],
        action: { label: "Publish Skill", shortcut: "P", onClick: () => router.push("/app/skills/publish"), icon: Plus },
      };
    }
    if (pathname === "/app/fleet") {
      return {
        title: "Agent Fleet War-Room",
        breadcrumbs: [
          { label: "Dashboard", href: "/app" },
          { label: "Fleet War-Room", href: "/app/fleet" },
        ],
        action: { label: "API Keys", shortcut: "K", onClick: onOpenApiKeyModal, icon: KeyRound },
      };
    }
    if (pathname === "/app/tools/schema-diet") {
      return {
        title: "Schema Token Diet",
        breadcrumbs: [
          { label: "Dashboard", href: "/app" },
          { label: "Schema Diet", href: "/app/tools/schema-diet" },
        ],
        action: { label: "Publish Skill", shortcut: "P", onClick: () => router.push("/app/skills/publish"), icon: Plus },
      };
    }
    if (pathname.startsWith("/app/skills/")) {
      const parts = pathname.split("/");
      const skillName = parts.slice(3).join("/");
      return {
        title: decodeURIComponent(skillName),
        breadcrumbs: [{ label: "Dashboard", href: "/app" }, { label: "Skills", href: "/app/skills" }, { label: decodeURIComponent(skillName), href: pathname }],
        action: { label: "New Version", shortcut: "N", onClick: () => router.push("/app/skills/publish"), icon: Plus },
      };
    }
    if (pathname === "/app/team") {
      return {
        title: "Team & Permissions",
        breadcrumbs: [{ label: "Dashboard", href: "/app" }, { label: "Team", href: "/app/team" }],
        action: { label: "Invite Member", shortcut: "I", onClick: onOpenInviteModal, icon: UserPlus },
      };
    }
    if (pathname === "/app/analytics") {
      const totalWorkspaceDownloads = skills.reduce((sum, s) => sum + (s.totalDownloads || 0), 0);
      return {
        title: "Analytics & Telemetry",
        breadcrumbs: [{ label: "Dashboard", href: "/app" }, { label: "Analytics", href: "/app/analytics" }],
        action: {
          label: "Export CSV",
          shortcut: "E",
          onClick: () => {
            const csv =
              "Date,Organization,Metric,Value\n" +
              `${new Date().toISOString().split("T")[0]},${escapeCsvCell(currentOrg.slug)},PublishedSkills,${skills.length}\n` +
              `${new Date().toISOString().split("T")[0]},${escapeCsvCell(currentOrg.slug)},Downloads,${totalWorkspaceDownloads}\n`;
            downloadCsv("spm-analytics.csv", csv);
            showToast({
              title: "CSV Export Complete",
              message: `Saved analytics for ${currentOrg.slug}.`,
              type: "success",
            });
          },
        },
      };
    }
    if (pathname === "/app/settings/audit") {
      return {
        title: "Enterprise Audit Logs",
        breadcrumbs: [{ label: "Settings", href: "/app/settings" }, { label: "Audit Logs", href: "/app/settings/audit" }],
        action: {
          label: "Export Audit CSV",
          shortcut: "E",
          onClick: () => {
            const rows = auditEvents
              .map((e) =>
                [
                  escapeCsvCell(e.timestamp),
                  escapeCsvCell(e.actor.email),
                  escapeCsvCell(e.action),
                  escapeCsvCell(e.resource),
                  escapeCsvCell(e.severity),
                ].join(",")
              )
              .join("\n");
            const csv = "Timestamp,Actor,Action,Resource,Severity\n" + rows;
            downloadCsv("spm-audit-trail.csv", csv);
            showToast({
              title: "Audit Trail Exported",
              message: `Exported ${auditEvents.length} immutable events.`,
              type: "success",
            });
          },
        },
      };
    }
    if (pathname === "/app/settings/security") {
      return {
        title: "Security & SAML SSO",
        breadcrumbs: [{ label: "Settings", href: "/app/settings" }, { label: "Security", href: "/app/settings/security" }],
        action: {
          label: "Save Security Policy",
          shortcut: "S",
          onClick: () => {
            showToast({
              title: "Security Policy Enforced",
              message: "IP CIDR allowlist, session timeouts, and SAML rules synchronized.",
              type: "success",
            });
          },
        },
      };
    }
    if (pathname === "/app/settings/access") {
      return {
        title: "Access Control & Custom RBAC",
        breadcrumbs: [{ label: "Settings", href: "/app/settings" }, { label: "Access Policies", href: "/app/settings/access" }],
        action: {
          label: "New Custom Role",
          shortcut: "R",
          onClick: () => {
            window.dispatchEvent(new CustomEvent("open-custom-role-modal"));
          },
        },
      };
    }
    if (pathname === "/app/settings/integrations") {
      return {
        title: "Webhooks & Connectors",
        breadcrumbs: [{ label: "Settings", href: "/app/settings" }, { label: "Integrations", href: "/app/settings/integrations" }],
        action: {
          label: "Add Webhook",
          shortcut: "W",
          onClick: () => {
            window.dispatchEvent(new CustomEvent("open-add-webhook-modal"));
          },
        },
      };
    }
    if (pathname === "/app/settings/compliance") {
      return {
        title: "Compliance & Governance",
        breadcrumbs: [{ label: "Settings", href: "/app/settings" }, { label: "Compliance", href: "/app/settings/compliance" }],
        action: {
          label: "Export Compliance Archive",
          shortcut: "E",
          onClick: () => {
            const bundleContent = `AGENT SPM - COMPLIANCE ARCHIVE\nGenerated: ${new Date().toISOString()}\nTenant: ${currentOrg.slug}\nPlan: ${currentOrg.plan.toUpperCase()}\nData Residency: US East (Virginia)\n`;
            downloadCsv("spm-compliance-archive.txt", bundleContent);
            showToast({
              title: "Compliance Archive Generated",
              message: "Saved spm-compliance-archive.txt to your device.",
              type: "success",
            });
          },
        },
      };
    }
    if (pathname === "/app/billing") {
      return {
        title: "Billing & Invoices",
        breadcrumbs: [{ label: "Dashboard", href: "/app" }, { label: "Billing", href: "/app/billing" }],
        action: {
          label: `${currentOrg.plan.toUpperCase()} Plan`,
          shortcut: "P",
          onClick: () => {
            showToast({
              title: `${currentOrg.plan.toUpperCase()} Tier Active`,
              message: `${currentOrg.skillsAllowed} skills, ${currentOrg.seatsAllowed} seats allocated to ${currentOrg.slug}.`,
              type: "info",
            });
          },
        },
      };
    }
    if (pathname === "/app/settings") {
      return {
        title: "Organization Settings",
        breadcrumbs: [{ label: "Dashboard", href: "/app" }, { label: "Settings", href: "/app/settings" }],
        action: { label: "New API Key", shortcut: "K", onClick: onOpenApiKeyModal, icon: KeyRound },
      };
    }

    return {
      title: "Agent SPM Workspace",
      breadcrumbs: [{ label: "Dashboard", href: "/app" }],
      action: { label: "New Skill", shortcut: "P", onClick: () => router.push("/app/skills/publish"), icon: Plus },
    };
  };

  const meta = getPageMeta();
  const ActionIcon = meta.action?.icon;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-black/10 bg-white/80 backdrop-blur-md px-4 sm:px-6 shadow-xs">
      {/* Left: Mobile Toggle & Dynamic Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-[4px] border border-black/10 text-black/70 hover:bg-black/5 cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <nav className="flex items-center gap-1.5 font-mono text-[11px] text-black/50 overflow-hidden">
            {meta.breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.href + idx}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-black/30 flex-shrink-0" />}
                <Link
                  href={crumb.href}
                  className={`hover:text-black transition-colors truncate ${
                    idx === meta.breadcrumbs.length - 1 ? "text-[#1B5FED] font-semibold" : ""
                  }`}
                >
                  {crumb.label}
                </Link>
              </React.Fragment>
            ))}
          </nav>
          <h1 className="text-sm sm:text-base font-bold font-sans text-black truncate leading-tight">
            {meta.title}
          </h1>
        </div>
      </div>

      {/* Center/Right: Quick Search bar + Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-[4px] border border-black/10 bg-black/[0.02] hover:bg-black/[0.05] text-black/60 font-mono text-xs transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search skills, docs, members...</span>
          <kbd className="text-[10px] bg-black/5 px-1.5 py-0.5 rounded border border-black/10 font-bold">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-[4px] border border-black/10 text-black/70 hover:bg-black/5 relative cursor-pointer"
            aria-label="Toggle notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#1B5FED] ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-[8px] border border-black/10 bg-white p-4 shadow-xl z-50 text-xs font-mono animate-[fadeIn_0.15s_ease-out]">
              <div className="flex items-center justify-between border-b border-black/10 pb-2 mb-3">
                <span className="font-bold text-black uppercase">Notifications</span>
                <span className="text-[10px] text-black/50">3 unread</span>
              </div>
              <div className="space-y-2.5">
                <div className="p-2 rounded-[4px] bg-sky-50 border border-sky-100 text-black">
                  <div className="font-bold text-[#1B5FED]">Workspace Packages</div>
                  <div className="text-[11px] text-black/70 mt-0.5 font-sans">
                    {skills[0]
                      ? `${skills[0].scope}/${skills[0].name} v${skills[0].version} is indexed in ${currentOrg.slug}.`
                      : `No skill packages published in ${currentOrg.slug} yet.`}
                  </div>
                </div>
                <div className="p-2 rounded-[4px] bg-emerald-50 border border-emerald-100 text-black">
                  <div className="font-bold text-emerald-700">Team Allocation Normal</div>
                  <div className="text-[11px] text-black/70 mt-0.5 font-sans">
                    {teamMembers.length} of {currentOrg.seatsAllowed} seats allocated. Workspace quota healthy.
                  </div>
                </div>
                <div className="p-2 rounded-[4px] bg-purple-50 border border-purple-100 text-black">
                  <div className="font-bold text-purple-900">Recent Audit Activity</div>
                  <div className="text-[11px] text-black/70 mt-0.5 font-sans">
                    {auditEvents[0]
                      ? `${auditEvents[0].action} · ${auditEvents.length} event(s) in ${currentOrg.slug}.`
                      : `No security or audit events recorded yet for ${currentOrg.slug}.`}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-black/10 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] text-[#1B5FED] hover:underline font-semibold cursor-pointer"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Primary Page Action Button */}
        {meta.action && (
          <button
            onClick={meta.action.onClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-[#1B5FED] hover:bg-[#154ec4] text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
          >
            {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
            <span>{meta.action.label}</span>
            {meta.action.shortcut && (
              <span className="hidden sm:inline-block text-[10px] bg-white/20 px-1 py-0.2 rounded font-normal">
                [{meta.action.shortcut}]
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
