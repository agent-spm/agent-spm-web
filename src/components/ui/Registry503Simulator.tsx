"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Copy, Check, RotateCcw, ExternalLink, ShieldCheck, AlertTriangle } from "lucide-react";

export function Registry503Simulator() {
  const [copied, setCopied] = useState(false);
  const traceId = "spm_trace_9a8f_us_east_20261108_0941";

  const handleCopyTrace = () => {
    navigator.clipboard.writeText(traceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-[#121216]/95 p-6 sm:p-8 backdrop-blur-2xl max-w-xl mx-auto shadow-2xl text-center space-y-4">
      <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-amber-400" />
      </div>

      <div className="space-y-1">
        <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
          HTTP 503 • SERVICE TEMPORARILY DEGRADED
        </span>
        <h2 className="text-xl font-bold font-sans text-white mt-1">Registry Gateway Resyncing</h2>
        <p className="text-xs text-emerald-400 font-mono">
          ✓ All skill versions, hashes, and cryptographic signatures remain completely safe.
        </p>
      </div>

      {/* Error Block per spec */}
      <div className="rounded-xl border border-white/10 bg-surface-950 p-4 font-mono text-xs text-left space-y-1.5 text-surface-300">
        <div className="text-amber-400 font-bold">Failed Request Details:</div>
        <div className="flex justify-between text-[11px]"><span className="text-surface-500">Error:</span><span>Upstream Edge Ingestion Timeout</span></div>
        <div className="flex justify-between text-[11px]"><span className="text-surface-500">Retry Count:</span><span>3 of 5</span></div>
        <div className="flex justify-between text-[11px]"><span className="text-surface-500">Region:</span><span>us-east-1 (Virginia Cluster B)</span></div>
        <div className="flex justify-between text-[11px]"><span className="text-surface-500">Trace ID:</span><span className="text-[#00F0FF]">{traceId}</span></div>
        <div className="flex justify-between text-[11px]"><span className="text-surface-500">Timestamp:</span><span>{new Date().toISOString()}</span></div>
      </div>

      {/* Buttons: Retry Now, Status Page, Copy Trace ID */}
      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <button
          onClick={() => window.location.reload()}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs font-semibold uppercase shadow-md"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Now</span>
        </button>

        <button
          onClick={handleCopyTrace}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied Trace" : "Copy Trace ID"}</span>
        </button>

        <Link
          href="https://status.agent-spm.com"
          target="_blank"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Status Page</span>
        </Link>
      </div>
    </div>
  );
}
