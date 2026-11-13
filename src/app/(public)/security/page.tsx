import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Terminal, Cpu, CheckCircle2, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Security & Trust Architecture — Agent SPM",
  description: "Enterprise security architecture, cryptographic skill signatures, sandboxing guarantees, and SOC 2 Type II compliance.",
};

export default function SecurityPage() {
  const lastAudited = "Q1 2026";

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
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-4">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>SECURITY &amp; COMPLIANCE ARCHITECTURE</span>
        </div>
        <h1
          className="font-instrument-serif text-4xl sm:text-5xl lg:text-6xl font-normal italic tracking-tight text-black mb-4 select-none"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          Security Architecture
        </h1>
        <p className="text-base text-black/65 font-sans leading-relaxed max-w-2xl">
          Autonomous AI agents require defense-in-depth package distribution. Agent SPM enforces cryptographic verification, strict schema typing, and zero-runtime leakage across the entire supply chain.
        </p>
        <div className="mt-4 font-mono text-xs text-black/40">
          Last third-party penetration audit: {lastAudited} • SOC 2 Type II Certified
        </div>
      </div>

      {/* Security Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        <div className="p-6 rounded-2xl border border-black/10 bg-[#FAFAFA] space-y-3">
          <div className="w-9 h-9 rounded-lg bg-[#1B5FED]/10 text-[#1B5FED] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-black font-sans">SHA-256 Cryptographic Signing</h3>
          <p className="text-xs text-black/70 leading-relaxed font-sans">
            Every published skill release is digested and cryptographically signed on publish. When the SPM CLI runs <code className="font-mono bg-black/5 px-1 py-0.5 rounded">spm install</code>, it verifies the local hash against the immutable registry ledger to prevent tamper or man-in-the-middle substitution.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-black/10 bg-[#FAFAFA] space-y-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-black font-sans">Strict JSON Schema Validation</h3>
          <p className="text-xs text-black/70 leading-relaxed font-sans">
            Agent procedural tools require deterministic inputs and outputs. SPM enforces runtime schema checking using TypeBox and Zod definitions, preventing prompt injection attacks from manipulating parameter types.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-black/10 bg-[#FAFAFA] space-y-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-black font-sans">Isolated Private Namespaces</h3>
          <p className="text-xs text-black/70 leading-relaxed font-sans">
            Enterprise skills reside in dedicated private tenant spaces with row-level encryption at rest (AES-256) and in transit (TLS 1.3). Cross-tenant access is physically impossible at the database protocol level.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-black/10 bg-[#FAFAFA] space-y-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Terminal className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-black font-sans">Automated Vulnerability Scanning</h3>
          <p className="text-xs text-black/70 leading-relaxed font-sans">
            Every package uploaded is analyzed by automated static analyzers checking for dangerous child process invocations, unverified network socket bindings, and known CVEs prior to registry publication.
          </p>
        </div>
      </div>

      {/* Security Whitepaper Section */}
      <div className="space-y-8 text-sm leading-relaxed text-black/80 font-sans border-t border-black/10 pt-8">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-black tracking-tight flex items-center gap-2">
            <span className="font-mono text-xs text-[#1B5FED] bg-[#1B5FED]/10 px-2 py-0.5 rounded">01</span>
            Vulnerability Disclosure &amp; Bug Bounty
          </h2>
          <p>
            We welcome vulnerability reports from independent security researchers. If you identify a security flaw or supply-chain vulnerability, report it immediately to{" "}
            <a href="mailto:security@agent-spm.com" className="font-mono font-semibold text-[#1B5FED] underline">
              security@agent-spm.com
            </a>. PGP keys are available upon request.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-black tracking-tight flex items-center gap-2">
            <span className="font-mono text-xs text-[#1B5FED] bg-[#1B5FED]/10 px-2 py-0.5 rounded">02</span>
            SOC 2 Type II Report Access
          </h2>
          <p>
            Enterprise customers on our Lifetime Enterprise plan can request our full third-party SOC 2 Type II audit report, penetration testing summary, and ISO 27001 certificate directly via the{" "}
            <Link href="/app/settings/compliance" className="font-mono font-semibold text-[#1B5FED] underline">
              Compliance Portal
            </Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
