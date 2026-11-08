"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/data/session-context";
import { SEED_ORGANIZATIONS } from "@/lib/data/mock-store";
import { ChevronDown, Check, Plus, ExternalLink, ShieldCheck } from "lucide-react";

export function OrgSwitcher() {
  const { currentOrg, setOrg } = useSession();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "enterprise":
        return <span className="font-mono text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-700 border border-purple-500/30">ENT</span>;
      case "pro":
        return <span className="font-mono text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#1B5FED]/15 text-[#1B5FED] border border-[#1B5FED]/30">PRO</span>;
      default:
        return <span className="font-mono text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-black/5 text-black/60 border border-black/10">FREE</span>;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-2 rounded-[6px] border border-black/10 bg-white hover:border-[#1B5FED]/40 hover:shadow-xs transition-all text-left group cursor-pointer"
        aria-label="Switch organization"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-[4px] bg-white border border-black/10 flex items-center justify-center flex-shrink-0 p-1 group-hover:scale-105 transition-transform shadow-xs">
            <Image
              src="/images/blueLogo.png"
              alt="SPM"
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-black tracking-tight truncate">
                {currentOrg.slug}
              </span>
              {getPlanBadge(currentOrg.plan)}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-black/50 font-mono">
              <span className="truncate">{currentOrg.name}</span>
              <span>•</span>
              <span className="text-[#1B5FED] font-bold">{currentOrg.registryVersion}</span>
            </div>
          </div>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-black/40 transition-transform ${open ? "rotate-180 text-black" : ""}`} />
      </button>

      {/* Switcher Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-[8px] border border-black/10 bg-white p-1.5 shadow-2xl animate-[fadeIn_0.15s_ease-out]">
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-black/40 border-b border-black/5 mb-1 font-bold">
            Switch Organization
          </div>

          <div className="space-y-1">
            {SEED_ORGANIZATIONS.map((org) => {
              const active = org.id === currentOrg.id;
              return (
                <button
                  key={org.id}
                  onClick={() => {
                    setOrg(org.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[4px] text-left transition-all cursor-pointer ${
                    active
                      ? "bg-[#1B5FED]/10 border border-[#1B5FED]/30 text-black"
                      : "text-black/70 hover:bg-black/5 hover:text-black"
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="font-bold text-black">{org.slug}</span>
                      {getPlanBadge(org.plan)}
                    </div>
                    <div className="text-[11px] text-black/50 truncate font-sans">
                      {org.name} ({org.skillsCount} skills)
                    </div>
                  </div>

                  {active && <Check className="w-3.5 h-3.5 text-[#1B5FED] flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="mt-1 pt-1 border-t border-black/5">
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-black/60 hover:text-black hover:bg-black/5 font-mono text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Organization...</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
