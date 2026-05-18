"use client";

import React, { useState } from "react";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { Menu, X, ChevronRight, BookOpen } from "lucide-react";
import Link from "next/link";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="w-full bg-surface-50 dark:bg-surface-950 min-h-screen">
      {/* ── MOBILE HEADER (Hidden on Desktop) ── */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-4 bg-surface-0/80 dark:bg-surface-950/80 backdrop-blur-md border-b border-surface-200 dark:border-surface-800">
        <div className="flex items-center gap-2">
          <Link href="/docs" className="flex items-center gap-1.5 text-xs font-semibold text-surface-500 hover:text-brand-blue transition-colors">
            <BookOpen className="h-4 w-4" />
            <span>Docs</span>
          </Link>
          <ChevronRight className="h-3 w-3 text-surface-300 dark:text-surface-600" />
          <span className="text-xs font-semibold text-surface-900 dark:text-surface-100">
            Guide
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="bracket-btn flex items-center justify-center p-2 rounded-lg"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* ── MOBILE SIDEBAR DRAWER OVERLAY (Hidden on Desktop) ── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[3px] lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          {/* Sliding Drawer Container */}
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-surface-0 dark:bg-surface-950 p-6 overflow-y-auto border-r border-surface-200 dark:border-surface-800 shadow-2xl lg:hidden flex flex-col justify-between animate-[slideInLeftElastic_0.4s_cubic-bezier(0.34,1.56,0.64,1)_both]">
            <div className="space-y-6">
              {/* Drawer Title Header */}
              <div className="flex items-center justify-between pb-4 border-b border-surface-100 dark:border-surface-800">
                <span className="font-mono text-xs font-bold tracking-widest text-surface-400 uppercase">
                  Documentation
                </span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="bracket-btn p-1.5 flex items-center justify-center hover:scale-95 transition-transform"
                  aria-label="Close menu"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Sidebar Links */}
              <DocsSidebar onLinkClick={() => setMobileOpen(false)} />
            </div>
            
            <div className="pt-4 border-t border-surface-100 dark:border-surface-800">
              <span className="text-[10px] font-mono text-surface-400">
                spm.dev &copy; {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </>
      )}

      {/* ── MAIN LAYOUT GRID ── */}
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-12 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Desktop Sticky Sidebar (Hidden on Mobile) */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-28 self-start max-h-[calc(100vh-120px)] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-surface-200 dark:scrollbar-thumb-surface-800">
            <DocsSidebar />
          </aside>

          {/* Docs Content Scroll Panel */}
          <article className="flex-1 min-w-0 w-full max-w-3xl">
            {children}
          </article>

        </div>
      </div>
    </div>
  );
}
