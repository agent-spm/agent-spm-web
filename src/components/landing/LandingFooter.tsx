"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PixelBox } from "./PixelBox";

export const LandingFooter = () => {
  return (
    <footer className="w-full bg-white pt-16 sm:pt-24 pb-0 relative overflow-hidden border-t border-black/5">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between gap-12 sm:gap-16 pb-16">
          {/* Left Brand Area (Exact from Figma node 534:713 - 541:56) */}
          <div className="max-w-sm flex flex-col items-start">
            {/* Logo Group 45 (40x40) */}
            <Link
              href="/"
              className="w-10 h-10 mb-6 rounded-[2px] shadow-sm overflow-hidden block hover:opacity-90 active:scale-95 transition-all"
              aria-label="Agent SPM"
            >
              <Image
                src="/images/figma/spm-logo-footer.svg"
                alt="Agent SPM"
                width={40}
                height={40}
                className="w-10 h-10 rounded-[2px] object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/images/figma/Group 45.png";
                }}
              />
            </Link>

            <h3 className="font-sans text-xl font-medium text-black leading-snug mb-1">
              Agent Skills
              <br />
              Package Manager
            </h3>

            <p className="font-sans text-lg font-medium text-black/80 mb-5">
              Intelligence should be simple.
            </p>

            <p className="font-sans text-xs text-black/55 leading-relaxed mb-6 max-w-[403px]">
              Check out recent announcements, the agent skills decoded series,
              and other in-depth posts about skills package manager behind the
              curtains.
            </p>

            <span className="font-sans text-xs text-black/45">
              © 2026 Agent SPM - All Rights Reserved
            </span>
          </div>

          {/* Right Columns (Figma Frame 32: Menu, Navigation, Company) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-14 lg:gap-20">
            {/* Column 1: Menu */}
            <div>
              <h4 className="font-sans text-sm font-semibold text-black uppercase tracking-wider mb-4">
                Menu
              </h4>
              <ul className="space-y-2.5 font-sans text-sm text-black/60">
                <li>
                  <Link
                    href="/#blog"
                    onClick={(e) => {
                      if (window.location.pathname === '/' || window.location.pathname === '') {
                        e.preventDefault();
                        const lenis = (window as any).__lenis;
                        if (lenis) {
                          lenis.scrollTo('#blog', { offset: -30 });
                        } else {
                          document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' });
                        }
                        window.history.pushState(null, '', '#blog');
                      }
                    }}
                    className="hover:text-black transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-black transition-colors">
                    Docs
                  </Link>
                </li>
                <li>
                  <Link href="/connect" className="hover:text-black transition-colors">
                    Connect
                  </Link>
                </li>
                <li>
                  <Link href="/search" className="hover:text-black transition-colors">
                    Skills Registry
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Navigation */}
            <div>
              <h4 className="font-sans text-sm font-semibold text-black uppercase tracking-wider mb-4">
                Navigation
              </h4>
              <ul className="space-y-2.5 font-sans text-sm text-black/60">
                <li>
                  <a
                    href="https://github.com/agent-spm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-black transition-colors"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-black transition-colors"
                  >
                    X (Twitter)
                  </a>
                </li>
                <li>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-black transition-colors"
                  >
                    YouTube
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.gg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-black transition-colors"
                  >
                    Discord
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div>
              <h4 className="font-sans text-sm font-semibold text-black uppercase tracking-wider mb-4">
                Company
              </h4>
              <ul className="space-y-2.5 font-sans text-sm text-black/60">
                <li>
                  <Link href="/privacy" className="hover:text-black transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-black transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-black transition-colors">
                    Security
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:support@agent-spm.com"
                    className="hover:text-black transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Pixel Pattern with Auto-Scroll Generated Reveal: Airy sky cyan & azure scatter */}
      <div className="relative w-full pointer-events-none select-none z-0 -mt-6 sm:-mt-12 overflow-hidden">
        <PixelBox variant="footer-gradient" className="w-full" />
      </div>
    </footer>
  );
};
