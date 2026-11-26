"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarNav } from "./SidebarNav";
import { Topbar } from "./Topbar";
import { CommandPalette } from "../modals/CommandPalette";
import { InviteMemberModal } from "../modals/InviteMemberModal";
import { CreateApiKeyModal } from "../modals/CreateApiKeyModal";
import { useSession } from "@/lib/data/session-context";
import { X, Eye, ArrowLeft, AlertTriangle } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const {
    impersonation,
    exitImpersonation,
    maintenanceBanner,
    isActualSuperAdmin,
    isMemberOfActiveOrg,
    currentOrg,
  } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  // Global Keyboard Shortcuts (P, E, N, I, K, R, W, S, ⌘K)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable
      ) {
        return;
      }

      // Check for command palette (⌘K / Ctrl+K)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) {
        return; // Preserve standard OS shortcuts
      }

      const key = e.key.toLowerCase();
      if (key === "p") {
        e.preventDefault();
        router.push("/app/skills/publish");
      } else if (key === "i") {
        e.preventDefault();
        setInviteModalOpen(true);
      } else if (key === "k") {
        e.preventDefault();
        setApiKeyModalOpen(true);
      } else if (key === "r") {
        e.preventDefault();
        router.push("/app/settings/access");
      } else if (key === "w") {
        e.preventDefault();
        router.push("/app/settings/integrations");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <div className="relative min-h-screen bg-[#F5F5F7] text-black font-sans flex selection:bg-[#1B5FED] selection:text-white">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:flex lg:flex-col w-64 flex-shrink-0 sticky top-0 h-screen overflow-hidden z-30">
        <SidebarNav />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-black/60 backdrop-blur-sm flex"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 h-full bg-white border-r border-black/10 flex flex-col animate-[slideInLeft_0.25s_ease-out] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 flex items-center justify-between border-b border-black/5 bg-[#FAFAFA]">
              <span className="font-mono text-xs uppercase font-bold text-black/60">
                Workspace Menu
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-[4px] text-black/50 hover:text-black hover:bg-black/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <SidebarNav
                onCloseMobile={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F5F5F7]">
        {maintenanceBanner?.enabled && (
          <div className="bg-red-50 border-b border-red-200 px-4 sm:px-6 py-2 flex items-center gap-2 font-mono text-xs text-red-900">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
            <span className="truncate font-semibold">{maintenanceBanner.message}</span>
          </div>
        )}

        {impersonation?.active && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-amber-950">
            <div className="flex items-center gap-2 min-w-0">
              <Eye className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
              <span className="font-bold uppercase">VIEW AS ACTIVE</span>
              <span className="truncate">
                Inspecting <strong>{impersonation.targetOrgSlug}</strong>
                {impersonation.targetUserEmail ? ` (${impersonation.targetUserEmail})` : ""}
              </span>
            </div>
            <button
              type="button"
              onClick={async () => {
                await exitImpersonation();
                router.push("/admin/organizations");
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black text-white hover:bg-black/80 font-mono text-[11px] font-bold uppercase cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Exit View As</span>
            </button>
          </div>
        )}

        {!impersonation?.active && isActualSuperAdmin && !isMemberOfActiveOrg && currentOrg.id && (
          <div className="bg-[#1B5FED]/10 border-b border-[#1B5FED]/25 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-[#0B328A]">
            <div className="flex items-center gap-2 min-w-0">
              <Eye className="w-3.5 h-3.5 text-[#1B5FED] flex-shrink-0" />
              <span className="font-bold uppercase">CROSS-TENANT WORKSPACE VIEW</span>
              <span className="truncate">
                Viewing <strong>{currentOrg.slug}</strong> as Superadmin without impersonation
              </span>
            </div>
            <button
              type="button"
              onClick={() => router.push("/admin/organizations")}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#1B5FED] text-white hover:bg-[#154EC9] font-mono text-[11px] font-bold uppercase cursor-pointer transition-colors"
            >
              <span>Manage in Admin</span>
            </button>
          </div>
        )}

        <Topbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenInviteModal={() => setInviteModalOpen(true)}
          onOpenApiKeyModal={() => setApiKeyModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenApiKeyModal={() => setApiKeyModalOpen(true)}
        onOpenInviteModal={() => setInviteModalOpen(true)}
      />

      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />

      <CreateApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
      />
    </div>
  );
}
