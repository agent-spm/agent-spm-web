"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarItem {
  label: string;
  href: string;
  shortcutCode: string;
}

interface SidebarParent {
  label: string;
  href: string;
  shortcutCode: string;
  children: SidebarItem[];
}

type SidebarNode = 
  | { type: "top-level"; label: string; href: string; shortcutCode: string }
  | { type: "parent"; label: string; href: string; shortcutCode: string; children: SidebarItem[] };

const SIDEBAR_TREE: SidebarNode[] = [
  {
    type: "top-level",
    label: "Introduction",
    href: "/docs",
    shortcutCode: "I",
  },
  {
    type: "parent",
    label: "Core Concepts",
    href: "/docs/getting-started",
    shortcutCode: "C",
    children: [
      { label: "Installation & CLI", href: "/docs/getting-started#cli", shortcutCode: "T" },
      { label: "spm.yaml Reference", href: "/docs/spm-yaml-reference", shortcutCode: "R" },
    ],
  },
  {
    type: "parent",
    label: "Workflows",
    href: "/docs/publishing",
    shortcutCode: "W",
    children: [
      { label: "Package Publishing", href: "/docs/publishing#publishing", shortcutCode: "P" },
    ],
  },
  {
    type: "top-level",
    label: "Skill Runtime API",
    href: "/docs/skill-api",
    shortcutCode: "A",
  },
];

// Flat list for bottom previous/next document cards
export interface FlatDocsLink {
  label: string;
  href: string;
}

export const FLAT_DOCS_LINKS: FlatDocsLink[] = [
  { label: "Introduction", href: "/docs" },
  { label: "Core Concepts", href: "/docs/getting-started" },
  { label: "spm.yaml Reference", href: "/docs/spm-yaml-reference" },
  { label: "Package Publishing", href: "/docs/publishing" },
  { label: "Skill Runtime API", href: "/docs/skill-api" },
];

interface DocsSidebarProps {
  onLinkClick?: () => void;
}

