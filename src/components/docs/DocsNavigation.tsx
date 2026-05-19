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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-16 pt-8 border-t border-surface-200 dark:border-surface-800">
      {/* Previous Card */}
      {prevLink ? (
        <Link
          href={prevLink.href}
          className="group flex items-center justify-between p-6 rounded-2xl border border-surface-200 dark:border-surface-800 hover:border-brand-blue/30 dark:hover:border-brand-blue/30 hover:bg-surface-50/50 dark:hover:bg-surface-900/30 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-900 group-hover:bg-brand-blue/10 transition-colors">
              <ChevronLeft className="h-5 w-5 text-surface-500 group-hover:text-brand-blue transition-colors" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest font-mono">
                Previous
              </span>
              <span className="block mt-0.5 text-base font-semibold text-surface-900 dark:text-surface-100">
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
          className="group flex items-center justify-between p-6 rounded-2xl border border-surface-200 dark:border-surface-800 hover:border-brand-blue/30 dark:hover:border-brand-blue/30 hover:bg-surface-50/50 dark:hover:bg-surface-900/30 transition-all duration-300 shadow-sm hover:shadow-md text-right"
        >
          <div className="flex items-center justify-between w-full">
            <div className="text-left">
              <span className="block text-[10px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest font-mono">
                Next Page
              </span>
              <span className="block mt-0.5 text-base font-semibold text-surface-900 dark:text-surface-100">
                {nextLink.label}
              </span>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-900 group-hover:bg-brand-blue/10 transition-colors">
              <ChevronRight className="h-5 w-5 text-surface-500 group-hover:text-brand-blue transition-colors" />
            </div>
          </div>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
    </div>
  );
}
