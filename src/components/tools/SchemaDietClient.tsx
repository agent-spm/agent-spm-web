"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Zap,
  Cpu,
  Layers,
  Copy,
  Download,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Shield,
  Code,
  FileCheck,
  ChevronRight,
  BarChart2,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { optimizeToolSchema } from "@/lib/tools/schema-diet";

interface SchemaPreset {
  id: string;
  name: string;
  category: string;
  rawJson: string;
}

const PRESETS: SchemaPreset[] = [
  {
    id: "github-mcp",
    name: "GitHub MCP: create_issue",
    category: "Developer Tools",
    rawJson: JSON.stringify(
      {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        title: "CreateIssueParameters",
        description:
          "This tool allows the agent to create a brand new GitHub issue within a target organization and repository. Please ensure that the repository exists and that you have valid OAuth write permissions before dispatching this call. You must supply both the repository owner and the repository name as separate strings.",
        type: "object",
        properties: {
          owner: {
            type: "string",
            description:
              "The GitHub account owner of the repository (for example, the organization login name or personal username). This cannot be empty.",
          },
          repo: {
            type: "string",
            description:
              "The name of the repository without the .git extension. Do not include the owner name here, only the repository slug.",
          },
          title: {
            type: "string",
            description:
              "The title or headline of the issue. Keep this concise and descriptive to help maintainers triage the issue quickly.",
          },
          body: {
            type: "string",
            description:
              "The Markdown body containing the full description, reproduction steps, agent trace logs, and any screenshots relevant to this defect report.",
          },
          labels: {
            type: "array",
            description:
              "An array of string tags or category labels that should be attached to this issue upon creation, such as 'bug', 'enhancement', or 'agent-automated'.",
            items: {
              type: "string",
            },
          },
          assignees: {
            type: "array",
            description:
              "A list of GitHub usernames that should be automatically assigned to review or address this new issue.",
            items: {
              type: "string",
            },
          },
        },
        required: ["owner", "repo", "title"],
      },
      null,
      2
    ),
  },
  {
    id: "postgres-tool",
    name: "PostgreSQL: query_table",
    category: "Database Ops",
    rawJson: JSON.stringify(
      {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        title: "PostgresQueryParameters",
        description:
          "Execute an introspective SQL query against the connected tenant database. Only read-only SELECT statements are permissible unless the agent is running in an elevated transaction boundary. Dangerous DROP or TRUNCATE commands are disallowed by perimeter guards.",
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "The raw SQL statement to execute. Parameters should ideally be escaped or passed via positional arguments to prevent SQL injection vulnerabilities.",
          },
          parameters: {
            type: "array",
            description:
              "Optional list of positional parameters to bind into the SQL query placeholders ($1, $2, etc.) to ensure parameter safety.",
            items: {
              type: "string",
            },
          },
          timeout_ms: {
            type: "number",
            description:
              "Maximum permissible duration in milliseconds before the Postgres connection pool terminates query execution. Default is 5000ms.",
            default: 5000,
          },
        },
        required: ["query"],
      },
      null,
      2
    ),
  },
  {
    id: "slack-notifier",
    name: "Slack: post_message",
    category: "Communications",
    rawJson: JSON.stringify(
      {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        title: "SlackPostMessageParameters",
        description:
          "Dispatch an asynchronous notification block to a designated internal Slack channel. Markdown and Block Kit formatting syntax are fully supported.",
        type: "object",
        properties: {
          channel_id: {
            type: "string",
            description:
              "The unique Slack channel ID (e.g., C012345678) or channel name (e.g., #agent-alerts) where the message should be broadcasted.",
          },
          text: {
            type: "string",
            description:
              "The primary text content or notification fallback string of the message.",
          },
          thread_ts: {
            type: "string",
            description:
              "Timestamp of another message to reply as a child thread rather than posting to the main channel stream.",
          },
        },
        required: ["channel_id", "text"],
      },
      null,
      2
    ),
  },
];

