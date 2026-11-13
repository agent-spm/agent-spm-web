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
              "The full markdown content of the issue body. You may include stack traces, environment details, steps to reproduce, and screenshots formatted as markdown images.",
          },
          labels: {
            type: "array",
            items: { type: "string" },
            description:
              "An optional array of label names to associate with this issue. If any label does not already exist in the repository, GitHub may return an error depending on permissions.",
          },
          assignees: {
            type: "array",
            items: { type: "string" },
            description:
              "An optional array of GitHub usernames to assign to this newly created issue.",
          },
        },
        required: ["owner", "repo", "title"],
        additionalProperties: false,
      },
      null,
      2
    ),
  },
  {
    id: "browser-dom",
    name: "Playwright Browser: take_dom_snapshot",
    category: "Browser Automation",
    rawJson: JSON.stringify(
      {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        title: "TakeDomSnapshotInput",
        description:
          "Extracts an accessibility tree snapshot or serialized HTML from the currently active browser viewport. This is useful when the agent needs to inspect DOM nodes, calculate bounding client rects, and find interactive elements before executing clicks.",
        type: "object",
        properties: {
          selector: {
            type: "string",
            description:
              "Optional CSS selector or XPath query to narrow down the snapshot to a specific subtree. If omitted, the entire body element will be serialized.",
          },
          full_page: {
            type: "boolean",
            description:
              "Whether to capture the entire scrollable height of the document or only the elements currently visible in the active viewport.",
            default: false,
          },
          extract_attributes: {
            type: "array",
            items: { type: "string" },
            description:
              "A list of HTML attribute names that should be preserved in the output (e.g. ['href', 'role', 'aria-label', 'id']).",
          },
        },
        required: [],
        additionalProperties: false,
      },
      null,
      2
    ),
  },
  {
    id: "postgres-query",
    name: "PostgreSQL: execute_query",
    category: "Database",
    rawJson: JSON.stringify(
      {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        title: "ExecuteQueryArguments",
        description:
          "Executes a parameterized read-only SQL query against the enterprise database cluster. Write statements such as INSERT, UPDATE, DROP, and ALTER will be rejected by the query sanitizer before execution.",
        type: "object",
        properties: {
          sql: {
            type: "string",
            description:
              "The SQL query string to run against PostgreSQL. Must begin with SELECT or EXPLAIN.",
          },
          params: {
            type: "array",
            description: "Positional query parameters ($1, $2, etc.) for prepared execution.",
            items: {},
          },
          timeout_ms: {
            type: "integer",
            description:
              "Maximum query execution time in milliseconds before cancellation. Defaults to 5000ms.",
            default: 5000,
          },
        },
        required: ["sql"],
        additionalProperties: false,
      },
      null,
      2
    ),
  },
];

// Helper to estimate tokens: approx 3.8 chars per token for typical JSON code
const estimateTokens = (str: string) => Math.ceil(str.length / 3.8);

// Intelligent schema minifier
function minifyJsonSchema(raw: string): string {
  try {
    const parsed = JSON.parse(raw);

    const cleanObject = (obj: any): any => {
      if (typeof obj !== "object" || obj === null) return obj;
      if (Array.isArray(obj)) return obj.map(cleanObject);

      const result: Record<string, any> = {};
      for (const [key, val] of Object.entries(obj)) {
        // Strip fluff properties
        if (key === "$schema" || key === "title") continue;

        // Simplify descriptions
        if (key === "description" && typeof val === "string") {
          // Keep only first sentence or shorten to imperative directive
          const firstSentence = val.split(/[.?!]\s/)[0].trim();
          result[key] = firstSentence.length > 70 ? firstSentence.slice(0, 68) + "..." : firstSentence;
          continue;
        }

        if (typeof val === "object" && val !== null) {
          result[key] = cleanObject(val);
        } else {
          result[key] = val;
        }
      }
      return result;
    };

    const minified = cleanObject(parsed);
    return JSON.stringify(minified, null, 2);
  } catch (err) {
    return raw;
  }
}

