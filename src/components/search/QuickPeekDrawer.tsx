"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Shield,
  Download,
  Clock,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Zap,
  Box,
  Layers,
  CheckCircle2,
} from "lucide-react";
import type { PackageSearchResult } from "@/types/package";
import { formatNumber, timeAgo } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";

interface QuickPeekDrawerProps {
  pkg: PackageSearchResult | null;
  onClose: () => void;
}

export function QuickPeekDrawer({ pkg, onClose }: QuickPeekDrawerProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"cli" | "cursor" | "claude">("cursor");
  const [copied, setCopied] = useState(false);

  if (!pkg) return null;

  const spmCmd = `spm install ${pkg.namespace}/${pkg.name}`;
  const cursorConfig = JSON.stringify(
    {
      mcpServers: {
        [pkg.name]: {
          command: "npx",
          args: ["-y", `@${pkg.namespace}/${pkg.name}`],
          env: {
            SPM_API_KEY: "${env:SPM_API_KEY}",
          },
        },
      },
    },
    null,
    2
  );

  const claudeConfig = JSON.stringify(
    {
      mcpServers: {
        [pkg.name]: {
          command: "npx",
          args: ["-y", `@${pkg.namespace}/${pkg.name}`],
        },
      },
    },
    null,
    2
  );

  const getCopyContent = () => {
    if (activeTab === "cli") return spmCmd;
    if (activeTab === "cursor") return cursorConfig;
    return claudeConfig;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCopyContent());
    setCopied(true);
    showToast({
      title: "Config Copied",
      message: `${activeTab.toUpperCase()} configuration copied to clipboard.`,
      type: "success",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Mock tools list for quick inspection
  const tools = [
    { name: `${pkg.name.replace(/-/g, "_")}_inspect`, desc: "Inspects target context and returns AST or DOM tree." },
    { name: `${pkg.name.replace(/-/g, "_")}_execute`, desc: "Executes sanitized agent directive in isolated sandbox." },
    { name: `${pkg.name.replace(/-/g, "_")}_validate`, desc: "Validates input parameters against JSON Schema Draft 2020-12." },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-l border-black/10 animate-in slide-in-from-right duration-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-black/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[#1A5FED] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#1A5FED]" />
              QUICK PEEK • [SPACE] TO CLOSE
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-black/10 hover:bg-black/5 text-black/60 transition-colors cursor-pointer"
              title="Close drawer (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="font-mono text-xs text-black/40 mb-1">
              {pkg.namespace}/
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-black tracking-tight">{pkg.name}</h2>
              <span className="font-mono text-xs bg-[#F7F7F7] border border-black/10 px-2 py-0.5 rounded-md text-black/70 font-semibold">
                v{pkg.latestVersion}
              </span>
            </div>
            <p className="text-sm text-black/70 mt-2 leading-relaxed">
              {pkg.description}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 pt-2 font-mono text-xs text-black/60">
            <span className="flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-black/40" />
              {formatNumber(pkg.totalDownloads)} downloads
            </span>
            <span className="text-black/30">•</span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <strong className="text-emerald-700">96/100 Shield</strong>
            </span>
            <span className="text-black/30">•</span>
            <span className="text-black/50">SLSA L3</span>
          </div>
        </div>

        {/* Drawer Body (Scrollable) */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* 1-Click Connect Deck */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase text-black/60">
                1-Click Agent Integration
              </span>
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#F5F5F7] border border-black/5 font-mono text-[11px]">
                <button
                  onClick={() => setActiveTab("cursor")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                    activeTab === "cursor" ? "bg-white text-black font-bold shadow-xs" : "text-black/50"
                  }`}
                >
                  Cursor
                </button>
                <button
                  onClick={() => setActiveTab("claude")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                    activeTab === "claude" ? "bg-white text-black font-bold shadow-xs" : "text-black/50"
                  }`}
                >
                  Claude
                </button>
                <button
                  onClick={() => setActiveTab("cli")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                    activeTab === "cli" ? "bg-white text-black font-bold shadow-xs" : "text-black/50"
                  }`}
                >
                  SPM CLI
                </button>
              </div>
            </div>

            <div className="relative">
              <pre className="p-3.5 rounded-xl bg-[#0F172A] text-[#F8FAFC] font-mono text-xs overflow-auto max-h-[160px] leading-relaxed selection:bg-[#1A5FED]">
                {getCopyContent()}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-2.5 right-2.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "COPIED" : "COPY"}
              </button>
            </div>
          </div>

          {/* Exposed Tool Capabilities */}
          <div className="space-y-3">
            <span className="font-mono text-xs font-bold uppercase text-black/60 block">
              Declared MCP Tools ({tools.length})
            </span>
            <div className="space-y-2">
              {tools.map((t, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-black/5 bg-[#FAFAFA] font-mono text-xs space-y-1"
                >
                  <div className="flex items-center gap-1.5 font-bold text-[#1A5FED]">
                    <Zap className="w-3 h-3 text-amber-500" />
                    {t.name}
                  </div>
                  <p className="font-sans text-xs text-black/70 leading-normal">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Action Footer */}
        <div className="p-6 border-t border-black/10 bg-[#FAFAFA] flex items-center justify-between gap-3">
          <Link
            href={`/tools/schema-diet?tool=${encodeURIComponent(pkg.name)}`}
            className="flex-1 py-2.5 px-3 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-xs font-mono font-semibold text-black flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Check Token Diet
          </Link>
          <Link
            href={`/packages/${pkg.namespace}/${pkg.name}/`}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#1A5FED] hover:bg-[#1A5FED]/90 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
          >
            <span>Open Full Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
