"use client";

import React from "react";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DocsNavigation } from "@/components/docs/DocsNavigation";

export default function SkillApiPage() {
  return (
    <div className="space-y-10">
      {/* ── BREADCRUMBS ── */}
      <div className="flex items-center gap-2 text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-widest select-none">
        <span>Docs</span>
        <span>/</span>
        <span>API Reference</span>
        <span>/</span>
        <span className="text-brand-blue">Skill Runtime API</span>
      </div>

      {/* ── HEADER ── */}
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-surface-900 dark:text-surface-50">
          Skill Runtime API
        </h1>
        <p className="text-lg sm:text-xl text-surface-500 dark:text-surface-400 leading-relaxed font-normal">
          Explore the isolated runtime lifecycle hooks, context injection payloads, and execution handlers required to implement secure agent skills.
        </p>
      </div>

      <hr className="border-surface-200 dark:border-surface-800" />

      {/* ── SECTION 1: EXECUTION CONTEXT ── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Lifecycle Hook Handlers
        </h2>
        <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
          Every skill package must export a standard execution entry interface. This ensures the SPM runtime host can securely trigger capabilities, inject environment tokens (like database credentials or API keys), validate inputs, and catch exceptions smoothly.
        </p>
      </section>

      {/* ── SECTION 2: LIFECYCLE HOOKS ── */}
      <section className="space-y-6">
        <div className="p-5 rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-0">
          <div className="flex items-center gap-2 font-mono text-sm">
            <span className="text-brand-blue font-bold">execute()</span>
            <span className="text-surface-400 font-normal">async function</span>
            <span className="text-[10px] bg-brand-blue/10 px-2 py-0.5 rounded text-brand-blue font-bold">Mandatory</span>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
            The core entry function performing the actual capability logic. It receives:
          </p>
          <ul className="list-disc pl-5 mt-2 text-xs sm:text-sm text-surface-500 space-y-1">
            <li><code>params</code>: The strict object parameters validated against your manifest's <code>input</code> schema.</li>
            <li><code>context</code>: System configurations, including credentials and active database connections.</li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-0">
          <div className="flex items-center gap-2 font-mono text-sm">
            <span className="text-brand-blue font-bold">validate()</span>
            <span className="text-surface-400 font-normal">async function</span>
            <span className="text-[10px] bg-surface-100 dark:bg-surface-900 px-2 py-0.5 rounded text-surface-550">Optional</span>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
            Perform supplementary dynamic validations that JSON schemas cannot enforce (e.g. pinging an API host to verify key validity, or querying active files).
          </p>
        </div>
      </section>

      {/* ── SECTION 3: CODE TEMPLATE ── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          TypeScript Implementation Example
        </h2>
        <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
          Here is a fully documented, production-grade template implementing standard execution lifecycle hooks:
        </p>

        <CodeBlock 
          code={`import { SkillContext, SkillExecuteResult } from "@agent-spm/types";

// 1. Declare strict Type parameter interfaces matching spm.yaml input
interface WeatherInput {
  city: string;
  units?: "celsius" | "fahrenheit";
}

interface WeatherOutput {
  temp: number;
  wind: string;
  condition: string;
}

/**
 * Perform supplementary dynamic validations
 */
export async function validate(params: WeatherInput, context: SkillContext): Promise<boolean> {
  if (!params.city || params.city.trim().length === 0) {
    throw new Error("Target city string parameter cannot be empty.");
  }
  return true;
}

/**
 * Main execution lifecycle hook
 */
export async function execute(
  params: WeatherInput,
  context: SkillContext
): Promise<WeatherOutput> {
  const apiKey = context.env.WEATHER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing required credential environment: WEATHER_API_KEY.");
  }

  const units = params.units || "celsius";
  const url = \`https://api.weather.dev/v1/current?q=\${encodeURIComponent(params.city)}&key=\${apiKey}\`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(\`Weather host responded with code: \${response.status}\`);
  }

  const data = await response.json();

  // Return exactly conforming output object
  return {
    temp: units === "celsius" ? data.temp_c : data.temp_f,
    wind: \`\${data.wind_kph} kph\`,
    condition: data.condition_text,
  };
}`}
          language="typescript"
          filename="index.ts"
        />
      </section>

      {/* ── SECTION 4: ENVIRONMENT & SECURITY ── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Environment & Security Isolation
        </h2>
        <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
          When executing in agent pipelines, skills operate under strict isolated execution sandboxes:
        </p>
        <ul className="list-decimal pl-5 text-sm sm:text-base text-surface-600 dark:text-surface-400 space-y-3">
          <li><strong>No Arbitrary Environment Access</strong>: Skills can ONLY read environment keys explicitly registered in their workspace configurations. They cannot scan host machine environment states.</li>
          <li><strong>CPU & Memory Sandboxing</strong>: Runtimes enforce memory limits (e.g. 512MB max for Node skills) and timeouts to prevent hanging infinite loops or recursive prompts.</li>
          <li><strong>Network Whitelisting</strong>: Optional configurations in <code>spm.yaml</code> restrict skills to communicate only with registered remote API domains.</li>
        </ul>
      </section>

      {/* ── FOOTER PAGINATION ── */}
      <DocsNavigation />
    </div>
  );
}
