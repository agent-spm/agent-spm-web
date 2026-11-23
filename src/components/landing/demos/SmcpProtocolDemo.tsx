"use client";

import React, { useState, useMemo, useId } from "react";
import { Play, Terminal, RotateCcw } from "lucide-react";
import { DemoDarkShell, DemoTabList } from "./DemoChrome";
import { DEMO_SCHEMA_PRESETS, optimizeToolSchema } from "@/lib/tools/schema-diet";
import { DemoPackageItem, pickUniqueDemoPackages } from "./demo-types";

interface LogEntry {
  id: string;
  cmd: string;
  sourceLabel: "LIVE REGISTRY" | "LOCAL SCHEMA DIET" | "SANDBOX DRY-RUN";
  lines: string[];
}

export default function SmcpProtocolDemo({
  initialPackages,
}: {
  initialPackages: DemoPackageItem[];
}) {
  const uid = useId();
  const cmdInputId = `${uid}-cli-input`;
  const stripDescId = `${uid}-strip-desc`;
  const pruneOptId = `${uid}-prune-opt`;

  const uniquePackages = useMemo(
    () => pickUniqueDemoPackages(initialPackages, 6),
    [initialPackages]
  );
  const defaultPkg = uniquePackages[0];
  const sampleCmdTarget = uniquePackages.find((p) => p.name === "test-spm")?.fullName || defaultPkg.fullName;

  const sampleCommands = useMemo(
    () => [
      `spm search ${defaultPkg.name}`,
      `spm inspect ${defaultPkg.fullName}`,
      `spm install ${sampleCmdTarget}`,
      "spm schema-diet --preset github-mcp",
      "smcp call search_registry",
    ],
    [defaultPkg.name, defaultPkg.fullName, sampleCmdTarget]
  );

  const [cmdInput, setCmdInput] = useState(`spm search ${defaultPkg.name}`);
  const [isRunning, setIsRunning] = useState(false);
  const [rightTab, setRightTab] = useState<"jsonrpc" | "schemadiet">("jsonrpc");
  const [stripDescriptions, setStripDescriptions] = useState(true);
  const [pruneOptional, setPruneOptional] = useState(false);
  const [presetIdx, setPresetIdx] = useState(0);

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "init-1",
      cmd: `spm search ${defaultPkg.name}`,
      sourceLabel: "LIVE REGISTRY",
      lines: [
        `✔ Found ${defaultPkg.fullName} (v${defaultPkg.latestVersion}) in public registry`,
        "→ Click any command pill above or type `help` to test live queries.",
      ],
    },
  ]);

  const [rpcPayload, setRpcPayload] = useState<{
    request: Record<string, unknown>;
    response: Record<string, unknown>;
    mode: "LIVE REGISTRY" | "SANDBOX DRY-RUN";
  }>({
    mode: "LIVE REGISTRY",
    request: {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: "registry_search", arguments: { query: defaultPkg.name } },
    },
    response: {
      jsonrpc: "2.0",
      id: 1,
      result: {
        matched: defaultPkg.fullName,
        version: defaultPkg.latestVersion,
        integrityMode: "sha256",
      },
    },
  });

  const dietResult = useMemo(
    () =>
      optimizeToolSchema(DEMO_SCHEMA_PRESETS[presetIdx].rawJson, {
        stripDescriptions,
        stripTitles: true,
        stripDrafts: true,
        pruneOptional,
        condenseEnums: true,
      }),
    [presetIdx, stripDescriptions, pruneOptional]
  );

  const executeCommand = async (rawCommand: string) => {
    const trimmed = rawCommand.trim();
    if (!trimmed || isRunning) return;

    const lower = trimmed.toLowerCase();
    if (lower === "clear") {
      setLogs([]);
      return;
    }

    if (lower === "help") {
      setLogs((prev) => [
        ...prev.slice(-6),
        {
          id: `${Date.now()}`,
          cmd: trimmed,
          sourceLabel: "SANDBOX DRY-RUN",
          lines: [
            "Supported interactive commands:",
            "  spm search <keyword>     Query live public registry packages",
            "  spm inspect <package>    Read real SHA-256 & version metadata",
            "  spm install <package>    Preview dependency & lock resolution",
            "  spm schema-diet          Compact MCP schema & measure tokens saved",
            "  smcp call <tool>         Dispatch JSON-RPC 2.0 tool dry-run",
          ],
        },
      ]);
      return;
    }

    if (lower.startsWith("spm schema-diet") || lower === "schema-diet") {
      const nextIdx = lower.includes("postgres") ? 1 : 0;
      setPresetIdx(nextIdx);
      setRightTab("schemadiet");
      const activeDiet = optimizeToolSchema(DEMO_SCHEMA_PRESETS[nextIdx].rawJson, {
        stripDescriptions,
        stripTitles: true,
        stripDrafts: true,
        pruneOptional,
        condenseEnums: true,
      });
      setLogs((prev) => [
        ...prev.slice(-6),
        {
          id: `${Date.now()}`,
          cmd: trimmed,
          sourceLabel: "LOCAL SCHEMA DIET",
          lines: [
            `✔ Compacted ${DEMO_SCHEMA_PRESETS[nextIdx].name}`,
            `  Tokens: ${activeDiet.originalTokens} → ${activeDiet.optimizedTokens} (-${activeDiet.percentSaved}% prompt bloat removed)`,
          ],
        },
      ]);
      return;
    }

    if (lower.startsWith("smcp call")) {
      const toolArg = trimmed.replace(/^smcp call\s*/i, "").trim() || "search_registry";
      setRightTab("jsonrpc");
      setIsRunning(true);
      try {
        const res = await fetch(`/api/demo/inspect?q=${encodeURIComponent(defaultPkg.name)}`);
        const data = await res.json();
        const top = data?.packages?.[0];
        setRpcPayload({
          mode: "SANDBOX DRY-RUN",
          request: {
            jsonrpc: "2.0",
            id: 42,
            method: "tools/call",
            params: { name: toolArg, arguments: { limit: 3 } },
          },
          response: {
            jsonrpc: "2.0",
            id: 42,
            result: {
              transport: "smcp-bridge-preview",
              liveRegistrySample: top ? `${top.fullName}@${top.latestVersion}` : defaultPkg.fullName,
              executionStatus: "sandbox-simulated",
            },
          },
        });
        setLogs((prev) => [
          ...prev.slice(-6),
          {
            id: `${Date.now()}`,
            cmd: trimmed,
            sourceLabel: "SANDBOX DRY-RUN",
            lines: [
              `→ Dispatched JSON-RPC tools/call "${toolArg}"`,
              `✔ Bridge preview paired with live registry (${top?.fullName || defaultPkg.fullName})`,
            ],
          },
        ]);
      } finally {
        setIsRunning(false);
      }
      return;
    }

    if (lower.startsWith("spm inspect") || lower.startsWith("spm install")) {
      const arg = trimmed.split(/\s+/)[2] || defaultPkg.fullName;
      const isInstall = lower.startsWith("spm install");
      setIsRunning(true);
      setRightTab("jsonrpc");

      try {
        const res = await fetch(`/api/demo/inspect?package=${encodeURIComponent(arg)}`);
        const data = await res.json();
        if (!res.ok || !data?.package) {
          setLogs((prev) => [
            ...prev.slice(-6),
            {
              id: `${Date.now()}`,
              cmd: trimmed,
              sourceLabel: "LIVE REGISTRY",
              lines: [`✖ Package "${arg}" not found in public registry.`],
            },
          ]);
          return;
        }
        const p = data.package;
        setRpcPayload({
          mode: "LIVE REGISTRY",
          request: {
            jsonrpc: "2.0",
            id: 7,
            method: isInstall ? "registry/resolve" : "registry/inspect",
            params: { package: p.displayName },
          },
          response: {
            jsonrpc: "2.0",
            id: 7,
            result: {
              package: p.displayName,
              version: p.latestVersion,
              verified: p.verified,
              integrity: p.integrity,
              downloads: p.totalDownloads,
              readmeSource: p.readmeSource,
            },
          },
        });
        setLogs((prev) => [
          ...prev.slice(-6),
          {
            id: `${Date.now()}`,
            cmd: trimmed,
            sourceLabel: "LIVE REGISTRY",
            lines: [
              `✔ Resolved ${p.displayName}@${p.latestVersion} (${p.verified ? "Verified Publisher" : "Community Package"})`,
              `  SHA-256: ${p.integrity}`,
              isInstall
                ? "  Dry-run lock preview ready (download .tgz in card above to record installs)"
                : `  Docs: ${p.readmeSource} • Downloads: ${p.totalDownloads}`,
            ],
          },
        ]);
      } finally {
        setIsRunning(false);
      }
      return;
    }

    const q = lower.startsWith("spm search")
      ? trimmed.slice("spm search".length).trim()
      : trimmed;
    setIsRunning(true);
    setRightTab("jsonrpc");
    try {
      const res = await fetch(`/api/demo/inspect?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      const rawHits: DemoPackageItem[] = Array.isArray(data?.packages) ? data.packages : [];
      const hits = pickUniqueDemoPackages(rawHits, 3);
      setRpcPayload({
        mode: "LIVE REGISTRY",
        request: {
          jsonrpc: "2.0",
          id: 9,
          method: "registry/search",
          params: { query: q || "*" },
        },
        response: {
          jsonrpc: "2.0",
          id: 9,
          result: {
            total: data?.total ?? hits.length,
            topMatches: hits.map((h) => `${h.fullName}@${h.latestVersion}`),
          },
        },
      });
      setLogs((prev) => [
        ...prev.slice(-6),
        {
          id: `${Date.now()}`,
          cmd: trimmed,
          sourceLabel: "LIVE REGISTRY",
          lines:
            hits.length > 0
              ? hits.map((h) => `• ${h.fullName} (v${h.latestVersion}) — ${h.totalDownloads} downloads`)
              : [`No live public packages matched "${q}". Try "${defaultPkg.name}" or "test-spm".`],
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <DemoDarkShell
      title="[SMCP RUNTIME] json-rpc & schema-diet"
      badgeText={rightTab === "schemadiet" ? `SCHEMA DIET • -${dietResult.percentSaved}%` : rpcPayload.mode}
      badgeTone={rightTab === "schemadiet" ? "emerald" : "blue"}
    >
      {/* Preset CLI Command Strip */}
      <div className="px-3 py-2 border-b border-zinc-800 bg-[#111113] flex items-center gap-1.5 overflow-x-auto flex-nowrap shrink-0 scrollbar-none">
        <span className="font-mono text-[10px] text-zinc-400 uppercase shrink-0 mr-1">
          Try:
        </span>
        {sampleCommands.map((cmd) => (
          <button
            key={cmd}
            type="button"
            onClick={() => {
              setCmdInput(cmd);
              void executeCommand(cmd);
            }}
            className="flex-none min-h-[28px] px-2.5 py-1 rounded-[3px] border border-zinc-700 bg-zinc-900 hover:bg-[#1B5FED] hover:border-[#1B5FED] text-zinc-200 hover:text-white font-mono text-[11px] whitespace-nowrap transition-colors cursor-pointer"
          >
            {cmd}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Interactive CLI Terminal */}
        <div className="lg:col-span-6 border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col min-h-[210px] lg:min-h-0 min-w-0 overflow-hidden bg-[#09090B]">
          <div
            aria-live="polite"
            className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3 font-mono text-xs"
          >
            {logs.map((entry) => (
              <div key={entry.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-zinc-100 min-w-0">
                    <span className="text-[#609CFF] font-bold">spm&gt;</span>
                    <span className="truncate font-semibold">{entry.cmd}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-[2px] border border-zinc-700 bg-zinc-900 text-zinc-300 shrink-0">
                    {entry.sourceLabel}
                  </span>
                </div>
                <div className="pl-4 space-y-0.5 text-zinc-300 text-[11px] leading-relaxed">
                  {entry.lines.map((line, i) => (
                    <div key={i} className="break-words">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void executeCommand(cmdInput);
            }}
            className="p-2.5 border-t border-zinc-800 bg-[#111113] flex items-center gap-2 shrink-0"
          >
            <label htmlFor={cmdInputId} className="sr-only">
              Run SPM terminal command
            </label>
            <Terminal className="w-3.5 h-3.5 text-[#609CFF] shrink-0" aria-hidden="true" />
            <input
              id={cmdInputId}
              type="text"
              value={cmdInput}
              onChange={(e) => setCmdInput(e.target.value)}
              placeholder="Type: spm search antiskill"
              className="flex-1 min-w-0 min-h-[34px] bg-[#09090B] border border-zinc-700 rounded-[4px] px-2.5 font-mono text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#1B5FED]"
            />
            <button
              type="submit"
              disabled={isRunning}
              className="min-h-[34px] px-3 rounded-[4px] bg-[#1B5FED] hover:bg-[#1B5FED]/90 disabled:opacity-60 text-white font-mono text-xs font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Play className="w-3 h-3 fill-current" aria-hidden="true" />
              <span>{isRunning ? "..." : "Run"}</span>
            </button>
          </form>
        </div>

        {/* Right JSON-RPC 2.0 / Schema Diet Inspector */}
        <div className="lg:col-span-6 flex flex-col min-h-[210px] lg:min-h-0 min-w-0 overflow-hidden bg-[#0D0D10]">
          <DemoTabList
            idPrefix={`${uid}-smcp`}
            ariaLabel="SMCP protocol and Schema Diet tabs"
            activeId={rightTab}
            onSelect={(id) => setRightTab(id as "jsonrpc" | "schemadiet")}
            tabs={[
              { id: "jsonrpc", label: "JSON-RPC 2.0 Bridge" },
              { id: "schemadiet", label: `Schema Diet (-${dietResult.percentSaved}% Tokens)` },
            ]}
          />

          {rightTab === "jsonrpc" ? (
            <div
              role="tabpanel"
              aria-labelledby={`${uid}-smcp-tab-jsonrpc`}
              className="flex-1 min-h-0 overflow-auto p-3.5 font-mono text-[11px] space-y-3"
            >
              <div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                  Request Envelope
                </div>
                <pre className="p-2.5 rounded-[4px] bg-[#09090B] border border-zinc-800 text-[#9CC2FF] whitespace-pre-wrap break-words">
                  {JSON.stringify(rpcPayload.request, null, 2)}
                </pre>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-emerald-300 mb-1">
                  Response Payload ({rpcPayload.mode})
                </div>
                <pre className="p-2.5 rounded-[4px] bg-[#09090B] border border-emerald-500/30 text-emerald-200 whitespace-pre-wrap break-words">
                  {JSON.stringify(rpcPayload.response, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div
              role="tabpanel"
              aria-labelledby={`${uid}-smcp-tab-schemadiet`}
              className="flex-1 min-h-0 flex flex-col overflow-hidden"
            >
              <div className="p-2.5 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 bg-[#09090B] shrink-0">
                <div className="flex items-center gap-3 flex-wrap font-mono text-[11px]">
                  <label htmlFor={stripDescId} className="inline-flex items-center gap-1.5 cursor-pointer text-zinc-200">
                    <input
                      id={stripDescId}
                      type="checkbox"
                      checked={stripDescriptions}
                      onChange={(e) => setStripDescriptions(e.target.checked)}
                      className="accent-[#1B5FED]"
                    />
                    <span>Strip docs</span>
                  </label>
                  <label htmlFor={pruneOptId} className="inline-flex items-center gap-1.5 cursor-pointer text-zinc-200">
                    <input
                      id={pruneOptId}
                      type="checkbox"
                      checked={pruneOptional}
                      onChange={(e) => setPruneOptional(e.target.checked)}
                      className="accent-[#1B5FED]"
                    />
                    <span>Required only</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="text-zinc-400">
                    {dietResult.originalTokens} →{" "}
                    <strong className="text-emerald-300">{dietResult.optimizedTokens} tok</strong>
                  </span>
                  <button
                    type="button"
                    aria-label="Switch sample tool schema"
                    onClick={() => setPresetIdx((i) => (i + 1) % DEMO_SCHEMA_PRESETS.length)}
                    className="px-2 py-1 rounded-[3px] border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" aria-hidden="true" />
                    <span>Next Schema</span>
                  </button>
                </div>
              </div>
              <pre className="flex-1 min-h-0 overflow-auto p-3.5 font-mono text-[11px] text-emerald-200 whitespace-pre-wrap break-words">
                <code>{dietResult.optimizedSchema}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </DemoDarkShell>
  );
}
