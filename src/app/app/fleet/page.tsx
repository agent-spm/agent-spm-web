"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSession } from "@/lib/data/session-context";
import { useToast } from "@/components/ui/ToastProvider";
import {
  Activity,
  Bot,
  Play,
  Pause,
  Trash2,
  Search,
  AlertTriangle,
  XCircle,
  Code,
  Copy,
  ChevronRight,
  Layers,
  RefreshCw,
  Send,
  ShieldCheck,
  Terminal,
  Loader2,
} from "lucide-react";

interface FleetLogEvent {
  id: string;
  timestamp: string;
  createdAt?: string;
  agentId: string;
  agentRole: string;
  skillName: string;
  toolName: string;
  method: string;
  status: number;
  latencyMs: number;
  tokens: number;
  clientIp: string;
  shieldStatus: string;
  requestPayload: Record<string, unknown>;
  responsePayload: Record<string, unknown>;
}

interface FleetStats {
  activeRunners: number;
  throughputPerMin: number;
  p95LatencyMs: number;
  hourlyTokenCostUsd: number;
  passRatePercent: number;
  blockedOrFailedCount: number;
  totalEvents: number;
}

const EMPTY_STATS: FleetStats = {
  activeRunners: 0,
  throughputPerMin: 0,
  p95LatencyMs: 0,
  hourlyTokenCostUsd: 0,
  passRatePercent: 100,
  blockedOrFailedCount: 0,
  totalEvents: 0,
};

