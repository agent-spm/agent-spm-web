"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OrgSwitcher } from "./OrgSwitcher";
import { useSession } from "@/lib/data/session-context";
import {
  LayoutDashboard,
  TerminalSquare,
  Users,
  BarChart3,
  ScrollText,
  Webhook,
  Shield,
  KeyRound,
  FileCheck,
  Settings,
  CreditCard,
  ExternalLink,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Workflow,
  Activity,
  Zap,
  LogOut,
} from "lucide-react";
import { performFullLogout } from "@/lib/auth/logout-client";

interface SidebarNavProps {
  onOpenPersonaModal?: () => void;
  onCloseMobile?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeHighlight?: boolean;
  enterprise?: boolean;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export function SidebarNav({ onOpenPersonaModal, onCloseMobile }: SidebarNavProps) {
  const pathname = usePathname();
  const {
    currentPersona,
    currentOrg,
    skills,
    teamMembers,
    impersonation,
    isActualSuperAdmin,
    exitImpersonation,
  } = useSession();

  const isLinkActive = (href: string) => {
    if (href === "/app") {
      return pathname === "/app";
    }
    if (href === "/app/skills") {
      // Only active on /app/skills or /app/skills/[scope]/[name], NOT /app/skills/workspace (DAG Studio)
      return (
        pathname === "/app/skills" ||
        (pathname.startsWith("/app/skills/") && !pathname.startsWith("/app/skills/workspace"))
      );
    }
    if (href === "/app/settings") {
      // Only active on exactly /app/settings, NOT child pages like /app/settings/security, /app/settings/audit, etc.
      return pathname === "/app/settings";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const navGroups: NavGroup[] = [
    {
      groupTitle: "WORKSPACE",
      items: [
        { label: "Overview", href: "/app", icon: LayoutDashboard },
        { label: "My Skills", href: "/app/skills", icon: TerminalSquare, badge: `${skills.length}` },
        { label: "DAG Studio", href: "/app/skills/workspace", icon: Workflow, badge: "DAG" },
        { label: "Fleet War-Room", href: "/app/fleet", icon: Activity, badge: "MCP" },
        { label: "Team", href: "/app/team", icon: Users, badge: `${teamMembers.length}/${currentOrg.seatsAllowed}` },
        { label: "Analytics", href: "/app/analytics", icon: BarChart3 },
      ],
    },
    {
      groupTitle: "OPERATIONS & TOOLS",
      items: [
        { label: "Schema Token Diet", href: "/app/tools/schema-diet", icon: Zap },
        { label: "Audit Logs", href: "/app/settings/audit", icon: ScrollText, badge: "NEW", badgeHighlight: true },
        { label: "Integrations", href: "/app/settings/integrations", icon: Webhook },
      ],
    },
    {
      groupTitle: "ENTERPRISE GOVERNANCE",
      items: [
        { label: "Security", href: "/app/settings/security", icon: Shield, enterprise: true },
        { label: "Access & RBAC", href: "/app/settings/access", icon: KeyRound, enterprise: true },
        { label: "Compliance", href: "/app/settings/compliance", icon: FileCheck, enterprise: true },
        { label: "Settings", href: "/app/settings", icon: Settings },
      ],
    },
    {
      groupTitle: "USAGE & PLAN",
      items: [
        { label: "Billing & Invoices", href: "/app/billing", icon: CreditCard },
      ],
    },
  ];

  return (
    <aside className="w-full lg:w-64 flex flex-col h-full min-h-0 bg-white border-r border-black/10 select-none shadow-sm">
      {/* Top Org Switcher */}
      <div className="p-3 border-b border-black/10 bg-[#FAFAFA] flex-shrink-0">
        <OrgSwitcher />
      </div>

      {/* Navigation Groups */}
      <nav
        data-lenis-prevent
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-3 space-y-4 scrollbar-thin"
      >
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-3 text-[10px] font-mono uppercase font-bold text-black/40 tracking-wider">
              {group.groupTitle}
            </div>

            <div className="space-y-0.5 pt-1">
              {group.items.map((item) => {
                const active = isLinkActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`group flex items-center justify-between px-3 py-2 rounded-[4px] text-xs font-mono font-medium transition-all ${
                      active
                        ? "bg-[#1B5FED] text-white shadow-sm font-semibold"
                        : "text-black/70 hover:bg-black/5 hover:text-black"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-white" : "text-black/40 group-hover:text-[#1B5FED]"}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {item.enterprise && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                          active ? "bg-white/20 text-white" : "bg-purple-500/10 text-purple-700 font-bold"
                        }`}>
                          ENT
                        </span>
                      )}

                      {item.badge && (
                        <span suppressHydrationWarning className={`text-[10px] px-1.5 py-0.2 rounded font-mono uppercase ${
                          active
                            ? "bg-white/20 text-white"
                            : item.badgeHighlight
                              ? "bg-emerald-500/15 text-emerald-800 font-bold"
                              : "bg-black/5 text-black/60"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Authenticated User Profile Card ── */}
      <div className="p-2.5 border-t border-black/10 bg-[#FAFAFA] flex-shrink-0">
        <div className="w-full p-2.5 rounded-[6px] border border-black/10 bg-white shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/app/settings"
              className="flex items-center gap-2.5 min-w-0 group cursor-pointer flex-1"
              title="Open Account Settings"
            >
              <div className="w-8 h-8 rounded-full bg-[#1B5FED]/10 border border-[#1B5FED]/20 flex items-center justify-center text-[#1B5FED] font-mono font-bold text-xs flex-shrink-0 group-hover:scale-105 transition-transform">
                {(currentPersona.name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-mono text-xs font-bold text-black truncate group-hover:text-[#1B5FED]">
                  {currentPersona.name}
                </div>
                <div className="text-[10px] text-black/50 font-mono flex items-center gap-1.5 truncate">
                  <span className="text-[#1B5FED] font-semibold uppercase">
                    {impersonation?.active
                      ? "VIEWED USER"
                      : currentPersona.isStaff
                        ? "SUPERADMIN"
                        : currentPersona.role}
                  </span>
                  <span>•</span>
                  <span className="truncate">
                    {currentPersona.email ? currentPersona.email : "@guest"}
                  </span>
                </div>
              </div>
            </Link>

            <button
              onClick={() => performFullLogout()}
              title="Sign Out"
              className="p-1.5 rounded-[4px] border border-black/10 text-black/40 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {(currentPersona.isStaff || (isActualSuperAdmin && impersonation?.active)) && (
          <div className="mt-2 space-y-1.5">
            {impersonation?.active && (
              <button
                type="button"
                onClick={async () => {
                  await exitImpersonation();
                  window.location.href = "/admin/organizations";
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[4px] border border-black/15 bg-black text-white font-mono text-[11px] font-bold uppercase hover:bg-black/85 transition-all cursor-pointer"
              >
                <span>Exit View As ({impersonation.targetOrgSlug})</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
            <Link
              href="/admin"
              className="flex items-center justify-between px-2.5 py-1.5 rounded-[4px] border border-amber-500/30 bg-amber-500/10 text-amber-900 font-mono text-[11px] font-bold uppercase hover:bg-amber-500/20 transition-all"
            >
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Super-Admin Mode</span>
              </div>
              <ChevronRight className="w-3 h-3 text-amber-600" />
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
