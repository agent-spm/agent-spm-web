"use client";

import React, { useRef } from "react";
import { SpmLogoMark } from "@/components/ui/SpmLogoMark";

export interface DemoTabItem {
  id: string;
  label: string;
}

/**
 * Agent SPM Noir workbench container aligned with globals.css tokens (`#09090B` obsidian canvas,
 * `#111113` header chrome, `#1B5FED` brand blue accent, and `4px` architectural radii).
 * Enforces `color-scheme: only dark` on an explicit dark background so scrollbars,
 * inputs, and text selection remain crisp inside light landing sections.
 */
export function DemoDarkShell({
  title,
  badgeText,
  badgeTone = "blue",
  headerRight,
  children,
}: {
  title: string;
  badgeText: string;
  badgeTone?: "blue" | "emerald" | "amber";
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  const badgeClasses =
    badgeTone === "emerald"
      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
      : badgeTone === "amber"
        ? "border-red-500/45 bg-red-500/15 text-red-200"
        : "border-[#1B5FED]/50 bg-[#1B5FED]/20 text-[#9CC2FF]";

  return (
    <div
      style={{ colorScheme: "only dark", contain: "layout style" }}
      className="relative w-full min-h-[480px] md:min-h-[510px] lg:h-[520px] bg-[#09090B] text-zinc-100 rounded-[4px] border border-zinc-800 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col text-left select-text"
    >
      {/* Top Signal Blue Micro Hairline matching Agent SPM brand accent */}
      <div
        aria-hidden="true"
        className="h-[2px] w-full bg-gradient-to-r from-[#1B5FED] via-[#609CFF]/70 to-zinc-800 shrink-0"
      />

      {/* SPM Workbench Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 sm:px-4 py-2.5 bg-[#111113] border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Official Agent SPM Square Mark */}
          <SpmLogoMark size={20} variant="badge" />
          <span className="font-mono text-xs font-medium text-zinc-100 uppercase tracking-tight truncate">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] border font-mono text-[10px] font-semibold uppercase tracking-wider ${badgeClasses}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
            <span>[{badgeText}]</span>
          </span>
          {headerRight}
        </div>
      </div>

      {/* Workbench Content */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">{children}</div>
    </div>
  );
}

/**
 * Accessible horizontal single-row tablist matching Agent SPM `rounded-[4px]` geometry:
 * uses `aria-selected`, non-color bottom underline indicator, and keyboard arrow roving focus.
 */
export function DemoTabList({
  ariaLabel,
  tabs,
  activeId,
  onSelect,
  idPrefix,
}: {
  ariaLabel: string;
  tabs: DemoTabItem[];
  activeId: string;
  onSelect: (id: string) => void;
  idPrefix: string;
}) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = -1;
    if (e.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = tabs.length - 1;

    if (nextIndex !== -1) {
      e.preventDefault();
      const targetTab = tabs[nextIndex];
      onSelect(targetTab.id);
      const btn = buttonRefs.current[nextIndex];
      btn?.focus();
      btn?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex items-center gap-1 overflow-x-auto flex-nowrap border-b border-zinc-800 bg-[#111113] px-2 shrink-0 scrollbar-none"
    >
      {tabs.map((tab, idx) => {
        const isSelected = tab.id === activeId;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              buttonRefs.current[idx] = el;
            }}
            id={`${idPrefix}-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={(e) => {
              onSelect(tab.id);
              e.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" });
            }}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`relative flex-none min-h-[36px] px-3 py-2 font-mono text-xs whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1B5FED] focus-visible:outline-offset-[-2px] ${
              isSelected
                ? "text-white font-semibold after:content-[''] after:absolute after:inset-x-1 after:bottom-0 after:border-b-2 after:border-[#1B5FED]"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
