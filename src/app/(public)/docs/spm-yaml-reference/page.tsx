"use client";

import React from "react";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DocsNavigation } from "@/components/docs/DocsNavigation";

export default function SpmYamlReferencePage() {
  return (
    <div className="space-y-10">
      {/* ── BREADCRUMBS ── */}
      <div className="flex items-center gap-2 text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-widest select-none">
        <span>Docs</span>
        <span>/</span>
        <span>Configuration</span>
        <span>/</span>
        <span className="text-brand-blue">spm.yaml Spec</span>
      </div>

      {/* ── HEADER ── */}
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-surface-900 dark:text-surface-50 font-sans">
          spm.yaml Specification
        </h1>
        <p className="text-lg sm:text-xl text-surface-500 dark:text-surface-400 leading-relaxed font-normal">
          The structural configuration manifest declaring package meta info, runtime systems, dependencies, and strict semantic input/output contracts.
        </p>
      </div>

      <hr className="border-surface-200 dark:border-surface-800" />

      {/* ── SECTION 1: INTRODUCTION ── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          The Manifest Manifest
        </h2>
        <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
          Every skill package has an <code>spm.yaml</code> manifest at its root directory. This manifest serves two critical operations:
        </p>
        <ul className="list-disc pl-5 text-sm sm:text-base text-surface-600 dark:text-surface-400 space-y-2">
          <li><strong>CLI Packing</strong>: Identifies the package name, version, entry target, and execution runtime rules for publishing.</li>
          <li><strong>LLM Tool-Calling binding</strong>: Declares the semantic description and parameters schema that LLM agents use to parse tool payloads.</li>
        </ul>
      </section>

      {/* ── SECTION 2: PRODUCTION EXAMPLE ── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Production YAML Example
        </h2>
        <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
          Here is a production-grade <code>spm.yaml</code> specification for a skill package designed to query weather reports:
        </p>

        <CodeBlock 
          code={`# Skill Package Manager Configuration Manifest
spm: "1.0"
namespace: "weather"
name: "report-fetcher"
version: "1.2.0"
description: "Fetches live weather reports, temperatures, and wind speeds for a target city."
entry: "./dist/index.js"
runtime: "node"

# Parameter constraints used by LLMs to format inputs
input:
  type: "object"
  properties:
    city:
      type: "string"
      description: "The name of the target city (e.g., 'San Francisco', 'Tokyo')."
    units:
      type: "string"
      enum: ["celsius", "fahrenheit"]
      default: "celsius"
      description: "Temperature metrics system to return."
  required: ["city"]

# Output constraints guaranteeing runtime validation schemas
output:
  type: "object"
  properties:
    temp:
      type: "number"
    wind:
      type: "string"
    condition:
      type: "string"`}
          language="yaml"
          filename="spm.yaml"
        />
      </section>

      {/* ── SECTION 3: KEY DEFINITIONS ── */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Parameter Key Reference
        </h2>

        {/* Custom Clean Grid Layout */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-0">
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="text-brand-blue font-bold">spm</span>
              <span className="text-surface-400 font-normal">string</span>
              <span className="text-[10px] bg-surface-100 dark:bg-surface-900 px-2 py-0.5 rounded text-surface-550">Required</span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
              Indicates the SPM package spec framework compiler version. Use <code>"1.0"</code>.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-0">
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="text-brand-blue font-bold">namespace</span>
              <span className="text-surface-400 font-normal">string</span>
              <span className="text-[10px] bg-surface-100 dark:bg-surface-900 px-2 py-0.5 rounded text-surface-550">Required</span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
              The publisher scope (e.g. organization name or username). Keeps your packages organized and prevents name conflicts.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-0">
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="text-brand-blue font-bold">name</span>
              <span className="text-surface-400 font-normal">string</span>
              <span className="text-[10px] bg-surface-100 dark:bg-surface-900 px-2 py-0.5 rounded text-surface-550">Required</span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
              The specific kebab-case identifier of your skill (e.g., <code>"report-fetcher"</code>). Combine with the namespace to form the unique identifier (e.g., <code>"@weather/report-fetcher"</code>).
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-0">
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="text-brand-blue font-bold">description</span>
              <span className="text-surface-400 font-normal">string</span>
              <span className="text-[10px] bg-surface-100 dark:bg-surface-900 px-2 py-0.5 rounded text-surface-550">Required</span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
              A highly descriptive semantic sentence explaining precisely what capabilities this skill delivers. <strong>CRITICAL</strong>: This parameter is injected directly into LLM prompt tool lists so models understand when and why to invoke this package.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-0">
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="text-brand-blue font-bold">entry</span>
              <span className="text-surface-400 font-normal">string</span>
              <span className="text-[10px] bg-surface-100 dark:bg-surface-900 px-2 py-0.5 rounded text-surface-550">Required</span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
              Relative path mapping the direct compiled executable script entry points (e.g. <code>"./dist/index.js"</code>).
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-0">
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="text-brand-blue font-bold">runtime</span>
              <span className="text-surface-400 font-normal">string</span>
              <span className="text-[10px] bg-surface-100 dark:bg-surface-900 px-2 py-0.5 rounded text-surface-550">Required</span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
              The target execution layer required to sandbox this skill. Supported runtimes are: <code>"node"</code>, <code>"python"</code>, or <code>"docker"</code>.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-0">
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="text-brand-blue font-bold">input / output</span>
              <span className="text-surface-400 font-normal">object (JSON Schema)</span>
              <span className="text-[10px] bg-surface-100 dark:bg-surface-900 px-2 py-0.5 rounded text-surface-550">Required</span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
              Strict standard JSON Schema objects detailing parameter constraints, properties, typings, default properties, and requirements. Guarantees safety and tool precision.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER PAGINATION ── */}
      <DocsNavigation />
    </div>
  );
}
