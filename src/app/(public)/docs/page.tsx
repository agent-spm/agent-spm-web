"use client";

import React from "react";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { TabbedCodeBlock, CodeTab } from "@/components/docs/TabbedCodeBlock";
import { DocsNavigation } from "@/components/docs/DocsNavigation";
import { Shield, Cpu, Zap, Layers } from "lucide-react";

export default function DocsOverviewPage() {
  return (
    <div className="space-y-10 text-black font-sans">
      {/* ── HEADER ── */}
      <div id="overview" className="space-y-4 scroll-mt-24">
        <h1
          className="font-instrument-serif text-4xl sm:text-5xl italic font-normal tracking-tight text-black"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          What is SPM?
        </h1>
        <p className="text-lg sm:text-xl text-black/70 leading-relaxed font-normal">
          The open, developer-first registry for battle-tested procedural skill packages designed specifically for autonomous AI agents.
        </p>
      </div>

      <hr className="border-black/10" />

      {/* ── BODY SECTIONS ── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-black tracking-tight">
          Compounding Agent Capabilities
        </h2>
        <p className="text-sm sm:text-base text-black/75 leading-relaxed">
          AI agents are powerful, but developers spend too much time building the exact same tool definitions, sandbox runtimes, and validation schemas from scratch. 
        </p>
        <p className="text-sm sm:text-base text-black/75 leading-relaxed">
          <strong>SPM (Skill Package Manager)</strong> is the dependency manager for agent autonomy. It acts as the <code className="bg-black/5 text-[#1A5FED] px-1.5 py-0.5 rounded-[2px] font-mono text-xs">npm</code> or <code className="bg-black/5 text-[#1A5FED] px-1.5 py-0.5 rounded-[2px] font-mono text-xs">pip</code> of AI skills, enabling you to discover, import, version, and orchestrate complex procedural tasks (like secure Postgres querying, headless browser automation, or calendar booking) in seconds.
        </p>
      </section>

      {/* Quick Visual Diagram */}
      <section className="p-6 rounded-[8px] border border-black/10 bg-[#F7F7F7] relative overflow-hidden select-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#1A5FED]/5 rounded-full blur-3xl pointer-events-none" />
        <h3 className="text-xs font-bold text-black/50 uppercase tracking-widest font-mono mb-4">
          [HOW IT WORKS]
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#1A5FED] font-semibold text-sm">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1A5FED]/10 text-xs font-mono font-bold">1</span>
              <span className="font-sans">Discover &amp; Pull</span>
            </div>
            <p className="text-xs text-black/60 leading-relaxed">
              Find battle-tested skill schemas on the registry and fetch them using the SPM CLI.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#1A5FED] font-semibold text-sm">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1A5FED]/10 text-xs font-mono font-bold">2</span>
              <span className="font-sans">Import &amp; Bind</span>
            </div>
            <p className="text-xs text-black/60 leading-relaxed">
              Load package code directly inside LangChain, LlamaIndex, or custom agent systems.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#1A5FED] font-semibold text-sm">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1A5FED]/10 text-xs font-mono font-bold">3</span>
              <span className="font-sans">Execute Safely</span>
            </div>
            <p className="text-xs text-black/60 leading-relaxed">
              Every skill provides isolated runtimes, strict input validation, and clear outputs.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-black tracking-tight">
          A Quick Demonstration
        </h3>
        <p className="text-sm sm:text-base text-black/75 leading-relaxed">
          Install and initialize packages across CLI, Cursor, or your preferred agent runtime:
        </p>
        
        <TabbedCodeBlock
          tabs={[
            {
              id: "bash-cli",
              label: "Bash",
              language: "bash",
              code: `# Install a package from the SPM registry
spm install @utils/json-validator

# Initialize a package in your local codebase
spm init @utils/json-validator --namespace custom-skills`,
              filename: "terminal",
            },
            {
              id: "cursor-mcp",
              label: "Cursor",
              language: "json",
              code: `{
  "mcpServers": {
    "json-validator": {
      "command": "npx",
      "args": ["-y", "@spm/json-validator"],
      "env": {
        "SPM_API_KEY": "\${env:SPM_API_KEY}"
      }
    }
  }
}`,
              filename: ".cursor/mcp.json",
            },
            {
              id: "python-langchain",
              label: "Python",
              language: "python",
              code: `from spm import load_skill

# Load authenticated SPM tool into LangGraph agent
validator_tool = load_skill("@utils/json-validator", api_key="spm_live_...")
agent = create_react_agent(model="claude-3-5-sonnet", tools=[validator_tool])`,
              filename: "agent.py",
            },
          ]}
        />
      </section>

      {/* ── CORE PILLARS CARD GRID ── */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-black tracking-tight">
          Core Pillars of SPM
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-[8px] border border-black/5 bg-[#F7F7F7]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-[4px] bg-[#1A5FED]/10">
                <Shield className="h-4 w-4 text-[#1A5FED]" />
              </div>
              <h3 className="text-base font-semibold text-black">
                Sandboxed Autonomy
              </h3>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-black/65 leading-relaxed">
              Every downloaded package complies with standard execution layers. Run dangerous browser actions or data parser queries within safely managed environments.
            </p>
          </div>

          <div className="p-5 rounded-[8px] border border-black/5 bg-[#F7F7F7]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-[4px] bg-[#1A5FED]/10">
                <Cpu className="h-4 w-4 text-[#1A5FED]" />
              </div>
              <h3 className="text-base font-semibold text-black">
                Semantic Schemas
              </h3>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-black/65 leading-relaxed">
              Skills provide strict OpenAPI or custom JSON schemas so your LLM agents understand precisely what tools exist, their requirements, and expected payloads.
            </p>
          </div>

          <div className="p-5 rounded-[8px] border border-black/5 bg-[#F7F7F7]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-[4px] bg-[#1A5FED]/10">
                <Layers className="h-4 w-4 text-[#1A5FED]" />
              </div>
              <h3 className="text-base font-semibold text-black">
                Framework Agnostic
              </h3>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-black/65 leading-relaxed">
              Integrate downloaded skills into LangChain, CrewAI, AutoGen, LlamaIndex, or build your own custom runtime wrappers in pure Python or TypeScript.
            </p>
          </div>

          <div className="p-5 rounded-[8px] border border-black/5 bg-[#F7F7F7]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-[4px] bg-[#1A5FED]/10">
                <Zap className="h-4 w-4 text-[#1A5FED]" />
              </div>
              <h3 className="text-base font-semibold text-black">
                Fast &amp; Scalable
              </h3>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-black/65 leading-relaxed">
              Resilient version locking ensures your remote production pipelines never break when packages receive upgrades. Focus purely on model engineering.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER PAGINATION ── */}
      <DocsNavigation />
    </div>
  );
}
