"use client";

import { useState, useCallback } from "react";
import { Check, Copy } from "lucide-react";
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
        "flex items-center justify-between rounded-lg border border-surface-200 bg-surface-950 px-4 py-3 dark:border-surface-800",
        className
      )}
    >
      <code className="font-mono text-sm text-surface-50">
        <span className="text-surface-500">$ </span>
        {command}
      </code>
      <button
        onClick={handleCopy}
        className="ml-3 rounded-md p-1.5 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-50"
        aria-label="Copy install command"
      >
        {copied ? (
          <Check className="h-4 w-4 text-success" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
