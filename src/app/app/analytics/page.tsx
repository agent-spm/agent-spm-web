"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "@/lib/data/session-context";
import { useToast } from "@/components/ui/ToastProvider";
import { DownloadsOverTimeChart, type ChartRange } from "@/components/dashboard/DownloadsOverTimeChart";
import { escapeCsvCell } from "@/lib/security/sanitize";
import {
  DownloadCloud,
  Globe,
  TrendingUp,
  Search,
  ArrowUpDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function AnalyticsPage() {
  const { skills, currentOrg, auditEvents } = useSession();
  const { showToast } = useToast();

  const [range, setRange] = useState<ChartRange>("30D");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"name" | "downloads" | "updated">("downloads");
  const [sortAsc, setSortAsc] = useState(false);
  const [pageSize, setPageSize] = useState<number>(10);
  const [pageIndex, setPageIndex] = useState<number>(0);

  const totalDownloads = useMemo(
    () => skills.reduce((sum, s) => sum + (s.totalDownloads || 0), 0),
    [skills]
  );

  const enrichedSkills = useMemo(() => {
    const list = skills.map((sk) => ({
      id: sk.id,
      name: sk.name,
      scope: sk.scope,
      fullName: sk.name.startsWith("@") ? sk.name : `${sk.scope}/${sk.name}`,
      downloads: sk.totalDownloads || 0,
      downloadsFormatted: (sk.totalDownloads || 0).toLocaleString(),
      visibility: sk.visibility,
      updatedAt: sk.updatedAt || "—",
      version: sk.version,
    }));

    const filtered = list.filter((item) =>
      item.fullName.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    return filtered.sort((a, b) => {
      let cmp = 0;
      if (sortField === "downloads") {
        cmp = b.downloads - a.downloads;
      } else if (sortField === "name") {
        cmp = a.name.localeCompare(b.name);
      } else {
        cmp = b.updatedAt.localeCompare(a.updatedAt);
      }
      return sortAsc ? -cmp : cmp;
    });
  }, [skills, searchQuery, sortField, sortAsc]);

  const paginatedSkills = useMemo(() => {
    const start = pageIndex * pageSize;
    return enrichedSkills.slice(start, start + pageSize);
  }, [enrichedSkills, pageIndex, pageSize]);

  const totalPages = Math.ceil(enrichedSkills.length / pageSize);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Skill Name", "Scope", "Version", "Downloads", "Visibility", "Updated At", "Period"];
    const rows = enrichedSkills.map((sk) => [
      escapeCsvCell(sk.name),
      escapeCsvCell(sk.scope),
      escapeCsvCell(sk.version),
      escapeCsvCell(sk.downloads),
      escapeCsvCell(sk.visibility),
      escapeCsvCell(sk.updatedAt),
      escapeCsvCell(range),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `spm-analytics-${currentOrg.slug.replace(/^@/, "")}-${range.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      title: "Telemetry Exported (CSV)",
      message: `Downloaded live telemetry for ${enrichedSkills.length} skills in ${currentOrg.slug}.`,
      type: "success",
    });
  };

  return (
    <div className="space-y-6 text-black">
      {/* ── TOP CONTROLS & HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-sans text-black">Registry Telemetry & Ingestion</h1>
            <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              {currentOrg.slug}
            </span>
          </div>
          <p className="text-xs font-mono text-black/60 mt-0.5">
            Live workspace package counts, download totals, and audit stream activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-black/10 font-mono text-xs shadow-xs">
            {(["7D", "30D", "90D", "1Y"] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRange(r);
                  setPageIndex(0);
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-medium ${
                  range === r
                    ? "bg-black text-white font-semibold shadow-xs"
                    : "text-black/60 hover:text-black hover:bg-black/5"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-black font-mono text-xs uppercase font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
            title="Download Telemetry CSV"
          >
            <DownloadCloud className="w-3.5 h-3.5 text-[#1B5FED]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── 4 REAL WORKSPACE KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition-all hover:border-black/20">
          <div className="font-mono text-xs uppercase text-black/60 mb-2 font-semibold">Total Downloads</div>
          <div className="text-3xl font-bold font-sans text-black">{totalDownloads.toLocaleString()}</div>
          <div className="mt-1 flex items-center gap-1 text-xs font-mono text-emerald-700 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Across {skills.length} workspace skill{skills.length === 1 ? "" : "s"}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition-all hover:border-black/20">
          <div className="font-mono text-xs uppercase text-black/60 mb-2 font-semibold">Published Packages</div>
          <div className="text-3xl font-bold font-sans text-black">{skills.length}</div>
          <div className="mt-1 text-xs font-mono text-black/60">
            Quota: {skills.length} / {currentOrg.skillsAllowed} ({currentOrg.plan.toUpperCase()})
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition-all hover:border-black/20">
          <div className="font-mono text-xs uppercase text-black/60 mb-2 font-semibold">Audit Events</div>
          <div className="text-3xl font-bold font-sans text-black">{auditEvents.length}</div>
          <div className="mt-1 text-xs font-mono text-black/60">
            Recorded workspace mutations
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition-all hover:border-black/20">
          <div className="font-mono text-xs uppercase text-black/60 mb-2 font-semibold">Public vs Private</div>
          <div className="text-3xl font-bold font-sans text-black">
            {skills.filter((s) => s.visibility === "public").length} / {skills.filter((s) => s.visibility === "private").length}
          </div>
          <div className="mt-1 text-xs font-mono text-black/60">
            Public / private packages
          </div>
        </div>
      </div>

      {/* ── SYNCHRONIZED TIME-SERIES CHART ── */}
      <DownloadsOverTimeChart
        title={`Workspace Downloads (${range})`}
        totalDownloads={totalDownloads}
        range={range}
        onRangeChange={setRange}
        events={skills.map((s) => ({
          date: s.updatedAt,
          downloads: s.totalDownloads || 0,
        }))}
      />

      {/* ── BY-SKILL TABLE ── */}
      <div className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-black/10 bg-[#F5F5F7]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-black">By-Skill Performance</h3>
              <span className="font-mono text-xs bg-black/5 text-black/70 px-2 py-0.5 rounded-full font-bold">
                {enrichedSkills.length} skills indexed
              </span>
            </div>
            <p className="text-xs text-black/60 font-mono mt-0.5">
              Tenant-scoped downloads & release tracking • {currentOrg.slug}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPageIndex(0);
              }}
              placeholder="Filter by skill name..."
              className="w-full pl-8 pr-3 py-1.5 text-xs font-mono rounded-lg border border-black/15 bg-white focus:outline-none focus:border-[#1B5FED] focus:ring-1 focus:ring-[#1B5FED]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-black/10 bg-[#F5F5F7]/80 uppercase tracking-wider text-black/60 text-[11px] select-none">
                <th
                  onClick={() => handleSort("name")}
                  className="py-3 px-6 cursor-pointer hover:text-black transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Skill</span>
                    <ArrowUpDown className="w-3 h-3 text-black/40" />
                  </div>
                </th>
                <th className="py-3 px-4">Version</th>
                <th
                  onClick={() => handleSort("downloads")}
                  className="py-3 px-4 cursor-pointer hover:text-black transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Downloads</span>
                    <ArrowUpDown className="w-3 h-3 text-black/40" />
                  </div>
                </th>
                <th className="py-3 px-4">Visibility</th>
                <th
                  onClick={() => handleSort("updated")}
                  className="py-3 px-4 text-right cursor-pointer hover:text-black transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Last Updated</span>
                    <ArrowUpDown className="w-3 h-3 text-black/40" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {paginatedSkills.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-black/45 font-mono text-xs">
                    {searchQuery
                      ? `No skills matched "${searchQuery}"`
                      : `No skills published in ${currentOrg.slug} yet.`}
                  </td>
                </tr>
              ) : (
                paginatedSkills.map((sk) => (
                  <tr key={sk.id} className="hover:bg-black/[0.02] transition-colors group">
                    <td className="py-3.5 px-6 font-bold text-black">
                      <Link
                        href={`/app/skills/${encodeURIComponent(sk.scope)}/${encodeURIComponent(sk.name)}`}
                        className="inline-flex items-center gap-1.5 hover:text-[#1B5FED] transition-colors"
                      >
                        <span>{sk.fullName}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#1B5FED] transition-opacity" />
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-[#1B5FED] font-semibold">v{sk.version}</td>
                    <td className="py-3.5 px-4 text-black font-semibold">{sk.downloadsFormatted}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 capitalize text-black/70">
                        <Globe className="w-3 h-3 text-emerald-600" />
                        <span>{sk.visibility}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-black/60">{sk.updatedAt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-black/10 bg-black/[0.01] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-black/60">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageIndex(0);
              }}
              className="border border-black/15 rounded bg-white px-2 py-0.5 text-xs font-mono text-black focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-black/40">
              Showing {enrichedSkills.length === 0 ? 0 : pageIndex * pageSize + 1}–
              {Math.min((pageIndex + 1) * pageSize, enrichedSkills.length)} of {enrichedSkills.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={pageIndex === 0}
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              className="p-1.5 rounded border border-black/10 bg-white hover:bg-black/5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-semibold text-black">
              Page {totalPages === 0 ? 0 : pageIndex + 1} of {totalPages}
            </span>
            <button
              disabled={pageIndex >= totalPages - 1}
              onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
              className="p-1.5 rounded border border-black/10 bg-white hover:bg-black/5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
