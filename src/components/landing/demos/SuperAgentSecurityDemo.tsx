"use client";

import React, { useState, useEffect, useId, useMemo } from "react";
import {
  Bot,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Lock,
  Network,
  FolderGit2,
  Plus,
} from "lucide-react";
import { DemoDarkShell } from "./DemoChrome";
import {
  DemoPackageItem,
  DemoPackageDetail,
  formatReadmeSourceLabel,
  pickUniqueDemoPackages,
} from "./demo-types";

interface PresetFlow {
  id: string;
  label: string;
  agentName: string;
  permissions: string[];
}

const PRESET_FLOWS: PresetFlow[] = [
  {
    id: "dev-team",
    label: "Code & Repo Automation",
    agentName: "Cursor / Engineering Agent",
    permissions: ["fs:workspace-read", "git:release-read", "mcp:stdio-isolated"],
  },
  {
    id: "web-research",
    label: "Web Intelligence Agent",
    agentName: "Research & Crawl Agent",
    permissions: ["net:https-allowlist", "sandbox:memory-scoped", "audit:digest-locked"],
  },
];

export default function SuperAgentSecurityDemo({
  initialPackages,
}: {
  initialPackages: DemoPackageItem[];
}) {
  const uid = useId();
  const tamperSwitchId = `${uid}-tamper-switch`;

  const uniqueQuickPackages = useMemo(
    () => pickUniqueDemoPackages(initialPackages, 6),
    [initialPackages]
  );

  const [flowId, setFlowId] = useState<string>(PRESET_FLOWS[0].id);
  const [selectedPkg, setSelectedPkg] = useState<DemoPackageItem>(uniqueQuickPackages[0]);
  const [detail, setDetail] = useState<DemoPackageDetail | null>(null);
  const [simulateTamper, setSimulateTamper] = useState(false);

  const activeFlow = PRESET_FLOWS.find((f) => f.id === flowId) || PRESET_FLOWS[0];

  useEffect(() => {
    if (!selectedPkg) return;
    const controller = new AbortController();
    fetch(`/api/demo/inspect?package=${encodeURIComponent(selectedPkg.fullName)}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.mode === "package" && data.package) {
          setDetail(data.package);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [selectedPkg]);

  const recordedHash =
    detail?.integrity && detail.integrity !== "unrecorded"
      ? detail.integrity
      : "sha256:7b9a1c4f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b";

  const hasRecordedHash = Boolean(detail?.integrity && detail.integrity !== "unrecorded");
  const isBlocked = simulateTamper;

  return (
    <DemoDarkShell
      title="[SUPERAGENT GUARD] context & sha-256 gate"
      badgeText={isBlocked ? "TAMPER ALERT • BLOCKED" : "INTEGRITY VERIFIED"}
      badgeTone={isBlocked ? "amber" : "emerald"}
      headerRight={
        <label
          htmlFor={tamperSwitchId}
          className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[3px] bg-zinc-900 border border-zinc-700 hover:border-zinc-500 font-mono text-[11px] text-zinc-200 cursor-pointer select-none"
        >
          <input
            id={tamperSwitchId}
            type="checkbox"
            checked={simulateTamper}
            onChange={(e) => setSimulateTamper(e.target.checked)}
            {...({ switch: "" } as Record<string, string>)}
            className="accent-red-500 cursor-pointer"
          />
          <span>Simulate Tampered File</span>
        </label>
      }
    >
      {/* Workflow Preset & Unique Skill Picker */}
      <div className="px-3 py-2 border-b border-zinc-800 bg-[#111113] flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          {PRESET_FLOWS.map((flow) => (
            <button
              key={flow.id}
              type="button"
              onClick={() => setFlowId(flow.id)}
              className={`min-h-[30px] px-2.5 py-1 rounded-[3px] font-mono text-[11px] transition-colors cursor-pointer ${
                flowId === flow.id
                  ? "bg-[#1B5FED] text-white font-semibold"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
              }`}
            >
              {flow.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono text-[10px] text-zinc-400 uppercase">Skill:</span>
          {uniqueQuickPackages.slice(0, 3).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedPkg(item)}
              className={`min-h-[28px] px-2 py-0.5 rounded-[3px] font-mono text-[10px] border inline-flex items-center gap-1 transition-colors cursor-pointer ${
                selectedPkg.id === item.id
                  ? "bg-white text-black border-white font-semibold"
                  : "bg-zinc-900 text-zinc-300 border-zinc-700 hover:text-white"
              }`}
            >
              <Plus className="w-2.5 h-2.5" aria-hidden="true" />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: 2-Tier Pipeline (Zero Right-Edge Clipping) + Cryptographic Panel */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Interactive DAG Pipeline — Stacked 2+1 Grid prevents horizontal overflow clipping */}
        <figure
          aria-label="Interactive agent runtime to verified skill execution pipeline"
          className="lg:col-span-7 p-4 flex flex-col justify-between gap-3 border-b lg:border-b-0 lg:border-r border-zinc-800 bg-[#09090B] min-w-0 overflow-y-auto"
        >
          <div className="space-y-3">
            {/* Row 1: Agent Host -> SPM Lock Gate */}
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-2.5">
              {/* Node 1: Agent Host */}
              <div className="min-w-0 p-3 rounded-[4px] border border-[#1B5FED]/50 bg-[#111520]">
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-[#9CC2FF] mb-1">
                  <Bot className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>1. Agent Runtime</span>
                </div>
                <div className="font-sans text-xs sm:text-sm font-semibold text-white truncate">
                  {activeFlow.agentName}
                </div>
                <div className="font-mono text-[10px] text-zinc-400 mt-1">
                  Requests verified tool context
                </div>
              </div>

              <div
                className="flex items-center justify-center font-mono text-xs text-zinc-500 py-0.5 sm:py-0"
                aria-hidden="true"
              >
                <span className="hidden sm:inline">──▶</span>
                <span className="sm:hidden">↓</span>
              </div>

              {/* Node 2: Selected Skill Gate */}
              <div
                className={`min-w-0 p-3 rounded-[4px] border transition-colors ${
                  isBlocked
                    ? "border-red-500/60 bg-red-950/35"
                    : "border-emerald-500/45 bg-emerald-950/20"
                }`}
              >
                <div className="flex items-center justify-between gap-1 font-mono text-[10px] uppercase mb-1">
                  <span className={isBlocked ? "text-red-300" : "text-emerald-300"}>
                    2. SPM Lock Gate
                  </span>
                  {isBlocked ? (
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" aria-hidden="true" />
                  ) : selectedPkg.verified ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                  ) : (
                    <Shield className="w-3.5 h-3.5 text-emerald-300 shrink-0" aria-hidden="true" />
                  )}
                </div>
                <div className="font-mono text-xs font-bold text-white truncate">
                  {selectedPkg.fullName}
                </div>
                <div className="font-mono text-[10px] text-zinc-300 mt-1 truncate">
                  {isBlocked ? "Blocked: Checksum Mismatch" : `v${selectedPkg.latestVersion} • Digest Checked`}
                </div>
              </div>
            </div>

            {/* Connector Down to Node 3 */}
            <div className="flex items-center justify-center font-mono text-[11px] text-zinc-500" aria-hidden="true">
              <span>↓ {isBlocked ? "Execution Halted" : "Scoped Dispatch Approved"}</span>
            </div>

            {/* Row 2: Full-Width Scoped Permissions Perimeter (Never Clips) */}
            <div
              className={`min-w-0 p-3 rounded-[4px] border transition-opacity ${
                isBlocked
                  ? "border-zinc-800 bg-zinc-900/40 opacity-55"
                  : "border-zinc-800 bg-[#111113]"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-zinc-300">
                  <Lock className="w-3 h-3 text-[#609CFF] shrink-0" aria-hidden="true" />
                  <span>3. Scoped Runtime Permissions</span>
                </div>
                <span className="font-mono text-[10px] text-zinc-400">
                  {isBlocked ? "Revoked" : "Active Sandbox Policy"}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                {activeFlow.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="px-2 py-1 rounded-[3px] border border-zinc-700 bg-[#09090B] text-zinc-200"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <figcaption className="p-2.5 rounded-[4px] bg-[#111113] border border-zinc-800 font-mono text-[11px] text-zinc-300">
            <strong className="text-white">How it protects teams:</strong> Before any AI assistant loads an external tool, Agent SPM verifies its version lock and SHA-256 checksum.
          </figcaption>
        </figure>

        {/* Right Cryptographic Audit Panel */}
        <div className="lg:col-span-5 p-4 bg-[#0D0D10] flex flex-col justify-between gap-3 min-w-0 overflow-y-auto">
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400">
                Integrity Attestation
              </span>
              <span
                className={`px-2 py-0.5 rounded-[3px] text-[10px] font-bold shrink-0 ${
                  isBlocked
                    ? "bg-red-500/20 text-red-200 border border-red-500/45"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                }`}
              >
                {isBlocked ? "BLOCKED BEFORE RUN" : "DIGEST MATCH"}
              </span>
            </div>

            <div className="p-2.5 rounded-[4px] bg-[#09090B] border border-zinc-800 space-y-1">
              <div className="text-[10px] text-zinc-400 uppercase">
                Registry SHA-256 ({hasRecordedHash ? "Live DB" : "Sample"})
              </div>
              <div className="text-[11px] text-emerald-300 break-all">{recordedHash}</div>
            </div>

            <div className="p-2.5 rounded-[4px] bg-[#09090B] border border-zinc-800 space-y-1">
              <div className="text-[10px] text-zinc-400 uppercase">Observed Tarball Hash</div>
              <div
                className={`text-[11px] break-all ${
                  isBlocked ? "text-red-300" : "text-emerald-300"
                }`}
              >
                {isBlocked
                  ? "sha256:deadbeef00112233445566778899aabbccddeeff (TAMPERED)"
                  : recordedHash}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800 font-mono text-[10px] text-zinc-300">
            <div className="p-2 rounded-[3px] border border-zinc-800 bg-[#111113] flex items-center gap-1.5 min-w-0">
              <FolderGit2 className="w-3.5 h-3.5 text-[#609CFF] shrink-0" aria-hidden="true" />
              <span className="truncate">{formatReadmeSourceLabel(detail?.readmeSource)}</span>
            </div>
            <div className="p-2 rounded-[3px] border border-zinc-800 bg-[#111113] flex items-center gap-1.5 min-w-0">
              <Network className="w-3.5 h-3.5 text-[#609CFF] shrink-0" aria-hidden="true" />
              <span className="truncate">
                {selectedPkg.verified ? "Verified Publisher" : "Community Review"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DemoDarkShell>
  );
}
