"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Terminal, Copy, Check, Globe } from "lucide-react";

interface FooterLink {
  label: string;
  prefix: string;
  href: string;
}

const footerLinks: Record<string, FooterLink[]> = {
  PRODUCT: [
    { label: "PRICING", prefix: "P", href: "/pricing/" },
    { label: "DOCUMENTATION", prefix: "D", href: "/docs" },
  ],
  RESOURCES: [
    { label: "CLI GUIDE", prefix: "C", href: "/docs/getting-started" },
    { label: "PUBLISHING", prefix: "V", href: "/docs/publishing" },
    { label: "API REFERENCE", prefix: "A", href: "/docs/skill-api" },
    { label: "STATUS", prefix: "S", href: "https://status.spm.dev" },
  ],
  COMPANY: [
    { label: "ABOUT", prefix: "O", href: "/search/" },
    { label: "BLOG", prefix: "B", href: "/search/" },
    { label: "TERMS", prefix: "T", href: "/search/" },
    { label: "PRIVACY", prefix: "R", href: "/search/" },
  ],
};

export function PublicFooter() {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  if (pathname === "/connect" || pathname === "/connect/") return null;

  const copyCommand = () => {
    navigator.clipboard.writeText("npm install -g @agent-spm/cli");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t-2 border-black/10 bg-[#F5F5F5] text-black">
      {/* ── Outer border container for retro board feel ── */}
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-12 py-16">
        
        {/* Main Grid: divide-x adds thin border columns */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-8 pb-12 border-b border-black/10">
          
          {/* Brand & CLI Mockup Column (Takes 2 grid columns on large screens) */}
          <div className="lg:col-span-2 flex flex-col justify-between space-y-8 pr-0 lg:pr-8">
            <div>
              {/* Logo Row */}
              <div className="flex items-center gap-2 mb-4">
                <Image 
                  src="/images/logo.png" 
                  alt="Agent SPM Logo" 
                  width={32} 
                  height={32} 
                  className="object-contain filter grayscale-0"
                />
                <span className="font-mono text-xl font-bold tracking-tight uppercase">
                  spm.dev
                </span>
              </div>
              <p className="font-sans text-sm text-black/60 leading-relaxed max-w-sm">
                The high-performance, decentralized registry and package manager for AI Agent Skills. Built for production-grade speed and reliability.
              </p>
            </div>

            {/* Interactive Terminal Clipboard Snippet */}
            <div className="w-full max-w-sm rounded-[6px] border border-black/10 bg-[#E8E9ED] p-3.5 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs font-semibold text-black/50">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>QUICK INSTALL</span>
                </div>
                <button
                  onClick={copyCommand}
                  className="bracket-btn h-6 w-6 p-0 flex items-center justify-center rounded-[3px] bg-black/5 hover:bg-brand-blue hover:text-white transition-all scale-95 group-hover:scale-100"
                  aria-label="Copy install command"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
              <div className="mt-2.5 font-mono text-sm flex items-center gap-1.5 select-all">
                <span className="text-[#1B5FED] font-bold">$</span>
                <span className="font-medium text-black">npm install -g @agent-spm/cli</span>
              </div>
            </div>
          </div>

          {/* Links Columns (3 grid columns) */}
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section} className="flex flex-col space-y-4">
                <h3 className="font-mono text-xs font-bold tracking-widest text-black/40 uppercase">
                  {section}
                </h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="group flex items-center font-mono text-[13px] tracking-tight text-black/70 hover:text-[#1B5FED] transition-colors"
                      >
                        <span className="text-[#1B5FED]/0 group-hover:text-[#1B5FED] group-hover:mr-1 transition-all duration-150">
                          [
                        </span>
                        <span className="font-semibold text-black/35 group-hover:text-[#1B5FED] transition-colors">
                          {link.prefix}
                        </span>
                        <span className="text-[#1B5FED]/0 group-hover:text-[#1B5FED] group-hover:ml-1 transition-all duration-150">
                          ]
                        </span>
                        <span className="ml-1.5 font-medium tracking-wide">
                          {link.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Footer Bottom Row */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-black/45">
          
          {/* Copyright */}
          <div>
            &copy; {new Date().getFullYear()} SPM. BUILT FOR THE AGENT ECOSYSTEM.
          </div>

          {/* Dynamic Status / System State */}
          <div className="flex items-center gap-6">
            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-[4px] border border-black/5 bg-[#E8E9ED]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-[10px] tracking-wider uppercase text-emerald-700">
                REGISTRY: OPERATIONAL
              </span>
            </div>

            {/* Network / Geography */}
            <div className="flex items-center gap-1.5 font-semibold text-[10px] tracking-widest uppercase">
              <Globe className="h-3.5 w-3.5 text-black/30" />
              <span>GLOBAL NODE</span>
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
}
