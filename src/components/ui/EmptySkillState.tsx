"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TerminalSquare, Plus, Globe, Copy, Check } from "lucide-react";

export function EmptySkillState() {
  const [copied, setCopied] = useState(false);
  const cliCmd = "spm publish ./my-skill";

  const handleCopy = () => {
    navigator.clipboard.writeText(cliCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#121216]/90 p-8 sm:p-12 backdrop-blur-xl text-center max-w-xl mx-auto space-y-5">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-[#1B5FED]/10 border border-[#1B5FED]/30 flex items-center justify-center">
        <TerminalSquare className="w-7 h-7 text-[#00F0FF]" />
      </div>

      <div>
        <h3 className="text-xl font-bold font-sans text-white">No Skills Published Yet</h3>
        <p className="text-xs text-surface-400 font-mono mt-1 max-w-md mx-auto">
          Equip your AI agents with reusable procedural knowledge. Publish your first skill using the web wizard or directly from your terminal.
        </p>
      </div>

      {/* Copyable CLI command per spec */}
      <div className="max-w-md mx-auto p-2.5 rounded-xl border border-white/10 bg-surface-950 flex items-center justify-between font-mono text-xs text-white">
        <span className="text-[#00F0FF]">{cliCmd}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-[11px] uppercase transition-all"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      {/* Buttons: Publish New Skill and Browse Registry */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/app/skills/publish"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Publish New Skill [P]</span>
        </Link>

        <Link
          href="/search"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white font-mono text-xs uppercase flex items-center justify-center gap-2"
        >
          <Globe className="w-3.5 h-3.5 text-surface-400" />
          <span>Browse Public Registry</span>
        </Link>
      </div>
    </div>
  );
}
