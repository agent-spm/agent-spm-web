"use client";

import React from "react";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DocsNavigation } from "@/components/docs/DocsNavigation";

export default function GettingStartedPage() {
  return (
    <div className="space-y-10">
      {/* ── BREADCRUMBS ── */}
      <div className="flex items-center gap-2 text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-widest select-none">
        <span>Docs</span>
        <span>/</span>
        <span className="text-brand-blue">Getting Started</span>
      </div>

      {/* ── HEADER ── */}
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-surface-900 dark:text-surface-50">
          Getting Started
        </h1>
        <p className="text-lg sm:text-xl text-surface-500 dark:text-surface-400 leading-relaxed font-normal">
          Install the SPM CLI, authenticate with your registry account, and build your very first autonomous agent skill.
        </p>
      </div>

      <hr className="border-surface-200 dark:border-surface-800" />

      {/* ── SECTION 1: PREREQUISITES ── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          1. Prerequisites
        </h2>
        <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
          Before installing the Skill Package Manager CLI, ensure you have the following environments set up on your machine:
        </p>
        <ul className="list-disc pl-5 text-sm sm:text-base text-surface-600 dark:text-surface-400 space-y-2">
          <li><strong>Node.js</strong>: Version 18.0 or higher.</li>
          <li><strong>Package Manager</strong>: <code>npm</code>, <code>yarn</code>, or <code>pnpm</code>.</li>
        </ul>
      </section>

      {/* ── SECTION 2: INSTALLATION ── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          2. Install the SPM CLI
        </h2>
        <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
          The SPM CLI orchestrates your local skills registry development workflows, including downloads, auth, publishing, validation, and localized testing.
        </p>
        <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
          Install it globally using your preferred package manager:
        </p>
        
        <CodeBlock 
          code={`# Install globally via npm
npm install -g @agent-spm/cli

# Verify successful installation
spm --version`}
          language="bash"
        />
      </section>

      {/* ── SECTION 3: AUTHENTICATION ── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          3. Authenticate with the Registry
        </h2>
        <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
          To pull private packages or publish your own skills to the public SPM registry, you must link the CLI with your workspace registry tokens.
        </p>
        <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
          Run the following login wizard and follow the prompts to complete verification in your browser:
        </p>

        <CodeBlock 
          code={`# Launch the login prompt
spm login`}
          language="bash"
        />

        <div className="p-4 rounded-xl border border-blue-200/50 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-950/20 text-xs sm:text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
          <span className="font-bold text-brand-blue">Protip:</span> If you are operating inside a headless CI/CD server, you can set the environment token directly using: <code>export SPM_TOKEN="your_token_here"</code>.
        </div>
      </section>

      {/* ── SECTION 4: SCAFFOLD A SKILL ── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          4. Scaffold Your First Skill
        </h2>
        <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
          Scaffold a completely compliant, boilerplate agent skill within a new subfolder using the <code>spm init</code> generator command:
        </p>

        <CodeBlock 
          code={`# Initialize a new skill package named "weather-checker"
spm init weather-checker`}
          language="bash"
        />

        <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
          The CLI builds a beautifully structured schema bundle:
        </p>

        {/* Directory Layout visual box */}
        <div className="p-5 rounded-2xl border border-surface-200 dark:border-surface-800 bg-[#0E0F14] font-mono text-xs sm:text-sm text-[#D2D6E2] select-none">
          <div className="text-surface-500 uppercase tracking-widest font-bold text-[10px] mb-3">Generated Structure</div>
          <div>weather-checker/</div>
          <div className="pl-4">├── <span className="text-[#98C379]">spm.yaml</span>        <span className="text-surface-500"># Metadata & API configuration</span></div>
          <div className="pl-4">├── <span className="text-[#61AFEF]">index.ts</span>        <span className="text-surface-500"># Main skill execution code</span></div>
          <div className="pl-4">├── <span className="text-surface-450">package.json</span>    <span className="text-surface-500"># Node dependency requirements</span></div>
          <div className="pl-4">└── <span className="text-surface-450">README.md</span>       <span className="text-surface-500"># Skill documentation and specs</span></div>
        </div>
      </section>

      {/* ── SECTION 5: LOCAL VALIDATION & TESTING ── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          5. Local Validation & Testing
        </h2>
        <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
          You don't need a live LLM runtime pipeline to verify that your tool functions are formatted correctly. You can test your skill execution schemas locally via CLI mocking:
        </p>

        <CodeBlock 
          code={`# Validate spm.yaml metadata constraints
spm validate

# Run localized test execution against mock payloads
spm run --input '{"city": "San Francisco"}'`}
          language="bash"
        />
      </section>

      {/* ── FOOTER PAGINATION ── */}
      <DocsNavigation />
    </div>
  );
}
