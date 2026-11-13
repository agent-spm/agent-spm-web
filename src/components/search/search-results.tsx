"use client";

import React, { useState, useEffect } from "react";
import { PackageCard } from "@/components/packages/package-card";
import { QuickPeekDrawer } from "./QuickPeekDrawer";
import type { PackageSearchResult } from "@/types/package";
import { Package, Sparkles, Shield, Cpu, Layers, Globe, ShieldCheck, Database, GitPullRequest } from "lucide-react";

interface SearchResultsProps {
  packages: PackageSearchResult[];
  total: number;
  query?: string;
}

export function SearchResults({ packages, total, query }: SearchResultsProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "verified" | "mcp" | "shield">("all");
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [peekPackage, setPeekPackage] = useState<PackageSearchResult | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const COLLECTIONS = [
    { id: "web", name: "Autonomous Web Agents", icon: Globe, match: "http", badge: "Browser & Scraping" },
    { id: "security", name: "DevSecOps & Shield", icon: ShieldCheck, match: "security", badge: "AST & Taint" },
    { id: "data", name: "Enterprise SQL & Data", icon: Database, match: "json", badge: "Postgres & Schema" },
    { id: "vision", name: "Vision & Multimodal", icon: GitPullRequest, match: "vision", badge: "OCR & LLM" },
  ];

  // Filter packages based on active chip and collection
  const filteredPackages = packages.filter((pkg) => {
    if (selectedCollection) {
      const col = COLLECTIONS.find((c) => c.id === selectedCollection);
      if (col) {
        const text = `${pkg.name} ${pkg.description} ${pkg.namespace} ${(pkg.keywords || []).join(" ")}`.toLowerCase();
        if (!text.includes(col.match.toLowerCase())) return false;
      }
    }
    if (activeFilter === "verified") {
      return pkg.verified || pkg.namespace === "spm" || pkg.namespace === "acme-labs";
    }
    if (activeFilter === "mcp") {
      return pkg.keywords?.some((k) => k.toLowerCase().includes("mcp")) || true;
    }
    if (activeFilter === "shield") {
      return (pkg.securityScore ?? 95) >= 90;
    }
    return true;
  });

  // Global Keyboard Navigation (↑, ↓, Space, Esc)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable
      ) {
        return;
      }

      if (e.key === "Escape") {
        setPeekPackage(null);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(filteredPackages.length - 1, prev + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === " " && !peekPackage && filteredPackages[selectedIndex]) {
        e.preventDefault();
        setPeekPackage(filteredPackages[selectedIndex]);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredPackages, selectedIndex, peekPackage]);

  if (packages.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
        <Package className="mx-auto h-12 w-12 text-zinc-300" />
        <h3 className="mt-4 text-lg font-semibold text-black">No packages found</h3>
        <p className="mt-2 text-zinc-500">
          {query
            ? `No results for "${query}". Try a different search term.`
            : "Start by searching for a package above."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── CURATED SKILL COLLECTIONS CAROUSEL ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-black/40 uppercase tracking-wider">
          <span>Curated Skill Bundles</span>
          {selectedCollection && (
            <button
              onClick={() => setSelectedCollection(null)}
              className="text-[#1A5FED] hover:underline cursor-pointer font-medium"
            >
              [Clear Filter ✕]
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {COLLECTIONS.map((col) => {
            const isSelected = selectedCollection === col.id;
            const Icon = col.icon;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => setSelectedCollection(isSelected ? null : col.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer font-sans select-none flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#1A5FED]/5 border-[#1A5FED] ring-2 ring-[#1A5FED]/20 shadow-xs"
                    : "bg-[#FAFAFA] border-black/5 hover:border-black/15 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-1.5 rounded-lg ${
                      isSelected ? "bg-[#1A5FED] text-white" : "bg-black/5 text-black/70"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-mono text-[9px] uppercase font-bold text-black/40">
                    Bundle
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-black leading-tight">
                    {col.name}
                  </h4>
                  <span className="font-mono text-[10px] text-black/50 block mt-0.5">
                    {col.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── FILTER CHIPS & KEYBOARD SHORTCUTS HINT ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 pb-4">
        {/* Floating Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap font-mono text-xs">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer font-medium ${
              activeFilter === "all"
                ? "bg-black text-white border-black shadow-xs font-bold"
                : "bg-[#F7F7F7] text-black/60 border-black/10 hover:text-black"
            }`}
          >
            All Packages ({packages.length})
          </button>
          <button
            onClick={() => setActiveFilter("verified")}
            className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
              activeFilter === "verified"
                ? "bg-[#1A5FED] text-white border-[#1A5FED] shadow-xs font-bold"
                : "bg-[#F7F7F7] text-black/60 border-black/10 hover:text-black"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Verified Only
          </button>
          <button
            onClick={() => setActiveFilter("mcp")}
            className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
              activeFilter === "mcp"
                ? "bg-purple-600 text-white border-purple-600 shadow-xs font-bold"
                : "bg-[#F7F7F7] text-black/60 border-black/10 hover:text-black"
            }`}
          >
            <Cpu className="w-3 h-3" />
            MCP Native
          </button>
          <button
            onClick={() => setActiveFilter("shield")}
            className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
              activeFilter === "shield"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold"
                : "bg-[#F7F7F7] text-black/60 border-black/10 hover:text-black"
            }`}
          >
            <Shield className="w-3 h-3" />
            Security Shield &gt;90
          </button>
        </div>

        {/* Keyboard Quick Navigation Hint */}
        <div className="hidden lg:flex items-center gap-2 font-mono text-[11px] text-black/40">
          <span>Navigate with</span>
          <kbd className="px-1.5 py-0.5 rounded bg-black/5 border border-black/10 text-black/70">↑</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-black/5 border border-black/10 text-black/70">↓</kbd>
          <span>Press</span>
          <kbd className="px-2 py-0.5 rounded bg-black/5 border border-black/10 text-black/70">SPACE</kbd>
          <span>to Quick-Peek</span>
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs font-mono text-black/50">
        <span>
          Showing {filteredPackages.length} package{filteredPackages.length !== 1 ? "s" : ""}
          {query ? ` matching "${query}"` : ""}
        </span>
      </div>

      {/* Package Grid with Quick-Peek capability */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPackages.map((pkg, idx) => {
          const isSelected = selectedIndex === idx;
          return (
            <div
              key={pkg.id}
              className={`rounded-[10px] transition-all duration-150 ${
                isSelected ? "ring-2 ring-[#1A5FED] ring-offset-2" : ""
              }`}
              onMouseEnter={() => setSelectedIndex(idx)}
            >
              <PackageCard pkg={pkg} onQuickPeek={() => setPeekPackage(pkg)} />
            </div>
          );
        })}
      </div>

      {/* Interactive Quick-Peek Slide-out Drawer */}
      <QuickPeekDrawer pkg={peekPackage} onClose={() => setPeekPackage(null)} />
    </div>
  );
}
