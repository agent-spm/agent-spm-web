"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`shrink-0 flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
        copied 
          ? "border-green-500/50 bg-green-50/50 text-green-600 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400" 
          : "border-surface-200 bg-white text-surface-500 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-300 dark:border-surface-700 dark:bg-surface-800 dark:hover:bg-brand-950 dark:hover:text-brand-400"
      }`}
      title={copied ? "Copied!" : "Copy install command"}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
