"use client";

import React from "react";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DocsNavigation } from "@/components/docs/DocsNavigation";
import { Terminal, Shield, Cpu, Zap, Layers } from "lucide-react";

export default function DocsOverviewPage() {
  return (
    <div className="space-y-10">
      {/* ── BREADCRUMBS ── */}
      <div className="flex items-center gap-2 text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-widest select-none">
        <span>Docs</span>
        <span>/</span>
        <span className="text-brand-blue">Introduction</span>
      </div>

      {/* ── HEADER ── */}
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-surface-900 dark:text-surface-50">
          What is SPM?
        </h1>
        <p className="text-lg sm:text-xl text-surface-500 dark:text-surface-400 leading-relaxed font-normal">
          The open, developer-first registry for battle-tested procedural skill packages designed specifically for autonomous AI agents.
        </p>
      </div>

      <hr className="border-surface-200 dark:border-surface-800" />

      {/* ── BODY SECTIONS ── */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Compounding Agent Capabilities
        </h2>
        <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
          AI agents are powerful, but developers spend too much time building the exact same tool definitions, sandbox runtimes, and validation schemas from scratch. 
        </p>
        <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
          <strong>SPM (Skill Package Manager)</strong> is the dependency manager for agent autonomy. It acts as the <code>npm</code> or <code>pip</code> of AI skills, enabling you to discover, import, version, and orchestrate complex procedural tasks (like secure Postgres querying, headless browser automation, or calendar booking) in seconds.
        </p>
      </section>

      {/* Quick Visual Diagram */}
      <section className="p-6 rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900/40 relative overflow-hidden select-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />
        <h3 className="text-sm font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-widest font-mono mb-4">
          How it works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-brand-blue font-semibold text-sm">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-blue/10 text-xs">1</span>
              <span>Discover & Pull</span>
            </div>
            <p className="text-xs text-surface-500 dark:text-surface-450 leading-relaxed">
              Find battle-tested skill schemas on the registry and fetch them using the SPM CLI.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-brand-blue font-semibold text-sm">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-blue/10 text-xs">2</span>
              <span>Import & Bind</span>
            </div>
            <p className="text-xs text-surface-500 dark:text-surface-450 leading-relaxed">
              Load package code directly inside LangChain, LlamaIndex, or custom agent systems.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-brand-blue font-semibold text-sm">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-blue/10 text-xs">3</span>
              <span>Execute Safely</span>
            </div>
            <p className="text-xs text-surface-500 dark:text-surface-450 leading-relaxed">
              Every skill provides isolated runtimes, strict input validation, and clear outputs.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-surface-900 dark:text-surface-100">
          A Quick Demonstration
        </h3>
        <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
          Install and initialize packages using a single shell routine:
        </p>
        
        <CodeBlock 
          code={`# Install a package from the SPM registry
spm install @utils/json-validator

# Initialize a package in your local codebase
spm init @utils/json-validator --namespace custom-skills`}
          language="bash"
        />
      </section>

      {/* ── CORE PILLARS CARD GRID ── */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Core Pillars of SPM
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-blue/10">
                <Shield className="h-5 w-5 text-brand-blue" />
              </div>
              <h3 className="text-base font-bold text-surface-900 dark:text-surface-50">
                Sandboxed Autonomy
              </h3>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-surface-500 leading-relaxed">
              Every downloaded package complies with standard execution layers. Run dangerous browser actions or data parser queries within safely managed environments.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-blue/10">
                <Cpu className="h-5 w-5 text-brand-blue" />
              </div>
              <h3 className="text-base font-bold text-surface-900 dark:text-surface-50">
                Semantic Schemas
              </h3>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-surface-500 leading-relaxed">
              Skills provide strict OpenAPI or custom JSON schemas so your LLM agents understand precisely what tools exist, their requirements, and expected payloads.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-blue/10">
                <Layers className="h-5 w-5 text-brand-blue" />
              </div>
              <h3 className="text-base font-bold text-surface-900 dark:text-surface-50">
                Framework Agnostic
              </h3>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-surface-500 leading-relaxed">
              Integrate downloaded skills intoLangChain, CrewAI, AutoGen, LlamaIndex, or build your own custom runtime wrappers in pure Python or TypeScript.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-blue/10">
                <Zap className="h-5 w-5 text-brand-blue" />
              </div>
              <h3 className="text-base font-bold text-surface-900 dark:text-surface-50">
                Fast & Scalable
              </h3>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-surface-500 leading-relaxed">
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
