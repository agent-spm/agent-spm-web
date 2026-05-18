"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const NavButton = ({ 
  prefixChar, 
  label, 
  active = false,
  icon,
  href,
  ariaLabel,
  onClick
}: { 
  prefixChar?: string; 
  label?: string; 
  active?: boolean;
  icon?: React.ReactNode;
  href?: string;
  ariaLabel?: string;
  onClick?: () => void;
}) => {
  const content = (
    <button 
      className={`bracket-btn ${active ? 'active' : ''}`} 
      aria-label={ariaLabel || label}
      onClick={onClick}
    >
      {icon ? (
        <span className="flex items-center justify-center">{icon}</span>
      ) : (
        <>
          <span className="opacity-50">[{prefixChar}]</span>
          <span className="ml-1.5">{label}</span>
        </>
      )}
    </button>
  );
  if (href) return <Link href={href} onClick={onClick}>{content}</Link>;
  return content;
};

// 3×3 grid dots icon — matches Figma design
const GridMenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <rect x="2"   y="2"   width="3" height="3" rx="0.5"/>
    <rect x="8.5" y="2"   width="3" height="3" rx="0.5"/>
    <rect x="15"  y="2"   width="3" height="3" rx="0.5"/>
    <rect x="2"   y="8.5" width="3" height="3" rx="0.5"/>
    <rect x="8.5" y="8.5" width="3" height="3" rx="0.5"/>
    <rect x="15"  y="8.5" width="3" height="3" rx="0.5"/>
    <rect x="2"   y="15"  width="3" height="3" rx="0.5"/>
    <rect x="8.5" y="15"  width="3" height="3" rx="0.5"/>
    <rect x="15"  y="15"  width="3" height="3" rx="0.5"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const XIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const DiscordIcon = ({ size = 22 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z"/>
  </svg>
);

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="flex items-center gap-2 sm:gap-[10px] py-4 sm:py-5 w-full" aria-label="Main navigation">

        {/* Logo — Wrap in Link to refresh/navigate home */}
        <Link href="/" className="flex items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-80 active:scale-95 transition-all">
          <Image src="/images/logo.png" alt="Agent SPM Logo" width={32} height={32} className="object-contain" />
        </Link>

        {/* ── MOBILE ONLY: X + Discord right next to logo ── */}
        <div className="flex items-center gap-2 lg:hidden">
          <NavButton ariaLabel="Follow us on X (Twitter)" icon={<XIcon size={18} />} />
          <NavButton ariaLabel="Join us on Discord"       icon={<DiscordIcon size={20} />} />
        </div>

        {/* ── DESKTOP ONLY: all text nav links + social icons ── */}
        <div className="hidden lg:flex items-center gap-[10px] flex-nowrap">
          <NavButton prefixChar="H" label="HOME"    href="/" />
          <NavButton prefixChar="B" label="BLOG"    href="/search/" />
          <NavButton prefixChar="D" label="DOCS"    href="/search/" />
          <NavButton prefixChar="Y" label="YOUTUBE" href="/search/" />
          <NavButton prefixChar="G" label="GITHUB"  href="/search/" />
          <NavButton prefixChar="C" label="CONNECT" href="/connect/" />
          <NavButton ariaLabel="Follow us on X (Twitter)" icon={<XIcon size={20} />} />
          <NavButton ariaLabel="Join us on Discord"       icon={<DiscordIcon size={22} />} />
        </div>

        {/* ── MOBILE ONLY: 3×3 grid menu icon pushed to the far right ── */}
        <div className="ml-auto lg:hidden">
          <button 
            className="bracket-btn flex items-center justify-center" 
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <GridMenuIcon />
          </button>
        </div>

      </nav>

      {/* ── MOBILE MENU OVERLAY: Beautiful animated drawer with micro-interactions ── */}
      {menuOpen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-md flex justify-end animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setMenuOpen(false)}
        >
          {/* Drawer Container */}
          <div 
            className="w-[280px] h-full bg-[#F4F4F2] shadow-2xl p-6 flex flex-col gap-6 animate-[slideInRight_0.25s_cubic-bezier(0.16,1,0.3,1)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <div className="flex items-center gap-2">
                <Image src="/images/logo.png" alt="Agent SPM Logo" width={28} height={28} className="object-contain" />
                <span className="font-mono text-sm font-semibold tracking-tight text-black">SPM MENU</span>
              </div>
              <button 
                className="bracket-btn p-1.5 flex items-center justify-center active:scale-95 transition-transform" 
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Nav Links */}
            <div className="flex flex-col gap-3">
              <NavButton prefixChar="H" label="HOME"    href="/" onClick={() => setMenuOpen(false)} />
              <NavButton prefixChar="B" label="BLOG"    href="/search/" onClick={() => setMenuOpen(false)} />
              <NavButton prefixChar="D" label="DOCS"    href="/search/" onClick={() => setMenuOpen(false)} />
              <NavButton prefixChar="Y" label="YOUTUBE" href="/search/" onClick={() => setMenuOpen(false)} />
              <NavButton prefixChar="G" label="GITHUB"  href="/search/" onClick={() => setMenuOpen(false)} />
              <NavButton prefixChar="C" label="CONNECT" href="/connect/" onClick={() => setMenuOpen(false)} />
            </div>

            {/* Footer with social accounts & branding */}
            <div className="mt-auto pt-6 border-t border-black/5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <a 
                  href="https://x.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bracket-btn w-10 h-10 flex items-center justify-center active:scale-95 transition-all"
                  aria-label="Follow us on X"
                >
                  <XIcon size={18} />
                </a>
                <a 
                  href="https://discord.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bracket-btn w-10 h-10 flex items-center justify-center active:scale-95 transition-all"
                  aria-label="Join Discord"
                >
                  <DiscordIcon size={20} />
                </a>
              </div>
              <span className="font-sans text-[11px] text-black/40 font-medium">
                © {new Date().getFullYear()} Agent SPM. All rights reserved.
              </span>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
