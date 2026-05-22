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
          
          {/* Section Header: Styled like code comments for premium developer look */}
          <div className="flex items-center gap-2 px-1">
            <span className="text-[10px] font-bold text-black/30 tracking-wider">
              //{section.prefix}
            </span>
            <h4 className="text-[11px] font-bold text-black/40 tracking-wider uppercase">
              {section.title}
            </h4>
          </div>

          {/* Directory Hierarchy Tree: Dotted vertical border connects the child links */}
          <div className="border-l-2 border-black/5 ml-[9px] pl-3.5 space-y-1.5 relative">
            {section.links.map((link, linkIdx) => {
              const isActive = pathname === link.href || pathname === `${link.href}/`;
              const Icon = link.icon;

              return (
                <Link
                  key={linkIdx}
                  href={link.href}
                  onClick={onLinkClick}
                  className={`group relative flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-[4px] transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "text-[#1B5FED] bg-[#1B5FED]/8 border border-[#1B5FED]/15 shadow-sm"
                      : "text-black/60 hover:text-black hover:bg-black/5 border border-transparent"
                  }`}
                >
                  {/* Left Side: Icon & Title */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                        isActive ? "text-[#1B5FED]" : "text-black/35 group-hover:text-black"
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

                  {/* Right Side: Keycap Shortcut hint or Chevron Active indicator */}
                  <div className="flex items-center gap-1.5">
                    {isActive ? (
                      <span className="flex items-center justify-center h-4 px-1 rounded-[3px] bg-[#1B5FED] text-white text-[8px] font-bold uppercase tracking-widest leading-none">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 font-mono text-[9px] bg-black/5 text-black/40 px-1 rounded border border-black/5 uppercase">
                        {link.shortcutCode}
                      </span>
                    )}
                  </div>

                  {/* Connective branch connector node (retro cosmetic detail) */}
                  <div className={`absolute left-0 top-[18px] w-1.5 h-[2px] bg-black/5 ${isActive ? "bg-[#1B5FED]/40" : ""}`} style={{ left: "-14px" }} />
                </Link>
              );
            })}
          </div>

        </div>
      ))}
    </nav>
  );
}
