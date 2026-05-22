"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Terminal,
  FileCode2,
  CloudLightning,
  Cpu,
  ChevronRight
} from "lucide-react";

interface DocsSidebarProps {
  onLinkClick?: () => void;
}

interface SidebarLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcutCode: string;
}

interface SidebarSection {
  title: string;
  prefix: string;
  links: SidebarLink[];
}

export const DOCS_SECTIONS: SidebarSection[] = [
  {
    title: "GETTING STARTED",
    prefix: "01",
    links: [
      { label: "Introduction", href: "/docs", icon: BookOpen, shortcutCode: "I" },
      { label: "Installation & CLI", href: "/docs/getting-started", icon: Terminal, shortcutCode: "T" },
    ],
  },
  {
    title: "CONFIGURATION",
    prefix: "02",
    links: [
      { label: "spm.yaml Reference", href: "/docs/spm-yaml-reference", icon: FileCode2, shortcutCode: "R" },
    ],
  },
  {
    title: "WORKFLOWS",
    prefix: "03",
    links: [
      { label: "Package Publishing", href: "/docs/publishing", icon: CloudLightning, shortcutCode: "P" },
    ],
  },
  {
    title: "API REFERENCE",
    prefix: "04",
    links: [
      { label: "Skill Runtime API", href: "/docs/skill-api", icon: Cpu, shortcutCode: "A" },
    ],
  },
];

export function DocsSidebar({ onLinkClick }: DocsSidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="w-full space-y-8 select-none font-mono">
      {DOCS_SECTIONS.map((section, secIdx) => (
        <div key={secIdx} className="space-y-3">
          
          {/* Section Header: Premium modern index style */}
          <div className="flex items-center gap-2 px-1 mb-1.5">
            <span className="text-[11px] font-bold text-[#1B5FED] tracking-wider font-mono select-none">
              {section.prefix}
            </span>
            <h4 className="text-xs font-bold text-black/65 tracking-wider uppercase select-none">
              {section.title}
            </h4>
          </div>

          {/* Directory Hierarchy Tree: Connective vertical border */}
          <div className="border-l border-black/10 ml-[10px] pl-4 space-y-2.5 relative">
            {section.links.map((link, linkIdx) => {
              const isActive = pathname === link.href || pathname === `${link.href}/`;
              const Icon = link.icon;

              return (
                <Link
                  key={linkIdx}
                  href={link.href}
                  onClick={onLinkClick}
                  className={`group relative flex items-center justify-between px-3 py-2.5 text-[13px] font-mono tracking-tight rounded-[6px] border transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-white border-2 border-black text-[#1B5FED] shadow-[3.5px_3.5px_0px_rgba(27,95,237,1)] -translate-x-0.5 -translate-y-0.5 font-bold"
                      : "bg-white border border-black/25 text-black/80 shadow-[1.5px_1.5px_0px_rgba(0,0,0,0.12)] hover:text-black hover:border-black hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5"
                  }`}
                >
                  {/* Left Side: Icon & Title */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? "text-[#1B5FED] stroke-[2.5px]" : "text-black/50 group-hover:text-black"
                      }`}
                    />
                    <span className="truncate font-sans font-medium tracking-tight">
                      {isActive ? (
                        <span className="font-semibold text-black">
                          {link.label}
                        </span>
                      ) : (
                        link.label
                      )}
                    </span>
                  </div>

                  {/* Right Side: Keycap Shortcut hint */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isActive ? (
                      <span className="font-mono text-[9px] bg-[#1B5FED] text-white px-1.5 py-0.5 rounded border border-[#1B5FED] font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_rgba(0,0,0,0.15)] select-none">
                        {link.shortcutCode}
                      </span>
                    ) : (
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 font-mono text-[9px] bg-white border border-black/10 text-black/45 px-1.5 py-0.5 rounded shadow-[1px_1px_0px_rgba(0,0,0,0.05)] uppercase select-none">
                        {link.shortcutCode}
                      </span>
                    )}
                  </div>

                  {/* Connective branch connector node (retro cosmetic detail) */}
                  <div 
                    className={`absolute top-[20px] h-[1px] bg-black/10 ${isActive ? "bg-[#1B5FED]/40" : ""}`} 
                    style={{ left: "-16px", width: "16px" }} 
                  />
                </Link>
              );
            })}
          </div>

        </div>
      ))}
    </nav>
  );
}
