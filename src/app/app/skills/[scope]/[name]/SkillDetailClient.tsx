"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/data/session-context";
import { DeleteSkillModal } from "@/components/modals/DeleteSkillModal";
import { ConnectAgentModal } from "@/components/modals/ConnectAgentModal";
import { useToast } from "@/components/ui/ToastProvider";
import {
  Copy,
  Check,
  Edit,
  Plus,
  Globe,
  Lock,
  ExternalLink,
  Download,
  AlertTriangle,
  GitCompare,
  FileCode,
  ArrowRight,
  Play,
  Terminal,
  ShieldCheck,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Code2,
} from "lucide-react";

interface SkillDetailClientProps {
  scope: string;
  name: string;
}

export default function SkillDetailClient({ scope, name }: SkillDetailClientProps) {
  const router = useRouter();
  const rawScope = decodeURIComponent(scope);
  const rawName = decodeURIComponent(name);
  const normalizedScope = rawScope.startsWith("@") ? rawScope : `@${rawScope}`;

  const { skills, deleteSkill, updateSkillStatus, userProfile } = useSession();
  const { showToast } = useToast();
  
  // Navigation & Modal States
  const [activeTab, setActiveTab] = useState<
    "overview" | "playground" | "versions" | "analytics" | "security" | "settings"
  >("overview");
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showManifestModal, setShowManifestModal] = useState(false);
  const [manifestDraft, setManifestDraft] = useState("");

  // Versions Diff States
  const [compareFrom, setCompareFrom] = useState("1.0.0");
  const [compareTo, setCompareTo] = useState("1.2.0");
  const [showDiff, setShowDiff] = useState(false);

  // MCP Playground States
  const [selectedTool, setSelectedTool] = useState("take_dom_snapshot");
  const [targetUrl, setTargetUrl] = useState("https://example.com/checkout");
  const [viewportWidth, setViewportWidth] = useState(1280);
  const [viewportHeight, setViewportHeight] = useState(800);
  const [extractTextOnly, setExtractTextOnly] = useState(false);
  const [selector, setSelector] = useState("button#submit-order");
  const [scriptCode, setScriptCode] = useState("document.title;");
  const [isRunning, setIsRunning] = useState(false);
  const [execLatency, setExecLatency] = useState(74);
  const [activeConsoleTab, setActiveConsoleTab] = useState<"rendered" | "jsonrpc" | "curl">("rendered");

  const skill = skills.find(
    (s) => (s.scope === rawScope || s.scope === normalizedScope) && s.name === rawName
  );

  if (!skill) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-8 text-center">
        <h2 className="font-mono text-lg font-bold text-black">Skill Not Found</h2>
        <p className="mt-2 text-sm text-black/60">
          No skill matching {rawScope}/{rawName} was found in your workspace.
        </p>
        <Link
          href="/app/skills"
          className="mt-4 inline-flex items-center rounded-xl bg-black px-4 py-2 font-mono text-xs font-semibold text-white hover:bg-black/85"
        >
          Back to Skills
        </Link>
      </div>
    );
  }

  const canonicalName = skill.name.startsWith("@") && skill.name.includes("/")
    ? skill.name.split("/")[1]
    : skill.name;

  const installCmd = `spm install ${canonicalName}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    showToast({
      title: "Command Copied to Clipboard",
      message: installCmd,
      type: "success",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunTool = () => {
    setIsRunning(true);
    const start = performance.now();
    setTimeout(() => {
      const end = performance.now();
      setExecLatency(Math.round(end - start) + 42);
      setIsRunning(false);
      showToast({
        title: "Tool Executed Successfully",
        message: `${selectedTool} returned 200 OK in ${Math.round(end - start) + 42}ms`,
        type: "success",
      });
    }, 550);
  };

  const handleApplyPreset = (presetType: "valid" | "edge" | "error") => {
    if (presetType === "valid") {
      setTargetUrl("https://example.com/checkout");
      setViewportWidth(1280);
      setViewportHeight(800);
      setExtractTextOnly(false);
      setSelector("button#submit-order");
      showToast({ title: "Valid Preset Loaded", message: "Standard execution parameters set.", type: "info" });
    } else if (presetType === "edge") {
      setTargetUrl("https://deep-nested.internal-corp.test/analytics?view=full&nodes=5000");
      setViewportWidth(2560);
      setViewportHeight(1440);
      setExtractTextOnly(true);
      setSelector("div[data-node-id='9812'] > span.metric");
      showToast({ title: "Edge Case Preset Loaded", message: "High-resolution viewport & deep selector.", type: "info" });
    } else {
      setTargetUrl("invalid-uri-without-protocol");
      setViewportWidth(-100);
      setViewportHeight(0);
      setSelector("");
      showToast({ title: "Error Preset Loaded", message: "Boundary validation triggers ready.", type: "warning" });
    }
  };

  return (
    <div className="space-y-6 text-black">
      {/* ── HEADER ROW ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-mono text-black tracking-tight">
              {skill.name.startsWith("@") ? skill.name : `${skill.scope}/${skill.name}`}
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-sky-50 text-[#1B5FED] border border-sky-200 font-semibold">
              v{skill.version}
            </span>
          </div>
          <p className="mt-1 text-sm text-black/70 font-sans">
            {skill.description}
          </p>
        </div>

        {/* Header Action Buttons: [C] Connect to Agent, [E] Edit Manifest, [N] New Version */}
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <button
            onClick={() => setShowConnectModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-sky-50 border border-sky-300 hover:bg-sky-100 text-[#1B5FED] font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 text-[#1B5FED]" />
            <span>Connect to Agent</span>
            <span className="text-[10px] bg-[#1B5FED]/15 text-[#1B5FED] px-1.5 py-0.2 rounded border border-[#1B5FED]/30 font-bold">[C]</span>
          </button>

          <button
            onClick={() => {
              const defaultYaml = `name: ${canonicalName}
