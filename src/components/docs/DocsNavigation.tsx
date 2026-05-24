"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DOCS_SECTIONS } from "./DocsSidebar";

export function DocsNavigation() {
  const pathname = usePathname();

  // Flatten sections link list to look up next/prev easily
  const flatLinks = DOCS_SECTIONS.flatMap((section) => section.links);
  
  // Find current index
  const currentIndex = flatLinks.findIndex(
    (link) => pathname === link.href || pathname === `${link.href}/`
  );

  if (currentIndex === -1) return null;

  const prevLink = currentIndex > 0 ? flatLinks[currentIndex - 1] : null;
  const nextLink = currentIndex < flatLinks.length - 1 ? flatLinks[currentIndex + 1] : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-16 pt-8 border-t-2 border-black/10 select-none">
      
      {/* Previous Card */}
      {prevLink ? (
        <Link
          href={prevLink.href}
          className="group flex items-center justify-between p-5 rounded-[6px] border border-black/10 hover:border-[#1B5FED]/30 bg-black/[0.01] hover:bg-black/[0.03] transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            {/* Keycap Style Button */}
            <div className="bracket-btn h-9 w-9 p-0 flex items-center justify-center rounded-[4px] bg-[#E8E9ED] group-hover:bg-[#1B5FED] group-hover:text-white transition-all">
              <ChevronLeft className="h-4 w-4" />
            </div>
            <div>
              <span className="block font-mono text-[10px] font-bold text-black/35 uppercase tracking-widest leading-none">
                PREVIOUS
              </span>
              <span className="block mt-1 font-sans text-sm font-semibold text-black tracking-tight group-hover:text-[#1B5FED] transition-colors">
                {prevLink.label}
              </span>
            </div>
          </div>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {/* Next Card */}
      {nextLink ? (
        <Link
          href={nextLink.href}
          className="group flex items-center justify-between p-5 rounded-[6px] border border-black/10 hover:border-[#1B5FED]/30 bg-black/[0.01] hover:bg-black/[0.03] transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between w-full">
            <div className="text-left">
              <span className="block font-mono text-[10px] font-bold text-black/35 uppercase tracking-widest leading-none">
                NEXT DOCUMENT
              </span>
              <span className="block mt-1 font-sans text-sm font-semibold text-black tracking-tight group-hover:text-[#1B5FED] transition-colors">
                {nextLink.label}
              </span>
            </div>
            {/* Keycap Style Button */}
            <div className="bracket-btn h-9 w-9 p-0 flex items-center justify-center rounded-[4px] bg-[#E8E9ED] group-hover:bg-[#1B5FED] group-hover:text-white transition-all">
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
    </div>
  );
}
