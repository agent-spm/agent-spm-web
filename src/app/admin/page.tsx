"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/ToastProvider";
import {
  DownloadsOverTimeChart,
  TimelineSourceEvent,
} from "@/components/dashboard/DownloadsOverTimeChart";
import {
  Users,
  Building2,
  TerminalSquare,
  Download,
  HardDrive,
  ShieldAlert,
  RefreshCw,
  ArrowRight,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Activity,
} from "lucide-react";

interface OverviewResponse {
  stats: {
    users: number;
    orgs: number;
    skills: number;
    downloads: number;
    storage: string;
    uptime: string;
    activeIncidents: number;
  };
  services: Array<{
    name: string;
    status: "operational" | "degraded";
    p50LatencyMs: number;
    uptimePercent: number;
  }>;
  incidents: Array<{
    id: string;
    severity: "info" | "warning" | "critical";
    title: string;
    details: string;
    region: string;
    startTime: string;
    acknowledged: boolean;
  }>;
  packagesTimeline: TimelineSourceEvent[];
}

export default function AdminOverviewPage() {
  const { showToast } = useToast();

  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create Incident Modal
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incTitle, setIncTitle] = useState("");
  const [incSeverity, setIncSeverity] = useState<"info" | "warning" | "critical">("warning");
  const [incRegion, setIncRegion] = useState("Global Edge");
  const [incDetails, setIncDetails] = useState("");
  const [creatingInc, setCreatingInc] = useState(false);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/overview", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to load admin telemetry.");
      }
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const handleAckIncident = async (id: string) => {
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ack_incident", id }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Could not acknowledge incident.");
      }
      showToast({
        title: "Incident Acknowledged",
        message: "Marked resolved in platform incident log.",
        type: "success",
      });
      await loadOverview();
    } catch (err: unknown) {
      showToast({
        title: "Acknowledge Failed",
        message: err instanceof Error ? err.message : "Incident update error.",
        type: "error",
      });
    }
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incTitle.trim()) return;
    setCreatingInc(true);
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_incident",
          title: incTitle.trim(),
          severity: incSeverity,
          region: incRegion.trim() || "Global Edge",
          details: incDetails.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to log incident.");
      }
      showToast({
        title: "Incident Recorded",
        message: json.incident?.title || incTitle,
        type: "warning",
      });
      setShowIncidentModal(false);
      setIncTitle("");
      setIncDetails("");
      await loadOverview();
    } catch (err: unknown) {
      showToast({
        title: "Incident Error",
        message: err instanceof Error ? err.message : "Could not record incident.",
        type: "error",
      });
    } finally {
      setCreatingInc(false);
    }
  };

  const stats = data?.stats || {
    users: 0,
    orgs: 0,
    skills: 0,
    downloads: 0,
    storage: "0 KB",
    uptime: "100.0%",
    activeIncidents: 0,
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-black tracking-tight">
            Platform Control Plane Overview
          </h1>
          <p className="font-mono text-xs text-black/55 mt-1">
            Live PostgreSQL telemetry across all tenants, published packages, registry storage, and service health
          </p>
        </div>

        <button
          type="button"
          onClick={loadOverview}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-black/10 bg-white hover:bg-black/[0.03] text-black/75 font-mono text-xs font-semibold cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-mono text-red-700 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── 6 REAL KPI CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {[
          { label: "Total Users", value: stats.users.toLocaleString(), icon: Users, href: "/admin/users" },
          { label: "Workspaces", value: stats.orgs.toLocaleString(), icon: Building2, href: "/admin/organizations" },
          { label: "Published Skills", value: stats.skills.toLocaleString(), icon: TerminalSquare, href: "/admin/skills" },
          { label: "Total Pulls", value: stats.downloads.toLocaleString(), icon: Download, href: "/admin/skills" },
          { label: "Storage Used", value: stats.storage, icon: HardDrive, href: "/admin/organizations" },
          {
            label: "Active Incidents",
            value: String(stats.activeIncidents),
            icon: ShieldAlert,
            href: "/admin/system",
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="rounded-xl border border-black/10 bg-white p-4 shadow-xs hover:border-[#1B5FED]/40 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between text-black/50 mb-2">
                <span className="font-mono text-[10px] uppercase font-semibold">{kpi.label}</span>
                <Icon className="w-3.5 h-3.5 text-[#1B5FED]" />
              </div>
              <div className="text-xl font-bold font-sans text-black">
                {loading && !data ? "—" : kpi.value}
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── CHART + QUICK ACTIONS ── */}
      <DownloadsOverTimeChart
        title="Platform Pulls Over Time"
        totalDownloads={stats.downloads}
        events={data?.packagesTimeline || []}
      />

      {/* ── LIVE SERVICES & INCIDENTS SPLIT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Services */}
        <div className="rounded-xl border border-black/10 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-sans font-bold text-base text-black">
              <Activity className="w-4 h-4 text-[#1B5FED]" />
              <h2>Core Infrastructure Probes</h2>
            </div>
            <Link
              href="/admin/system"
              className="inline-flex items-center gap-1 font-mono text-xs text-[#1B5FED] hover:underline font-semibold"
            >
              <span>Inspect Mesh</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-black/5">
            {(data?.services || []).map((svc) => (
              <div key={svc.name} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-sans font-semibold text-xs text-black">{svc.name}</div>
                  <div className="font-mono text-[10px] text-black/45">
                    Latency: {svc.p50LatencyMs} ms · SLA {svc.uptimePercent}%
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    svc.status === "operational"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}
                >
                  {svc.status === "operational" ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <AlertTriangle className="w-3 h-3" />
                  )}
                  {svc.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Incidents Feed */}
        <div className="rounded-xl border border-black/10 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-sans font-bold text-base text-black">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <h2>Platform Incident Log</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowIncidentModal(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-black text-white font-mono text-[11px] font-semibold cursor-pointer hover:bg-black/85"
            >
              <Plus className="w-3 h-3" />
              <span>Log Incident</span>
            </button>
          </div>

          {!data?.incidents || data.incidents.length === 0 ? (
            <div className="rounded-lg border border-black/5 bg-black/[0.02] p-6 text-center font-mono text-xs text-black/50">
              Zero active incidents logged. All services reporting normal telemetry.
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.incidents.map((inc) => (
                <div
                  key={inc.id}
                  className={`rounded-lg border p-3.5 flex items-start justify-between gap-3 ${
                    inc.acknowledged
                      ? "border-black/10 bg-black/[0.02] opacity-70"
                      : inc.severity === "critical"
                        ? "border-red-200 bg-red-50/70"
                        : "border-amber-200 bg-amber-50/70"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white border border-black/10">
                        {inc.severity}
                      </span>
                      <span className="font-sans font-bold text-xs text-black">{inc.title}</span>
                    </div>
                    {inc.details && (
                      <p className="font-sans text-[11px] text-black/65">{inc.details}</p>
                    )}
                    <div className="font-mono text-[10px] text-black/45">
                      {inc.region} · {inc.startTime}
                    </div>
                  </div>
                  {!inc.acknowledged && (
                    <button
                      type="button"
                      onClick={() => handleAckIncident(inc.id)}
                      className="px-2.5 py-1 rounded bg-white border border-black/15 hover:bg-black hover:text-white font-mono text-[10px] font-semibold cursor-pointer transition-colors flex-shrink-0"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── LOG INCIDENT MODAL ── */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/10 bg-black/[0.02]">
              <h2 className="font-sans font-bold text-base text-black">Log Platform Incident</h2>
              <button
                type="button"
                onClick={() => setShowIncidentModal(false)}
                className="p-1.5 rounded-lg text-black/50 hover:text-black hover:bg-black/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateIncident} className="p-5 space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase font-semibold text-black/60 mb-1.5">
                  Incident Title
                </label>
                <input
                  type="text"
                  required
                  value={incTitle}
                  onChange={(e) => setIncTitle(e.target.value)}
                  placeholder="Elevated tarball signing latency in bom1"
                  className="w-full px-3 py-2 rounded-lg border border-black/15 font-sans text-xs text-black focus:outline-none focus:border-[#1B5FED]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] uppercase font-semibold text-black/60 mb-1.5">
                    Severity
                  </label>
                  <select
                    value={incSeverity}
                    onChange={(e) => setIncSeverity(e.target.value as "info" | "warning" | "critical")}
                    className="w-full px-3 py-2 rounded-lg border border-black/15 font-mono text-xs text-black bg-white focus:outline-none focus:border-[#1B5FED]"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase font-semibold text-black/60 mb-1.5">
                    Region
                  </label>
                  <input
                    type="text"
                    value={incRegion}
                    onChange={(e) => setIncRegion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-black/15 font-mono text-xs text-black focus:outline-none focus:border-[#1B5FED]"
                  />
                </div>
              </div>
              <div>
                <label className="block font-mono text-[11px] uppercase font-semibold text-black/60 mb-1.5">
                  Details
                </label>
                <textarea
                  rows={3}
                  value={incDetails}
                  onChange={(e) => setIncDetails(e.target.value)}
                  placeholder="Optional impact notes or mitigation status..."
                  className="w-full px-3 py-2 rounded-lg border border-black/15 font-sans text-xs text-black focus:outline-none focus:border-[#1B5FED]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setShowIncidentModal(false)}
                  className="px-4 py-2 rounded-lg border border-black/15 font-mono text-xs font-semibold text-black/70 hover:bg-black/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingInc}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1B5FED] text-white font-mono text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {creatingInc && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Incident</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
