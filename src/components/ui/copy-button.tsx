"use client";

import { Copy } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
  return (
    <button
      onClick={() => navigator.clipboard?.writeText(text)}
      className="shrink-0 flex items-center gap-1.5 rounded-md border border-surface-200 bg-white px-3 py-1.5 text-xs font-medium text-surface-500 transition-colors hover:bg-brand-50 hover:text-brand-600 hover:border-brand-300 dark:border-surface-700 dark:bg-surface-800 dark:hover:bg-brand-950 dark:hover:text-brand-400"
      title="Copy install command"
    >
      <Copy className="h-3.5 w-3.5" />
      Copy
    </button>
  );
}