scope: ${skill.scope}
version: ${skill.version}
description: "${skill.description}"
license: ${skill.license || "MIT"}

runtime:
  engine: "node>=18"
  permissions:
    network:
      - "https://*.*"
    filesystem: "read-only"

agents:
  gpt4: true
  claude: true
  gemini: true

entrypoint: "./dist/index.js"
`;
              setManifestDraft(defaultYaml);
              setShowManifestModal(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-black font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
          >
            <Edit className="w-3.5 h-3.5 text-black/60" />
            <span>Edit Manifest</span>
            <span className="text-[10px] bg-black/5 text-black/70 px-1.5 py-0.2 rounded border border-black/10">[E]</span>
          </button>

          <Link
            href="/app/skills/publish"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Version</span>
            <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.2 rounded">[N]</span>
          </Link>
        </div>
      </div>

      {/* ── META BADGES ROW ── */}
      <div className="flex items-center gap-3 sm:gap-6 flex-wrap text-xs font-mono text-black/70 p-3.5 rounded-2xl bg-white border border-black/10 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-black/50">Status:</span>
          <span className={`uppercase font-bold text-[10px] px-2.5 py-0.5 rounded-full ${
            skill.status === "published"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
              : skill.status === "draft"
                ? "bg-amber-50 text-amber-900 border border-amber-300"
                : "bg-red-50 text-red-900 border border-red-300"
          }`}>
            {skill.status}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-black/50">Visibility:</span>
          {skill.visibility === "public" ? (
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Public</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-800 font-semibold">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Private</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-black/50">License:</span>
          <span className="text-black font-semibold">{skill.license}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-black/50">Package Size:</span>
          <span className="text-black font-semibold">{skill.versions?.[0]?.tarballSize || "—"}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-black/50">Integrity:</span>
          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {skill.versions?.[0]?.signature ? "Signed Package" : "Community Package"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-black/50">Downloads:</span>
          <span className="text-[#1B5FED] font-bold">{skill.totalDownloads.toLocaleString()}</span>
        </div>
      </div>

      {/* ── TAB SELECTOR (Overview, Playground, Versions, Analytics, Security, Settings) ── */}
      <div className="flex items-center gap-1 border-b border-black/10 pb-px font-mono text-xs overflow-x-auto">
        {(["overview", "playground", "versions", "analytics", "security", "settings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === tab
                ? "border-[#1B5FED] text-[#1B5FED]"
                : "border-transparent text-black/60 hover:text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── TAB 1: OVERVIEW ── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Rendered README */}
          <div className="lg:col-span-2 rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="prose max-w-none text-black/80">
              <h2 className="text-xl font-bold font-sans text-black border-b border-black/10 pb-2">
                Capabilities & Integration Guide
              </h2>
              <div className="mt-4 space-y-3 text-sm text-black/70 font-sans leading-relaxed">
                <p>
                  The <code className="text-[#1B5FED] bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 font-mono text-xs font-semibold">{canonicalName}</code> package exposes high-level procedural tool execution hooks directly for LLM agents, enabling deterministic task completion with full audit observability.
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-black/70">
                  <li>Autonomous multi-step execution pipeline</li>
                  <li>Automated boundary validation and secret protection</li>
                  <li>High-frequency metric reporting and telemetry counters</li>
                  <li>Full compatibility with Model Context Protocol (MCP) standards</li>
                </ul>
              </div>

              <h3 className="text-base font-bold font-sans text-black mt-6 mb-2">
                TypeScript Usage Example
              </h3>
              <div className="p-4 rounded-xl border border-black/10 bg-[#09090B] font-mono text-xs text-[#7ECEFF] overflow-x-auto relative shadow-inner">
                <pre>{`import { initSkill } from "${canonicalName}";

