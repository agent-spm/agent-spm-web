"use client";

import React from "react";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DocsNavigation } from "@/components/docs/DocsNavigation";

export default function PackagePublishingPage() {
  return (
    <div className="space-y-10">
      {/* ── BREADCRUMBS ── */}
      <div className="flex items-center gap-2 text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-widest select-none">
        <span>Docs</span>
        <span>/</span>
        <span>Workflows</span>
        <span>/</span>
        <span className="text-brand-blue">Publishing</span>
      </div>

      {/* ── HEADER ── */}
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-surface-900 dark:text-surface-50">
          Package Publishing
        </h1>
        <p className="text-lg sm:text-xl text-surface-500 dark:text-surface-400 leading-relaxed font-normal">
          Share your agent capabilities with your team or publish them globally to the public registry.
        </p>
      </div>

      <hr className="border-surface-200 dark:border-surface-800" />

      {/* ── SECTION 1: WORKFLOW OVERVIEW ── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Publishing Workflow
        </h2>
        <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
          Publishing a skill to SPM compiles your source files, validates parameter formats against the JSON schema, and securely pushes the bundle to the central index registry. 
        </p>
        <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
          Follow these sequential stages to publish your local package:
        </p>
      </section>

      {/* ── SECTION 2: PREPARATION ── */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-surface-900 dark:text-surface-100">
          1. Prepare & Validate
        </h3>
        <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
          Before building the package, verify that all configurations declared in <code>spm.yaml</code> comply with SPM registry rules. Run validation:
        </p>

        <CodeBlock 
          code={`# Run local manifest syntax checking
spm validate`}
          language="bash"
        />

        <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
          If any schema configurations (such as an undefined required input property or invalid kebab-case namespace) violate parameters, the CLI will return exact line-number warnings.
        </p>
      </section>

      {/* ── SECTION 3: BUILD ── */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-surface-900 dark:text-surface-100">
          2. Compile Source Assets
        </h3>
        <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
          Ensure that your TypeScript/JavaScript files are compiled into the targeted entry folder mapped in your manifest (e.g. <code>"./dist"</code>).
        </p>

        <CodeBlock 
          code={`# Compile typescript files if relevant
npm run build`}
          language="bash"
        />
      </section>

      {/* ── SECTION 4: PUBLISH RUN ── */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-surface-900 dark:text-surface-100">
          3. Pushing to the Registry
        </h3>
        <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
          Once your package passes local validations, execute the publish trigger. Ensure you are signed in (via <code>spm login</code>) or have configured the <code>SPM_TOKEN</code> environment variable:
        </p>

        <CodeBlock 
          code={`# Publish your skill package
spm publish`}
          language="bash"
        />

        <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
          The CLI will compress the code, upload the bundle to our secure storage registry, register the new version index, and automatically make it available under <code>spm install @your-namespace/package-name</code>.
        </p>
      </section>

      {/* ── SECTION 5: SEMANTIC VERSIONING ── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Semantic Versioning Guidelines
        </h2>
        <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
          To ensure agent runtimes operate reliably without unexpected failures, we strictly enforce standard NPM-style Semantic Versioning (<code>MAJOR.MINOR.PATCH</code>):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="p-5 rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-0">
            <span className="block font-mono text-xs font-bold text-brand-blue uppercase tracking-wider">PATCH (0.0.x)</span>
            <span className="block mt-1 text-sm font-semibold text-surface-900 dark:text-surface-50">Bug Fixes</span>
            <p className="mt-2 text-xs text-surface-500 leading-relaxed">
              Use for standard internal bug fixes, dependency updates, and logic changes. Does NOT change input or output schemas.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-0">
            <span className="block font-mono text-xs font-bold text-brand-blue uppercase tracking-wider">MINOR (0.x.0)</span>
            <span className="block mt-1 text-sm font-semibold text-surface-900 dark:text-surface-50">New Features</span>
            <p className="mt-2 text-xs text-surface-500 leading-relaxed">
              Use when introducing new optional tool parameters, improved performance, or supplementary outputs. Schema remains backward compatible.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-0">
            <span className="block font-mono text-xs font-bold text-brand-blue uppercase tracking-wider">MAJOR (x.0.0)</span>
            <span className="block mt-1 text-sm font-semibold text-surface-900 dark:text-surface-50">Breaking Changes</span>
            <p className="mt-2 text-xs text-surface-500 leading-relaxed">
              Use when modifying required input parameters, deleting properties, changing output shapes, or migrating runtimes.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER PAGINATION ── */}
      <DocsNavigation />
    </div>
  );
}