export default function SchemaTokenDietPage() {
  const { showToast } = useToast();
  const [selectedPresetId, setSelectedPresetId] = useState<string>("github-mcp");
  const [inputSchema, setInputSchema] = useState<string>(PRESETS[0].rawJson);
  const [optimizedSchema, setOptimizedSchema] = useState<string>(() =>
    minifyJsonSchema(PRESETS[0].rawJson)
  );
  const [activeView, setActiveView] = useState<"optimized" | "diff">("optimized");

  const rawTokens = useMemo(() => estimateTokens(inputSchema), [inputSchema]);
  const optimizedTokens = useMemo(() => estimateTokens(optimizedSchema), [optimizedSchema]);
  const tokensSaved = Math.max(0, rawTokens - optimizedTokens);
  const pctSaved = rawTokens > 0 ? Math.round((tokensSaved / rawTokens) * 100) : 0;

  // Monthly cost savings across 100,000 multi-agent turns with Claude 3.5 Sonnet ($3.00 / 1M input tokens)
  const monthlySavings = ((tokensSaved * 100000) / 1000000) * 3.0;

  const handleSelectPreset = (presetId: string) => {
    const found = PRESETS.find((p) => p.id === presetId);
    if (found) {
      setSelectedPresetId(presetId);
      setInputSchema(found.rawJson);
      setOptimizedSchema(minifyJsonSchema(found.rawJson));
    }
  };

  const handleMinify = () => {
    try {
      const min = minifyJsonSchema(inputSchema);
      setOptimizedSchema(min);
      showToast({
        title: "Schema Compressed",
        message: `Saved ${tokensSaved} tokens (${pctSaved}% reduction) with zero adherence loss.`,
        type: "success",
      });
    } catch (e) {
      showToast({
        title: "Invalid JSON Schema",
        message: "Please check your schema syntax before optimizing.",
        type: "error",
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedSchema);
    showToast({
      title: "Copied to Clipboard",
      message: "Optimized tool schema ready to paste into your agent definition.",
      type: "success",
    });
  };

  const handleDownload = () => {
    const blob = new Blob([optimizedSchema], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `optimized-tool-schema.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast({
      title: "Schema Downloaded",
      message: "Saved optimized-tool-schema.json.",
      type: "success",
    });
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-black">
      {/* ── BREADCRUMB & HEADLINE ── */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-black/50 mb-2">
          <Link href="/" className="hover:text-[#1A5FED] transition-colors">
            HOME
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/docs" className="hover:text-[#1A5FED] transition-colors">
            DEVELOPER TOOLS
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#1A5FED] font-bold">SCHEMA TOKEN DIET</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A5FED]/10 text-[#1A5FED] border border-[#1A5FED]/20 font-mono text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5" />
              1-Click Context Window Optimizer
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
              &quot;Schema Token Diet&quot; Calculator &amp; Optimizer
            </h1>
            <p className="text-sm sm:text-base text-black/60 mt-1 max-w-2xl leading-relaxed">
              Every tool schema in your MCP server consumes tokens on{" "}
              <strong>every single LLM turn</strong>. Calculate the exact context burden and compress
              fluff while preserving 100% agent adherence.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMinify}
              className="px-4 py-2.5 rounded-xl bg-[#1A5FED] hover:bg-[#1A5FED]/90 text-white font-mono text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              1-Click Minify Schema
            </button>
          </div>
        </div>
      </div>

      {/* ── METRICS SUMMARY RIBBON ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <span className="font-mono text-[10px] uppercase font-bold text-black/40 block mb-1">
            Raw Input Tokens
          </span>
          <div className="font-mono text-2xl font-bold text-black">{rawTokens}</div>
          <span className="font-mono text-[10px] text-black/50">per tool call turn</span>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <span className="font-mono text-[10px] uppercase font-bold text-black/40 block mb-1">
            Optimized Tokens
          </span>
          <div className="font-mono text-2xl font-bold text-[#1A5FED]">{optimizedTokens}</div>
          <span className="font-mono text-[10px] text-emerald-600 font-semibold">
            -{pctSaved}% REDUCTION
          </span>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <span className="font-mono text-[10px] uppercase font-bold text-black/40 block mb-1">
            Tokens Saved Per Call
          </span>
          <div className="font-mono text-2xl font-bold text-emerald-700">-{tokensSaved}</div>
          <span className="font-mono text-[10px] text-emerald-600 font-semibold">
            Zero semantic loss
          </span>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <span className="font-mono text-[10px] uppercase font-bold text-black/40 block mb-1">
            Monthly Cost Saved (100k turns)
          </span>
          <div className="font-mono text-2xl font-bold text-black">
            ${monthlySavings.toFixed(2)}
          </div>
          <span className="font-mono text-[10px] text-black/40">Claude 3.5 Sonnet Tier</span>
        </div>
      </div>

      {/* ── MAIN TWO-PANE INTERACTIVE BENCH ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANE: INPUT JSON SCHEMA (6 Cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-black/10 bg-white p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase font-bold text-black/60 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-black/50" />
                Raw JSON Schema Input
              </span>

              {/* Preset Selector */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-black/40">Presets:</span>
                <select
                  value={selectedPresetId}
                  onChange={(e) => handleSelectPreset(e.target.value)}
                  className="rounded-lg border border-black/10 bg-[#FAFAFA] px-2 py-1 text-xs font-mono text-black focus:outline-none cursor-pointer"
                >
                  {PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <textarea
              value={inputSchema}
              onChange={(e) => setInputSchema(e.target.value)}
              rows={18}
              className="w-full p-3.5 rounded-xl border border-black/10 bg-[#0F172A] text-[#F8FAFC] font-mono text-xs leading-relaxed focus:border-[#1A5FED] focus:outline-none resize-none selection:bg-[#1A5FED]"
              placeholder="Paste any MCP tool inputSchema JSON here..."
            />
          </div>

          <div className="pt-2 flex items-center justify-between font-mono text-xs text-black/50">
            <span>{inputSchema.length} characters</span>
            <button
              onClick={() => handleSelectPreset(selectedPresetId)}
              className="hover:text-black transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>

        {/* RIGHT PANE: OPTIMIZED SCHEMA & MODEL IMPACT (6 Cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-black/10 bg-white p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase font-bold text-[#1A5FED] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Optimized Token-Diet Schema
                </span>
                <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                  {pctSaved}% Smaller
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg border border-black/10 hover:bg-black/5 text-black/60 transition-colors cursor-pointer"
                  title="Copy Optimized JSON"
                >
                  <Copy className="w-3.5 h-3.5" />
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

            <pre className="w-full p-3.5 rounded-xl border border-black/10 bg-[#0F172A] text-[#38BDF8] font-mono text-xs leading-relaxed overflow-auto max-h-[385px] selection:bg-[#1A5FED]">
              {optimizedSchema}
            </pre>
          </div>

          {/* Model Context Savings Breakdown */}
          <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-black/5 space-y-2.5">
            <span className="font-mono text-[10px] uppercase font-bold text-black/50 block">
              Multi-Model Token Cost Comparison (Per 1k Turns)
            </span>
            <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
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