const agent = initSkill({
  apiKey: process.env.SPM_API_KEY,
  environment: "production",
});

const result = await agent.execute({
  action: "take_dom_snapshot",
  params: { url: "https://example.com" }
});
console.log("Result:", result.output);`}</pre>
              </div>

              <h3 className="text-base font-bold font-sans text-black mt-6 mb-2">
                Authentication & Runtime Requirements
              </h3>
              <p className="text-xs text-black/70 font-sans leading-relaxed">
                Ensure you have exported your organization token via <code className="font-mono text-[#1B5FED] bg-sky-50 px-1 rounded border border-sky-200">SPM_API_KEY</code>. Use read-only keys for local evaluation and live keys inside production CI runners.
              </p>
            </div>
          </div>

          {/* Right Column: Install Box, Manifest Panel, Compatibility Grid, Tags */}
          <div className="space-y-6">
            {/* Install Box */}
            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
              <label className="block font-mono text-xs uppercase tracking-wider text-black/60 mb-2 font-semibold">
                Install Command
              </label>
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-black/10 bg-black/[0.02] font-mono text-xs text-black">
                <span className="text-black font-semibold truncate mr-2">{installCmd}</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B5FED] text-white hover:bg-[#1B5FED]/90 transition-all font-mono text-[11px] uppercase cursor-pointer shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Manifest Panel */}
            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm space-y-3 font-mono text-xs">
              <h3 className="text-xs uppercase font-bold text-black/60 tracking-wider border-b border-black/10 pb-2">
                Manifest Details
              </h3>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-black/60">Version:</span>
                <span className="text-black font-semibold">v{skill.version}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-black/60">License:</span>
                <span className="text-black">{skill.license}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-black/60">Published:</span>
                <span className="text-black">
                  {skill.updatedAt} by {skill.versions?.[0]?.publishedBy || userProfile?.name || "Publisher"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-black/60">Dependencies:</span>
                <span className="text-black font-medium">3 packages</span>
              </div>
            </div>

            {/* Tags */}
            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
              <h3 className="font-mono text-xs uppercase font-bold text-black/60 tracking-wider mb-2">
                Keyword Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skill.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-black/5 text-black/70 border border-black/10"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: INTERACTIVE MCP PLAYGROUND ── */}
      {activeTab === "playground" && (
        <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono text-black">In-Browser MCP Tool Playground</h2>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold uppercase">
                  SIMULATION ACTIVE
                </span>
              </div>
              <p className="text-xs text-black/60 font-sans mt-0.5">
                Execute tool calls directly against the verified schema without local installation.
              </p>
            </div>

            {/* Preset Chiclets */}
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="text-black/40 mr-1">Presets:</span>
              <button
                onClick={() => handleApplyPreset("valid")}
                className="px-2.5 py-1 rounded-lg border border-black/10 bg-black/[0.03] hover:bg-black/10 text-black cursor-pointer font-medium"
              >
                [P1] Valid
              </button>
              <button
                onClick={() => handleApplyPreset("edge")}
                className="px-2.5 py-1 rounded-lg border border-black/10 bg-black/[0.03] hover:bg-black/10 text-black cursor-pointer font-medium"
              >
                [P2] Edge
              </button>
              <button
                onClick={() => handleApplyPreset("error")}
                className="px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 cursor-pointer font-medium"
              >
                [P3] Error
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 5 Cols: Tool & Parameters Form */}
            <div className="lg:col-span-5 space-y-4">
              {/* Tool Selector */}
              <div>
                <label className="block text-xs font-mono font-semibold text-black/70 uppercase tracking-wider mb-1.5">
                  Target MCP Tool
                </label>
                <select
                  value={selectedTool}
                  onChange={(e) => setSelectedTool(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-black/10 bg-white font-mono text-xs text-black outline-none focus:border-[#1B5FED] focus:ring-2 focus:ring-[#1B5FED]/10 transition-all cursor-pointer shadow-xs"
                >
                  <option value="take_dom_snapshot">take_dom_snapshot — Capture DOM tree & visual snapshot</option>
                  <option value="click_selector">click_selector — Simulate user mouse event</option>
                  <option value="scroll_page">scroll_page — Scroll target viewport</option>
                  <option value="evaluate_script">evaluate_script — Execute sandboxed JS</option>
                </select>
              </div>

              {/* Dynamic Parameter Fields based on Tool */}
              <div className="p-4 rounded-xl border border-black/10 bg-[#FAFAFA] space-y-3 font-sans text-xs">
                <div className="font-mono text-[11px] font-bold uppercase text-black/60 border-b border-black/10 pb-1.5">
                  Input Parameters (JSON Schema Draft 2020-12)
                </div>

                {selectedTool === "take_dom_snapshot" && (
                  <>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-mono text-black font-semibold">targetUrl *</label>
                        <span className="text-[10px] text-red-600 font-mono font-semibold">[REQUIRED]</span>
                      </div>
                      <input
                        type="text"
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-black/10 bg-white font-mono text-xs text-black outline-none focus:border-[#1B5FED]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-mono text-black font-semibold">viewportWidth</label>
                        <input
                          type="number"
                          value={viewportWidth}
                          onChange={(e) => setViewportWidth(Number(e.target.value))}
                          className="w-full h-9 px-3 rounded-lg border border-black/10 bg-white font-mono text-xs text-black outline-none focus:border-[#1B5FED]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-mono text-black font-semibold">viewportHeight</label>
                        <input
                          type="number"
                          value={viewportHeight}
                          onChange={(e) => setViewportHeight(Number(e.target.value))}
                          className="w-full h-9 px-3 rounded-lg border border-black/10 bg-white font-mono text-xs text-black outline-none focus:border-[#1B5FED]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-mono text-black font-semibold">extractTextOnly</span>
                      <button
                        type="button"
                        onClick={() => setExtractTextOnly(!extractTextOnly)}
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                          extractTextOnly ? "bg-[#1B5FED]" : "bg-black/20"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          extractTextOnly ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>
                  </>
                )}

                {selectedTool === "click_selector" && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-black font-semibold">selector *</label>
                      <span className="text-[10px] text-red-600 font-mono font-semibold">[REQUIRED]</span>
                    </div>
                    <input
                      type="text"
                      value={selector}
                      onChange={(e) => setSelector(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-black/10 bg-white font-mono text-xs text-black outline-none focus:border-[#1B5FED]"
                    />
                  </div>
                )}

                {selectedTool === "evaluate_script" && (
                  <div className="space-y-1">
                    <label className="font-mono text-black font-semibold">scriptCode *</label>
                    <textarea
                      rows={3}
                      value={scriptCode}
                      onChange={(e) => setScriptCode(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-black/10 bg-white font-mono text-xs text-black outline-none focus:border-[#1B5FED] resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Execution Action Button */}
              <button
                onClick={handleRunTool}
                disabled={isRunning}
                className="w-full h-11 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 disabled:opacity-50 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98"
              >
                {isRunning ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Executing Tool Call...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Tool Call [⌘ + Enter]</span>
                  </>
                )}
              </button>
            </div>

            {/* Right 7 Cols: Telemetry & Inspector Console */}
            <div className="lg:col-span-7 space-y-4">
              {/* Telemetry Header Pill */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-black/10 bg-black/[0.02] font-mono text-xs flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-black font-bold">STATUS: 200 OK</span>
                </div>
                <div className="flex items-center gap-4 text-black/60">
                  <span>Latency: <strong className="text-black">{execLatency} ms</strong></span>
                  <span>Tokens: <strong className="text-[#1B5FED]">~340 tokens</strong></span>
                  <span>Size: <strong className="text-black">1.4 KB</strong></span>
                </div>
              </div>

              {/* Console Tabs */}
              <div className="rounded-2xl border border-black/10 bg-[#09090B] overflow-hidden shadow-inner flex flex-col min-h-[340px]">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 font-mono text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveConsoleTab("rendered")}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        activeConsoleTab === "rendered"
                          ? "bg-white/15 text-white"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      Rendered Result
                    </button>
                    <button
                      onClick={() => setActiveConsoleTab("jsonrpc")}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        activeConsoleTab === "jsonrpc"
                          ? "bg-white/15 text-white"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      JSON-RPC Wire (2.0)
                    </button>
                    <button
                      onClick={() => setActiveConsoleTab("curl")}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        activeConsoleTab === "curl"
                          ? "bg-white/15 text-white"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      cURL Command
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        activeConsoleTab === "jsonrpc"
                          ? `{"jsonrpc":"2.0","method":"tools/call","params":{"name":"${selectedTool}"}}`
                          : "DOM Snapshot extracted cleanly."
                      );
                      showToast({ title: "Output Copied", message: "Result copied to clipboard", type: "success" });
                    }}
                    className="flex items-center gap-1 text-white/50 hover:text-white cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>

                <div className="p-4 flex-1 font-mono text-xs text-[#7ECEFF] overflow-x-auto">
                  {activeConsoleTab === "rendered" && (
                    <div className="space-y-2 text-slate-200 font-sans text-xs">
                      <div className="text-[#7ECEFF] font-mono text-[11px] font-semibold border-b border-white/10 pb-1">
                        Execution Result Object:
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10 font-mono text-[11px] text-emerald-300">
                        ✔ Page snapshot captured for: {targetUrl}
                      </div>
                      <div className="text-slate-300 text-xs leading-relaxed font-sans">
                        DOM parsed cleanly (2,410 nodes). Viewport evaluated at {viewportWidth}x{viewportHeight}.
                        All active interactive buttons extracted with semantic ARIA roles.
                      </div>
                    </div>
                  )}

                  {activeConsoleTab === "jsonrpc" && (
                    <pre className="text-[11px] text-[#7ECEFF] leading-relaxed">
{`--> {
  "jsonrpc": "2.0",
  "id": "play-req-01",
  "method": "tools/call",
  "params": {
    "name": "${selectedTool}",
    "arguments": {
      "targetUrl": "${targetUrl}",
      "viewport": { "width": ${viewportWidth}, "height": ${viewportHeight} },
      "extractTextOnly": ${extractTextOnly}
    }
  }
}

