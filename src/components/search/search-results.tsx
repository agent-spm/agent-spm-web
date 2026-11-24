"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PackageCard } from "@/components/packages/package-card";
import { QuickPeekDrawer } from "./QuickPeekDrawer";
import type { PackageSearchResult } from "@/types/package";
import {
  Package,
  Sparkles,
  Shield,
  Cpu,
  Globe,
  Terminal,
  Layers,
  RotateCcw,
} from "lucide-react";

interface SearchResultsProps {
  packages: PackageSearchResult[];
  total: number;
  query?: string;
  page?: number;
  pageSize?: number;
}

const COLLECTIONS = [
  {
    id: "web",
    name: "Web & Browser",
    icon: Globe,
    terms: ["web", "crawler", "scraping", "browser", "http"],
    badge: "DOM & Scraping",
  },
  {
    id: "skills",
    name: "Autonomous Skills",
    icon: Layers,
    terms: ["antiskill", "antigravity", "skills", "openhuman", "agent"],
    badge: "Procedural Suites",
  },
  {
    id: "mcp",
    name: "MCP Context",
    icon: Cpu,
    terms: ["mcp", "protocol"],
    badge: "Model Context",
  },
  {
    id: "cli",
    name: "CLI & Validation",
    icon: Terminal,
    terms: ["spm", "test", "push", "pull"],
    badge: "Tooling & QA",
  },
];

const POPULAR_QUERIES = ["web-crawler", "antiskill", "skills", "test-skill-mcp"];

function matchesCollection(pkg: PackageSearchResult, terms: string[]) {
  const haystack = `${pkg.namespace} ${pkg.name} ${pkg.description} ${(pkg.keywords || []).join(" ")}`.toLowerCase();
  return terms.some((t) => haystack.includes(t));
}

