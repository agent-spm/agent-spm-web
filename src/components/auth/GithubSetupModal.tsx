"use client";

import React, { useState } from "react";
import { Copy, Check, ExternalLink, ShieldAlert, ArrowRight, Zap, X } from "lucide-react";

interface GithubSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedAnyway: () => void;
  redirectUrl?: string;
}

export function GithubSetupModal({
  isOpen,
  onClose,
  onProceedAnyway,
  redirectUrl = "/app",
}: GithubSetupModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const callbackUrl = "https://pbcnraifbapghtcavwqs.supabase.co/auth/v1/callback";

  const handleCopy = () => {
    navigator.clipboard.writeText(callbackUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRetryOAuth = () => {
    onProceedAnyway();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-black/10 bg-white p-6 shadow-2xl text-black">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-black/40 hover:text-black hover:bg-black/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-sans tracking-tight">
              GitHub OAuth Setup Required
            </h3>
            <p className="text-xs font-mono text-black/50">
              Supabase Project: pbcnraifbapghtcavwqs
            </p>
          </div>
        </div>

        <p className="text-sm text-black/70 mb-5 leading-relaxed">
          Your Supabase Auth service rejected the request because the GitHub provider is not enabled yet in your Supabase dashboard (<code className="text-xs bg-black/5 px-1.5 py-0.5 rounded font-mono">Unsupported provider</code>).
        </p>

        {/* Steps Card */}
        <div className="space-y-4 rounded-xl border border-black/10 bg-[#FBFBFA] p-4 text-xs font-sans mb-5">
          <div>
            <div className="font-semibold text-black flex items-center justify-between mb-1">
              <span>Step 1: Create GitHub OAuth App</span>
              <a
                href="https://github.com/settings/applications/new"
                target="_blank"
                rel="noreferrer"
                className="text-[#1B5FED] font-mono hover:underline flex items-center gap-1 font-bold"
              >
                Open GitHub <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="text-black/60 space-y-1 font-mono text-[11px]">
              <div>Application name: <span className="text-black font-semibold">Agent SPM</span></div>
              <div>Homepage URL: <span className="text-black font-semibold">https://www.agent-spm.com</span></div>
            </div>
          </div>

          <div>
            <div className="font-semibold text-black mb-1">
              Step 2: Set Authorization Callback URL
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={callbackUrl}
                className="flex-1 rounded-lg border border-black/10 bg-white px-2.5 py-1.5 font-mono text-[11px] text-black select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black text-white font-mono text-xs hover:bg-black/80 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <div>
            <div className="font-semibold text-black flex items-center justify-between mb-1">
              <span>Step 3: Enable in Supabase Dashboard</span>
              <a
                href="https://supabase.com/dashboard/project/pbcnraifbapghtcavwqs/auth/providers"
                target="_blank"
                rel="noreferrer"
                className="text-[#1B5FED] font-mono hover:underline flex items-center gap-1 font-bold"
              >
                Open Supabase <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-black/60 text-[11px] leading-relaxed">
              Expand <strong>GitHub</strong>, toggle <strong>Enable GitHub</strong> to ON, paste your <strong>Client ID</strong> and <strong>Client Secret</strong>, and click <strong>Save</strong>.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleRetryOAuth}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1B5FED] hover:bg-[#154BC1] text-white font-sans text-sm font-semibold shadow-sm transition-all"
          >
            <span>I have enabled it — retry GitHub OAuth</span>
          </button>
        </div>
      </div>
    </div>
  );
}