export default function FleetWarRoomPage() {
  const { currentOrg, skills, userProfile } = useSession();
  const { showToast } = useToast();

  const [events, setEvents] = useState<FleetLogEvent[]>([]);
  const [stats, setStats] = useState<FleetStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [migrationRequired, setMigrationRequired] = useState(false);
  const [autoPoll, setAutoPoll] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<FleetLogEvent | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "200" | "errors">("all");
  const [activeTab, setActiveTab] = useState<"request" | "response" | "security">("request");
  const [emitting, setEmitting] = useState(false);
  const [clearing, setClearing] = useState(false);

  const loadEvents = useCallback(
    async (silent = false) => {
      if (!currentOrg.id) {
        setEvents([]);
        setStats(EMPTY_STATS);
        setLoading(false);
        return;
      }
      if (!silent) setLoading(true);
      try {
        const res = await fetch(
          `/api/fleet/events?orgId=${encodeURIComponent(currentOrg.id)}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch fleet telemetry.");
        }
        const nextEvents: FleetLogEvent[] = Array.isArray(data.events) ? data.events : [];
        setEvents(nextEvents);
        setStats(data.stats || EMPTY_STATS);
        setMigrationRequired(Boolean(data.migrationRequired));
        setSelectedEvent((prev) => {
          if (prev && nextEvents.some((e) => e.id === prev.id)) return prev;
          return nextEvents[0] || null;
        });
      } catch (err: unknown) {
        if (!silent) {
          showToast({
            title: "Telemetry Fetch Error",
            message: err instanceof Error ? err.message : "Could not load fleet stream.",
            type: "error",
          });
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [currentOrg.id, showToast]
  );

  useEffect(() => {
    loadEvents(false);
  }, [loadEvents]);

  useEffect(() => {
    if (!autoPoll || !currentOrg.id || migrationRequired) return;
    const interval = setInterval(() => {
      loadEvents(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPoll, currentOrg.id, migrationRequired, loadEvents]);

  const handleEmitTestEvent = async () => {
    if (!currentOrg.id) return;
    setEmitting(true);
    try {
      const targetSkill = skills[0]
        ? `${skills[0].scope}/${skills[0].name}`
        : `${currentOrg.slug}/runtime-check`;
      const res = await fetch("/api/telemetry/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: currentOrg.id,
          agentId: `runner-${(userProfile?.githubUsername || "local").slice(0, 12)}`,
          agentRole: "Workspace Verification Runner",
          packageName: targetSkill,
          toolName: "verify_skill_runtime",
          method: "tools/call",
          statusCode: 200,
          latencyMs: 38,
          tokens: 420,
          requestPayload: {
            jsonrpc: "2.0",
            id: `call-${Date.now().toString().slice(-6)}`,
            method: "tools/call",
            params: {
              name: "verify_skill_runtime",
              arguments: { package: targetSkill, workspace: currentOrg.slug },
            },
          },
          responsePayload: {
            jsonrpc: "2.0",
            id: `call-${Date.now().toString().slice(-6)}`,
            result: { ok: true, workspace: currentOrg.slug, verified: true },
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to ingest test telemetry event.");
      }
      showToast({
        title: "Telemetry Event Recorded",
        message: `Persisted MCP call for ${targetSkill} into Postgres.`,
        type: "success",
      });
      await loadEvents(false);
    } catch (err: unknown) {
      showToast({
        title: "Ingest Error",
        message: err instanceof Error ? err.message : "Could not send test telemetry event.",
        type: "error",
      });
    } finally {
      setEmitting(false);
    }
  };

  const handleClearEvents = async () => {
    if (!currentOrg.id) return;
    setClearing(true);
    try {
      const res = await fetch(
        `/api/fleet/events?orgId=${encodeURIComponent(currentOrg.id)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not clear workspace telemetry.");
      }
      setEvents([]);
      setStats(EMPTY_STATS);
      setSelectedEvent(null);
      showToast({
        title: "Telemetry Buffer Cleared",
        message: `Deleted recorded events for ${currentOrg.slug}.`,
        type: "neutral",
      });
    } catch (err: unknown) {
      showToast({
        title: "Clear Failed",
        message: err instanceof Error ? err.message : "Failed to clear telemetry.",
        type: "error",
      });
    } finally {
      setClearing(false);
    }
  };

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((ev) => {
      const matchesSearch =
        !q ||
        ev.agentId.toLowerCase().includes(q) ||
        ev.toolName.toLowerCase().includes(q) ||
        ev.skillName.toLowerCase().includes(q);
      if (statusFilter === "200") return matchesSearch && ev.status < 400;
      if (statusFilter === "errors") return matchesSearch && ev.status >= 400;
      return matchesSearch;
    });
  }, [events, search, statusFilter]);

  const curlSnippet = useMemo(() => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://www.agent-spm.com";
    const pkg = skills[0] ? `${skills[0].scope}/${skills[0].name}` : `${currentOrg.slug}/my-skill`;
    return `curl -X POST ${origin}/api/telemetry/ingest \\
  -H "Authorization: Bearer $SPM_LIVE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"agentId":"claude-runner-1","packageName":"${pkg}","toolName":"run_tool","statusCode":200,"latencyMs":42,"tokens":510}'`;
  }, [skills, currentOrg.slug]);

  const handleCopy = (text: string, title = "Copied") => {
    navigator.clipboard.writeText(text);
    showToast({ title, message: "Copied to clipboard.", type: "success" });
  };

  return (
    <div className="space-y-6 text-black">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-black/50 mb-1">
            <Link href="/app" className="hover:text-[#1B5FED] transition-colors">
              WORKSPACE
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#1B5FED] font-bold">FLEET WAR-ROOM</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black flex items-center gap-2.5">
              <Activity className="w-7 h-7 text-[#1B5FED]" />
              Agent Fleet War-Room
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                stats.activeRunners > 0
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-black/[0.04] text-black/60 border-black/10"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  stats.activeRunners > 0 ? "bg-emerald-500 animate-pulse" : "bg-black/30"
                }`}
              />
              {stats.activeRunners} Active {stats.activeRunners === 1 ? "Runner" : "Runners"} (5m)
            </span>
          </div>
          <p className="text-sm text-black/60 mt-1 max-w-2xl">
            Workspace-isolated MCP JSON-RPC telemetry stream for <strong>{currentOrg.slug}</strong> via{" "}
            <code className="font-mono text-xs bg-black/5 px-1.5 py-0.5 rounded">
              POST /api/telemetry/ingest
            </code>
            .
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleEmitTestEvent}
            disabled={emitting || migrationRequired || !currentOrg.id}
            className="px-3.5 py-2 rounded-xl bg-[#1B5FED] hover:bg-[#154EC9] text-white text-xs font-mono font-semibold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {emitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Emit Test Event</span>
          </button>

          <button
            type="button"
            onClick={() => setAutoPoll(!autoPoll)}
            className={`px-3 py-2 rounded-xl border text-xs font-mono font-medium transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer ${
              autoPoll
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                : "bg-white text-black/70 border-black/10 hover:bg-black/5"
            }`}
          >
            {autoPoll ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{autoPoll ? "Polling (5s)" : "Paused"}</span>
          </button>

          <button
            type="button"
            onClick={() => loadEvents(false)}
            disabled={loading}
            className="px-3 py-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-xs font-mono font-medium text-black shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          {events.length > 0 && (
            <button
              type="button"
              disabled={clearing}
              onClick={handleClearEvents}
              className="px-3 py-2 rounded-xl border border-black/10 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-xs font-mono font-medium text-black transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {migrationRequired && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 font-mono text-xs text-amber-950 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Telemetry Table Not Migrated Yet</div>
            <p className="mt-1 text-amber-900/80">
              Run{" "}
              <code className="px-1.5 py-0.5 rounded bg-amber-100 border border-amber-200">
                supabase/migrations/20261126_admin_control_plane_and_tenant_scoping.sql
              </code>{" "}
              in your Supabase SQL Editor to create{" "}
              <code className="font-semibold">public.agent_telemetry_events</code> and start receiving live MCP runner events.
            </p>
          </div>
        </div>
      )}

      {/* ── REAL COMPUTED KPI CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <span className="font-mono text-[10px] uppercase font-bold text-black/40 block mb-1">
            Active Agent Workers (5m)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-black">{stats.activeRunners}</span>
            <span className="font-mono text-[10px] text-black/45">
              {stats.totalEvents} stored events
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <span className="font-mono text-[10px] uppercase font-bold text-black/40 block mb-1">
            Throughput (Calls/Min)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-black">{stats.throughputPerMin}</span>
            <span className="font-mono text-[10px] text-black/45">last 60s</span>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <span className="font-mono text-[10px] uppercase font-bold text-black/40 block mb-1">
            P95 Latency
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-[#1B5FED]">{stats.p95LatencyMs}ms</span>
            <span className="font-mono text-[10px] text-black/40">JSON-RPC</span>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <span className="font-mono text-[10px] uppercase font-bold text-black/40 block mb-1">
            Hourly Token Burn (Est.)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-black">
              ${stats.hourlyTokenCostUsd.toFixed(4)}
            </span>
            <span className="font-mono text-[10px] text-black/40">/hr</span>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <span className="font-mono text-[10px] uppercase font-bold text-black/40 block mb-1">
            Call Pass Rate
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-emerald-700">
              {stats.passRatePercent}%
            </span>
            <span className="font-mono text-[10px] text-black/50">
              {stats.blockedOrFailedCount} errors
            </span>
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTER TABS ── */}
      <div className="rounded-2xl border border-black/10 bg-white p-3 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by agent ID, tool, or skill package..."
            className="w-full rounded-xl border border-black/10 bg-[#FAFAFA] pl-10 pr-20 py-2 text-xs text-black placeholder:text-black/40 focus:border-[#1B5FED] focus:outline-none font-sans"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-black/40">
            {filteredEvents.length} events
          </span>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F5F5F7] border border-black/5 font-mono text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              statusFilter === "all" ? "bg-white text-black font-bold shadow-sm" : "text-black/60"
            }`}
          >
            All Calls ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("200")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              statusFilter === "200"
                ? "bg-white text-emerald-700 font-bold shadow-sm"
                : "text-black/60"
            }`}
          >
            2xx OK Only
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("errors")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              statusFilter === "errors"
                ? "bg-white text-red-700 font-bold shadow-sm"
                : "text-black/60"
            }`}
          >
            Errors &amp; RateLimits
          </button>
        </div>
      </div>

      {/* ── STREAM TABLE OR ONBOARDING EMPTY STATE ── */}
      {events.length === 0 && !loading ? (
        <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase text-[#1B5FED] bg-[#1B5FED]/10 px-2.5 py-0.5 rounded-full">
                <Terminal className="w-3 h-3" />
                <span>Waiting for Telemetry</span>
              </div>
              <h2 className="text-lg font-bold text-black">
                No agent calls recorded in {currentOrg.slug} yet
              </h2>
              <p className="text-xs text-black/60 max-w-xl">
                Send real MCP tool call telemetry from your agent runner using a{" "}
                <Link href="/app/settings" className="text-[#1B5FED] underline font-semibold">
                  live API key
                </Link>
                , or click <strong>Emit Test Event</strong> above to verify your Postgres stream immediately.
              </p>
            </div>
          </div>

          <div className="relative">
            <pre className="p-4 rounded-xl bg-[#0F172A] text-[#E2E8F0] font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
              {curlSnippet}
            </pre>
            <button
              type="button"
              onClick={() => handleCopy(curlSnippet, "curl Command Copied")}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors cursor-pointer"
              title="Copy curl snippet"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[520px]">
          {/* LEFT: LIVE STREAM TABLE (8 Cols) */}
          <div className="lg:col-span-8 rounded-2xl border border-black/10 bg-white overflow-hidden shadow-sm flex flex-col">
            <div className="p-3 border-b border-black/10 bg-[#FAFAFA] flex items-center justify-between font-mono text-xs text-black/60">
              <span>POSTGRES TELEMETRY STREAM</span>
              <span>PROTOCOL: MCP JSON-RPC 2.0</span>
            </div>

            <div className="flex-1 overflow-x-auto max-h-[540px] overflow-y-auto">
              {loading && events.length === 0 ? (
                <div className="p-10 text-center font-mono text-xs text-black/45">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1B5FED]" />
                  Loading workspace telemetry events...
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#FAFAFA] border-b border-black/10 font-mono text-[10px] text-black/50 uppercase tracking-wider sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3">Time (UTC)</th>
                      <th className="py-2.5 px-3">Agent Worker</th>
                      <th className="py-2.5 px-3">Tool Invoked</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Latency</th>
                      <th className="py-2.5 px-3">Tokens</th>
                      <th className="py-2.5 px-3 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-xs font-sans">
                    {filteredEvents.map((ev) => {
                      const isSelected = selectedEvent?.id === ev.id;
                      return (
                        <tr
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-[#1B5FED]/5 font-semibold text-black"
                              : "hover:bg-black/[0.02] text-black/80"
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono text-[11px] text-black/50 whitespace-nowrap">
                            {ev.timestamp}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <Bot className="w-3.5 h-3.5 text-[#1B5FED] shrink-0" />
                              <span className="font-mono text-xs font-medium text-black truncate max-w-[130px]">
                                {ev.agentId}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-mono text-[11px] font-semibold text-black truncate max-w-[160px]">
                              {ev.toolName}
                            </div>
                            <div className="font-mono text-[10px] text-black/40 truncate max-w-[160px]">
                              {ev.skillName}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {ev.status < 400 ? (
                              <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {ev.status} OK
                              </span>
                            ) : ev.status === 429 ? (
                              <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300">
                                <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                                429 Limit
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-900 border border-red-300">
                                <XCircle className="w-2.5 h-2.5 text-red-600" />
                                {ev.status} Err
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-black/70 whitespace-nowrap">
                            {ev.latencyMs}ms
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-black/70 whitespace-nowrap">
                            {ev.tokens}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="font-mono text-[10px] text-[#1B5FED] hover:underline">
                              View →
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* RIGHT: WIRE PAYLOAD INSPECTOR (4 Cols) */}
          <div className="lg:col-span-4 rounded-2xl border border-black/10 bg-white p-5 shadow-sm flex flex-col justify-between space-y-4">
            {selectedEvent ? (
              <div className="space-y-4">
                <div className="border-b border-black/10 pb-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold text-black/40 block">
                      Payload Inspector
                    </span>
                    <h3 className="text-base font-bold text-black flex items-center gap-2">
                      <Code className="w-4 h-4 text-[#1B5FED]" />
                      {selectedEvent.toolName}
                    </h3>
                  </div>
                  <span className="font-mono text-xs text-black/50">{selectedEvent.timestamp}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-[#F8F9FA] border border-black/5">
                    <span className="text-[10px] text-black/40 block uppercase">Caller</span>
                    <span className="font-bold text-black truncate block">
                      {selectedEvent.agentId}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F8F9FA] border border-black/5">
                    <span className="text-[10px] text-black/40 block uppercase">Client IP</span>
                    <span className="font-bold text-black">{selectedEvent.clientIp}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F5F5F7] border border-black/5 font-mono text-xs">
                  {(["request", "response", "security"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-1 text-center rounded-lg transition-all cursor-pointer font-medium capitalize ${
                        activeTab === tab ? "bg-white text-black font-bold shadow-xs" : "text-black/60"
                      }`}
                    >
                      {tab === "request" ? "Request" : tab === "response" ? "Response" : "Event Check"}
                    </button>
                  ))}
                </div>

                {activeTab === "request" && (
                  <div className="relative">
                    <pre className="p-3 rounded-xl bg-[#0F172A] text-[#E2E8F0] font-mono text-xs overflow-auto max-h-[260px] leading-relaxed border border-slate-800">
                      {JSON.stringify(selectedEvent.requestPayload, null, 2)}
                    </pre>
                    <button
                      type="button"
                      onClick={() => handleCopy(JSON.stringify(selectedEvent.requestPayload, null, 2), "Request JSON Copied")}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {activeTab === "response" && (
                  <div className="relative">
                    <pre className="p-3 rounded-xl bg-[#0F172A] text-[#E2E8F0] font-mono text-xs overflow-auto max-h-[260px] leading-relaxed border border-slate-800">
                      {JSON.stringify(selectedEvent.responsePayload, null, 2)}
                    </pre>
                    <button
                      type="button"
                      onClick={() => handleCopy(JSON.stringify(selectedEvent.responsePayload, null, 2), "Response JSON Copied")}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="p-3 rounded-xl bg-[#F8F9FA] border border-black/5 space-y-2.5 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-black/60">HTTP / RPC Status:</span>
                      <span
                        className={`font-bold ${
                          selectedEvent.status < 400 ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        {selectedEvent.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-black/60">Shield Verdict:</span>
                      <span className="inline-flex items-center gap-1 font-bold text-black">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#1B5FED]" />
                        {selectedEvent.shieldStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-black/60">Package Scope:</span>
                      <span className="font-semibold text-black truncate max-w-[160px]">
                        {selectedEvent.skillName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-black/60">Latency:</span>
                      <span className="text-black font-semibold">{selectedEvent.latencyMs}ms</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center p-8 text-black/40 font-mono text-xs">
                Select an event from the stream to inspect payloads.
              </div>
            )}

            <div className="pt-3 border-t border-black/10">
              <Link
                href="/app/skills/workspace"
                className="w-full py-2 px-3 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-xs font-mono font-semibold text-black flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Layers className="w-3.5 h-3.5 text-[#1B5FED]" />
                <span>View Workspace in DAG Studio</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
