"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/ToastProvider";
import {
  GitBranch,
  GitCommit,
  GitFork,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Layers,
  ArrowRight,
  ExternalLink,
  Code2,
  RefreshCw,
  Sparkles,
  Search,
  Lock,
  Globe,
  Check,
  FileCode,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function GithubIcon({ className = "w-4 h-4", size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}
import { useSession } from "@/lib/data/session-context";

export type ImportScenario = "clean" | "duplicate" | "monorepo" | "security_block";

function parseGithubUrl(url: string) {
  const cleaned = url.trim().replace(/^https?:\/\/github\.com\//i, "").replace(/\.git$/i, "").replace(/\/$/, "");
  const parts = cleaned.split("/").filter(Boolean);

  if (parts.length >= 2) {
    const owner = parts[0];
    const repo = parts[1];
    return {
      owner,
      repo,
      name: repo.toLowerCase().replace(/[^a-z0-9-_]/g, "-"),
      cleanFullName: `${owner}/${repo}`,
    };
  } else if (parts.length === 1) {
    const name = parts[0].toLowerCase().replace(/[^a-z0-9-_]/g, "-");
    return {
      owner: "community",
      repo: parts[0],
      name,
      cleanFullName: parts[0],
    };
  }
  return {
    owner: "agent-spm",
    repo: "custom-skill",
    name: "custom-skill",
    cleanFullName: "agent-spm/custom-skill",
  };
}

interface GitHubSkillImporterProps {
  onSuccessPublish: (skillData: {
    name: string;
    scope: string;
    version: string;
    description: string;
    repoUrl: string;
    license: string;
  }) => void;
  onSwitchToManual: () => void;
}

export function GitHubSkillImporter({
  onSuccessPublish,
  onSwitchToManual,
}: GitHubSkillImporterProps) {
  const { currentOrg } = useSession();
  const { showToast } = useToast();

  // URL input and state
  const [repoUrl, setRepoUrl] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [subfolder, setSubfolder] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Simulation states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analyzed, setAnalyzed] = useState(false);
  const [scenario, setScenario] = useState<ImportScenario>("clean");

  // Dynamic extracted package metadata
  const [packageName, setPackageName] = useState("skills");
  const [packageVersion, setPackageVersion] = useState("1.0.0");
  const [packageDescription, setPackageDescription] = useState(
    "High-performance autonomous agent skill imported from GitHub."
  );
  const [packageLicense, setPackageLicense] = useState("MIT");

  // Monorepo selection state
  const [selectedMonorepoSkills, setSelectedMonorepoSkills] = useState<string[]>([
    "skills/fetch",
    "skills/postgres",
    "skills/memory-vault",
  ]);

  // Code preview tab
  const [activeTab, setActiveTab] = useState<"visual" | "yaml">("visual");
  const [copiedYaml, setCopiedYaml] = useState(false);

  // Mock presets to let users test instantly
  const presetRepos = [
    {
      label: "MCP Fetch Tool",
      url: "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch",
      scenario: "clean" as ImportScenario,
      tag: "MCP Server",
    },
    {
      label: "Anthropic Tools (Duplicate)",
      url: "https://github.com/anthropics/anthropic-tools",
      scenario: "duplicate" as ImportScenario,
      tag: "Collision Test",
    },
    {
      label: "Google Antigravity Multi-Skills",
      url: "https://github.com/google-antigravity/skills",
      scenario: "monorepo" as ImportScenario,
      tag: "Monorepo (3)",
    },
    {
      label: "Untrusted Agent (Security Block)",
      url: "https://github.com/suspicious-dev/unverified-agent",
      scenario: "security_block" as ImportScenario,
      tag: "Security Test",
    },
  ];

  const handleApplyPreset = (item: (typeof presetRepos)[0]) => {
    setRepoUrl(item.url);
    setScenario(item.scenario);
    setAnalyzed(false);
    const parsed = parseGithubUrl(item.url);
    setPackageName(parsed.name);
    setPackageDescription(`SPM skill package: ${item.label}`);
  };

  const handleRunAnalysis = () => {
    if (!repoUrl.trim()) return;

    const parsed = parseGithubUrl(repoUrl);
    setPackageName(parsed.name);
    setPackageDescription(`High-performance autonomous agent skill package imported from ${parsed.cleanFullName}.`);

    setIsAnalyzing(true);
    setAnalysisStep(1);

    // Simulate multi-stage pipeline
    setTimeout(() => {
      setAnalysisStep(2);
      setTimeout(() => {
        setAnalysisStep(3);
        setTimeout(() => {
          setAnalysisStep(4);
          setTimeout(() => {
            setIsAnalyzing(false);
            setAnalyzed(true);
          }, 350);
        }, 400);
      }, 450);
    }, 400);
  };

  const handlePublishImportedSkill = () => {
    onSuccessPublish({
      name: scenario === "monorepo" ? "fetch-tool" : packageName,
      scope: currentOrg.slug,
      version: packageVersion,
      description: packageDescription,
      repoUrl: repoUrl || `https://github.com/agent-spm-registry/${packageName}`,
      license: packageLicense,
    });
  };

  const mockYaml = `name: ${packageName}
version: ${packageVersion}
scope: ${currentOrg.slug}
description: ${packageDescription}
license: ${packageLicense}
source:
  type: github
  url: ${repoUrl || `https://github.com/agent-spm-registry/${packageName}`}
  commit: 8f3c1a93b4e72d1f
  pinned: true

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
  llama: true

entrypoint: "./dist/index.js"
`;

  const copyYamlToClipboard = () => {
    navigator.clipboard.writeText(mockYaml);
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ── TOP SCENARIO TESTING BAR ── */}
      <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-black/70">
              Interactive Test Mode:
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "clean", label: "✅ Clean Import", desc: "Fresh skill index" },
              { id: "duplicate", label: "⚠️ Duplicate Detected", desc: "Canonical collision" },
              { id: "monorepo", label: "🗂️ Monorepo (3 Skills)", desc: "Multi-manifest parser" },
              { id: "security_block", label: "🚫 Security Blocked", desc: "Key leak detected" },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setScenario(s.id as ImportScenario);
                  if (analyzed) {
                    // re-trigger view
                  }
                }}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
                  scenario === s.id
                    ? "bg-[#1B5FED] text-white shadow-xs font-semibold"
                    : "bg-white text-black/70 border border-black/10 hover:border-black/30"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── GITHUB INPUT CARD ── */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
                <GithubIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-sans text-black">
                  1-Click GitHub Skill Import
                </h2>
                <p className="text-xs font-mono text-black/60">
                  Provide any GitHub repository. SPM parses manifests, verifies security, and registers the skill.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onSwitchToManual}
              className="text-xs font-mono text-[#1B5FED] hover:underline flex items-center gap-1"
            >
              <span>Switch to Manual Manifest</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Input Bar */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="relative flex-1 rounded-xl border border-black/15 bg-white focus-within:border-[#1B5FED] focus-within:ring-2 focus-within:ring-[#1B5FED]/20 overflow-hidden flex items-center">
              <span className="pl-3.5 text-black/40">
                <GithubIcon className="w-4 h-4" />
              </span>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  setAnalyzed(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRunAnalysis();
                }}
                placeholder="https://github.com/owner/skill-repository or owner/repo"
                className="w-full bg-transparent px-3 py-2.5 text-xs font-mono text-black placeholder:text-black/40 focus:outline-none"
              />
              {repoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setRepoUrl("");
                    setAnalyzed(false);
                  }}
                  className="pr-3 text-black/40 hover:text-black text-xs font-mono"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="button"
              disabled={!repoUrl.trim() || isAnalyzing}
              onClick={handleRunAnalysis}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer shadow-md shrink-0"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Inspecting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Inspect Repo</span>
                  <span className="text-[10px] bg-white/20 px-1 py-0.2 rounded font-mono">↵</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-mono text-black/50 mr-1">Quick presets:</span>
            {presetRepos.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/[0.03] hover:bg-black/[0.07] border border-black/10 font-mono text-[11px] text-black transition-colors"
              >
                <span>{p.label}</span>
                <span className="text-[9px] text-[#1B5FED] bg-sky-50 border border-sky-200 px-1 rounded">
                  {p.tag}
                </span>
              </button>
            ))}
          </div>

          {/* Advanced toggle (Branch / Subpath) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-black/60 hover:text-black"
            >
              <span>Advanced git parameters (branch, subfolder)</span>
              {showAdvanced ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>

            {showAdvanced && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-black/10 bg-black/[0.02]">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-black/70 mb-1 font-semibold">
                    Target Branch or Release Tag
                  </label>
                  <div className="flex items-center rounded-lg border border-black/15 bg-white px-2.5 py-1.5 focus-within:border-[#1B5FED]">
                    <GitBranch className="w-3.5 h-3.5 text-black/40 mr-1.5" />
                    <input
                      type="text"
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      placeholder="main, v1.0.0"
                      className="w-full bg-transparent text-xs font-mono text-black focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-black/70 mb-1 font-semibold">
                    Monorepo Subdirectory (Optional)
                  </label>
                  <div className="flex items-center rounded-lg border border-black/15 bg-white px-2.5 py-1.5 focus-within:border-[#1B5FED]">
                    <Layers className="w-3.5 h-3.5 text-black/40 mr-1.5" />
                    <input
                      type="text"
                      value={subfolder}
                      onChange={(e) => setSubfolder(e.target.value)}
                      placeholder="e.g. skills/crawler"
                      className="w-full bg-transparent text-xs font-mono text-black focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── ANALYSIS IN PROGRESS STATE ── */}
        {isAnalyzing && (
          <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-sky-950">
                <RefreshCw className="w-4 h-4 text-[#1B5FED] animate-spin" />
                <span>Inspecting Repository Tree &amp; Analyzing AST...</span>
              </div>
              <span className="text-xs font-mono text-[#1B5FED] font-bold">
                Stage {analysisStep} of 4
              </span>
            </div>

            <div className="space-y-2">
              {[
                {
                  step: 1,
                  label: "Cloning git manifest tree & verifying commit SHA...",
                },
                {
                  step: 2,
                  label: "Detecting skill specification (SKILL.md, mcp.json, tool AST)...",
                },
                {
                  step: 3,
                  label: "Running AST security scanner & checking for secret leaks...",
                },
                {
                  step: 4,
                  label: "Verifying canonical registry index for duplicate imports...",
                },
              ].map((s) => {
                const isPassed = analysisStep > s.step;
                const isCurrent = analysisStep === s.step;
                return (
                  <div
                    key={s.step}
                    className="flex items-center gap-2.5 font-mono text-xs"
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[#1B5FED] border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-black/10 shrink-0" />
                    )}
                    <span
                      className={
                        isPassed
                          ? "text-emerald-900 font-medium"
                          : isCurrent
                            ? "text-[#1B5FED] font-semibold"
                            : "text-black/40"
                      }
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── RESULTS & PRE-FLIGHT DASHBOARD ── */}
        {analyzed && !isAnalyzing && (
          <div className="space-y-6 pt-4 border-t border-black/10">
            {/* 1. Repository Metainfo Header */}
            <div className="rounded-xl border border-black/10 bg-black/[0.02] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm shrink-0">
                  <GithubIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-black">
                      {repoUrl.replace("https://github.com/", "") || "owner/repo"}
                    </span>
                    <a
                      href={repoUrl.startsWith("http") ? repoUrl : `https://${repoUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black/40 hover:text-black"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1 font-mono text-[11px] text-black/60">
                    <span className="inline-flex items-center gap-1">
                      <GitCommit className="w-3 h-3 text-[#1B5FED]" />
                      <span>sha: 8f3c1a9 (pinned)</span>
                    </span>
                    <span>•</span>
                    <span>MIT License</span>
                    <span>•</span>
                    <span>★ 14.2k stars</span>
                  </div>
                </div>
              </div>

              {/* Format Badge */}
              <div className="flex flex-col sm:items-end gap-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono text-[11px] font-semibold">
                  <Check className="w-3 h-3" />
                  <span>Valid Spec: Antigravity SKILL.md</span>
                </span>
                <span className="text-[10px] font-mono text-black/50">
                  Detected: Markdown + YAML Frontmatter
                </span>
              </div>
            </div>

            {/* 2. Scenario-Specific Guardrail Banners */}

            {/* SCENARIO A: DUPLICATE COLLISION DETECTED */}
            {scenario === "duplicate" && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-mono text-xs font-bold text-amber-950 uppercase tracking-wider">
                      Duplicate Skill Detected in Canonical Registry
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed font-sans">
                      This exact repository is already indexed in the SPM Registry under the canonical namespace:
                    </p>
                    <div className="inline-flex items-center gap-2 font-mono text-xs bg-white/80 px-2.5 py-1 rounded-lg border border-amber-300 text-amber-950 font-semibold my-1">
                      <span>@anthropic/rag-tools</span>
                      <span className="text-black/50 text-[11px]">v1.2.0 (latest)</span>
                      <span className="text-emerald-700 text-[10px] bg-emerald-100 px-1 rounded">Active</span>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed font-sans">
                      To prevent library pollution and name squatting, you cannot re-register an identical package under a duplicate identifier.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200/80 flex flex-wrap items-center gap-2">
                  <Link
                    href="/search?q=rag-tools"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white font-mono text-xs font-semibold"
                  >
                    <span>View Existing Package</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      showToast({
                        title: "Upstream In Sync",
                        message: "The upstream repository has no newer commits than v1.2.0.",
                        type: "info",
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100/50 text-amber-900 font-mono text-xs font-semibold cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Check for Upstream Version Sync</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setScenario("clean");
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100/50 text-amber-900 font-mono text-xs font-semibold"
                  >
                    <GitFork className="w-3 h-3" />
                    <span>Fork as Derivative (@{currentOrg.slug}/rag-tools)</span>
                  </button>
                </div>
              </div>
            )}

            {/* SCENARIO B: SECURITY BLOCK */}
            {scenario === "security_block" && (
              <div className="rounded-xl border border-red-300 bg-red-50 p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-mono text-xs font-bold text-red-950 uppercase tracking-wider">
                      Import Blocked by SPM Security Gatekeeper
                    </div>
                    <p className="text-xs text-red-900 leading-relaxed font-sans">
                      Our automated static AST analyzer and credential scanner flagged critical security issues in this repository:
                    </p>
                    <div className="space-y-1.5 mt-2">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-red-200 text-xs font-mono text-red-900">
                        <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">CRITICAL</span>
                        <span>Leaked API Token detected: <code>sk-ant-api03-9d8a...</code> in <code>tests/test_agent.py:14</code></span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-red-200 text-xs font-mono text-red-900">
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">HIGH</span>
                        <span>Unrestricted <code>child_process.exec()</code> command without input sanitization</span>
                      </div>
                    </div>
                    <p className="text-xs text-red-800 pt-1 font-sans">
                      To safeguard the repository author and downstream agents, this repository cannot be imported into the public registry until secrets are revoked and sanitized.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-red-200/80 flex items-center justify-between">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-red-800 hover:underline"
                  >
                    Read Secret Remediation Protocol →
                  </a>
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2 rounded-xl bg-red-200 text-red-600 font-mono text-xs font-bold cursor-not-allowed"
                  >
                    Publish Disabled (Security Violation)
                  </button>
                </div>
              </div>
            )}

            {/* SCENARIO C: MONOREPO MULTI-SKILL SELECTOR */}
            {scenario === "monorepo" && (
              <div className="rounded-xl border border-sky-300 bg-sky-50/50 p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <Layers className="w-5 h-5 text-[#1B5FED] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-mono text-xs font-bold text-sky-950 uppercase tracking-wider">
                      Monorepo Detected: 3 Distinct Skills Found
                    </div>
                    <p className="text-xs text-sky-900 font-sans mt-0.5">
                      This repository contains multiple skill packages. Select the skills you wish to index into SPM:
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    {
                      id: "skills/fetch",
                      name: "fetch-tool",
                      path: "skills/fetch/SKILL.md",
                      desc: "HTTP fetching with automatic robots.txt compliance and html-to-markdown parsing.",
                      spec: "MCP Server",
                      size: "42 KB",
                    },
                    {
                      id: "skills/postgres",
                      name: "postgres-inspector",
                      path: "skills/postgres/SKILL.md",
                      desc: "Safe parameterized PostgreSQL schema introspection and read-only query execution.",
                      spec: "Model Tool",
                      size: "78 KB",
                    },
                    {
                      id: "skills/memory-vault",
                      name: "memory-vault",
                      path: "skills/memory-vault/SKILL.md",
                      desc: "Long-term episodic vector recall for autonomous agents.",
                      spec: "Antigravity",
                      size: "64 KB",
                    },
                  ].map((skill) => {
                    const isSelected = selectedMonorepoSkills.includes(skill.id);
                    return (
                      <label
                        key={skill.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#1B5FED] bg-white shadow-xs"
                            : "border-black/10 bg-white/60 hover:bg-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMonorepoSkills([...selectedMonorepoSkills, skill.id]);
                            } else {
                              setSelectedMonorepoSkills(
                                selectedMonorepoSkills.filter((id) => id !== skill.id)
                              );
                            }
                          }}
                          className="mt-0.5 rounded border-black/20 text-[#1B5FED] focus:ring-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-black">
                              {currentOrg.slug}/{skill.name}
                            </span>
                            <div className="flex items-center gap-1.5 font-mono text-[10px]">
                              <span className="px-1.5 py-0.5 rounded bg-sky-100 text-[#1B5FED] font-semibold">
                                {skill.spec}
                              </span>
                              <span className="text-black/40">{skill.size}</span>
                            </div>
                          </div>
                          <p className="text-xs text-black/70 font-sans mt-0.5">{skill.desc}</p>
                          <span className="inline-block font-mono text-[10px] text-black/40 mt-1">
                            path: {skill.path}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Pre-Flight Manifest Inspector (Clean or Monorepo) */}
            {scenario !== "duplicate" && scenario !== "security_block" && (
              <div className="rounded-xl border border-black/10 bg-white overflow-hidden shadow-xs">
                {/* Tabs */}
                <div className="flex items-center justify-between border-b border-black/10 bg-black/[0.02] px-4 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("visual")}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors ${
                        activeTab === "visual"
                          ? "bg-white text-black shadow-xs border border-black/10"
                          : "text-black/60 hover:text-black"
                      }`}
                    >
                      Visual Summary
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("yaml")}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        activeTab === "yaml"
                          ? "bg-white text-black shadow-xs border border-black/10"
                          : "text-black/60 hover:text-black"
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5 text-[#1B5FED]" />
                      <span>Auto-Generated spm.yaml</span>
                    </button>
                  </div>

                  {activeTab === "yaml" && (
                    <button
                      type="button"
                      onClick={copyYamlToClipboard}
                      className="inline-flex items-center gap-1 font-mono text-xs text-black/60 hover:text-black"
                    >
                      {copiedYaml ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy YAML</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Tab 1: Visual View */}
                {activeTab === "visual" && (
                  <div className="p-5 space-y-4 font-mono text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-black/50 block text-[11px] uppercase font-semibold">
                          Target Package Identifier:
                        </span>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-black/50 font-mono text-sm">{currentOrg.slug}/</span>
                          <input
                            type="text"
                            value={packageName}
                            onChange={(e) => setPackageName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "-"))}
                            placeholder="skill-name"
                            className="font-bold text-sm text-black border-b border-dashed border-black/30 hover:border-[#1B5FED] focus:border-[#1B5FED] focus:outline-none bg-transparent px-1 py-0.5"
                          />
                        </div>
                      </div>
                      <div>
                        <span className="text-black/50 block text-[11px] uppercase font-semibold">
                          Release Version (SemVer):
                        </span>
                        <input
                          type="text"
                          value={packageVersion}
                          onChange={(e) => setPackageVersion(e.target.value)}
                          placeholder="1.0.0"
                          className="font-bold text-sm text-[#1B5FED] border-b border-dashed border-sky-300 hover:border-[#1B5FED] focus:border-[#1B5FED] focus:outline-none bg-transparent px-1 py-0.5 mt-1"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-black/50 block text-[11px] uppercase font-semibold">
                          Auto-Extracted Description:
                        </span>
                        <input
                          type="text"
                          value={packageDescription}
                          onChange={(e) => setPackageDescription(e.target.value)}
                          placeholder="Skill description..."
                          className="w-full text-black/80 font-sans text-xs border border-black/10 rounded-lg p-2 mt-1 focus:border-[#1B5FED] focus:outline-none bg-white shadow-xs"
                        />
                      </div>
                    </div>

                    {/* Security checklist */}
                    <div className="pt-3 border-t border-black/10">
                      <span className="text-black/50 block text-[11px] uppercase mb-2">
                        Automated Pre-Flight Gatekeeper:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>0 Leaked Secrets</span>
                        </div>
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Safe AST Sandbox</span>
                        </div>
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Permissive MIT License</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: YAML View */}
                {activeTab === "yaml" && (
                  <pre className="p-4 bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
                    <code>{mockYaml}</code>
                  </pre>
                )}
              </div>
            )}

            {/* 4. Action Buttons */}
            <div className="pt-4 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setAnalyzed(false);
                  setRepoUrl("");
                }}
                className="font-mono text-xs text-black/60 hover:text-black"
              >
                ← Inspect Another Repository
              </button>

              {scenario !== "security_block" && scenario !== "duplicate" && (
                <button
                  type="button"
                  onClick={handlePublishImportedSkill}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {scenario === "monorepo"
                      ? `Publish ${selectedMonorepoSkills.length} Selected Skills to SPM`
                      : "Publish Imported Skill to SPM Registry"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
