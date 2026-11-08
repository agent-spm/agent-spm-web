"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarNav } from "./SidebarNav";
import { Topbar } from "./Topbar";
import { CommandPalette } from "../modals/CommandPalette";
import { PersonaSwitcherModal } from "../modals/PersonaSwitcherModal";
import { InviteMemberModal } from "../modals/InviteMemberModal";
import { CreateApiKeyModal } from "../modals/CreateApiKeyModal";
import { X } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [personaModalOpen, setPersonaModalOpen] = useState(false);
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
      <div className="hidden lg:block w-64 flex-shrink-0 sticky top-0 h-screen z-30">
        <SidebarNav onOpenPersonaModal={() => setPersonaModalOpen(true)} />
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
            <div className="flex-1 overflow-hidden">
              <SidebarNav
                onOpenPersonaModal={() => {
                  setMobileMenuOpen(false);
                  setPersonaModalOpen(true);
                }}
                onCloseMobile={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F5F5F7]">
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
        onOpenPersonaModal={() => setPersonaModalOpen(true)}
      />

      <PersonaSwitcherModal
        isOpen={personaModalOpen}
        onClose={() => setPersonaModalOpen(false)}
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