export function SchemaDietClient({ inApp = false }: { inApp?: boolean }) {
  const { showToast } = useToast();

  const [inputSchema, setInputSchema] = useState(PRESETS[0].rawJson);
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0].id);

  // Compression options
  const [stripDescriptions, setStripDescriptions] = useState(true);
  const [stripTitles, setStripTitles] = useState(true);
  const [stripDrafts, setStripDrafts] = useState(true);
  const [pruneOptional, setPruneOptional] = useState(false);
  const [condenseEnums, setCondenseEnums] = useState(true);

  // Compression algorithm (shared engine)
  const { optimizedSchema, originalTokens, optimizedTokens, percentSaved } = useMemo(
    () =>
      optimizeToolSchema(inputSchema, {
        stripDescriptions,
        stripTitles,
        stripDrafts,
        pruneOptional,
        condenseEnums,
      }),
    [inputSchema, stripDescriptions, stripTitles, stripDrafts, pruneOptional, condenseEnums]
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedSchema);
    showToast({
      title: "Optimized Schema Copied",
      message: `Saved ${percentSaved}% token footprint. Ready to inject into SPM manifest.`,
      type: "success",
    });
  };

  const handleDownload = () => {
    const blob = new Blob([optimizedSchema], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "diet-schema.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      title: "Schema Downloaded",
      message: "Saved diet-schema.json to disk.",
      type: "success",
    });
  };

  const tokensSaved = Math.max(0, originalTokens - optimizedTokens);

  return (
    <div className={`space-y-6 text-black ${inApp ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}`}>
      {/* ── TOP HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#1A5FED]" />
            <h1 className="text-xl font-bold font-sans text-black">
              MCP Schema Token Diet Optimizer
            </h1>
            <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              UP TO -65% TOKENS
            </span>
          </div>
          <p className="text-xs font-mono text-black/60 mt-1">
            Compress heavy MCP & OpenAI tool JSON schemas before injecting them into agent system prompts. Save LLM context window bandwidth without sacrificing execution fidelity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {inApp ? (
            <Link
              href="/app/skills/workspace"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-black font-mono text-xs uppercase font-semibold transition-all shadow-xs"
            >
              <span>Multi-Agent DAG</span>
              <ChevronRight className="w-3.5 h-3.5 text-black/40" />
            </Link>
          ) : (
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1A5FED] text-white font-mono text-xs uppercase font-semibold shadow-sm hover:bg-[#1A5FED]/90 transition-all"
            >
              <span>Workspace Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* ── PRESETS BAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-black/10 bg-white shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#1A5FED]" />
          <span className="font-mono text-xs font-bold text-black uppercase">Sample MCP Presets:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((pr) => (
            <button
              key={pr.id}
              onClick={() => {
                setSelectedPreset(pr.id);
                setInputSchema(pr.rawJson);
              }}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer ${
                selectedPreset === pr.id
                  ? "bg-[#1A5FED] text-white shadow-xs"
                  : "bg-black/5 text-black/70 hover:bg-black/10"
              }`}
            >
              {pr.name}
            </button>
          ))}
          <button
            onClick={() => {
              setInputSchema("{\n  \"type\": \"object\",\n  \"properties\": {}\n}");
              setSelectedPreset("custom");
            }}
            className="px-3 py-1.5 rounded-xl font-mono text-xs font-semibold bg-black/5 text-black/70 hover:bg-black/10 transition-all cursor-pointer"
          >
            Clear / Custom
          </button>
        </div>
      </div>

      {/* ── METRICS DISPLAY ROW ── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="rounded-xl border border-black/10 bg-white p-4 shadow-xs">
          <span className="text-black/50 block text-[11px] uppercase">Original Size</span>
          <div className="text-2xl font-bold text-black mt-1">~{originalTokens} <span className="text-xs text-black/50 font-normal">tokens</span></div>
          <span className="text-[10px] text-black/40 mt-1 block">Full JSON schema footprint</span>
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-4 shadow-xs">
          <span className="text-[#1A5FED] block text-[11px] uppercase font-bold">Optimized Size</span>
          <div className="text-2xl font-bold text-[#1A5FED] mt-1">~{optimizedTokens} <span className="text-xs text-[#1A5FED]/70 font-normal">tokens</span></div>
          <span className="text-[10px] text-emerald-700 mt-1 block font-semibold">Reduced by ~{tokensSaved} tokens</span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-xs">
          <span className="text-emerald-900 block text-[11px] uppercase font-bold">Token Reduction</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">-{percentSaved}%</div>
          <span className="text-[10px] text-emerald-800 mt-1 block">Context window headroom freed</span>
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-4 shadow-xs">
          <span className="text-black/50 block text-[11px] uppercase">Cost Multiplier</span>
          <div className="text-2xl font-bold text-black mt-1">{(optimizedTokens / Math.max(originalTokens, 1)).toFixed(2)}x</div>
          <span className="text-[10px] text-black/40 mt-1 block">Of original inference token cost</span>
        </div>
      </div>

      {/* ── COMPRESSION RULES CONTROL TOGGLES ── */}
      <div className="p-4 rounded-2xl border border-black/10 bg-white shadow-xs space-y-3 font-mono text-xs">
        <span className="text-black/50 uppercase font-bold block text-[11px]">Active Pruning Strategies:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-black/5 border border-black/5 transition-colors">
            <input
              type="checkbox"
              checked={stripDescriptions}
              onChange={(e) => setStripDescriptions(e.target.checked)}
              className="rounded border-black/20 text-[#1A5FED] focus:ring-0"
            />
            <span className="text-xs text-black">Strip Descriptions</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-black/5 border border-black/5 transition-colors">
            <input
              type="checkbox"
              checked={stripTitles}
              onChange={(e) => setStripTitles(e.target.checked)}
              className="rounded border-black/20 text-[#1A5FED] focus:ring-0"
            />
            <span className="text-xs text-black">Strip Schema Titles</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-black/5 border border-black/5 transition-colors">
            <input
              type="checkbox"
              checked={stripDrafts}
              onChange={(e) => setStripDrafts(e.target.checked)}
              className="rounded border-black/20 text-[#1A5FED] focus:ring-0"
            />
            <span className="text-xs text-black">Remove $schema Drafts</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-black/5 border border-black/5 transition-colors">
            <input
              type="checkbox"
              checked={condenseEnums}
              onChange={(e) => setCondenseEnums(e.target.checked)}
              className="rounded border-black/20 text-[#1A5FED] focus:ring-0"
            />
            <span className="text-xs text-black">Condense Deep Enums</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-black/5 border border-black/5 transition-colors">
            <input
              type="checkbox"
              checked={pruneOptional}
              onChange={(e) => setPruneOptional(e.target.checked)}
              className="rounded border-black/20 text-[#1A5FED] focus:ring-0"
            />
            <span className="text-xs text-black">Prune Non-Required</span>
          </label>
        </div>
      </div>

      {/* ── SPLIT EDITOR WORKBENCH ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Schema */}
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-black/60" />
              <span className="font-mono text-xs font-bold text-black uppercase">
                Raw Input JSON Schema
              </span>
            </div>
            <button
              onClick={() => {
                try {
                  const p = JSON.parse(inputSchema);
                  setInputSchema(JSON.stringify(p, null, 2));
                } catch {
                  showToast({ title: "Format Error", message: "Invalid JSON syntax.", type: "error" });
                }
              }}
              className="font-mono text-[11px] text-[#1A5FED] hover:underline cursor-pointer"
            >
              Prettify
            </button>
          </div>

          <textarea
            value={inputSchema}
            onChange={(e) => setInputSchema(e.target.value)}
            rows={18}
            className="w-full p-3.5 rounded-xl border border-black/10 bg-black/[0.02] font-mono text-xs text-black leading-relaxed focus:border-[#1A5FED] focus:outline-none focus:ring-1 focus:ring-[#1A5FED] resize-none"
            placeholder="Paste your MCP tool schema or OpenAPI definition..."
          />
        </div>

        {/* Right: Optimized Diet Output */}
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-mono text-xs font-bold text-black uppercase">
                  Diet-Optimized Schema
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                  -{percentSaved}%
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#1A5FED] hover:bg-[#1A5FED]/90 text-white font-mono text-xs font-semibold cursor-pointer shadow-xs transition-all"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="p-1.5 rounded-lg border border-black/10 hover:bg-black/5 text-black/60 transition-colors cursor-pointer"
                  title="Download JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <pre className="w-full p-3.5 mt-3 rounded-xl border border-black/10 bg-[#0F172A] text-[#38BDF8] font-mono text-xs leading-relaxed overflow-auto max-h-[360px] selection:bg-[#1A5FED]">
              {optimizedSchema}
            </pre>
          </div>

          {/* Model Context Savings Breakdown */}
          <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-black/5 space-y-2.5 font-mono text-xs">
            <span className="text-[10px] uppercase font-bold text-black/50 block">
              Multi-Model Inference Savings (Per 1k Tool Calls)
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-white border border-black/5">
                <span className="text-[10px] text-black/40 block">Claude 3.5 Sonnet</span>
                <span className="font-bold text-black">${((optimizedTokens * 1000) / 1000000 * 3).toFixed(3)}</span>
                <span className="text-[9px] text-emerald-600 block font-semibold">Saved ${(tokensSaved * 1000 / 1000000 * 3).toFixed(3)}</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-black/5">
                <span className="text-[10px] text-black/40 block">GPT-4o</span>
                <span className="font-bold text-black">${((optimizedTokens * 1000) / 1000000 * 2.5).toFixed(3)}</span>
                <span className="text-[9px] text-emerald-600 block font-semibold">Saved ${(tokensSaved * 1000 / 1000000 * 2.5).toFixed(3)}</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-black/5">
                <span className="text-[10px] text-black/40 block">Gemini 1.5 Pro</span>
                <span className="font-bold text-black">${((optimizedTokens * 1000) / 1000000 * 1.25).toFixed(3)}</span>
                <span className="text-[9px] text-emerald-600 block font-semibold">Saved ${(tokensSaved * 1000 / 1000000 * 1.25).toFixed(3)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
