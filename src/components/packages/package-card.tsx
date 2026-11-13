"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Download, Clock, Eye } from "lucide-react";
import { formatNumber, timeAgo } from "@/lib/utils";
import type { PackageSearchResult } from "@/types/package";

interface PackageCardProps {
  pkg: PackageSearchResult;
  onQuickPeek?: () => void;
}

export function PackageCard({ pkg, onQuickPeek }: PackageCardProps) {
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
      className="group block rounded-[8px] border border-black/5 bg-[#F7F7F7] p-5 sm:p-6 transition-all duration-200 hover:bg-white hover:border-[#1A5FED]/30 hover:shadow-[0_8px_30px_rgba(27,95,237,0.06)] hover:-translate-y-0.5 cursor-pointer font-sans"
    >
      {/* Header Info */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-xs text-black/40 mb-1">
            {pkg.namespace}/
          </div>
          <h3 className="truncate text-lg font-semibold text-black transition-colors duration-200 group-hover:text-[#1A5FED]">
            {pkg.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-black/60">
            {pkg.description}
          </p>
        </div>
        
        {/* Top-Right Badges & Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="rounded-[2px] border border-black/10 bg-white px-2 py-0.5 font-mono text-xs text-black/60 shadow-xs">
            v{pkg.latestVersion}
          </span>
          {onQuickPeek && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickPeek();
              }}
              className="p-1 rounded-[2px] border border-black/10 bg-white text-black/40 hover:text-[#1A5FED] hover:border-[#1A5FED] hover:bg-[#1A5FED]/5 transition-colors cursor-pointer shadow-xs"
              title="Quick Peek (Space)"
              aria-label="Quick Peek"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Command Deck */}
      <div className="mt-5 flex items-center gap-2 bg-white border border-black/10 rounded-[4px] p-1.5 pl-3 relative overflow-hidden">
        <code className="flex-1 truncate font-mono text-xs text-black font-medium select-all">
          <span className="text-[#1A5FED] select-none font-bold">$</span> {installCmd}
        </code>
        
        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className={`shrink-0 rounded-[2px] px-3 py-1 font-mono text-xs font-semibold transition-all duration-150 cursor-pointer ${
            copied
              ? "bg-[#1A5FED] text-white border border-transparent shadow-xs"
              : "bg-[#F7F7F7] text-black/75 border border-black/10 hover:bg-black hover:text-white"
          }`}
          title="Copy install command"
        >
          {copied ? "COPIED" : "COPY"}
        </button>
      </div>

      {/* Footer Metadata */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-black/45 font-mono pt-3 border-t border-black/5">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <Download className="h-3.5 w-3.5 text-black/40" />
            {formatNumber(pkg.totalDownloads)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-black/40" />
            {timeAgo(pkg.updatedAt)}
          </span>
        </div>

        {/* Tags / Keywords */}
        {pkg.keywords && pkg.keywords.length > 0 && (
          <div className="flex items-center gap-1.5">
            {pkg.keywords.slice(0, 2).map((keyword) => (
              <span
                key={keyword}
                className="rounded-[2px] bg-black/5 px-1.5 py-0.5 text-[10px] text-black/60 font-mono"
              >
                #{keyword}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
