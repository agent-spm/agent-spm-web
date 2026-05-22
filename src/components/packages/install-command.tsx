"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface InstallCommandProps {
  namespace: string;
  name: string;
  className?: string;
}

export function InstallCommand({
  namespace,
  name,
  className,
}: InstallCommandProps) {
  const [copied, setCopied] = useState(false);
  const command = `spm install ${namespace}/${name}`;

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [command]);

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-2 pl-4 relative overflow-hidden font-mono shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]",
        className
      )}
    >
      <code className="font-mono text-[13px] text-zinc-700 font-medium">
        <span className="text-[#1B5FED] select-none font-bold">$ </span>
        {command}
      </code>
      <button
        onClick={handleCopy}
        className={`ml-3 rounded-lg border px-3 py-1.5 text-xs font-semibold font-sans transition-all duration-150 cursor-pointer ${
          copied
            ? "border-transparent bg-[#1B5FED] text-white shadow-sm shadow-[#1B5FED]/20"
            : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 hover:border-zinc-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)] active:translate-y-0.5 active:shadow-none"
        }`}
        aria-label="Copy install command"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
