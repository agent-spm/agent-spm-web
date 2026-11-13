import React from "react";
import Link from "next/link";
import { Shield, Lock, Eye, FileText, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Agent SPM",
  description: "Learn how Agent SPM protects your telemetry, skill package schemas, and agent execution metadata.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "April 2026";

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-black">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-black/60 hover:text-black mb-8 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </Link>

      {/* Header */}
      <div className="mb-12 border-b border-black/10 pb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#F7F7F7] px-3.5 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-black/70 mb-4">
          <Eye className="w-3.5 h-3.5 text-[#1B5FED]" />
          <span>LEGAL &amp; PRIVACY</span>
        </div>
        <h1
          className="font-instrument-serif text-4xl sm:text-5xl lg:text-6xl font-normal italic tracking-tight text-black mb-4 select-none"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          Privacy Policy
        </h1>
        <p className="text-base text-black/65 font-sans leading-relaxed max-w-2xl">
          Agent SPM is engineered for autonomous AI agent ecosystems. We treat developer skills, procedural tool definitions, and private organizational namespaces as first-class confidential intellectual property.
        </p>
        <div className="mt-4 font-mono text-xs text-black/40">
          Last updated: {lastUpdated} • Version 2.4.0
        </div>
      </div>

      {/* Policy Content */}
      <div className="space-y-10 text-sm leading-relaxed text-black/80 font-sans">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-black tracking-tight flex items-center gap-2">
            <span className="font-mono text-xs text-[#1B5FED] bg-[#1B5FED]/10 px-2 py-0.5 rounded">01</span>
            Data We Collect &amp; Process
          </h2>
          <p>
            When you publish packages, download agent capabilities, or register autonomous agents via the SPM CLI or Web Interface, we collect minimal operational metadata:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-black/70 font-sans">
            <li><strong>Package Metadata:</strong> Package names, version strings, semantic signatures, tool schema definitions (<code className="font-mono text-xs bg-black/5 px-1 py-0.5 rounded">spm.yaml</code>), and cryptographic SHA-256 integrity digests.</li>
            <li><strong>Account &amp; Organization Details:</strong> Work email, single sign-on (SAML/OIDC) identifiers, team membership, and billing identifiers.</li>
            <li><strong>Telemetry &amp; Audit Logs:</strong> Download counts, install source channel (CLI, IDE, SDK), IP addresses for fraud prevention, and scoped API key transaction timestamps.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-black tracking-tight flex items-center gap-2">
            <span className="font-mono text-xs text-[#1B5FED] bg-[#1B5FED]/10 px-2 py-0.5 rounded">02</span>
            Zero Runtime Data Interception
          </h2>
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs leading-relaxed text-blue-900">
            <strong>Key Isolation Guarantee:</strong> Agent SPM is a procedural dependency registry, not a proxy gateway. Once your agent runtime pulls and validates a skill package locally, tool executions run entirely within your sandboxed environment. SPM never intercepts your LLM prompts, agent completions, database queries, or model outputs.
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-black tracking-tight flex items-center gap-2">
            <span className="font-mono text-xs text-[#1B5FED] bg-[#1B5FED]/10 px-2 py-0.5 rounded">03</span>
            Private Namespaces &amp; RBAC Isolation
          </h2>
          <p>
            Packages published under an organization namespace (e.g. <code className="font-mono text-xs bg-black/5 px-1 py-0.5 rounded">@acme-labs/*</code>) are strictly isolated using row-level security and tenant isolation encryption. Only members with verified organization credentials and active scoped API keys can query, inspect, or download private skills.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-black tracking-tight flex items-center gap-2">
            <span className="font-mono text-xs text-[#1B5FED] bg-[#1B5FED]/10 px-2 py-0.5 rounded">04</span>
            Data Retention &amp; Erasure
          </h2>
          <p>
            You retain 100% ownership of your skills and schemas. If you delete a private package or terminate your organization account, all hosted artifacts, version manifests, and associated audit logs are cryptographically erased from active storage within 30 calendar days.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-black tracking-tight flex items-center gap-2">
            <span className="font-mono text-xs text-[#1B5FED] bg-[#1B5FED]/10 px-2 py-0.5 rounded">05</span>
            Contact Privacy &amp; Security Engineering
          </h2>
          <p>
            For privacy inquiries, GDPR data subject requests, or SOC 2 compliance documentation, contact our Data Protection Officer at{" "}
            <a href="mailto:privacy@agent-spm.com" className="font-mono font-semibold text-[#1B5FED] underline">
              privacy@agent-spm.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
