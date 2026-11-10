"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Activity,
  Bot,
  Zap,
  Play,
  Pause,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Code,
  Copy,
  ChevronRight,
  ExternalLink,
  Shield,
  Layers,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

interface FleetLogEvent {
  id: string;
  timestamp: string;
  agentId: string;
  agentRole: string;
  skillName: string;
  toolName: string;
  method: "tools/call" | "resources/read" | "prompts/get";
  status: 200 | 429 | 500;
  latencyMs: number;
  tokens: number;
  clientIp: string;
  requestPayload: Record<string, unknown>;
  responsePayload: Record<string, unknown>;
}

const INITIAL_EVENTS: FleetLogEvent[] = [
  {
    id: "rpc-9104",
    timestamp: "13:42:15.820",
    agentId: "agent-triage-402",
    agentRole: "Triage Sentinel",
    skillName: "@spm/browser-tools",
    toolName: "take_dom_snapshot",
    method: "tools/call",
    status: 200,
    latencyMs: 74,
    tokens: 920,
    clientIp: "10.0.4.12",
    requestPayload: {
      jsonrpc: "2.0",
      id: "call-9104",
      method: "tools/call",
      params: {
        name: "take_dom_snapshot",
        arguments: { selector: "#main-content", full_page: true, format: "ax-tree" },
      },
    },
    responsePayload: {
      jsonrpc: "2.0",
      id: "call-9104",
      result: {
        content: [{ type: "text", text: '{"node": "BODY", "children": 48, "accessible": true}' }],
        isError: false,
      },
    },
  },
  {
    id: "rpc-9103",
    timestamp: "13:42:14.210",
    agentId: "claude-code-runner-09",
    agentRole: "Code Reviewer",
    skillName: "@spm/security-shield",
    toolName: "ast_taint_check",
    method: "tools/call",
    status: 200,
    latencyMs: 22,
    tokens: 410,
    clientIp: "10.0.2.88",
    requestPayload: {
      jsonrpc: "2.0",
      id: "call-9103",
      method: "tools/call",
      params: {
        name: "ast_taint_check",
        arguments: { code: 'const query = req.query.id; db.execute("SELECT * FROM users WHERE id = " + query);' },
      },
    },
    responsePayload: {
      jsonrpc: "2.0",
      id: "call-9103",
      result: {
        content: [{ type: "text", text: '{"taint_detected": true, "type": "SQL_INJECTION", "line": 1}' }],
        isError: false,
      },
    },
  },
  {
    id: "rpc-9102",
    timestamp: "13:42:12.605",
    agentId: "data-synthesizer-18",
    agentRole: "Analytics Bot",
    skillName: "@spm/postgres-mcp",
    toolName: "query_readonly",
    method: "tools/call",
    status: 429,
    latencyMs: 140,
    tokens: 680,
    clientIp: "10.0.1.201",
    requestPayload: {
      jsonrpc: "2.0",
      id: "call-9102",
      method: "tools/call",
      params: {
        name: "query_readonly",
        arguments: { query: "SELECT count(*) FROM audit_events WHERE created_at > now() - interval '1 hour'" },
      },
    },
    responsePayload: {
      jsonrpc: "2.0",
      id: "call-9102",
      error: {
        code: -32000,
        message: "Tenant concurrency limit reached (100 req/min). Backing off.",
      },
    },
  },
  {
    id: "rpc-9101",
    timestamp: "13:42:10.150",
    agentId: "agent-triage-402",
    agentRole: "Triage Sentinel",
    skillName: "@spm/slack-notify",
    toolName: "send_incident_alert",
    method: "tools/call",
    status: 200,
    latencyMs: 48,
    tokens: 520,
    clientIp: "10.0.4.12",
    requestPayload: {
      jsonrpc: "2.0",
      id: "call-9101",
      method: "tools/call",
      params: {
        name: "send_incident_alert",
        arguments: { channel: "#sec-ops", severity: "WARN", message: "DOM audit completed with 0 errors" },
      },
    },
    responsePayload: {
      jsonrpc: "2.0",
      id: "call-9101",
      result: {
        content: [{ type: "text", text: '{"delivered": true, "ts": "1731053530.102"}' }],
        isError: false,
      },
    },
  },
];