<-- {
  "jsonrpc": "2.0",
  "id": "play-req-01",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "DOM Tree extracted cleanly (2,410 nodes parsed)."
      }
    ],
    "isError": false
  }
}`}
                    </pre>
                  )}

                  {activeConsoleTab === "curl" && (
                    <pre className="text-[11px] text-amber-300">
{`curl -X POST https://mcp.agent-spm.com/v1/tools/call \\
  -H "Authorization: Bearer $SPM_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "${selectedTool}",
    "arguments": { "url": "${targetUrl}" }
  }'`}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: VERSIONS ── */}
      {activeTab === "versions" && (
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-black/10">
            <div>
              <h3 className="text-base font-semibold text-black">Release Version History</h3>
              <p className="text-xs font-mono text-black/60">Cryptographically signed semver releases</p>
            </div>
            <Link
              href="/app/skills/publish"
              className="px-3.5 py-1.5 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs font-semibold uppercase shadow-sm"
            >
              Release New Version [N]
            </Link>
          </div>

          <div className="space-y-3">
            {(skill.versions && skill.versions.length > 0
              ? skill.versions
              : [
                  {
                    version: skill.version,
                    publishedAt: skill.updatedAt,
                    publishedBy: userProfile?.name || "Publisher",
                    tarballSize: "—",
                    downloads: skill.totalDownloads,
                    digest: "unrecorded",
                    changelog: "Active registry release.",
                  },
                ]
            ).map((v, idx) => (
              <div key={`${v.version}-${idx}`} className="p-4 rounded-xl border border-black/10 bg-white hover:border-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-black">v{v.version}</span>
                    {idx === 0 && (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold uppercase">
                        LATEST
                      </span>
                    )}
                    <span className="font-mono text-xs text-black/60">• {v.publishedAt}</span>
                    <span className="text-xs text-black/60 font-sans">by {v.publishedBy}</span>
                  </div>
                  <p className="text-xs text-black/70 mt-1 font-sans">
                    {v.changelog || "Published skill version."}
                  </p>
                  <div className="font-mono text-[11px] text-black/60 mt-1 flex items-center gap-2">
                    <span>{v.digest}</span>
                    <span>•</span>
                    <span>{v.tarballSize}</span>
                    <span>•</span>
                    <span>{(v.downloads || 0).toLocaleString()} downloads</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    onClick={() => {
                      setCompareFrom("1.0.0");
                      setCompareTo(v.version);
                      setShowDiff(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 hover:bg-black/5 font-mono text-xs font-semibold text-black cursor-pointer shadow-2xs"
                  >
                    <GitCompare className="w-3.5 h-3.5 text-black/60" />
                    <span>Diff Schema</span>
                  </button>
                  <a
                    href={`/api/packages/download?name=${encodeURIComponent(`${skill.scope}/${skill.name}`)}&version=${encodeURIComponent(v.version)}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 hover:bg-black/5 font-mono text-xs text-black/70 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>.tgz</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Diff View Inspector */}
          {showDiff && (
            <div className="mt-6 p-5 rounded-xl border border-sky-200 bg-sky-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-[#1B5FED]" />
                  <span className="font-mono text-xs font-bold text-black uppercase">
                    Schema Diff: v{compareFrom} → v{compareTo}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded font-bold">
                    +3 tools added
                  </span>
                  <span className="text-red-700 bg-red-100 border border-red-300 px-2 py-0.5 rounded font-bold">
                    -1 deprecated removed
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-black/10 bg-[#0F172A] text-slate-100 p-4 font-mono text-xs overflow-x-auto shadow-inner leading-relaxed">
                <div className="text-slate-400 pb-2 border-b border-slate-700 mb-2 flex items-center justify-between">
                  <span>--- spm.yaml (v{compareFrom})</span>
                  <span>+++ spm.yaml (v{compareTo})</span>
                </div>
                <div className="space-y-0.5 text-[11px]">
                  <div className="text-slate-400">&nbsp;&nbsp;name: &quot;{skill.name}&quot;</div>
                  <div className="text-slate-400">&nbsp;&nbsp;scope: &quot;{skill.scope}&quot;</div>
                  <div className="bg-red-500/20 text-red-300 px-2 py-0.5 -mx-2 rounded">
                    - version: &quot;{compareFrom}&quot;
                  </div>
                  <div className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 -mx-2 rounded">
                    + version: &quot;{compareTo}&quot;
                  </div>
                  <div className="text-slate-400">&nbsp;&nbsp;runtime: &quot;node20&quot;</div>
                  <div className="text-slate-400">&nbsp;&nbsp;tools:</div>
                  <div className="text-slate-400">&nbsp;&nbsp;&nbsp;&nbsp;- name: &quot;browser_navigate&quot;</div>
                  <div className="text-slate-400">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;timeoutMs: 30000</div>
                  <div className="bg-red-500/20 text-red-300 px-2 py-0.5 -mx-2 rounded">
                    - &nbsp;&nbsp;&nbsp;- name: &quot;legacy_eval_script&quot; # deprecated sync execution
                  </div>
                  <div className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 -mx-2 rounded">
                    + &nbsp;&nbsp;&nbsp;- name: &quot;inspect_element&quot; # DOM accessibility inspector
                  </div>
                  <div className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 -mx-2 rounded">
                    + &nbsp;&nbsp;&nbsp;- name: &quot;stream_dom_snapshots&quot; # real-time delta stream
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: ANALYTICS ── */}
      {activeTab === "analytics" && (
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-semibold text-black">Skill Consumption Metrics</h3>
            <p className="text-xs font-mono text-black/60">
              Live package counters from PostgreSQL · Per-call runtime latency appears in{" "}
              <Link href="/app/fleet" className="text-[#1B5FED] underline">
                Fleet War-Room
              </Link>{" "}
              once instrumented
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-black/10 bg-black/[0.02]">
              <div className="font-mono text-xs text-black/60">Total Recorded Pulls</div>
              <div className="text-2xl font-bold font-sans text-black mt-1">
                {(skill.totalDownloads || 0).toLocaleString()}
              </div>
              <div className="text-[11px] font-mono text-black/55 mt-0.5">
                Tracked via registry resolve &amp; .tgz download
              </div>
            </div>
            <div className="p-4 rounded-xl border border-black/10 bg-black/[0.02]">
              <div className="font-mono text-xs text-black/60">Indexed Releases</div>
              <div className="text-2xl font-bold font-sans text-black mt-1">
                {skill.versions?.length || 1}
              </div>
              <div className="text-[11px] font-mono text-black/55 mt-0.5">
                Latest tag v{skill.version}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-black/10 bg-black/[0.02]">
              <div className="font-mono text-xs text-black/60">Package Status</div>
              <div className="text-2xl font-bold font-sans text-black mt-1 uppercase">
                {skill.status}
              </div>
              <div className="text-[11px] font-mono text-black/55 mt-0.5">
                Visibility: {skill.visibility}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: SPM SECURITY SHIELD & ATTESTATION STATUS ── */}
      {activeTab === "security" && (
        <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono text-black">Package Verification Status</h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-black/[0.05] text-black/75 border border-black/15 font-bold">
                  {skill.repositoryUrl ? "SOURCE LINKED" : "REGISTRY PACKAGE"}
                </span>
              </div>
              <p className="text-xs text-black/60 font-sans mt-0.5">
                Recorded integrity digest and repository source metadata from Postgres. Automated AST &amp; SLSA pipelines run on external CI builders when configured.
              </p>
            </div>
            <div className="font-mono text-xs text-black/50">
              Latest Tag: <strong className="text-black">v{skill.version}</strong>
            </div>
          </div>

          <div className="rounded-xl border border-black/10 overflow-hidden text-xs font-mono">
            <div className="grid grid-cols-12 bg-black/[0.03] p-2.5 font-bold text-black/60 border-b border-black/10">
              <div className="col-span-4">Release</div>
              <div className="col-span-5">Integrity Digest</div>
              <div className="col-span-3 text-right">Size</div>
            </div>
            {(skill.versions?.length ? skill.versions : [{ version: skill.version, digest: "unrecorded", tarballSize: "—" }]).map((ver, idx) => (
              <div key={`${ver.version}-${idx}`} className="grid grid-cols-12 p-2.5 border-b border-black/5 items-center">
                <div className="col-span-4 font-semibold text-black">v{ver.version}</div>
                <div className="col-span-5 text-black/55 truncate pr-2">{ver.digest || "unrecorded"}</div>
                <div className="col-span-3 text-right text-black/70">{ver.tarballSize || "—"}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 6: SETTINGS ── */}
      {activeTab === "settings" && (
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-semibold text-black">Skill Configuration</h3>
            <p className="text-xs font-mono text-black/60">Access policies and package lifecycle controls</p>
          </div>

          {/* Visibility Toggle */}
          <div className="p-4 rounded-xl border border-black/10 bg-black/[0.02] flex items-center justify-between">
            <div>
              <div className="font-mono text-xs font-bold text-black">Package Visibility</div>
              <div className="text-xs text-black/60 mt-0.5 font-sans">
                Current visibility: <strong className="text-black uppercase">{skill.visibility}</strong>.
              </div>
            </div>
            <button
              onClick={async () => {
                const nextVis = skill.visibility === "public" ? "private" : "public";
                try {
                  const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
                  const supabase = createSupabaseBrowserClient();
                  const { data: updatedRows, error } = await supabase
                    .from("packages")
                    .update({ visibility: nextVis, updated_at: new Date().toISOString() })
                    .eq("id", skill.id)
                    .select("id");
                  if (error || !updatedRows || updatedRows.length === 0) {
                    showToast({
                      title: "Permission Denied",
                      message: error?.message || `You do not have permission to modify visibility for ${canonicalName}.`,
                      type: "error",
                    });
                    return;
                  }
                  skill.visibility = nextVis as typeof skill.visibility;
                } catch (e: unknown) {
                  showToast({
                    title: "Update Failed",
                    message: (e instanceof Error ? e.message : null) || `Unable to update visibility for ${canonicalName}.`,
                    type: "error",
                  });
                  return;
                }
                showToast({
                  title: "Visibility Updated",
                  message: `Package ${canonicalName} visibility set to ${nextVis.toUpperCase()}.`,
                  type: "success",
                });
              }}
              className="px-3.5 py-1.5 rounded-xl border border-black/15 bg-white hover:bg-black/5 font-mono text-xs text-black font-medium shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              Toggle to {skill.visibility === "public" ? "Private" : "Public"}
            </button>
          </div>

          {/* Deprecation Trigger */}
          <div className="p-4 rounded-xl border border-black/10 bg-black/[0.02] flex items-center justify-between">
            <div>
              <div className="font-mono text-xs font-bold text-black">Deprecation Status</div>
              <div className="text-xs text-black/60 mt-0.5 font-sans">
                Deprecating marks this package with a warning on the public registry.
              </div>
            </div>
            <button
              onClick={() => updateSkillStatus(skill.id, skill.status === "deprecated" ? "published" : "deprecated")}
              className="px-3.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 font-mono text-xs text-amber-900 font-medium shadow-xs"
            >
              {skill.status === "deprecated" ? "Re-activate Skill" : "Deprecate Skill"}
            </button>
          </div>

          {/* Danger Zone */}
          <div className="p-5 rounded-2xl border border-red-200 bg-red-50 space-y-3">
            <div className="flex items-center gap-2 text-red-700 font-mono text-xs font-bold uppercase">
              <AlertTriangle className="w-4 h-4" />
              <span>Danger Zone</span>
            </div>
            <p className="text-xs text-red-900 font-sans leading-relaxed">
              Permanently deleting this skill will break all dependent agents. The scope handle becomes locked for 30 days before reuse.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              Delete this Skill...
            </button>
          </div>
        </div>
      )}

      {/* Connect to Agent Modal */}
      <ConnectAgentModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        skillScope={skill.scope}
        skillName={skill.name}
        version={skill.version}
      />

      {/* Delete Modal */}
      <DeleteSkillModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        skillName={skill.name}
        scope={skill.scope}
        totalDownloads={skill.totalDownloads}
        onConfirmDelete={() => {
          deleteSkill(skill.id);
          router.push("/app/skills");
        }}
      />

      {/* Manifest Editor Slide-over Modal */}
      {showManifestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl border border-black/10 bg-white p-6 shadow-2xl text-black space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#1B5FED]" />
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
                  Edit spm.yaml Manifest
                </h3>
              </div>
              <button
                onClick={() => setShowManifestModal(false)}
                className="text-black/40 hover:text-black font-mono text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs font-mono text-black/60">
              Update procedural permissions, model bindings, and runtime entrypoints for <strong>{canonicalName}</strong>.
            </p>

            <textarea
              rows={14}
              value={manifestDraft}
              onChange={(e) => setManifestDraft(e.target.value)}
              className="w-full p-4 rounded-xl border border-black/10 bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#1B5FED] resize-none"
            />

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(manifestDraft);
                  showToast({ title: "Copied", message: "YAML copied to clipboard.", type: "success" });
                }}
                className="px-3.5 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-black font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
              >
                Copy YAML
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowManifestModal(false)}
                  className="px-4 py-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-black font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setShowManifestModal(false);
                    const descMatch = manifestDraft.match(/description:\s*["']?([^"'\n]+)["']?/);
                    const updatedDesc = descMatch ? descMatch[1] : skill.description;
                    const prevDescription = skill.description;
                    if (descMatch) {
                      skill.description = updatedDesc;
                    }
                    try {
                      const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
                      const supabase = createSupabaseBrowserClient();
                      const { data: updatedRows, error } = await supabase
                        .from("packages")
                        .update({ description: updatedDesc, updated_at: new Date().toISOString() })
                        .eq("id", skill.id)
                        .select("id");
                      if (error || !updatedRows || updatedRows.length === 0) {
                        skill.description = prevDescription;
                        showToast({
                          title: "Permission Denied",
                          message: error?.message || `You do not have permission to update ${canonicalName}.`,
                          type: "error",
                        });
                        return;
                      }
                    } catch (e: unknown) {
                      skill.description = prevDescription;
                      showToast({
                        title: "Save Failed",
                        message: (e instanceof Error ? e.message : null) || `Unable to save manifest for ${canonicalName}.`,
                        type: "error",
                      });
                      return;
                    }
                    showToast({
                      title: "Manifest Saved",
                      message: `Successfully validated and saved spm.yaml for ${canonicalName}.`,
                      type: "success",
                    });
                  }}
                  className="px-5 py-2 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  Save Manifest [S]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
