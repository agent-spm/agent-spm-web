"use client";

import React, { useState, useEffect } from "react";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { Menu, X, ChevronRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Force instant scroll to very top to make navbar visible
    window.scrollTo({ top: 0, behavior: "auto" });
    document.documentElement.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  // Dynamically resolve section path breadcrumb
  const getCurrentDocTitle = () => {
    if (pathname.includes("/getting-started")) return "INSTALLATION & CLI";
    if (pathname.includes("/spm-yaml-reference")) return "SPM.YAML REFERENCE";
    if (pathname.includes("/publishing")) return "PACKAGE PUBLISHING";
    if (pathname.includes("/skill-api")) return "SKILL RUNTIME API";
    return "INTRODUCTION";
  };

  return (
    <div className="w-full bg-[#F5F5F5] text-black min-h-screen selection:bg-brand-blue/10 selection:text-[#1B5FED]">
      
      {/* ── MOBILE HEADER (Hidden on Desktop) ── */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3.5 bg-[#F5F5F5]/90 backdrop-blur-md border-b border-black/10">
        <div className="flex items-center gap-2">
          <Link 
            href="/docs" 
            className="flex items-center gap-1.5 text-xs font-mono font-bold text-black/55 hover:text-[#1B5FED] transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            <span>DOCS</span>
          </Link>
          <ChevronRight className="h-3 w-3 text-black/20" />
          <span className="text-xs font-mono font-bold text-black uppercase tracking-tight">
            {getCurrentDocTitle()}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="bracket-btn flex items-center justify-center p-2 rounded-[4px]"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>
      </header>

      {/* ── MOBILE SIDEBAR DRAWER OVERLAY (Hidden on Desktop) ── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[6px] lg:hidden animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setMobileOpen(false)}
          />
          
          {/* Sliding Drawer Container */}
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-[#F5F5F5] p-6 overflow-y-auto border-r border-black/10 shadow-2xl lg:hidden flex flex-col justify-between animate-[slideInRightElastic_0.4s_cubic-bezier(0.34,1.56,0.64,1)_both] [&_span]:!text-black [&_h4]:!text-black/40 [&_svg]:!text-black/50 [&_a]:!text-black/75 [&_a:hover]:!text-[#1B5FED] [&_a:hover]:!bg-black/5 [&_a.text-brand-blue]:!text-[#1B5FED] [&_a.text-brand-blue_svg]:!text-[#1B5FED] [&_a.text-brand-blue]:!bg-[#1B5FED]/8">
            <div className="space-y-6">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-black/10">
                <span className="font-mono text-xs font-bold tracking-widest text-black/40 uppercase">
                  DOCUMENTATION
                </span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="bracket-btn p-1.5 flex items-center justify-center active:scale-95 transition-transform"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Sidebar Links */}
              <DocsSidebar onLinkClick={() => setMobileOpen(false)} />
            </div>

            <div className="pt-4 border-t border-black/10 font-mono text-[9px] text-black/30 tracking-widest uppercase">
              spm.dev &copy; {new Date().getFullYear()}
            </div>
          </div>
        </>
      )}

      {/* ── MAIN LAYOUT GRID ── */}
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-12 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-12 items-start">

          {/* Desktop Sticky Sidebar (Hidden on Mobile) */}
          <aside className="hidden lg:block w-80 shrink-0 sticky top-28 self-start max-h-[calc(100vh-120px)] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-black/10 hover:scrollbar-thumb-black/25">
            {/* Retro card container wrap for extra premium look */}
            <div className="p-5 bg-black/[0.02] border border-black/5 rounded-[6px] shadow-sm">
              <DocsSidebar />
            </div>
          </aside>

          {/* Docs Content Scroll Panel */}
          <article className="flex-1 min-w-0 w-full max-w-3xl">
            
            {/* Desktop Breadcrumbs (Clean keyboard style) */}
            <div className="hidden lg:flex items-center gap-2 mb-8 font-mono text-xs text-black/40 font-bold select-none">
              <span className="flex items-center gap-1 hover:text-[#1B5FED] transition-colors cursor-pointer">
                [DOCS]
              </span>
              <ChevronRight className="h-3 w-3 text-black/20" />
              <span className="text-[#1B5FED] tracking-wide uppercase">
                {getCurrentDocTitle()}
              </span>
            </div>

            {/* Markdown / Core Document Body Container */}
            <div className="prose prose-slate max-w-none prose-headings:font-sans prose-headings:font-bold prose-h1:text-4xl prose-h1:tracking-tight prose-h2:text-2xl prose-h2:tracking-tight prose-p:text-black/75 prose-code:font-mono prose-code:text-[#1B5FED] prose-code:bg-[#1B5FED]/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-[3px] prose-code:before:content-none prose-code:after:content-none prose-strong:text-black prose-a:text-[#1B5FED] hover:prose-a:underline">
              {children}
            </div>

          </article>

        </div>
      </div>
    </div>
  );
}
