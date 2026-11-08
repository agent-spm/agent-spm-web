"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  TerminalSquare,
  Flag,
  Activity,
  ShieldAlert,
  ArrowLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Organizations", href: "/admin/organizations", icon: Building2 },
  { label: "Skills Registry", href: "/admin/skills", icon: TerminalSquare },
  { label: "Feature Flags", href: "/admin/feature-flags", icon: Flag },
  { label: "System Health", href: "/admin/system", icon: Activity },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#F5F5F7] text-black font-sans flex flex-col selection:bg-amber-500 selection:text-black">
      {/* ── TOP PLATFORM STAFF BANNER (RESPONSIVE AMBER STRIP) ── */}
      <div className="bg-amber-500/10 border-b border-amber-500/25 px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 font-mono text-xs text-amber-950">
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2 font-bold">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1 rounded hover:bg-amber-500/20 text-amber-900 cursor-pointer"
              aria-label="Open admin menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="truncate">SUPER-ADMIN CONSOLE</span>
          </div>
          <span className="hidden md:inline text-amber-400">•</span>
          <span className="hidden md:inline text-amber-900/70 text-[11px] truncate">
            Authorized personnel only • Root Privileges Active
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-[11px] w-full sm:w-auto justify-between sm:justify-end border-t border-amber-500/15 sm:border-t-0 pt-1.5 sm:pt-0">
          <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden xs:inline">Mesh:</span> Operational (99.99%)
          </span>
          <Link
            href="/app"
            className="flex items-center gap-1 font-semibold text-black hover:text-[#1B5FED] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Tenant App</span>
          </Link>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* ── DESKTOP PERSISTENT SIDEBAR ── */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-black/10 bg-white p-4 space-y-6 shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5 px-2 py-2 border-b border-black/5">
            <div className="w-7 h-7 rounded bg-amber-500/15 border border-amber-500/30 flex items-center justify-center p-1 text-amber-800 font-mono font-bold text-xs shadow-sm">
              SPM
            </div>
            <div>
              <div className="font-mono text-xs font-bold text-black tracking-tight">agent-spm/admin</div>
              <div className="text-[10px] font-mono text-amber-700 uppercase font-bold tracking-wider">SUPER-ADMIN</div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 font-mono text-xs">
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-[4px] transition-all group font-medium ${
                    active
                      ? "bg-black text-white font-semibold shadow-xs"
                      : "text-black/70 hover:bg-black/5 hover:text-black"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-amber-400" : "text-black/40 group-hover:text-[#1B5FED]"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-3 rounded-[6px] border border-black/10 bg-[#FAFAFA] font-mono text-[11px] text-black/60 space-y-1 shadow-sm">
            <div className="text-black font-bold flex items-center justify-between">
              <span>Staff Session:</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-800 font-bold">STAFF</span>
            </div>
            <div className="truncate">root@agent-spm.com</div>
            <div className="text-[#1B5FED] font-semibold text-[10px]">Cluster: us-east-prod-04</div>
          </div>
        </aside>

        {/* ── MOBILE DRAWER OVERLAY ── */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden bg-black/60 backdrop-blur-sm flex animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-72 h-full bg-white border-r border-black/10 flex flex-col shadow-2xl p-4 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-black/5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-800 font-mono font-bold text-xs">
                    SPM
                  </div>
                  <span className="font-mono text-xs font-bold text-black">Admin Console</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-black/60 hover:text-black hover:bg-black/5"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 space-y-1 font-mono text-xs">
                {ADMIN_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[4px] transition-all font-medium ${
                        active
                          ? "bg-black text-white font-semibold shadow-xs"
                          : "text-black/70 hover:bg-black/5 hover:text-black"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? "text-amber-400" : "text-black/40"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-3 rounded-[6px] border border-black/10 bg-[#FAFAFA] font-mono text-[11px] text-black/60 space-y-1 shadow-sm">
                <div className="text-black font-bold flex items-center justify-between">
                  <span>Staff Session:</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-800 font-bold">STAFF</span>
                </div>
                <div className="truncate">root@agent-spm.com</div>
                <div className="text-[#1B5FED] font-semibold text-[10px]">Cluster: us-east-prod-04</div>
              </div>
            </div>
          </div>
        )}

        {/* ── MAIN ADMIN VIEWPORT ── */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F5F5F7] overflow-y-auto">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
