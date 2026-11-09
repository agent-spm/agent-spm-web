"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/data/session-context";
import {
  Search,
  LayoutDashboard,
  TerminalSquare,
  Users,
  BarChart3,
  Plus,
  KeyRound,
  Shield,
  ArrowRight,
  Sparkles,
  Command,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApiKeyModal?: () => void;
  onOpenInviteModal?: () => void;
  onOpenPersonaModal?: () => void;
}

interface CommandItem {
  id: string;
  category: "navigation" | "action" | "skill";
  title: string;
  subtitle?: string;
  badge?: string;
  meta?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onSelect: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenApiKeyModal,
  onOpenInviteModal,
  onOpenPersonaModal,
}: CommandPaletteProps) {
  const router = useRouter();
  const { skills } = useSession();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll when palette is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const navigateTo = (path: string) => {
    router.push(path);
    onClose();
  };

  // Build flattened selectable items for smooth keyboard + mouse scrubbing
  const items: CommandItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result: CommandItem[] = [];

    // 1. Navigation items
    const navItems: CommandItem[] = [
      {
        id: "nav-overview",
        category: "navigation",
        title: "Overview",
        icon: <LayoutDashboard className="w-3.5 h-3.5 text-[#1B5FED]" />,
        shortcut: "G O",
        onSelect: () => navigateTo("/app"),
      },
      {
        id: "nav-skills",
        category: "navigation",
        title: "My Skills",
        icon: <TerminalSquare className="w-3.5 h-3.5 text-[#1B5FED]" />,
        shortcut: "G S",
        onSelect: () => navigateTo("/app/skills"),
      },
      {
        id: "nav-team",
        category: "navigation",
        title: "Team",
        icon: <Users className="w-3.5 h-3.5 text-purple-600" />,
        shortcut: "G T",
        onSelect: () => navigateTo("/app/team"),
      },
      {
        id: "nav-analytics",
        category: "navigation",
        title: "Analytics",
        icon: <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />,
        shortcut: "G A",
        onSelect: () => navigateTo("/app/analytics"),
      },
    ];

    if (!q) {
      result.push(...navItems);
    } else {
      result.push(...navItems.filter((item) => item.title.toLowerCase().includes(q)));
    }

    // 2. Action items
    const actionItems: CommandItem[] = [
      {
        id: "action-publish",
        category: "action",
        title: "Publish New Skill",
        icon: <Plus className="w-3.5 h-3.5 text-[#1B5FED]" />,
        shortcut: "P",
        onSelect: () => navigateTo("/app/skills/publish"),
      },
    ];

    if (onOpenApiKeyModal) {
      actionItems.push({
        id: "action-api-key",
        category: "action",
        title: "Create API Key",
        icon: <KeyRound className="w-3.5 h-3.5 text-[#1B5FED]" />,
        shortcut: "K",
        onSelect: () => {
          onClose();
          onOpenApiKeyModal();
        },
      });
    }

    if (onOpenInviteModal) {
      actionItems.push({
        id: "action-invite",
        category: "action",
        title: "Invite Team Member",
        icon: <Users className="w-3.5 h-3.5 text-purple-600" />,
        shortcut: "I",
        onSelect: () => {
          onClose();
          onOpenInviteModal();
        },
      });
    }

    if (onOpenPersonaModal) {
      actionItems.push({
        id: "action-persona",
        category: "action",
        title: "Switch Persona / Role",
        icon: <Sparkles className="w-3.5 h-3.5 text-amber-600" />,
        shortcut: "S",
        onSelect: () => {
          onClose();
          onOpenPersonaModal();
        },
      });
    }

    if (!q) {
      result.push(...actionItems);
    } else {
      result.push(...actionItems.filter((item) => item.title.toLowerCase().includes(q)));
    }

    // 3. Skills items (All 12 skills without arbitrary truncation)
    const filteredSkills = skills.filter(
      (s) =>
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.scope.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );

    const skillItems: CommandItem[] = filteredSkills.map((sk) => ({
      id: `skill-${sk.id}`,
      category: "skill",
      title: `${sk.scope}/${sk.name}`,
      subtitle: sk.description,
      badge: `v${sk.version}`,
      meta: `${sk.totalDownloads.toLocaleString()} dl`,
      onSelect: () =>
        navigateTo(
          `/app/skills/${encodeURIComponent(sk.scope)}/${encodeURIComponent(sk.name)}`
        ),
    }));

    result.push(...skillItems);

    return result;
  }, [query, skills, onOpenApiKeyModal, onOpenInviteModal, onOpenPersonaModal]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation listener (ESC, Cmd+K, ArrowUp, ArrowDown, Enter)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      } else if (e.key === "ArrowDown" && isOpen && items.length > 0) {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % items.length);
      } else if (e.key === "ArrowUp" && isOpen && items.length > 0) {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
      } else if (e.key === "Enter" && isOpen && items.length > 0) {
        e.preventDefault();
        items[selectedIndex]?.onSelect();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, items, selectedIndex]);

  // Automatically scroll selected item into view during arrow key navigation
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 p-4 bg-black/40 backdrop-blur-md animate-[fadeIn_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-black/10 bg-white/98 p-0 shadow-2xl backdrop-blur-2xl overflow-hidden animate-[scaleInFade_0.2s_ease-out] text-black flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-black/10 flex-shrink-0 bg-white">
          <Search className="w-4 h-4 text-black/40 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills, navigate pages, or run actions..."
            className="w-full bg-transparent text-sm text-black placeholder-black/40 focus:outline-none font-sans"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="text-xs font-mono text-black/40 hover:text-black px-1.5 py-0.5 rounded"
            >
              Clear
            </button>
          ) : (
            <kbd className="text-[10px] font-mono bg-black/5 text-black/60 px-1.5 py-0.5 rounded border border-black/10">
              ESC
            </kbd>
          )}
        </div>

        {/* ── HIGH-CAPACITY FLUID SCROLL CONTAINER WITH CUSTOM DELICATE SCROLLBAR ── */}
        <div
          ref={listContainerRef}
          className="max-h-[65vh] sm:max-h-[500px] overflow-y-auto p-2 space-y-4 overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.18)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/15 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-black/30"
        >
          {items.length === 0 ? (
            <div className="py-12 text-center text-black/40 font-mono text-xs">
              No matching skills, pages, or actions found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              {/* Navigation Group */}
              {items.some((i) => i.category === "navigation") && (
                <div>
                  <div className="px-2 py-1 font-mono text-[10px] uppercase font-bold tracking-wider text-black/40">
                    Navigation Shortcuts
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                    {items
                      .filter((i) => i.category === "navigation")
                      .map((item) => {
                        const globalIdx = items.indexOf(item);
                        const isSelected = selectedIndex === globalIdx;
                        return (
                          <button
                            key={item.id}
                            ref={isSelected ? selectedItemRef : undefined}
                            onClick={item.onSelect}
                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                            className={`flex items-center justify-between p-2 rounded-lg text-xs font-mono transition-all text-left cursor-pointer border ${
                              isSelected
                                ? "bg-[#1B5FED]/10 text-[#1B5FED] border-[#1B5FED]/30 shadow-xs"
                                : "text-black/80 hover:bg-black/5 hover:text-black border-transparent"
                            }`}
                          >
                            <span className="flex items-center gap-2 truncate pr-2">
                              {item.icon}
                              <span className="font-semibold">{item.title}</span>
                            </span>
                            {item.shortcut && (
                              <kbd className="text-[10px] bg-black/5 px-1.5 py-0.5 rounded text-black/50 border border-black/10 flex-shrink-0">
                                {item.shortcut}
                              </kbd>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Actions Group */}
              {items.some((i) => i.category === "action") && (
                <div>
                  <div className="px-2 py-1 font-mono text-[10px] uppercase font-bold tracking-wider text-black/40">
                    Actions
                  </div>
                  <div className="space-y-1 mt-1">
                    {items
                      .filter((i) => i.category === "action")
                      .map((item) => {
                        const globalIdx = items.indexOf(item);
                        const isSelected = selectedIndex === globalIdx;
                        return (
                          <button
                            key={item.id}
                            ref={isSelected ? selectedItemRef : undefined}
                            onClick={item.onSelect}
                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-mono transition-all text-left cursor-pointer border ${
                              isSelected
                                ? "bg-[#1B5FED]/10 text-[#1B5FED] border-[#1B5FED]/30 shadow-xs"
                                : "text-black/80 hover:bg-black/5 hover:text-black border-transparent"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {item.icon}
                              <span className="font-semibold">{item.title}</span>
                            </span>
                            {item.shortcut && (
                              <span
                                className={`text-[10px] ${
                                  isSelected ? "text-[#1B5FED]" : "text-black/40"
                                }`}
                              >
                                {item.shortcut}
                              </span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Skills Group (All skills displayed and scrollable) */}
              {items.some((i) => i.category === "skill") && (
                <div>
                  <div className="px-2 py-1 flex items-center justify-between font-mono text-[10px] uppercase font-bold tracking-wider text-black/40">
                    <span>
                      Skills (
                      {items.filter((i) => i.category === "skill").length})
                    </span>
                    <span>Downloads</span>
                  </div>

                  <div className="space-y-1 mt-1">
                    {items
                      .filter((i) => i.category === "skill")
                      .map((item) => {
                        const globalIdx = items.indexOf(item);
                        const isSelected = selectedIndex === globalIdx;
                        return (
                          <button
                            key={item.id}
                            ref={isSelected ? selectedItemRef : undefined}
                            onClick={item.onSelect}
                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all cursor-pointer border ${
                              isSelected
                                ? "bg-[#1B5FED]/10 text-black border-[#1B5FED]/30 shadow-xs"
                                : "hover:bg-black/5 border-transparent"
                            }`}
                          >
                            <div className="min-w-0 pr-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-mono text-xs font-semibold ${
                                    isSelected
                                      ? "text-[#1B5FED]"
                                      : "text-black group-hover:text-[#1B5FED]"
                                  }`}
                                >
                                  {item.title}
                                </span>
                                {item.badge && (
                                  <span className="font-mono text-[10px] px-1 rounded bg-black/5 text-black/60 border border-black/10">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              {item.subtitle && (
                                <p className="text-[11px] text-black/60 truncate mt-0.5 max-w-md">
                                  {item.subtitle}
                                </p>
                              )}
                            </div>

                            {item.meta && (
                              <div
                                className={`font-mono text-xs flex-shrink-0 ${
                                  isSelected
                                    ? "text-[#1B5FED] font-bold"
                                    : "text-black/60"
                                }`}
                              >
                                {item.meta}
                              </div>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Hints with Dynamic Selection Counter */}
        <div className="px-4 py-2.5 bg-[#F5F5F7] border-t border-black/10 flex items-center justify-between text-[11px] font-mono text-black/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="bg-white px-1 rounded border border-black/15 shadow-2xs">↑</kbd>
              <kbd className="bg-white px-1 rounded border border-black/15 shadow-2xs">↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-white px-1 rounded border border-black/15 shadow-2xs">↵</kbd>
              <span>select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-white px-1 rounded border border-black/15 shadow-2xs">esc</kbd>
              <span>close</span>
            </span>
          </div>
          <span className="text-[#1B5FED] font-semibold">
            {selectedIndex + 1} of {items.length} items
          </span>
        </div>
      </div>
    </div>
  );
}
