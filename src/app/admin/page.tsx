"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  SEED_PLATFORM_KPIS,
  SEED_ACTIVE_ALERTS,
  SEED_SYSTEM_SERVICES,
} from "@/lib/data/mock-store";
import {
  ShieldAlert,
  AlertTriangle,
  Activity,
  Layers,
  Database,
  Users,
  Building2,
  ExternalLink,
  CheckCircle2,
  AlertOctagon,
  TrendingUp,
  Server,
} from "lucide-react";
import { DownloadsOverTimeChart } from "@/components/dashboard/DownloadsOverTimeChart";

export default function PlatformOverviewPage() {
  const [alerts, setAlerts] = useState(SEED_ACTIVE_ALERTS);

  const handleAck = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER BUTTONS: STATUS PAGE, CREATE INCIDENT ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
        <div>
          <h1 className="text-2xl font-bold font-sans text-black tracking-tight">Platform System Telemetry</h1>
          <p className="text-xs font-mono text-black/60 mt-0.5">Global registry traffic, infrastructure health, and multi-tenant operations</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert("Redirecting to public status page: https://status.agent-spm.com")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[4px] border border-black/10 bg-white hover:bg-[#F5F5F5] text-black font-mono text-xs uppercase shadow-sm cursor-pointer transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#1B5FED]" />
            <span>Status Page</span>
          </button>

          <button
            onClick={() => alert("Incident declaration war room initiated.")}
            className="flex items-center gap-2 px-4 py-2 rounded-[4px] bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-semibold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Create Incident</span>
          </button>
        </div>
      </div>

      {/* ── 5 KPI CARDS WITH WEEKLY CHANGE ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono text-xs">
        <div className="p-4 rounded-[8px] border border-black/10 bg-white shadow-sm">
          <div className="text-black/50 uppercase font-semibold">Total Users</div>
          <div className="text-2xl font-bold font-sans text-black mt-1">{SEED_PLATFORM_KPIS.totalUsers.value}</div>
          <div className="text-emerald-700 font-semibold text-[11px] mt-1">{SEED_PLATFORM_KPIS.totalUsers.change}</div>
        </div>

        <div className="p-4 rounded-[8px] border border-black/10 bg-white shadow-sm">
          <div className="text-black/50 uppercase font-semibold">Total Orgs</div>
          <div className="text-2xl font-bold font-sans text-black mt-1">{SEED_PLATFORM_KPIS.totalOrgs.value}</div>
          <div className="text-emerald-700 font-semibold text-[11px] mt-1">{SEED_PLATFORM_KPIS.totalOrgs.change}</div>
        </div>

        <div className="p-4 rounded-[8px] border border-black/10 bg-white shadow-sm">
          <div className="text-black/50 uppercase font-semibold">Total Skills</div>
          <div className="text-2xl font-bold font-sans text-black mt-1">{SEED_PLATFORM_KPIS.totalSkills.value}</div>
          <div className="text-emerald-700 font-semibold text-[11px] mt-1">{SEED_PLATFORM_KPIS.totalSkills.change}</div>
        </div>

        <div className="p-4 rounded-[8px] border border-black/10 bg-white shadow-sm">
          <div className="text-black/50 uppercase font-semibold">Registry Size</div>
          <div className="text-2xl font-bold font-sans text-black mt-1">{SEED_PLATFORM_KPIS.registrySize.value}</div>
          <div className="text-[#1B5FED] font-semibold text-[11px] mt-1">{SEED_PLATFORM_KPIS.registrySize.change}</div>
        </div>

        <div className="p-4 rounded-[8px] border border-black/10 bg-white shadow-sm">
          <div className="text-black/50 uppercase font-semibold">90-Day Uptime</div>
          <div className="text-2xl font-bold font-sans text-emerald-700 mt-1">{SEED_PLATFORM_KPIS.uptime90Days.value}</div>
          <div className="text-black/50 text-[11px] mt-1">{SEED_PLATFORM_KPIS.uptime90Days.incidents}</div>
        </div>
      </div>

      {/* ── GLOBAL DOWNLOADS SAWTOOTH TIME-SERIES CHART ── */}
      <DownloadsOverTimeChart title="Platform Downloads Over Time" />

      {/* ── SYSTEM HEALTH CARDS PER SERVICE ── */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-black">System Health Telemetry</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {SEED_SYSTEM_SERVICES.map((srv) => (
            <div key={srv.name} className="p-4 rounded-[8px] border border-black/10 bg-white shadow-sm font-mono text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-black truncate">{srv.name}</span>
                <span className={`w-2 h-2 rounded-full ${
                  srv.status === "operational" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                }`} />
              </div>
              <div className="text-2xl font-bold font-sans text-black">{srv.uptimePercent}%</div>
              <div className="text-[11px] text-black/50">P50: {srv.p50LatencyMs}ms</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ACTIVE ALERTS LIST ── */}
      <div className="rounded-[8px] border border-amber-500/30 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-base font-semibold text-black">Active Infrastructure Alerts ({alerts.length})</h3>
          </div>
          <span className="font-mono text-xs text-amber-800 font-semibold">Monitoring Region Cluster</span>
        </div>

        <div className="space-y-3">
          {alerts.map((alt) => (
            <div key={alt.id} className="p-4 rounded-[6px] border border-amber-500/20 bg-amber-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-800">
                    {alt.severity}
                  </span>
                  <span className="font-bold text-black">{alt.title}</span>
                  <span className="text-black/50">• {alt.region} • {alt.startTime}</span>
                </div>
                <p className="text-black/70 text-xs mt-1 font-sans">{alt.details}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => alert(`Investigating telemetry for ${alt.id}...`)}
                  className="px-3 py-1.5 rounded-[4px] border border-black/10 bg-white hover:bg-black/5 text-black uppercase text-[11px] font-semibold cursor-pointer shadow-sm transition-all"
                >
                  Investigate
                </button>
                <button
                  disabled={alt.acknowledged}
                  onClick={() => handleAck(alt.id)}
                  className={`px-3 py-1.5 rounded-[4px] uppercase text-[11px] font-bold cursor-pointer transition-all ${
                    alt.acknowledged
                      ? "bg-black/5 text-black/40 cursor-not-allowed"
                      : "bg-[#1B5FED] text-white hover:bg-[#154ec4] shadow-sm"
                  }`}
                >
                  {alt.acknowledged ? "Acked ✓" : "Ack"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
