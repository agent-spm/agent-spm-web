"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Download, Clock } from "lucide-react";
import { formatNumber, timeAgo } from "@/lib/utils";
import type { PackageSearchResult } from "@/types/package";

interface PackageCardProps {
  pkg: PackageSearchResult;
}

export function PackageCard({ pkg }: PackageCardProps) {
  const installCmd = `spm install ${pkg.namespace}/${pkg.name}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault(); // Don't navigate when clicking copy
    e.stopPropagation();
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Link
      href={`/packages/${pkg.namespace}/${pkg.name}/`}
      className="group block rounded-2xl border border-surface-200 bg-white p-5 transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/8 hover:-translate-y-1 cursor-pointer font-sans"
    >
      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-black transition-colors duration-200">
            <span className="text-black/40 font-normal">
              {pkg.namespace}/
            </span>
            <span className="text-black font-semibold transition-colors duration-200 group-hover:text-[#1B5FED]">
              {pkg.name}
            </span>
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-surface-500">
            {pkg.description}
          </p>
        </div>
        
        {/* Version Badge: Sleek Outline Badge */}
        <span className="ml-3 shrink-0 rounded-md border border-surface-200 bg-surface-50 px-2 py-0.5 font-mono text-xs text-surface-500">
          v{pkg.latestVersion}
        </span>
      </div>

      {/* Retro-Terminal Command Deck: Solid light base for premium clean look */}
      <div className="mt-4 flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl p-1.5 pl-3 relative overflow-hidden">
        <code className="flex-1 truncate font-mono text-xs text-zinc-700 font-medium select-all">
          <span className="text-[#1B5FED] select-none font-bold">$</span> {installCmd}
        </code>
        
        {/* Sleek copy button: 100% visible, transforms beautifully when copied */}
        <button
          onClick={handleCopy}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold font-sans transition-all duration-150 cursor-pointer ${
            copied
              ? "bg-[#1B5FED] text-white border border-transparent shadow-sm shadow-[#1B5FED]/20"
              : "bg-white text-zinc-800 border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)] active:translate-y-0.5 active:shadow-none"
          }`}
          title="Copy install command"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Stats Footer Block */}
      <div className="mt-4 pt-4 border-t border-surface-100 flex items-center gap-4 text-xs text-surface-400">
        <span className="flex items-center gap-1">
          <Download className="h-3.5 w-3.5 text-surface-400 shrink-0" />
          {formatNumber(pkg.weeklyDownloads)}/wk
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-surface-400 shrink-0" />
          {timeAgo(pkg.updatedAt)}
        </span>
        {pkg.author?.name && (
          <span className="ml-auto truncate font-medium text-surface-600">
            {pkg.author.name}
          </span>
        )}
      </div>

      {/* Keywords / Tags: Sleek Modern Chips */}
      {pkg.keywords.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pkg.keywords.slice(0, 4).map((kw) => (
            <span
              key={kw}
              className="rounded-md bg-surface-50 border border-surface-200 px-2.5 py-0.5 text-xs text-surface-500 hover:border-brand-200 hover:text-brand-600 transition-all font-sans font-medium"
            >
              {kw}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
