"use client";

import React, { useState } from "react";
import { useSession } from "@/lib/data/session-context";
import {
  DownloadCloud,
  Globe,
  TrendingUp,
} from "lucide-react";

export default function AnalyticsPage() {
  const { skills } = useSession();
  const [range, setRange] = useState<"7D" | "30D" | "90D" | "Custom">("30D");

  const regions = [
    { country: "United States", code: "US", downloads: "214,200", pct: "58%" },
    { country: "Germany", code: "DE", downloads: "64,800", pct: "18%" },
    { country: "United Kingdom", code: "GB", downloads: "36,900", pct: "10%" },
    { country: "Japan", code: "JP", downloads: "28,100", pct: "8%" },
    { country: "India", code: "IN", downloads: "24,450", pct: "6%" },
  ];

  return (
    <div className="space-y-6 text-black">
      {/* ── CONTROLS ROW ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-black">Registry Telemetry & Ingestion</h2>
          <p className="text-xs font-mono text-black/60 mt-0.5">Real-time package runtime execution metrics</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Range Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-black/10 font-mono text-xs shadow-xs">
            {(["7D", "30D", "90D", "Custom"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
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
            onClick={() => alert("Generated CSV download for range: " + range)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-black font-mono text-xs uppercase font-semibold transition-all shadow-xs cursor-pointer"
          >
            <DownloadCloud className="w-3.5 h-3.5 text-[#1B5FED]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── 4 KPI CARDS (WITH CHANGE VS PREVIOUS PERIOD) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="font-mono text-xs uppercase text-black/60 mb-2 font-semibold">Total Downloads</div>
          <div className="text-3xl font-bold font-sans text-black">368,450</div>
          <div className="mt-1 flex items-center gap-1 text-xs font-mono text-emerald-700 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>+18.4% vs previous 30d</span>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="font-mono text-xs uppercase text-black/60 mb-2 font-semibold">Unique Installers</div>
          <div className="text-3xl font-bold font-sans text-black">14,290</div>
          <div className="mt-1 flex items-center gap-1 text-xs font-mono text-emerald-700 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>+12.1% unique machines</span>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="font-mono text-xs uppercase text-black/60 mb-2 font-semibold">Avg Install Time (P50)</div>
          <div className="text-3xl font-bold font-sans text-black">12.4 ms</div>
          <div className="mt-1 flex items-center gap-1 text-xs font-mono text-emerald-700 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>-2.1ms lower latency</span>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="font-mono text-xs uppercase text-black/60 mb-2 font-semibold">Error Rate</div>
          <div className="text-3xl font-bold font-sans text-black">0.02%</div>
          <div className="mt-1 text-xs font-mono text-black/60">
            18 failed installs across 368k
          </div>
        </div>
      </div>

      {/* ── TOP REGIONS & METHODS SPLIT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Regions */}
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-black">Top Regions by Traffic</h3>
              <p className="text-xs text-black/60 font-mono mt-0.5">Global edge distribution</p>
            </div>
            <Globe className="w-4 h-4 text-[#1B5FED]" />
          </div>

          <div className="space-y-3">
            {regions.map((rg) => (
              <div key={rg.code} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-black font-semibold">{rg.country} ({rg.code})</span>
                  <span className="text-black/60">{rg.downloads} ({rg.pct})</span>
                </div>
                <div className="h-2 w-full rounded-full bg-black/5 overflow-hidden">
                  <div
                    style={{ width: rg.pct }}
                    className="h-full rounded-full bg-[#1B5FED]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Install Methods Donut Summary */}
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-black">Ingestion Protocols</h3>
            <p className="text-xs text-black/60 font-mono mt-0.5">Execution clients connecting to registry</p>
          </div>

          <div className="grid grid-cols-3 gap-3 my-4">
            <div className="p-4 rounded-xl border border-black/10 bg-black/[0.02] text-center">
              <div className="font-mono text-2xl font-bold text-[#1B5FED]">68%</div>
              <div className="font-mono text-xs font-bold text-black mt-1">CLI</div>
              <div className="font-mono text-[10px] text-black/50">spm install</div>
            </div>
            <div className="p-4 rounded-xl border border-black/10 bg-black/[0.02] text-center">
              <div className="font-mono text-2xl font-bold text-purple-700">24%</div>
              <div className="font-mono text-xs font-bold text-black mt-1">Agent API</div>
              <div className="font-mono text-[10px] text-black/50">MCP runner</div>
            </div>
            <div className="p-4 rounded-xl border border-black/10 bg-black/[0.02] text-center">
              <div className="font-mono text-2xl font-bold text-emerald-700">8%</div>
              <div className="font-mono text-xs font-bold text-black mt-1">Web Playground</div>
              <div className="font-mono text-[10px] text-black/50">Browser test</div>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-black/10 bg-black/[0.02] font-mono text-xs text-black/70 flex items-center justify-between">
            <span>Cache Hit Ratio:</span>
            <span className="text-emerald-700 font-bold">99.82%</span>
          </div>
        </div>
      </div>

      {/* ── BY-SKILL PAGINATED & SORTABLE TABLE ── */}
      <div className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-black/10 bg-[#F5F5F7]/50">
          <h3 className="text-base font-semibold text-black">By-Skill Ingestion Breakdown</h3>
          <p className="text-xs text-black/60 font-mono mt-0.5">Granular package performance table</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-black/10 bg-[#F5F5F7]/80 uppercase tracking-wider text-black/60 text-[11px]">
                <th className="py-3 px-6">Skill</th>
                <th className="py-3 px-4">Downloads</th>
                <th className="py-3 px-4">Top Region</th>
                <th className="py-3 px-4">Avg Install Time</th>
                <th className="py-3 px-4 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {skills.slice(0, 6).map((sk) => (
                <tr key={sk.id} className="hover:bg-black/[0.02] transition-colors">
                  <td className="py-3.5 px-6 font-bold text-black">
                    {sk.scope}/{sk.name}
                  </td>
                  <td className="py-3.5 px-4 text-black/80 font-semibold">
                    {sk.totalDownloads.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-black/60">
                    United States (US)
                  </td>
                  <td className="py-3.5 px-4 text-[#1B5FED] font-semibold">
                    12ms
                  </td>
                  <td className="py-3.5 px-4 text-right text-emerald-700 font-bold">
                    +14%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}