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
    <div className="my-6 rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-800 bg-[#0D0E12] shadow-md">
      {/* simulated macOS style header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#15171E] border-b border-surface-800 select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
        </div>
        
        {filename && (
          <span className="text-[11px] font-mono text-surface-500 font-semibold tracking-wide uppercase">
            {filename}
          </span>
        )}

        <div className="flex items-center gap-2">
          {language && !filename && (
            <span className="text-[10px] font-mono text-surface-600 dark:text-surface-500 font-bold uppercase tracking-wider">
              {language}
            </span>
          )}
          
          {/* Copy Trigger */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium font-mono text-surface-400 hover:text-white rounded-lg bg-surface-900/60 border border-surface-800 hover:border-surface-700 transition-all active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-450" />
                <span className="text-emerald-450">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Container */}
      <div className="p-5 overflow-x-auto font-mono text-sm leading-relaxed text-[#D2D6E2] select-text scrollbar-thin scrollbar-thumb-surface-800">
        <pre className="m-0">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
