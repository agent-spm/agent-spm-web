"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export function CodeBlock({ code, language = "bash", filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  return (
    <div className="my-6 rounded-[6px] overflow-hidden border border-black/10 bg-[#0D0E12] shadow-sm">
      {/* simulated macOS style header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#15171E] border-b border-black/20 select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
        </div>
        
        {filename && (
          <span className="text-[10px] font-mono text-white/40 font-semibold tracking-widest uppercase">
            {filename}
          </span>
        )}

        <div className="flex items-center gap-3">
          {language && !filename && (
            <span className="text-[9px] font-mono text-white/30 font-bold uppercase tracking-wider">
              {language}
            </span>
          )}
          
          {/* Copy Trigger */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-[9px] font-medium font-mono text-white/50 hover:text-white rounded-[3px] bg-white/5 border border-white/5 hover:border-white/10 transition-all active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-450" />
                <span className="text-emerald-450 font-bold">COPIED!</span>
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

      {/* Code Container */}
      <div className="p-4 overflow-x-auto font-mono text-[13px] leading-relaxed text-[#D2D6E2] select-text scrollbar-thin scrollbar-thumb-white/5">
        <pre className="m-0">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
