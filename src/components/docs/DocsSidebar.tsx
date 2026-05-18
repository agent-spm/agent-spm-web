"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Terminal,
  FileCode2,
  CloudLightning,
  Cpu
} from "lucide-react";

interface DocsSidebarProps {
  onLinkClick?: () => void;
}

interface SidebarLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarSection {
  title: string;
  links: SidebarLink[];
}

export const DOCS_SECTIONS: SidebarSection[] = [
  {
    title: "Getting Started",
    links: [
      { label: "Introduction", href: "/docs", icon: BookOpen },
      { label: "Installation & CLI", href: "/docs/getting-started", icon: Terminal },
    ],
  },
  {
    title: "Configuration",
    links: [
      { label: "spm.yaml Reference", href: "/docs/spm-yaml-reference", icon: FileCode2 },
    ],
  },
  {
    title: "Workflows",
    links: [
      { label: "Package Publishing", href: "/docs/publishing", icon: CloudLightning },
    ],
  },
  {
    title: "API Reference",
    links: [
      { label: "Skill Runtime API", href: "/docs/skill-api", icon: Cpu },
    ],
  },
];

export function DocsSidebar({ onLinkClick }: DocsSidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="w-full space-y-8 select-none">
      {DOCS_SECTIONS.map((section, secIdx) => (
        <div key={secIdx} className="space-y-2">
          {/* Section title */}
          <h4 className="px-3 text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-widest">
            {section.title}
          </h4>

          {/* Section links */}
          <div className="space-y-1">
            {section.links.map((link, linkIdx) => {
              const isActive = pathname === link.href || pathname === `${link.href}/`;
              const Icon = link.icon;

              return (
                <Link
                  key={linkIdx}
                  href={link.href}
                  onClick={onLinkClick}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${isActive
                      ? "text-brand-blue bg-brand-blue/5 dark:bg-brand-blue/10 font-semibold"
                      : "text-surface-600 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-surface-200 dark:hover:bg-surface-900/60"
                    }`}
                >
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-brand-blue" : "text-surface-400 dark:text-surface-500"
                    }`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
