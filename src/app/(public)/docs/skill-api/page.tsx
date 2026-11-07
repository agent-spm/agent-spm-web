"use client";

import React from "react";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DocsNavigation } from "@/components/docs/DocsNavigation";

export default function SkillApiPage() {
  return (
    <div className="space-y-10 text-black font-sans">
      {/* ── HEADER ── */}
      <div className="space-y-4">
        <h1
          className="font-instrument-serif text-4xl sm:text-5xl italic font-normal tracking-tight text-black"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          Skill Runtime API
        </h1>
        <p className="text-lg sm:text-xl text-black/70 leading-relaxed font-normal">
          Explore the isolated runtime lifecycle hooks, context injection payloads, and execution handlers required to implement secure agent skills.
        </p>
      </div>

      <hr className="border-black/10" />

      {/* ── SECTION 1: EXECUTION CONTEXT ── */}
      <section id="lifecycle" className="space-y-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-black tracking-tight">
          Lifecycle Hook Handlers
        </h2>
        <p className="text-sm sm:text-base text-black/75 leading-relaxed">
          Every skill package must export a standard execution entry interface. This ensures the SPM runtime host can securely trigger capabilities, inject environment tokens (like database credentials or API keys), validate inputs, and catch exceptions smoothly.
        </p>
      </section>

      {/* ── SECTION 2: LIFECYCLE HOOKS ── */}
      <section className="space-y-4">
        <div className="p-5 rounded-[8px] border border-black/5 bg-[#F7F7F7]">
          <div className="flex items-center gap-2 font-mono text-sm">
            <span className="text-[#1A5FED] font-bold">execute()</span>
            <span className="text-black/40 font-normal">async function</span>
            <span className="text-[10px] bg-[#1A5FED]/10 px-2 py-0.5 rounded-[2px] text-[#1A5FED] font-bold">Mandatory</span>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-black/70 leading-relaxed">
            The core entry function performing the actual capability logic. It receives:
          </p>
          <ul className="list-disc pl-5 mt-2 text-xs sm:text-sm text-black/65 space-y-1">
            <li><code>params</code>: The strict object parameters validated against your manifest&apos;s <code>input</code> schema.</li>
            <li><code>context</code>: System configurations, including credentials and active database connections.</li>
          </ul>
        </div>

        <div className="p-5 rounded-[8px] border border-black/5 bg-[#F7F7F7]">
          <div className="flex items-center gap-2 font-mono text-sm">
            <span className="text-[#1A5FED] font-bold">validate()</span>
            <span className="text-black/40 font-normal">async function</span>
            <span className="text-[10px] bg-black/5 px-2 py-0.5 rounded-[2px] text-black/60">Optional</span>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-black/70 leading-relaxed">
            Perform supplementary dynamic validations that JSON schemas cannot enforce (e.g. pinging an API host to verify key validity, or querying active files).
          </p>
        </div>
      </section>

      {/* ── SECTION 3: CODE TEMPLATE ── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-black tracking-tight">
          TypeScript Implementation Example
        </h2>
        <p className="text-sm sm:text-base text-black/75 leading-relaxed">
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
        <h2 className="text-2xl font-bold text-black tracking-tight">
          Environment &amp; Security Isolation
        </h2>
        <p className="text-sm sm:text-base text-black/75 leading-relaxed">
          When executing in agent pipelines, skills operate under strict isolated execution sandboxes:
        </p>
        <ul className="list-decimal pl-5 text-sm sm:text-base text-black/75 space-y-3">
          <li><strong>No Arbitrary Environment Access</strong>: Skills can ONLY read environment keys explicitly registered in their workspace configurations. They cannot scan host machine environment states.</li>
          <li><strong>CPU &amp; Memory Sandboxing</strong>: Runtimes enforce memory limits (e.g. 512MB max for Node skills) and timeouts to prevent hanging infinite loops or recursive prompts.</li>
          <li><strong>Network Whitelisting</strong>: Optional configurations in <code>spm.yaml</code> restrict skills to communicate only with registered remote API domains.</li>
        </ul>
      </section>

      {/* ── FOOTER PAGINATION ── */}
      <DocsNavigation />
    </div>
  );
}
