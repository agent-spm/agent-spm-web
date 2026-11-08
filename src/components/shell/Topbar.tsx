"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/data/session-context";
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
  const { auditEvents } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);

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
      return {
        title: "Analytics & Telemetry",
        breadcrumbs: [{ label: "Dashboard", href: "/app" }, { label: "Analytics", href: "/app/analytics" }],
        action: { label: "Export CSV", shortcut: "E", onClick: () => alert("Exporting 90-day install metrics CSV...") },
      };
    }
    if (pathname === "/app/settings/audit") {
      return {
        title: "Enterprise Audit Logs",
        breadcrumbs: [{ label: "Settings", href: "/app/settings" }, { label: "Audit Logs", href: "/app/settings/audit" }],
        action: { label: "Export Audit CSV", shortcut: "E", onClick: () => alert("Exporting audit trail archive...") },
      };
    }
    if (pathname === "/app/settings/security") {
      return {
        title: "Security & SAML SSO",
        breadcrumbs: [{ label: "Settings", href: "/app/settings" }, { label: "Security", href: "/app/settings/security" }],
        action: { label: "Save Security Policy", shortcut: "S", onClick: () => alert("Security policies saved successfully.") },
      };
    }
    if (pathname === "/app/settings/access") {
      return {
        title: "Access Control & Custom RBAC",
        breadcrumbs: [{ label: "Settings", href: "/app/settings" }, { label: "Access Policies", href: "/app/settings/access" }],
        action: { label: "New Custom Role", shortcut: "R", onClick: () => alert("Custom Role designer opened.") },
      };
    }
    if (pathname === "/app/settings/integrations") {
      return {
        title: "Webhooks & Connectors",
        breadcrumbs: [{ label: "Settings", href: "/app/settings" }, { label: "Integrations", href: "/app/settings/integrations" }],
        action: { label: "Add Webhook", shortcut: "W", onClick: () => alert("Add Webhook modal opened.") },
      };
    }
    if (pathname === "/app/settings/compliance") {
      return {
        title: "Compliance & Governance",
        breadcrumbs: [{ label: "Settings", href: "/app/settings" }, { label: "Compliance", href: "/app/settings/compliance" }],
        action: { label: "Export Data Archive", shortcut: "E", onClick: () => alert("Initiating complete organization archive export...") },
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
          <h1 className="text-sm sm:text-base font-semibold text-black tracking-tight truncate mt-0.5">
            {meta.title}
          </h1>
        </div>
      </div>

      {/* Right: Search, Notifications & Primary Action */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
        {/* Global Search / Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-[4px] border border-black/10 bg-white hover:bg-[#F5F5F5] hover:border-black/20 transition-all font-mono text-xs text-black/60 cursor-pointer shadow-xs group"
        >
          <Search className="w-3.5 h-3.5 group-hover:text-black transition-colors" />
          <span className="group-hover:text-black">Search skills, docs, members...</span>
          <kbd className="text-[10px] bg-black/5 text-black/60 px-1.5 py-0.5 rounded border border-black/10">
            ⌘K
          </kbd>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-[4px] border border-black/10 bg-white text-black/60 hover:text-black hover:bg-[#F5F5F5] transition-all cursor-pointer shadow-xs"
            aria-label="View recent activity"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#1B5FED] ring-2 ring-white" />
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div className="absolute -right-2 sm:right-0 mt-2 w-[calc(100vw-32px)] sm:w-80 max-w-sm rounded-[8px] border border-black/10 bg-white p-3 shadow-2xl z-50 animate-[fadeIn_0.15s_ease-out]">
              <div className="flex items-center justify-between pb-2 border-b border-black/5 mb-2">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-black">
                  Recent Stream
                </span>
                <span className="font-mono text-[10px] text-black/40">Live Pipeline</span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {auditEvents.slice(0, 5).map((evt) => (
                  <div key={evt.id} className="text-xs p-2 rounded-[4px] bg-[#FAFAFA] border border-black/5">
                    <div className="flex items-center justify-between font-mono text-[10px] text-black/50 mb-0.5">
                      <span className="text-black font-semibold">{evt.actor.name}</span>
                      <span>{new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-black/70 text-[11px]">
                      <span className="font-mono font-bold text-[#1B5FED]">{evt.action}</span>: {evt.resource}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2 pt-2 border-t border-black/5 text-center">
                <Link
                  href="/app/settings/audit"
                  onClick={() => setShowNotifications(false)}
                  className="font-mono text-xs text-[#1B5FED] font-bold hover:underline"
                >
                  View Full Audit Log →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Primary Action Button */}
        {meta.action && (
          <button
            onClick={meta.action.onClick}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-[4px] bg-[#1B5FED] hover:bg-[#154ec4] text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            {ActionIcon && <ActionIcon className="w-3.5 h-3.5 flex-shrink-0" />}
            <span className="hidden sm:inline">{meta.action.label}</span>
            <span className="sm:hidden">{meta.action.label.split(" ")[0]}</span>
            {meta.action.shortcut && (
              <span className="hidden sm:inline text-[10px] bg-white/20 text-white px-1.5 py-0.2 rounded">
                [{meta.action.shortcut}]
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
