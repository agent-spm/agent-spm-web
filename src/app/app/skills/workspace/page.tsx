"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Workflow,
  Shield,
  Layers,
  Zap,
  Play,
  Pause,
  Download,
  Copy,
  Check,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ArrowRight,
  Info,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  FileCode,
  Terminal,
  Activity,
  Bot,
  Box,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

type NodeType = "agent" | "skill" | "tool";
type SecurityTier = "safe" | "moderate" | "restricted" | "elevated";

interface DAGNode {
  id: string;
  name: string;
  type: NodeType;
  roleOrScope: string;
  description: string;
  securityTier: SecurityTier;
  x: number;
  y: number;
  tokens: number;
  latencyAvg: string;
  egress: string[];
  permissions: string[];
  inputs: string[];
  outputs: string[];
}

interface DAGEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  animated?: boolean;
}

interface PresetTopology {
  id: string;
  name: string;
  description: string;
  nodes: DAGNode[];
  edges: DAGEdge[];
}

const PRESET_TOPOLOGIES: PresetTopology[] = [
  {
    id: "triage-fleet",
    name: "Production Multi-Agent Triage Fleet",
    description: "Inbound ticket triage agent coordinating browser validation, security sanitization, and alert dispatch.",
    nodes: [
      {
        id: "agent-triage",
        name: "Triage Sentinel",
        type: "agent",
        roleOrScope: "Orchestrator Agent",
        description: "Evaluates incoming user issue reports and schedules reproduction workflows.",
        securityTier: "safe",
        x: 60,
        y: 180,
        tokens: 1450,
        latencyAvg: "24ms",
        egress: ["internal-mcp"],
        permissions: ["read:issues", "schedule:tasks"],
        inputs: ["Webhook: issue.created", "User Bug Report"],
        outputs: ["Dispatched Workflows", "Telemetry Event"],
      },
      {
        id: "skill-browser",
        name: "@spm/browser-tools",
        type: "skill",
        roleOrScope: "acme-labs/v1.4.0",
        description: "Headless Chromium automation runtime with screenshot and DOM extraction capabilities.",
        securityTier: "moderate",
        x: 320,
        y: 80,
        tokens: 3200,
        latencyAvg: "112ms",
        egress: ["*.staging.internal", "*.localhost"],
        permissions: ["sandbox:network", "exec:playwright"],
        inputs: ["Target URL", "DOM Selector"],
        outputs: ["DOM Snapshot", "PNG Artifact", "Network Trace"],
      },
      {
        id: "skill-security",
        name: "@spm/security-shield",
        type: "skill",
        roleOrScope: "spm-official/v2.1.0",
        description: "AST Taint analysis and prompt injection validator running in isolated gVisor jail.",
        securityTier: "safe",
        x: 320,
        y: 280,
        tokens: 850,
        latencyAvg: "18ms",
        egress: ["none"],
        permissions: ["ast:inspect", "jail:isolated"],
        inputs: ["Raw Prompt String", "AST Nodes"],
        outputs: ["Taint Score (0-100)", "Sanitized String"],
      },
      {
        id: "tool-snapshot",
        name: "take_dom_snapshot",
        type: "tool",
        roleOrScope: "Browser Leaf Tool",
        description: "Extracts complete accessibility tree and visual bounding boxes.",
        securityTier: "moderate",
        x: 580,
        y: 50,
        tokens: 950,
        latencyAvg: "84ms",
        egress: ["target-page"],
        permissions: ["read:dom"],
        inputs: ["full_page: boolean", "clip_rect: Rect"],
        outputs: ["serialized_html: string"],
      },
      {
        id: "tool-ast-check",
        name: "ast_taint_check",
        type: "tool",
        roleOrScope: "Security Leaf Tool",
        description: "Detects eval, prototype pollution, and suspicious regex backtrack patterns.",
        securityTier: "safe",
        x: 580,
        y: 250,
        tokens: 420,
        latencyAvg: "14ms",
        egress: ["none"],
        permissions: ["ast:parse"],
        inputs: ["code_snippet: string"],
        outputs: ["tainted_paths: string[]", "clean: boolean"],
      },
      {
        id: "agent-notifier",
        name: "Incident Dispatcher",
        type: "agent",
        roleOrScope: "Worker Agent",
        description: "Broadcasts verified diagnostics to Slack, PagerDuty, and Linear.",
        securityTier: "moderate",
        x: 820,
        y: 180,
        tokens: 980,
        latencyAvg: "42ms",
        egress: ["api.slack.com", "api.linear.app"],
        permissions: ["write:slack", "write:linear"],
        inputs: ["Verified Diagnostic Packet"],
        outputs: ["Incident Thread URL", "Linear Issue Key"],
      },
    ],
    edges: [
      { id: "e1", from: "agent-triage", to: "skill-browser", label: "reproduce_flow", animated: true },
      { id: "e2", from: "agent-triage", to: "skill-security", label: "sanitize_input", animated: true },
      { id: "e3", from: "skill-browser", to: "tool-snapshot", label: "call_tool", animated: true },
      { id: "e4", from: "skill-security", to: "tool-ast-check", label: "inspect_code", animated: true },
      { id: "e5", from: "tool-snapshot", to: "agent-notifier", label: "payload_ready", animated: true },
      { id: "e6", from: "tool-ast-check", to: "agent-notifier", label: "sanitized_ok", animated: true },
    ],
  },
  {
    id: "ci-cd-security",
    name: "Autonomous CI/CD & Security Gate",
    description: "Code review agent executing static analysis, package vulnerability audits, and deployment.",
    nodes: [
      {
        id: "agent-reviewer",
        name: "Code Review Bot",
        type: "agent",
        roleOrScope: "Orchestrator Agent",
        description: "Analyzes pull requests against engineering standards and test coverage.",
        securityTier: "safe",
        x: 80,
        y: 180,
        tokens: 2100,
        latencyAvg: "65ms",
        egress: ["api.github.com"],
        permissions: ["read:pr", "write:comments"],
        inputs: ["PR Diff", "Repo Metadata"],
        outputs: ["Review Verdict", "Suggested Patches"],
      },
      {
        id: "skill-github",
        name: "@spm/github-mcp",
        type: "skill",
        roleOrScope: "spm-official/v3.0.0",
        description: "Comprehensive GitHub API client for PR diffs, checks, and comments.",
        securityTier: "moderate",
        x: 340,
        y: 80,
        tokens: 2800,
        latencyAvg: "95ms",
        egress: ["api.github.com"],
        permissions: ["repo:read", "pull_requests:write"],
        inputs: ["Owner/Repo", "Pull Number"],
        outputs: ["Diff JSON", "Check Status"],
      },
      {
        id: "skill-audit",
        name: "@spm/slsa-verifier",
        type: "skill",
        roleOrScope: "security/v1.0.1",
        description: "Cryptographically validates SLSA Build Level 3 provenance for all dependencies.",
        securityTier: "safe",
        x: 340,
        y: 280,
        tokens: 650,
        latencyAvg: "32ms",
        egress: ["rekor.sigstore.dev"],
        permissions: ["sigstore:verify"],
        inputs: ["Package Tarball Digest"],
        outputs: ["Provenance Record", "Attestation Chain"],
      },
      {
        id: "agent-deployer",
        name: "Deploy Officer",
        type: "agent",
        roleOrScope: "Privileged Agent",
        description: "Applies canary release if security review and provenance tests are 100% green.",
        securityTier: "elevated",
        x: 680,
        y: 180,
        tokens: 1600,
        latencyAvg: "140ms",
        egress: ["k8s.internal.cluster"],
        permissions: ["deploy:canary", "cluster:admin"],
        inputs: ["Approved Verdict", "Valid SLSA Certificate"],
        outputs: ["Canary Deployment Hash", "Rollout Telemetry"],
      },
    ],
    edges: [
      { id: "e10", from: "agent-reviewer", to: "skill-github", label: "fetch_diff", animated: true },
      { id: "e11", from: "agent-reviewer", to: "skill-audit", label: "verify_deps", animated: true },
      { id: "e12", from: "skill-github", to: "agent-deployer", label: "pr_passed", animated: true },
      { id: "e13", from: "skill-audit", to: "agent-deployer", label: "slsa_valid", animated: true },
    ],
  },
];