export default function FleetWarRoomPage() {
  const { showToast } = useToast();
  const [events, setEvents] = useState<FleetLogEvent[]>(INITIAL_EVENTS);
  const [isStreaming, setIsStreaming] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<FleetLogEvent | null>(INITIAL_EVENTS[0]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "200" | "errors">("all");
  const [activeTab, setActiveTab] = useState<"request" | "response" | "security">("request");

  // Simulated live event generation
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const toolPresets = [
        {
          agent: "agent-triage-402",
          role: "Triage Sentinel",
          skill: "@spm/browser-tools",
          tool: "take_dom_snapshot",
          status: 200 as const,
          latency: Math.floor(Math.random() * 40) + 50,
          tokens: 880,
        },
        {
          agent: "claude-code-runner-09",
          role: "Code Reviewer",
          skill: "@spm/security-shield",
          tool: "ast_taint_check",
          status: 200 as const,
          latency: Math.floor(Math.random() * 20) + 15,
          tokens: 380,
        },
        {
          agent: "deploy-officer-02",
          role: "Deploy Officer",
          skill: "@spm/github-mcp",
          tool: "merge_pull_request",
          status: 200 as const,
          latency: Math.floor(Math.random() * 80) + 90,
          tokens: 1250,
        },
        {
          agent: "data-synthesizer-18",
          role: "Analytics Bot",
          skill: "@spm/postgres-mcp",
          tool: "query_readonly",
          status: Math.random() > 0.85 ? (429 as const) : (200 as const),
          latency: Math.floor(Math.random() * 60) + 80,
          tokens: 720,
        },
      ];

      const preset = toolPresets[Math.floor(Math.random() * toolPresets.length)];
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${Math.floor(
        Math.random() * 900 + 100
      )}`;

      const newEvent: FleetLogEvent = {
        id: `rpc-${Math.floor(Math.random() * 90000 + 10000)}`,
        timestamp: timeStr,
        agentId: preset.agent,
        agentRole: preset.role,
        skillName: preset.skill,
        toolName: preset.tool,
        method: "tools/call",
        status: preset.status,
        latencyMs: preset.latency,
        tokens: preset.tokens,
        clientIp: `10.0.${Math.floor(Math.random() * 4)}.${Math.floor(Math.random() * 250)}`,
        requestPayload: {
          jsonrpc: "2.0",
          id: `call-${Date.now().toString().slice(-4)}`,
          method: "tools/call",
          params: { name: preset.tool, arguments: { auto_stream: true } },
        },
        responsePayload: {
          jsonrpc: "2.0",
          id: `call-${Date.now().toString().slice(-4)}`,
          result: {
            content: [{ type: "text", text: `Execution OK in ${preset.latency}ms` }],
            isError: preset.status !== 200,
          },
        },
      };

      setEvents((prev) => [newEvent, ...prev.slice(0, 39)]);
    }, 3200);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.agentId.toLowerCase().includes(search.toLowerCase()) ||
      ev.toolName.toLowerCase().includes(search.toLowerCase()) ||
      ev.skillName.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === "200") return matchesSearch && ev.status === 200;
    if (statusFilter === "errors") return matchesSearch && ev.status !== 200;
    return matchesSearch;
  });

  const handleCopyPayload = (data: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    showToast({
      title: "Payload Copied",
      message: "JSON-RPC wire payload copied to clipboard.",
      type: "success",
    });
  };

  return (
    <div className="space-y-6 text-black">
      {/* ── TOP HEADER / BREADCRUMB ROW ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-black/50 mb-1">
            <Link href="/app" className="hover:text-[#1B5FED] transition-colors">
              WORKSPACE
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#1B5FED] font-bold">FLEET WAR-ROOM</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black flex items-center gap-2.5">
              <Activity className="w-7 h-7 text-[#1B5FED]" />
              Live Agent Fleet War-Room
            </h1>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              42 Runners Live
            </span>
          </div>
          <p className="text-sm text-black/60 mt-1 max-w-2xl">
            Real-time streaming telemetry and JSON-RPC wire inspection across all autonomous agents
            invoking SPM skill tools in production.
          </p>
        </div>

        {/* Global War-Room Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-medium transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer ${
              isStreaming
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                : "bg-white text-black/70 border-black/10 hover:bg-black/5"
            }`}
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isStreaming ? "Pause Live Stream" : "Resume Stream"}
          </button>
          <button
            onClick={() => {
              setEvents([]);
              showToast({ title: "Stream Cleared", message: "Event logs buffer reset.", type: "neutral" });
            }}
            className="px-3.5 py-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-xs font-mono font-medium text-black transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-black/50" />
            Clear
          </button>
        </div>
      </div>

      {/* ── KPI METRICS RIBBON (5 CARDS) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <span className="font-mono text-[10px] uppercase font-bold text-black/40 block mb-1">
            Active Agent Workers
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-black">42</span>
            <span className="font-mono text-[10px] text-emerald-600 font-semibold">100% HEALTH</span>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <span className="font-mono text-[10px] uppercase font-bold text-black/40 block mb-1">
            Throughput (Calls/Min)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-black">1,842</span>
            <span className="font-mono text-[10px] text-emerald-600 font-semibold">+14.2%</span>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <span className="font-mono text-[10px] uppercase font-bold text-black/40 block mb-1">
            P95 Wire Latency
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-[#1B5FED]">78ms</span>
            <span className="font-mono text-[10px] text-black/40 font-normal">JSON-RPC</span>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <span className="font-mono text-[10px] uppercase font-bold text-black/40 block mb-1">
            Hourly Token Burn
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-black">$14.20</span>
            <span className="font-mono text-[10px] text-black/40 font-normal">/hr</span>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <span className="font-mono text-[10px] uppercase font-bold text-black/40 block mb-1">
            Security Taint Shield
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-emerald-700">99.98%</span>
            <span className="font-mono text-[10px] text-emerald-600 font-semibold">0 JAIL BREAKS</span>
          </div>
        </div>
      </div>

      {/* ── CONTROLS ROW: SEARCH & FILTER TABS ── */}
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
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              statusFilter === "all" ? "bg-white text-black font-bold shadow-sm" : "text-black/60"
            }`}
          >
            All Calls ({events.length})
          </button>
          <button
            onClick={() => setStatusFilter("200")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              statusFilter === "200"
                ? "bg-white text-emerald-700 font-bold shadow-sm"
                : "text-black/60"
            }`}
          >
            200 OK Only
          </button>
          <button
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

      {/* ── MAIN SPLIT: STREAMING TABLE + SLIDE-OUT INSPECTOR ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* LEFT / CENTER: LIVE STREAM TABLE (8 Cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-black/10 bg-white overflow-hidden shadow-sm flex flex-col">
          <div className="p-3 border-b border-black/10 bg-[#FAFAFA] flex items-center justify-between font-mono text-xs text-black/60">
            <span>LIVE TELEMETRY STREAM</span>
            <span>WIRE PROTOCOL: MODEL CONTEXT PROTOCOL (MCP)</span>
          </div>

          <div className="flex-1 overflow-x-auto max-h-[560px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#FAFAFA] border-b border-black/10 font-mono text-[10px] text-black/50 uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3">Time</th>
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
                          <span className="font-mono text-xs font-medium text-black truncate max-w-[120px]">
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
                        {ev.status === 200 ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            200 OK
                          </span>
                        ) : ev.status === 429 ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300">
                            <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                            429 Limit
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-900 border border-red-300">
                            <XCircle className="w-2.5 h-2.5 text-red-600" />
                            500 Err
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
          </div>
        </div>

        {/* RIGHT: JSON-RPC 2.0 WIRE INSPECTOR DRAWER (4 Cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-black/10 bg-white p-5 shadow-sm flex flex-col justify-between space-y-4">
          {selectedEvent ? (
            <div className="space-y-4">
              {/* Header */}
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

              {/* RPC Metadata Grid */}
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

              {/* Tab Selector */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F5F5F7] border border-black/5 font-mono text-xs">
                <button
                  onClick={() => setActiveTab("request")}
                  className={`flex-1 py-1 text-center rounded-lg transition-all cursor-pointer font-medium ${
                    activeTab === "request"
                      ? "bg-white text-black font-bold shadow-xs"
                      : "text-black/60"
                  }`}
                >
                  Request (JSON-RPC)
                </button>
                <button
                  onClick={() => setActiveTab("response")}
                  className={`flex-1 py-1 text-center rounded-lg transition-all cursor-pointer font-medium ${
                    activeTab === "response"
                      ? "bg-white text-black font-bold shadow-xs"
                      : "text-black/60"
                  }`}
                >
                  Response (Result)
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`flex-1 py-1 text-center rounded-lg transition-all cursor-pointer font-medium ${
                    activeTab === "security"
                      ? "bg-white text-black font-bold shadow-xs"
                      : "text-black/60"
                  }`}
                >
                  Shield Audit
                </button>
              </div>

              {/* Code Viewer */}
              {activeTab === "request" && (
                <div className="relative">
                  <pre className="p-3 rounded-xl bg-[#0F172A] text-[#E2E8F0] font-mono text-xs overflow-auto max-h-[260px] leading-relaxed border border-slate-800">
                    {JSON.stringify(selectedEvent.requestPayload, null, 2)}
                  </pre>
                  <button
                    onClick={() => handleCopyPayload(selectedEvent.requestPayload)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
                    title="Copy Request JSON"
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
                    onClick={() => handleCopyPayload(selectedEvent.responsePayload)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
                    title="Copy Response JSON"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {activeTab === "security" && (
                <div className="p-3 rounded-xl bg-[#F8F9FA] border border-black/5 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-black/60">SLSA Build Level 3:</span>
                    <span className="text-emerald-700 font-bold">VERIFIED ✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-black/60">AST Taint Scanning:</span>
                    <span className="text-emerald-700 font-bold">PASS (0 Taints)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-black/60">Prompt Injection Guard:</span>
                    <span className="text-emerald-700 font-bold">CLEAN</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-black/60">Sandbox Isolation:</span>
                    <span className="text-black/80 font-semibold">gVisor Container Jail</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-8 text-black/40 font-mono text-xs">
              Select an event from the live telemetry stream to inspect wire payloads.
            </div>
          )}

          {/* Footer Action */}
          <div className="pt-3 border-t border-black/10">
            <Link
              href="/app/skills/workspace"
              className="w-full py-2 px-3 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-xs font-mono font-semibold text-black flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Layers className="w-3.5 h-3.5 text-[#1B5FED]" />
              View Node in DAG Studio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
