import React from "react";
import Link from "next/link";
import { Scale, FileCode, CheckCircle2, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service — Agent SPM",
  description: "Terms and conditions governing the use of the Agent SPM Registry, CLI, and Enterprise Developer platform.",
};

export default function TermsOfServicePage() {
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
          <Scale className="w-3.5 h-3.5 text-[#1B5FED]" />
          <span>TERMS OF SERVICE</span>
        </div>
        <h1
          className="font-instrument-serif text-4xl sm:text-5xl lg:text-6xl font-normal italic tracking-tight text-black mb-4 select-none"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          Terms of Service
        </h1>
        <p className="text-base text-black/65 font-sans leading-relaxed max-w-2xl">
          By accessing or integrating with the Agent SPM Registry, CLI tools, or enterprise developer APIs, you agree to these commercial open-source terms.
        </p>
        <div className="mt-4 font-mono text-xs text-black/40">
          Last updated: {lastUpdated} • Version 1.8.2
        </div>
      </div>

      {/* Terms Content */}
      <div className="space-y-10 text-sm leading-relaxed text-black/80 font-sans">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-black tracking-tight flex items-center gap-2">
            <span className="font-mono text-xs text-[#1B5FED] bg-[#1B5FED]/10 px-2 py-0.5 rounded">01</span>
            Registry Access &amp; Package Distribution
          </h2>
          <p>
            Agent SPM provides both an open public procedural skill registry and private multi-tenant organization namespaces. You are responsible for maintaining the confidentiality of your API keys and authenticating all automated CLI publisher scripts.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-black tracking-tight flex items-center gap-2">
            <span className="font-mono text-xs text-[#1B5FED] bg-[#1B5FED]/10 px-2 py-0.5 rounded">02</span>
            Acceptable Use Policy &amp; Malware Prohibition
          </h2>
          <p>
            Skill packages published to the registry must not contain:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-black/70">
            <li>Obfuscated malicious payloads, rootkits, or unauthorized sandbox escape mechanisms.</li>
            <li>Tool definitions designed for unauthorized credential harvesting, denial-of-service, or distributed attacks.</li>
            <li>Packages that infringe upon intellectual property rights or misrepresent third-party agent affiliations.</li>
          </ul>
          <p className="text-xs text-black/60 font-mono mt-2">
            Violation of this policy will result in immediate skill quarantine, registry eviction, and API key revocation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-black tracking-tight flex items-center gap-2">
            <span className="font-mono text-xs text-[#1B5FED] bg-[#1B5FED]/10 px-2 py-0.5 rounded">03</span>
            Commercial Enterprise License &amp; SLAs
          </h2>
          <p>
            Paid Enterprise licenses grant perpetual platform access, dedicated 24/7 on-call engineering SLAs, and private namespace isolation. Commercial licenses are backed by a 99.95% API uptime service level commitment.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-black tracking-tight flex items-center gap-2">
            <span className="font-mono text-xs text-[#1B5FED] bg-[#1B5FED]/10 px-2 py-0.5 rounded">04</span>
            Disclaimer of Agent Runtime Liability
          </h2>
          <p>
            While Agent SPM scans and cryptographically signs packages, you acknowledge that autonomous AI agents execute code dynamically. You are solely responsible for configuring appropriate execution sandboxes, approval gates, and computational boundaries within your agent harness.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-black tracking-tight flex items-center gap-2">
            <span className="font-mono text-xs text-[#1B5FED] bg-[#1B5FED]/10 px-2 py-0.5 rounded">05</span>
            Contact Legal &amp; Licensing
          </h2>
          <p>
            Questions regarding licensing, custom MSAs, or enterprise agreements should be directed to{" "}
            <a href="mailto:legal@agent-spm.com" className="font-mono font-semibold text-[#1B5FED] underline">
              legal@agent-spm.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
