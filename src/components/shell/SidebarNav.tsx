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
} from "lucide-react";

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
  const { currentPersona, currentOrg } = useSession();

  const isLinkActive = (href: string) => {
    if (href === "/app") {
      return pathname === "/app";
    }
    return pathname.startsWith(href);
  };

  const navGroups: NavGroup[] = [
    {
      groupTitle: "WORKSPACE",
      items: [
        { label: "Overview", href: "/app", icon: LayoutDashboard },
        { label: "My Skills", href: "/app/skills", icon: TerminalSquare, badge: `${currentOrg.skillsCount}` },
        { label: "DAG Studio", href: "/app/skills/workspace", icon: Workflow, badge: "BETA", badgeHighlight: true },
        { label: "Fleet War-Room", href: "/app/fleet", icon: Activity, badge: "LIVE", badgeHighlight: true },
        { label: "Team", href: "/app/team", icon: Users, badge: `${currentOrg.seatsUsed}/${currentOrg.seatsAllowed}` },
        { label: "Analytics", href: "/app/analytics", icon: BarChart3 },
      ],
    },
    {
      groupTitle: "OPERATIONS & TOOLS",
      items: [
        { label: "Schema Token Diet", href: "/tools/schema-diet", icon: Zap },
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
        { label: "Billing & Invoices", href: "/pricing", icon: CreditCard },
      ],
    },
  ];

  return (
    <aside className="w-full lg:w-64 flex flex-col h-full bg-white border-r border-black/10 select-none shadow-sm">
      {/* Top Org Switcher */}
      <div className="p-3 border-b border-black/10 bg-[#FAFAFA]">
        <OrgSwitcher />
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
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
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono uppercase ${
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

      {/* Active Persona Banner & Quick Switcher Trigger */}
      <div className="p-3 border-t border-black/10 bg-[#FAFAFA]">
        <button
          onClick={onOpenPersonaModal}
          className="w-full flex items-center justify-between p-2 rounded-[6px] border border-black/10 bg-white hover:border-[#1B5FED]/40 hover:shadow-xs transition-all text-left cursor-pointer group"
          aria-label="Switch active persona for testing"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#1B5FED]/10 border border-[#1B5FED]/20 flex items-center justify-center text-[#1B5FED] font-mono font-bold text-xs">
              {currentPersona.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-mono text-xs font-semibold text-black truncate group-hover:text-[#1B5FED]">
                {currentPersona.name}
              </div>
              <div className="text-[10px] text-black/50 uppercase font-mono tracking-wider">
                Role: <span className="text-[#1B5FED] font-bold">{currentPersona.role}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono text-black/40 group-hover:text-black">
            <span>[S]</span>
          </div>
        </button>

        {currentPersona.isStaff && (
          <Link
            href="/admin"
            className="mt-2 flex items-center justify-between px-2.5 py-1.5 rounded-[4px] border border-amber-500/30 bg-amber-500/10 text-amber-900 font-mono text-[11px] font-bold uppercase hover:bg-amber-500/20 transition-all"
          >
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Super-Admin Mode</span>
            </div>
            <ChevronRight className="w-3 h-3 text-amber-600" />
          </Link>
        )}
      </div>
    </aside>
  );
}
