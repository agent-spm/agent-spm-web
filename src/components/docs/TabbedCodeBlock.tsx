"use client";

import React, { useState } from "react";
import { Copy, Check, Terminal, Code, Cpu } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export interface CodeTab {
  id: string;
  label: string;
  language: string;
  code: string;
  filename?: string;
}

interface TabbedCodeBlockProps {
  tabs: CodeTab[];
  title?: string;
}

export function TabbedCodeBlock({ tabs, title }: TabbedCodeBlockProps) {
  const { showToast } = useToast();
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id || "");
  const [copied, setCopied] = useState(false);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const handleCopy = async () => {
    if (!activeTab) return;
    try {
      await navigator.clipboard.writeText(activeTab.code);
      setCopied(true);
      showToast({
        title: "Code Snippet Copied",
        message: `${activeTab.label} code copied to clipboard.`,
        type: "success",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  return (
    <div className="my-6 rounded-[8px] overflow-hidden border border-black/10 bg-[#0D0E12] shadow-sm font-sans">
      {/* Top Bar with Window Controls, Language Tabs & Copy Action */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#15171E] border-b border-black/20 select-none gap-3">
        {/* Left: Window Dots + Tabs */}
        <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
          {/* macOS window traffic lights */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
          </div>

          <div className="h-3 w-px bg-white/10 shrink-0" />

          {/* Tab Buttons Strip */}
          <div className="flex items-center gap-1 overflow-x-auto min-w-0 scrollbar-none py-0.5">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  type="button"
                  className={`px-2.5 py-1 rounded-[4px] font-mono text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 leading-none ${
                    isActive
                      ? "bg-[#1A5FED] text-white shadow-xs"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.id.includes("bash") || tab.id.includes("cli") ? (
                    <Terminal className="w-3 h-3 text-white/80" />
                  ) : tab.id.includes("ts") || tab.id.includes("cursor") ? (
                    <Code className="w-3 h-3 text-sky-400" />
                  ) : (
                    <Cpu className="w-3 h-3 text-amber-400" />
                  )}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Filename & Copy Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          {activeTab.filename && (
            <span className="font-mono text-[10px] text-white/40 font-semibold tracking-wider uppercase whitespace-nowrap">
              {activeTab.filename}
            </span>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold font-mono rounded-[3px] border transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0 ${
              copied
                ? "bg-[#1B5FED]/20 border-[#1B5FED] text-[#1B5FED]"
                : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                <span>COPIED</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>COPY</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div className="p-4 overflow-x-auto font-mono text-[13px] leading-relaxed text-[#D2D6E2] select-text scrollbar-thin scrollbar-thumb-white/5">
        <pre className="m-0">
          <code>{activeTab.code}</code>
        </pre>
      </div>
    </div>
  );
}