export default function WorkspaceDAGStudioPage() {
  const { showToast } = useToast();
  const [selectedPresetId, setSelectedPresetId] = useState<string>("triage-fleet");
  const [activeTab, setActiveTab] = useState<"topology" | "simulation" | "blast-radius">("topology");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("agent-triage");
  const [isSimulating, setIsSimulating] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchFilter, setSearchFilter] = useState("");

  const currentPreset = useMemo(
    () => PRESET_TOPOLOGIES.find((p) => p.id === selectedPresetId) || PRESET_TOPOLOGIES[0],
    [selectedPresetId]
  );

  const selectedNode = useMemo(
    () => currentPreset.nodes.find((n) => n.id === selectedNodeId) || currentPreset.nodes[0],
    [currentPreset, selectedNodeId]
  );

  // Compute blast-radius score based on node type & permissions
  const getBlastRadiusBadge = (tier: SecurityTier) => {
    switch (tier) {
      case "safe":
        return {
          label: "Low (Perimeter Contained)",
          bg: "bg-emerald-50 text-emerald-800 border-emerald-300",
          dot: "bg-emerald-500",
        };
      case "moderate":
        return {
          label: "Moderate (Whitelisted Egress)",
          bg: "bg-blue-50 text-blue-800 border-blue-300",
          dot: "bg-blue-500",
        };
      case "restricted":
        return {
          label: "High (File System / DB Write)",
          bg: "bg-amber-50 text-amber-900 border-amber-300",
          dot: "bg-amber-500",
        };
      case "elevated":
        return {
          label: "Critical (Cluster / Prod Deploy)",
          bg: "bg-red-50 text-red-900 border-red-300",
          dot: "bg-red-500",
        };
    }
  };

  const handleExportLangGraph = () => {
    const langGraphManifest = {
      $schema: "https://langchain-ai.github.io/langgraph/schema/v1.json",
      name: currentPreset.name,
      description: currentPreset.description,
      nodes: currentPreset.nodes.map((n) => ({
        id: n.id,
        name: n.name,
        type: n.type,
        role: n.roleOrScope,
        permissions: n.permissions,
        network_egress: n.egress,
        token_overhead: n.tokens,
      })),
      edges: currentPreset.edges.map((e) => ({
        from: e.from,
        to: e.to,
        conditional_edge: false,
        wire_protocol: "mcp-jsonrpc-2.0",
      })),
      governance: {
        slsa_attestation_required: true,
        audit_trail: "enabled",
        managed_by: "Agent SPM Workspace",
      },
    };

    const blob = new Blob([JSON.stringify(langGraphManifest, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentPreset.id}-langgraph.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast({
      title: "LangGraph Manifest Exported",
      message: `Downloaded ${currentPreset.id}-langgraph.json successfully.`,
      type: "success",
    });
  };

  const handleCopyManifest = () => {
    const yamlSummary = `# Agent SPM Multi-Agent Topology
version: "spm.orchestration/v1alpha1"
kind: AgentGraph
metadata:
  name: ${currentPreset.id}
spec:
  nodes:
${currentPreset.nodes.map((n) => `    - id: ${n.id}\n      name: "${n.name}"\n      tier: ${n.securityTier}`).join("\n")}
  pipeline:
${currentPreset.edges.map((e) => `    - ${e.from} -> ${e.to}`).join("\n")}`;

    navigator.clipboard.writeText(yamlSummary);
    showToast({
      title: "Manifest Copied to Clipboard",
      message: "Ready to paste into cursor rules or agent orchestration engine.",
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
            <Link href="/app/skills" className="hover:text-[#1B5FED] transition-colors">
              SKILLS
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#1B5FED] font-bold">DAG STUDIO</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black flex items-center gap-2.5">
              <Workflow className="w-7 h-7 text-[#1B5FED]" />
              Multi-Agent Workspace DAG Studio
            </h1>
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1B5FED]/10 text-[#1B5FED] border border-[#1B5FED]/20">
              Interactive Canvas
            </span>
          </div>
          <p className="text-sm text-black/60 mt-1 max-w-2xl">
            Visualize your fleet&apos;s agent roles, SPM skill bindings, tool leaves, and security
            boundaries in real-time.
          </p>
        </div>

        {/* Global Studio Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/app/skills"
            className="px-3.5 py-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-xs font-mono font-medium text-black transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-black/60" />
            Table View
          </Link>
          <button
            onClick={handleCopyManifest}
            className="px-3.5 py-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-xs font-mono font-medium text-black transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-black/60" />
            Copy YAML
          </button>
          <button
            onClick={handleExportLangGraph}
            className="px-4 py-2 rounded-xl bg-[#1B5FED] hover:bg-[#1A5FED]/90 text-white text-xs font-mono font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            Export langgraph.json
          </button>
        </div>
      </div>

      {/* ── TOOLBAR: PRESET SELECTOR & VIEW MODE TABS ── */}
      <div className="rounded-2xl border border-black/10 bg-white p-3 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold uppercase text-black/50 pl-2">
            Topology Preset:
          </span>
          <select
            value={selectedPresetId}
            onChange={(e) => {
              setSelectedPresetId(e.target.value);
              setSelectedNodeId(
                PRESET_TOPOLOGIES.find((p) => p.id === e.target.value)?.nodes[0]?.id || ""
              );
            }}
            className="rounded-xl border border-black/10 bg-[#FAFAFA] px-3 py-1.5 text-xs font-medium text-black focus:border-[#1B5FED] focus:outline-none font-sans cursor-pointer"
          >
            {PRESET_TOPOLOGIES.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F5F5F7] border border-black/5 font-mono text-xs">
          <button
            onClick={() => setActiveTab("topology")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
              activeTab === "topology"
                ? "bg-white text-[#1B5FED] font-bold shadow-sm"
                : "text-black/60 hover:text-black"
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            Topology
          </button>
          <button
            onClick={() => setActiveTab("simulation")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
              activeTab === "simulation"
                ? "bg-white text-[#1B5FED] font-bold shadow-sm"
                : "text-black/60 hover:text-black"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Live Traffic
          </button>
          <button
            onClick={() => setActiveTab("blast-radius")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
              activeTab === "blast-radius"
                ? "bg-white text-[#1B5FED] font-bold shadow-sm"
                : "text-black/60 hover:text-black"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Blast Radius Heatmap
          </button>
        </div>

        {/* Canvas Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`p-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer flex items-center gap-1 ${
              isSimulating
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-black/5 text-black/60 border-black/10"
            }`}
            title="Toggle Live Particle Simulation"
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isSimulating ? "Streaming" : "Paused"}</span>
          </button>

          <div className="flex items-center border border-black/10 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
              className="p-1.5 hover:bg-black/5 text-black/60 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-black/60 border-x border-black/5">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-1.5 hover:bg-black/5 text-black/60 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN STUDIO WORKSPACE (CANVAS + INSPECTOR) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* LEFT / CENTER: INTERACTIVE SVG WORKSPACE CANVAS (8 Cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-black/10 bg-[#FAFAFB] p-4 relative overflow-hidden shadow-sm flex flex-col justify-between select-none">
          {/* Subtle Grid Backdrop */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(#000 1px, transparent 1px), radial-gradient(#000 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              backgroundPosition: "0 0, 12px 12px",
            }}
          />

          {/* Canvas Status Banner */}
          <div className="relative z-10 flex items-center justify-between pb-3 border-b border-black/5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-xs font-bold text-black/70">
                DAG ENGINE ONLINE • {currentPreset.nodes.length} NODES • {currentPreset.edges.length} MCP CHANNELS
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-black/40">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-[#1B5FED]" /> Agent
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-purple-600" /> Skill Package
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-amber-500" /> Leaf Tool
              </span>
            </div>
          </div>

          {/* SVG Visual Canvas Area */}
          <div className="relative z-10 flex-1 my-4 overflow-auto flex items-center justify-center min-h-[460px]">
            <div
              className="relative transition-transform duration-200"
              style={{
                width: "920px",
                height: "440px",
                transform: `scale(${zoomLevel})`,
                transformOrigin: "center center",
              }}
            >
              {/* SVG Edges Layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1B5FED" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#9333EA" stopOpacity="0.8" />
                  </linearGradient>
                  <marker
                    id="arrowhead"
                    markerWidth="7"
                    markerHeight="7"
                    refX="5"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 7 3.5, 0 7" fill="#1B5FED" />
                  </marker>
                </defs>

                {currentPreset.edges.map((edge) => {
                  const source = currentPreset.nodes.find((n) => n.id === edge.from);
                  const target = currentPreset.nodes.find((n) => n.id === edge.to);
                  if (!source || !target) return null;

                  const sx = source.x + 100;
                  const sy = source.y + 40;
                  const tx = target.x;
                  const ty = target.y + 40;
                  const mx = (sx + tx) / 2;

                  const pathD = `M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ty}, ${tx} ${ty}`;

                  return (
                    <g key={edge.id}>
                      {/* Outer glow line */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#1B5FED"
                        strokeWidth="3"
                        strokeOpacity="0.15"
                      />
                      {/* Core stroke line */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={activeTab === "blast-radius" ? "#94A3B8" : "url(#edgeGrad)"}
                        strokeWidth="2"
                        strokeDasharray={isSimulating && edge.animated ? "6, 4" : "none"}
                        className={isSimulating && edge.animated ? "animate-[dash_1s_linear_infinite]" : ""}
                        markerEnd="url(#arrowhead)"
                      />
                      {/* Edge Label Pill */}
                      {edge.label && (
                        <foreignObject x={mx - 45} y={(sy + ty) / 2 - 12} width="90" height="24">
                          <div className="w-full text-center font-mono text-[9px] uppercase tracking-wider bg-white/90 backdrop-blur-sm border border-black/10 rounded-full px-1.5 py-0.5 text-black/70 shadow-xs truncate">
                            {edge.label}
                          </div>
                        </foreignObject>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* HTML Nodes Layer */}
              {currentPreset.nodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const blastMeta = getBlastRadiusBadge(node.securityTier);

                let headerBg = "bg-[#1B5FED]/10 text-[#1B5FED]";
                let iconComponent = <Bot className="w-4 h-4 text-[#1B5FED]" />;

                if (node.type === "skill") {
                  headerBg = "bg-purple-100 text-purple-700";
                  iconComponent = <Box className="w-4 h-4 text-purple-600" />;
                } else if (node.type === "tool") {
                  headerBg = "bg-amber-100 text-amber-800";
                  iconComponent = <Wrench className="w-4 h-4 text-amber-600" />;
                }

                if (activeTab === "blast-radius") {
                  headerBg = blastMeta.bg;
                }

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    style={{ left: `${node.x}px`, top: `${node.y}px` }}
                    className={`absolute w-[200px] rounded-xl border bg-white p-3 shadow-md cursor-pointer transition-all duration-200 select-none ${
                      isSelected
                        ? "border-[#1B5FED] ring-3 ring-[#1B5FED]/20 scale-105 z-30 shadow-xl"
                        : "border-black/10 hover:border-black/30 hover:shadow-lg z-20"
                    }`}
                  >
                    {/* Top Row: Type Badge + Pulse Indicator */}
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${headerBg}`}
                      >
                        {iconComponent}
                        {node.type}
                      </div>
                      <span className={`w-2 h-2 rounded-full ${blastMeta.dot} animate-pulse`} />
                    </div>

                    {/* Node Name */}
                    <h3 className="font-sans font-bold text-xs text-black leading-tight truncate mb-1">
                      {node.name}
                    </h3>
                    <p className="font-mono text-[10px] text-black/50 truncate mb-2">
                      {node.roleOrScope}
                    </p>

                    {/* Micro Metrics Footer */}
                    <div className="pt-2 border-t border-black/5 flex items-center justify-between font-mono text-[10px] text-black/60">
                      <span>{node.tokens} tok</span>
                      <span className="font-semibold text-emerald-700">{node.latencyAvg}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Canvas Controls & Legend */}
          <div className="relative z-10 pt-3 border-t border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-xs text-black/60">
            <div className="flex items-center gap-3">
              <span>Selected Node: <strong className="text-black">{selectedNode.name}</strong></span>
              <span className="text-black/30">•</span>
              <span>Wire: <strong>MCP JSON-RPC 2.0</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-black/40">Tip: Click any node to inspect blast radius & permissions.</span>
            </div>
          </div>
        </div>

        {/* RIGHT: INSPECTOR & GOVERNANCE DRAWER (4 Cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-black/10 bg-white p-5 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Inspector Header */}
            <div className="border-b border-black/10 pb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs uppercase font-bold text-black/50">
                  Node Inspector
                </span>
                <span
                  className={`font-mono text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                    getBlastRadiusBadge(selectedNode.securityTier).bg
                  }`}
                >
                  {getBlastRadiusBadge(selectedNode.securityTier).label}
                </span>
              </div>
              <h2 className="text-xl font-bold text-black flex items-center gap-2">
                {selectedNode.name}
              </h2>
              <p className="font-mono text-xs text-[#1B5FED] mt-0.5">{selectedNode.roleOrScope}</p>
              <p className="text-xs text-black/70 mt-2 leading-relaxed">
                {selectedNode.description}
              </p>
            </div>

            {/* Security & Blast Radius Perimeter */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold uppercase text-black/60 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#1B5FED]" />
                Security &amp; Perimeter Boundary
              </h4>

              <div className="bg-[#F8F9FA] rounded-xl p-3 border border-black/5 space-y-2.5">
                <div>
                  <span className="font-mono text-[10px] text-black/40 uppercase block mb-1">
                    Network Egress Allowed:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.egress.map((e, idx) => (
                      <span
                        key={idx}
                        className="font-mono text-[11px] bg-white border border-black/10 px-2 py-0.5 rounded-md text-black/80 font-semibold"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-mono text-[10px] text-black/40 uppercase block mb-1">
                    Enforced Permissions:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.permissions.map((p, idx) => (
                      <span
                        key={idx}
                        className="font-mono text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-medium"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Input / Output Data Handoffs */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold uppercase text-black/60 flex items-center gap-1.5">
                <Workflow className="w-3.5 h-3.5 text-purple-600" />
                Data Handoff Schema
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl border border-black/5 bg-[#FAFAFA]">
                  <span className="text-[10px] text-black/40 uppercase font-bold block mb-1">
                    Inputs (Inbound)
                  </span>
                  <ul className="space-y-1 text-black/80 text-[11px]">
                    {selectedNode.inputs.map((inItem, idx) => (
                      <li key={idx} className="truncate">
                        • {inItem}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-2.5 rounded-xl border border-black/5 bg-[#FAFAFA]">
                  <span className="text-[10px] text-black/40 uppercase font-bold block mb-1">
                    Outputs (Outbound)
                  </span>
                  <ul className="space-y-1 text-black/80 text-[11px]">
                    {selectedNode.outputs.map((outItem, idx) => (
                      <li key={idx} className="truncate">
                        → {outItem}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Context Window Token Load */}
            <div className="p-3 rounded-xl border border-[#1B5FED]/20 bg-[#1B5FED]/5 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-[#1B5FED] block">
                  Context Window Token Weight
                </span>
                <span className="text-xs text-black/60">Estimated prompt tokens per turn</span>
              </div>
              <div className="text-right font-mono font-bold text-base text-[#1B5FED]">
                {selectedNode.tokens.toLocaleString()}{" "}
                <span className="text-[10px] font-normal text-black/50">tok</span>
              </div>
            </div>
          </div>

          {/* Quick Node Action Footer */}
          <div className="pt-4 border-t border-black/10 space-y-2">
            <Link
              href={`/tools/schema-diet?tool=${encodeURIComponent(selectedNode.name)}`}
              className="w-full py-2 px-3 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-xs font-mono font-semibold text-black flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Optimize Token Diet for this Node
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