export function DocsSidebar({ onLinkClick }: DocsSidebarProps) {
  const pathname = usePathname();
  const [currentHash, setCurrentHash] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentHash(window.location.hash);

      const handleHashChange = () => {
        setCurrentHash(window.location.hash);
      };

      window.addEventListener("hashchange", handleHashChange);
      return () => {
        window.removeEventListener("hashchange", handleHashChange);
      };
    }
  }, [pathname]);

  // Handle manual click events to instantly trigger slide transition
  const handleLinkClick = (href: string) => {
    if (href.includes("#")) {
      const parts = href.split("#");
      setCurrentHash("#" + parts[1]);
    } else {
      setCurrentHash("");
    }
    if (onLinkClick) onLinkClick();
  };

  // Determine if a specific link path is currently active
  const isLinkActive = (href: string) => {
    const cleanPath = pathname.replace(/\/$/, "");
    const cleanHref = href.replace(/\/$/, "");
    
    if (cleanHref.includes("#")) {
      const parts = cleanHref.split("#");
      return cleanPath === parts[0] && currentHash === "#" + parts[1];
    }
    
    // Parent headers trigger active only if exactly on their route and not on any children hash
    if (cleanHref === "/docs/getting-started") {
      return cleanPath === cleanHref && currentHash !== "#cli";
    }
    if (cleanHref === "/docs/publishing") {
      return cleanPath === cleanHref && currentHash !== "#publishing";
    }
    
    return cleanPath === cleanHref;
  };

  // Resolve exact coordinates and path percentages for the dynamic curved sliding active dot
  const getActiveState = () => {
    const cleanPath = pathname.replace(/\/$/, "");
    
    // 1. Introduction (Row 1, top-level first)
    if (cleanPath === "/docs") {
      return { x: 16, y: 22, percent: 0 };
    }
    
    // 2. Core Concepts (Row 2, parent)
    if (cleanPath === "/docs/getting-started") {
      if (currentHash === "#cli") {
        return { x: 32, y: 108, percent: 33.58 }; // Installation & CLI child
      }
      return { x: 16, y: 66, percent: 16.42 }; // Parent overview
    }
    
    // 3. spm.yaml Reference (Row 4, child 2)
    if (cleanPath === "/docs/spm-yaml-reference") {
      return { x: 32, y: 148, percent: 48.51 };
    }
    
    // 4. Workflows (Row 5, parent)
    if (cleanPath === "/docs/publishing") {
      if (currentHash === "#publishing") {
        return { x: 32, y: 232, percent: 82.84 }; // Package Publishing child
      }
      return { x: 16, y: 190, percent: 65.67 }; // Parent overview
    }
    
    // 5. Skill Runtime API (Row 7, top-level last)
    if (cleanPath === "/docs/skill-api") {
      return { x: 16, y: 274, percent: 100 };
    }
    
    // Fallback default
    return { x: 16, y: 22, percent: 0 };
  };

  const { x: activeX, y: activeY, percent: activePercent } = getActiveState();

  // Inactive state triggers for persistent ends dots
  const isIntroActive = isLinkActive("/docs");
  const isSkillApiActive = isLinkActive("/docs/skill-api");

  // Asymmetrical dynamic Bezier track path string (height 296px)
  const pathString = "M 16,22 L 16,66 C 16,87 32,87 32,108 L 32,148 C 32,169 16,169 16,190 C 16,211 32,211 32,232 C 32,253 16,253 16,274";

  return (
    <nav className="w-full select-none font-sans relative h-[296px] flex flex-col justify-start">
      
      {/* ── UNIFIED BACKGROUND SVG TRACK LINE (With Interactive Active Fill) ── */}
      <svg className="absolute left-0 top-0 w-12 h-[296px] text-zinc-200/80 pointer-events-none z-0" fill="none">
        {/* Background Empty Track (Light Zinc) */}
        <path 
          d={pathString} 
          stroke="#E4E4E7" 
          strokeWidth="3" 
          strokeLinecap="round"
        />

        {/* Foreground Filled Track (Lighter Greyish Active SVG Liquid Fill) */}
        <path 
          d={pathString} 
          stroke="#A1A1AA" /* zinc-400 (lighter greyish highlight) */
          strokeWidth="3" 
          strokeLinecap="round"
          pathLength="100"
          style={{
            strokeDasharray: "100",
            strokeDashoffset: 100 - activePercent,
            transition: 'stroke-dashoffset 0.3s ease-in-out',
          }}
        />
        
        {/* Inactive Persistent Gray Dot at Introduction Parent */}
        <circle 
          cx="16" 
          cy="22" 
          r="4" 
          fill="#D4D4D8" 
          stroke="#A1A1AA" 
          strokeWidth="1"
          className={cn("transition-opacity duration-200", isIntroActive ? "opacity-0" : "opacity-100")}
        />

        {/* Inactive Persistent Gray Dot at Skill Runtime API lifecycle */}
        <circle 
          cx="16" 
          cy="274" 
          r="4" 
          fill="#D4D4D8" 
          stroke="#A1A1AA" 
          strokeWidth="1"
          className={cn("transition-opacity duration-200", isSkillApiActive ? "opacity-0" : "opacity-100")}
        />
      </svg>

      {/* ── DYNAMIC SLIDING ACTIVE DOT (Perfect 10px scale & centered along Bezier curves) ── */}
      <div 
        className="absolute w-[10px] h-[10px] bg-black rounded-full z-20 transition-all duration-300 ease-in-out shadow-[0_0_8px_rgba(0,0,0,0.25)] ring-4 ring-black/10 pointer-events-none"
        style={{
          left: 0,
          top: 0,
          offsetPath: `path('${pathString}')`,
          offsetDistance: `${activePercent}%`,
          transitionProperty: 'offset-distance',
        }}
      />

      {/* ── RENDER SIDEBAR TREE Category loops ── */}
      <div className="relative z-10 flex flex-col w-full h-[296px] justify-start">
        {SIDEBAR_TREE.map((node, nodeIdx) => {
          if (node.type === "top-level") {
            const isActive = isLinkActive(node.href);

            return (
              <div 
                key={nodeIdx} 
                className="relative flex items-center h-[44px] w-full group"
              >
                <div className="pl-[30px] flex-1 min-w-0 flex items-center justify-between">
                  <Link
                    href={node.href}
                    onClick={() => handleLinkClick(node.href)}
                    className={cn(
                      "text-[17px] sm:text-[18px] tracking-tight transition-all duration-200 cursor-pointer block truncate w-full",
                      isActive 
                        ? "font-bold text-black" 
                        : "font-semibold text-zinc-400 hover:text-zinc-700"
                    )}
                  >
                    {node.label}
                  </Link>
                  <span className={cn(
                    "font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border mr-2 transition-all duration-200 select-none",
                    isActive
                      ? "bg-black border-black text-white font-bold"
                      : "opacity-0 group-hover:opacity-100 bg-white border-zinc-200 text-zinc-400"
                  )}>
                    {node.shortcutCode}
                  </span>
                </div>
              </div>
            );
          } else {
            const isParentActive = isLinkActive(node.href);
            const childrenHeight = node.children.length * 40; // 40px per child row

            return (
              <div key={nodeIdx} className="relative flex flex-col w-full">
                {/* Parent Row (44px) */}
                <div className="relative flex items-center h-[44px] w-full group">
                  <div className="pl-[30px] flex-1 min-w-0 flex items-center justify-between">
                    <Link
                      href={node.href}
                      onClick={() => handleLinkClick(node.href)}
                      className={cn(
                        "text-[17px] sm:text-[18px] tracking-tight transition-all duration-200 cursor-pointer block truncate w-full",
                        isParentActive 
                          ? "font-bold text-black" 
                          : "font-semibold text-zinc-400 hover:text-zinc-700"
                      )}
                    >
                      {node.label}
                    </Link>
                    <span className={cn(
                      "font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border mr-2 transition-all duration-200 select-none",
                      isParentActive
                        ? "bg-black border-black text-white font-bold"
                        : "opacity-0 group-hover:opacity-100 bg-white border-zinc-200 text-zinc-400"
                    )}>
                      {node.shortcutCode}
                    </span>
                  </div>
                </div>

                {/* Children List Container (Dynamic Height) */}
                <div 
                  className="relative flex flex-col w-full justify-start" 
                  style={{ height: `${childrenHeight}px` }}
                >
                  {node.children.map((child, childIdx) => {
                    const isChildActive = isLinkActive(child.href);
                    return (
                      <div 
                        key={childIdx} 
                        className="relative flex items-center h-[40px] w-full group"
                      >
                        <div className="pl-[46px] flex-1 min-w-0 flex items-center justify-between">
                          <Link
                            href={child.href}
                            onClick={() => handleLinkClick(child.href)}
                            className={cn(
                              "text-[15px] sm:text-[16px] tracking-tight transition-all duration-200 cursor-pointer block truncate w-full",
                              isChildActive 
                                ? "font-bold text-black" 
                                : "font-semibold text-zinc-400 hover:text-zinc-700"
                            )}
                          >
                            {child.label}
                          </Link>
                          <span className={cn(
                            "font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border mr-2 transition-all duration-200 select-none",
                            isChildActive
                              ? "bg-black border-black text-white font-bold"
                              : "opacity-0 group-hover:opacity-100 bg-white border-zinc-200 text-zinc-400"
                          )}>
                            {child.shortcutCode}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }
        })}
      </div>
    </nav>
  );
}
