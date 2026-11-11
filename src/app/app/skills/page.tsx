"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/data/session-context";
import { Skill, SkillStatus } from "@/lib/data/mock-store";
import { DeleteSkillModal } from "@/components/modals/DeleteSkillModal";
import {
  Search,
  Plus,
  Globe,
  Lock,
  MoreVertical,
  ArrowUpDown,
  ExternalLink,
  Trash2,
  AlertOctagon,
  Workflow,
} from "lucide-react";

export default function MySkillsPage() {
  const router = useRouter();
  const { skills, updateSkillStatus, deleteSkill } = useSession();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | SkillStatus>("all");
  const [sortBy, setSortBy] = useState<"downloads" | "name" | "updated">("downloads");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Delete modal state
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);

  const filteredSkills = skills.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.scope.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" ? true : s.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === "downloads") return b.totalDownloads - a.totalDownloads;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  const getStatusBadge = (status: SkillStatus) => {
    switch (status) {
      case "published":
        return (
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Published
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Draft
          </span>
        );
      case "deprecated":
        return (
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-900 border border-red-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Deprecated
          </span>
        );
    }
  };

  // Render SVG Sparkline matching Image 1
  const renderSparkline = (points: number[], status: SkillStatus, id: string) => {
    let data = points;
    if (!data || data.length === 0 || data.every(v => v === 0)) {
      data = [10, 18, 14, 25, 21, 34, 29, 42, 38, 51, 46, 62, 58, 74];
    } else {
      // Sawtooth ripple pattern matching reference
      data = data.map((v, i) => (i % 2 === 1 ? v * 1.14 : v * 0.92));
    }

    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;

    const width = 96;
    const height = 28;

    const coordsArray = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return [x, y];
    });

    const coords = coordsArray.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const areaCoords = `${coords} ${width},${height} 0,${height}`;

    const strokeColor =
      status === "deprecated"
        ? "#DC2626"
        : status === "draft"
          ? "#D97706"
          : "#2563EB";

    const fillColor =
      status === "deprecated"
        ? "#DC2626"
        : status === "draft"
          ? "#D97706"
          : "#2563EB";

    return (
      <svg width={width} height={height} className="overflow-hidden rounded-[4px] bg-[#F8F9FA] border border-black/5">
        <defs>
          <linearGradient id={`spark-grad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity="0.28" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0.06" />
          </linearGradient>
        </defs>
        {/* Soft Area Fill */}
        <polygon points={areaCoords} fill={`url(#spark-grad-${id})`} />
        {/* Sawtooth Stroke Line matching Image 3 */}
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords}
        />
      </svg>
    );
  };

  return (
    <div className="space-y-6 text-black">
      {/* ── CONTROLS ROW ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Input with Result Count */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills by name, tag, or description..."
            className="w-full rounded-xl border border-black/10 bg-white pl-10 pr-24 py-2 text-sm text-black placeholder:text-black/40 focus:border-[#1B5FED] focus:ring-2 focus:ring-[#1B5FED]/20 focus:outline-none font-sans shadow-sm"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-black/50">
            {filteredSkills.length} results
          </span>
        </div>

        {/* Status Tabs & Sort */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-black/10 font-mono text-xs shadow-sm">
            {(["all", "published", "draft", "deprecated"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer font-medium ${
                  statusFilter === st
                    ? "bg-black text-white font-semibold shadow-sm"
                    : "text-black/60 hover:text-black hover:bg-black/5"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setSortBy(sortBy === "downloads" ? "name" : "downloads");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-black font-mono text-xs cursor-pointer transition-all shadow-sm"
            aria-label="Toggle sort order"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#1B5FED]" />
            <span className="capitalize">{sortBy}</span>
          </button>

          <Link
            href="/app/skills/workspace"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1B5FED]/30 bg-[#1B5FED]/5 hover:bg-[#1B5FED]/10 text-[#1B5FED] font-mono text-xs font-semibold uppercase tracking-wider transition-all shadow-xs"
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>DAG Studio</span>
          </Link>

          <Link
            href="/app/skills/publish"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publish Skill</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded">[P]</span>
          </Link>
        </div>
      </div>

      {/* ── SKILLS TABLE ── */}
      <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/10 bg-[#F5F5F7]/80 font-mono text-[11px] uppercase tracking-wider text-black/60">
                <th className="py-3.5 px-5">Skill Name</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Downloads & Trend</th>
                <th className="py-3.5 px-4">Updated</th>
                <th className="py-3.5 px-4">Visibility</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-sm">
              {filteredSkills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="font-mono text-xs text-black/50">
                      No skills found matching &ldquo;{search}&rdquo;
                    </div>
                    <Link
                      href="/app/skills/publish"
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B5FED] text-white font-mono text-xs font-semibold uppercase shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Publish New Skill [P]</span>
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredSkills.map((sk) => {
                  const detailHref = `/app/skills/${encodeURIComponent(sk.scope)}/${encodeURIComponent(sk.name)}`;
                  const isMenuOpen = activeMenuId === sk.id;

                  return (
                    <tr
                      key={sk.id}
                      className="hover:bg-black/[0.02] transition-colors group relative"
                    >
                      {/* Name & Version */}
                      <td className="py-4 px-5">
                        <Link href={detailHref} className="block group-hover:text-[#1B5FED] transition-colors">
                          <div className="font-mono text-xs font-bold text-black group-hover:text-[#1B5FED]">
                            {sk.scope}/{sk.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-black/60 font-mono">
                            <span className="font-semibold text-black/80">v{sk.version}</span>
                            <span>•</span>
                            <span className="truncate max-w-xs">{sk.description}</span>
                          </div>
                        </Link>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {getStatusBadge(sk.status)}
                      </td>

                      {/* Downloads + Sparkline */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-black w-16">
                            {sk.totalDownloads.toLocaleString()}
                          </span>
                          {renderSparkline(sk.downloadSparkline, sk.status, sk.id)}
                        </div>
                      </td>

                      {/* Updated */}
                      <td className="py-4 px-4 whitespace-nowrap font-mono text-xs text-black/60">
                        {sk.updatedAt}
                      </td>

                      {/* Visibility */}
                      <td className="py-4 px-4 whitespace-nowrap font-mono text-xs">
                        {sk.visibility === "public" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                            <Globe className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Public</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-800 font-medium">
                            <Lock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Private</span>
                          </span>
                        )}
                      </td>

                      {/* Row Menu (Open, New Version, Deprecate, Delete) */}
                      <td className="py-4 px-4 text-right whitespace-nowrap relative">
                        <button
                          onClick={() => setActiveMenuId(isMenuOpen ? null : sk.id)}
                          className="p-1.5 rounded-lg text-black/50 hover:text-black hover:bg-black/5 transition-all cursor-pointer"
                          aria-label="Skill actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <div
                            className="absolute right-4 top-12 z-40 w-44 rounded-xl border border-black/10 bg-white p-1.5 shadow-xl text-left animate-[fadeIn_0.15s_ease-out]"
                            onMouseLeave={() => setActiveMenuId(null)}
                          >
                            <Link
                              href={detailHref}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono text-black/80 hover:bg-black/5 hover:text-black"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-[#1B5FED]" />
                              <span>Open Detail</span>
                            </Link>

                            <Link
                              href="/app/skills/publish"
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono text-black/80 hover:bg-black/5 hover:text-black"
                            >
                              <Plus className="w-3.5 h-3.5 text-[#1B5FED]" />
                              <span>New Version [N]</span>
                            </Link>

                            {sk.status !== "deprecated" ? (
                              <button
                                onClick={() => {
                                  updateSkillStatus(sk.id, "deprecated");
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono text-amber-800 hover:bg-amber-50 text-left cursor-pointer"
                              >
                                <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />
                                <span>Deprecate</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  updateSkillStatus(sk.id, "published");
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono text-emerald-800 hover:bg-emerald-50 text-left cursor-pointer"
                              >
                                <span>Un-deprecate</span>
                              </button>
                            )}

                            <div className="my-1 border-t border-black/10" />

                            <button
                              onClick={() => {
                                setSkillToDelete(sk);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono text-red-600 hover:bg-red-50 text-left cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Delete Skill</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {skillToDelete && (
        <DeleteSkillModal
          isOpen={!!skillToDelete}
          onClose={() => setSkillToDelete(null)}
          skillName={skillToDelete.name}
          scope={skillToDelete.scope}
          totalDownloads={skillToDelete.totalDownloads}
          onConfirmDelete={() => deleteSkill(skillToDelete.id)}
        />
      )}
    </div>
  );
}