export function SearchResults({
  packages,
  total,
  query,
  page = 1,
  pageSize = 60,
}: SearchResultsProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<"all" | "verified" | "mcp" | "shield">("all");
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [peekPackage, setPeekPackage] = useState<PackageSearchResult | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const counts = useMemo(() => {
    const verified = packages.filter((p) => p.verified).length;
    const mcp = packages.filter(
      (p) =>
        p.name.toLowerCase().includes("mcp") ||
        p.description.toLowerCase().includes("mcp") ||
        p.keywords?.some((k) => k.toLowerCase().includes("mcp"))
    ).length;
    const shield = packages.filter((p) => (p.securityScore ?? 92) >= 95).length;
    return { verified, mcp, shield };
  }, [packages]);

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      if (selectedCollection) {
        const col = COLLECTIONS.find((c) => c.id === selectedCollection);
        if (col && !matchesCollection(pkg, col.terms)) return false;
      }
      if (activeFilter === "verified") {
        return Boolean(pkg.verified);
      }
      if (activeFilter === "mcp") {
        return Boolean(
          pkg.keywords?.some((k) => k.toLowerCase().includes("mcp")) ||
            pkg.name.toLowerCase().includes("mcp") ||
            pkg.description.toLowerCase().includes("mcp")
        );
      }
      if (activeFilter === "shield") {
        return (pkg.securityScore ?? 92) >= 95;
      }
      return true;
    });
  }, [packages, selectedCollection, activeFilter]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeFilter, selectedCollection]);

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
      } else if (e.key === "ArrowDown" && filteredPackages.length > 0) {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(filteredPackages.length - 1, prev + 1));
      } else if (e.key === "ArrowUp" && filteredPackages.length > 0) {
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

  const resetFilters = () => {
    setActiveFilter("all");
    setSelectedCollection(null);
  };

  if (packages.length === 0) {
    return (
      <div className="rounded-xl border border-black/10 bg-[#FAFAFA] p-8 sm:p-12 text-center">
        <Package className="mx-auto h-12 w-12 text-black/25" />
        <h3 className="mt-4 text-lg font-semibold text-black">
          {query ? `No packages matching "${query}"` : "No packages available right now"}
        </h3>
        <p className="mt-2 text-sm text-black/60 max-w-md mx-auto">
          {query
            ? "Try a shorter package keyword or jump directly to a popular skill below."
            : "Try searching by package name or refresh to reload the registry index."}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {POPULAR_QUERIES.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
              className="rounded-full border border-black/10 bg-white px-3 py-1 font-mono text-xs text-black/75 hover:border-[#1A5FED] hover:text-[#1A5FED] transition-colors cursor-pointer"
            >
              {term}
            </button>
          ))}
        </div>

        {query && (
          <div className="mt-6">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 font-mono text-xs font-semibold text-white hover:bg-black/85 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Browse all skills
            </Link>
          </div>
        )}
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6 min-w-0">
      {/* ── CURATED SKILL BUNDLES ── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2 text-xs font-mono text-black/45 uppercase tracking-wider">
          <span>Curated Skill Bundles</span>
          {selectedCollection && (
            <button
              type="button"
              onClick={() => setSelectedCollection(null)}
              className="text-[#1A5FED] hover:underline cursor-pointer font-medium"
            >
              [Clear Bundle ✕]
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {COLLECTIONS.map((col) => {
            const isSelected = selectedCollection === col.id;
            const Icon = col.icon;
            const colCount = packages.filter((p) => matchesCollection(p, col.terms)).length;
            return (
              <button
                key={col.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedCollection(isSelected ? null : col.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer font-sans select-none flex flex-col justify-between min-w-0 ${
                  isSelected
                    ? "bg-[#1A5FED]/5 border-[#1A5FED] ring-2 ring-[#1A5FED]/20 shadow-xs"
                    : "bg-[#FAFAFA] border-black/5 hover:border-black/15 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <div
                    className={`p-1.5 rounded-lg ${
                      isSelected ? "bg-[#1A5FED] text-white" : "bg-black/5 text-black/70"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-mono text-[10px] uppercase font-bold text-black/45">
                    {colCount} pkg{colCount === 1 ? "" : "s"}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-black leading-tight truncate">
                    {col.name}
                  </h4>
                  <span className="font-mono text-[10px] text-black/50 block mt-0.5 truncate">
                    {col.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── FILTER CHIPS & KEYBOARD SHORTCUTS HINT ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-black/5 pb-4">
        <div className="flex items-center gap-1.5 flex-wrap font-mono text-xs">
          <button
            type="button"
            aria-pressed={activeFilter === "all"}
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer font-medium ${
              activeFilter === "all"
                ? "bg-black text-white border-black shadow-xs font-bold"
                : "bg-[#F7F7F7] text-black/65 border-black/10 hover:text-black"
            }`}
          >
            All ({packages.length})
          </button>
          <button
            type="button"
            aria-pressed={activeFilter === "verified"}
            onClick={() => setActiveFilter("verified")}
            className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
              activeFilter === "verified"
                ? "bg-[#1A5FED] text-white border-[#1A5FED] shadow-xs font-bold"
                : "bg-[#F7F7F7] text-black/65 border-black/10 hover:text-black"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Verified ({counts.verified})
          </button>
          <button
            type="button"
            aria-pressed={activeFilter === "mcp"}
            onClick={() => setActiveFilter("mcp")}
            className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
              activeFilter === "mcp"
                ? "bg-purple-600 text-white border-purple-600 shadow-xs font-bold"
                : "bg-[#F7F7F7] text-black/65 border-black/10 hover:text-black"
            }`}
          >
            <Cpu className="w-3 h-3" />
            MCP Native ({counts.mcp})
          </button>
          <button
            type="button"
            aria-pressed={activeFilter === "shield"}
            onClick={() => setActiveFilter("shield")}
            className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
              activeFilter === "shield"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold"
                : "bg-[#F7F7F7] text-black/65 border-black/10 hover:text-black"
            }`}
          >
            <Shield className="w-3 h-3" />
            Shield 95+ ({counts.shield})
          </button>
        </div>

        {/* Keyboard Quick Navigation Hint */}
        <div className="hidden lg:flex items-center gap-2 font-mono text-[11px] text-black/45 shrink-0">
          <span>Navigate</span>
          <kbd className="px-1.5 py-0.5 rounded bg-black/5 border border-black/10 text-black/70">↑</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-black/5 border border-black/10 text-black/70">↓</kbd>
          <span>Quick-Peek</span>
          <kbd className="px-2 py-0.5 rounded bg-black/5 border border-black/10 text-black/70">SPACE</kbd>
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-black/55">
        <span>
          Showing {filteredPackages.length} of {total} package{total !== 1 ? "s" : ""}
          {query ? ` matching "${query}"` : ""}
        </span>
        {(activeFilter !== "all" || selectedCollection) && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-[#1A5FED] hover:underline cursor-pointer"
          >
            Reset active filters
          </button>
        )}
      </div>

      {filteredPackages.length === 0 ? (
        <div className="rounded-xl border border-black/10 bg-[#FAFAFA] p-8 sm:p-10 text-center">
          <Package className="mx-auto h-10 w-10 text-black/25" />
          <h3 className="mt-3 text-base font-semibold text-black">
            No packages match the selected filters
          </h3>
          <p className="mt-1 text-sm text-black/55">
            {packages.length} package{packages.length === 1 ? " is" : "s are"} available when filters are cleared.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 font-mono text-xs font-semibold text-white hover:bg-black/85 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPackages.map((pkg, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <div
                key={pkg.id}
                className={`rounded-[10px] min-w-0 transition-all duration-150 ${
                  isSelected ? "lg:ring-2 lg:ring-[#1A5FED] lg:ring-offset-2" : ""
                }`}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <PackageCard pkg={pkg} onQuickPeek={() => setPeekPackage(pkg)} />
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pt-4 flex items-center justify-center gap-3 font-mono text-xs">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => router.push(`/search?page=${page - 1}${query ? `&q=${encodeURIComponent(query)}` : ""}`)}
            className="px-3.5 py-2 rounded-lg border border-black/10 bg-white text-black disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-black/5"
          >
            ← Prev
          </button>
          <span className="text-black/60">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => router.push(`/search?page=${page + 1}${query ? `&q=${encodeURIComponent(query)}` : ""}`)}
            className="px-3.5 py-2 rounded-lg border border-black/10 bg-white text-black disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-black/5"
          >
            Next →
          </button>
        </div>
      )}

      {/* Interactive Quick-Peek Slide-out Drawer */}
      <QuickPeekDrawer pkg={peekPackage} onClose={() => setPeekPackage(null)} />
    </div>
  );
}
