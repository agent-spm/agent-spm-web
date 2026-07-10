"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const XIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const DiscordIcon = ({ size = 22 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" />
  </svg>
);

const GithubIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const YoutubeIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.5 12 3.5 12 3.5s-7.518 0-9.388.553a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.553 9.388.553 9.388.553s7.518 0 9.388-.553a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const NavButton = ({
  prefixChar,
  label,
  active = false,
  icon,
  href,
  ariaLabel
}: {
  prefixChar?: string;
  label?: string;
  active?: boolean;
  icon?: React.ReactNode;
  href?: string;
  ariaLabel?: string;
}) => {
  const hasSpaces = label && label.includes(' ');
  const content = (
    <button className={`bracket-btn ${active ? 'active' : ''}`} aria-label={ariaLabel || label}>
      {icon ? (
        <span className="flex items-center justify-center">{icon}</span>
      ) : (
        <>
          <span className="opacity-50">[{prefixChar}]</span>
          <span
            className="ml-1.5"
            style={hasSpaces ? { wordSpacing: '-0.28em', letterSpacing: '-0.06em' } : undefined}
          >
            {label}
          </span>
        </>
      )}
    </button>
  );
  if (href) {
    const isExternal = href.startsWith("http");
    return (
      <Link
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
      >
        {content}
      </Link>
    );
  }
  return content;
};

// 3×3 grid dots icon
const GridMenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <rect x="2" y="2" width="3" height="3" rx="0.5" />
    <rect x="8.5" y="2" width="3" height="3" rx="0.5" />
    <rect x="15" y="2" width="3" height="3" rx="0.5" />
    <rect x="2" y="8.5" width="3" height="3" rx="0.5" />
    <rect x="8.5" y="8.5" width="3" height="3" rx="0.5" />
    <rect x="15" y="8.5" width="3" height="3" rx="0.5" />
    <rect x="2" y="15" width="3" height="3" rx="0.5" />
    <rect x="8.5" y="15" width="3" height="3" rx="0.5" />
    <rect x="15" y="15" width="3" height="3" rx="0.5" />
  </svg>
);

const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

interface MobileNavItemProps {
  num: string;
  label: string;
  shortcut: string;
  href: string;
  onClick: () => void;
  index: number;
}

const MobileNavItem = ({ num, label, shortcut, href, onClick, index }: MobileNavItemProps) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between py-5 border-b border-black/5 group cursor-pointer active:bg-black/[0.02] transition-colors"
      style={{
        animation: `slideInRightElastic 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both`,
        animationDelay: `${0.06 * index}s`
      }}
    >
      <div className="flex items-baseline gap-4">
        {/* Index */}
        <span className="font-mono text-xs text-brand-blue/70 font-semibold">{num}</span>
        {/* Menu label */}
        <span className="font-sans text-xl font-medium tracking-tight text-black group-hover:translate-x-1 transition-transform duration-200 uppercase">
          {label}
        </span>
      </div>

      {/* Keycap Indicator */}
      <span className="font-mono text-xs bg-black/5 text-black/40 px-2 py-0.5 rounded border border-black/5 group-hover:bg-brand-blue group-hover:text-white group-hover:border-transparent transition-all duration-200 uppercase">
        {shortcut}
      </span>
    </Link>
  );
};

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="flex items-center gap-2 sm:gap-[10px] py-4 sm:py-5 w-full" aria-label="Main navigation">

        {/* Logo */}
        <Link href="/" className="flex items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-80 active:scale-95 transition-all">
          <Image src="/images/logo.png" alt="Agent SPM Logo" width={32} height={32} className="object-contain" />
        </Link>

        {/* ── MOBILE ONLY: Youtube + Github + X + Discord right next to logo ── */}
        <div className="flex items-center gap-2 lg:hidden">
          <NavButton ariaLabel="Watch us on YouTube" icon={<YoutubeIcon size={18} />} href="/search/" />
          <NavButton ariaLabel="Follow us on GitHub" icon={<GithubIcon size={18} />} href="https://github.com/agent-spm" />
          <NavButton ariaLabel="Follow us on X (Twitter)" icon={<XIcon size={18} />} href="https://x.com/agentspm" />
          <NavButton ariaLabel="Join us on Discord" icon={<DiscordIcon size={20} />} href="https://discord.gg/Qgg73H9Jm" />
        </div>

        {/* ── DESKTOP ONLY: nav links ── */}
        <div className="hidden lg:flex items-center gap-[5px] xl:gap-[10px] flex-nowrap">
          {/* <NavButton prefixChar="B" label="BLOG"    href="/search/" /> */}
          <NavButton prefixChar="D" label="DOCS" href="/docs" />
          <NavButton prefixChar="P" label="PRICING" href="/pricing/" />
          <NavButton prefixChar="T" label="TALK TO US" href="/connect/" />
        </div>

        {/* ── DESKTOP ONLY: icon links (pushed to the right) ── */}
        <div className="hidden lg:flex items-center gap-[5px] xl:gap-[10px] flex-nowrap ml-auto">
          <NavButton ariaLabel="Watch us on YouTube" icon={<YoutubeIcon size={20} />} href="/search/" />
          <NavButton ariaLabel="Follow us on GitHub" icon={<GithubIcon size={20} />} href="https://github.com/agent-spm" />
          <NavButton ariaLabel="Follow us on X (Twitter)" icon={<XIcon size={20} />} href="https://x.com/agentspm" />
          <NavButton ariaLabel="Join us on Discord" icon={<DiscordIcon size={22} />} href="https://discord.gg/Qgg73H9Jm" />
        </div>

        {/* ── MOBILE ONLY: Menu Grid Toggle Button ── */}
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

      {/* ── PREMIUM MOBILE FLOATING CARD SPRING OVERLAY ── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/35 backdrop-blur-[10px] p-3 sm:p-4 flex flex-col justify-stretch animate-[fadeIn_0.25s_ease-out]"
          onClick={() => setMenuOpen(false)}
        >
          {/* Unfolding Elastic Card Container */}
          <div
            className="w-full h-full bg-[#F4F4F2]/98 backdrop-blur-md rounded-[20px] shadow-2xl border border-white/40 p-6 flex flex-col justify-between overflow-y-auto animate-[scaleInFade_0.4s_cubic-bezier(0.34,1.56,0.64,1)_both]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <div className="flex items-center gap-2">
                <Image src="/images/logo.png" alt="Agent SPM Logo" width={28} height={28} className="object-contain" />
                <span className="font-mono text-xs font-bold tracking-widest text-black/40 uppercase">NAVIGATION</span>
              </div>

              <button
                className="bracket-btn p-2 flex items-center justify-center active:scale-95 transition-transform"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Staggered Elastic Items */}
            <div className="flex flex-col my-auto pt-4 pb-6">
              <MobileNavItem num="01" label="Docs" shortcut="[D]" href="/docs" onClick={() => setMenuOpen(false)} index={0} />
              <MobileNavItem num="02" label="Pricing" shortcut="[P]" href="/pricing/" onClick={() => setMenuOpen(false)} index={1} />
              <MobileNavItem num="03" label="Talk to us" shortcut="[T]" href="/connect/" onClick={() => setMenuOpen(false)} index={2} />
            </div>

            {/* Footer with branding */}
            <div className="pt-5 border-t border-black/5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs text-black/40 font-medium">FOLLOW US</span>
                <div className="flex items-center gap-3">
                  <a
                    href="/search/"
                    className="bracket-btn w-9 h-9 flex items-center justify-center active:scale-95 transition-all"
                    aria-label="Watch us on YouTube"
                  >
                    <YoutubeIcon size={16} />
                  </a>
                  <a
                    href="https://github.com/agent-spm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bracket-btn w-9 h-9 flex items-center justify-center active:scale-95 transition-all"
                    aria-label="Follow us on GitHub"
                  >
                    <GithubIcon size={16} />
                  </a>
                  <a
                    href="https://x.com/agentspm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bracket-btn w-9 h-9 flex items-center justify-center active:scale-95 transition-all"
                    aria-label="Follow us on X"
                  >
                    <XIcon size={16} />
                  </a>
                  <a
                    href="https://discord.gg/Qgg73H9Jm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bracket-btn w-9 h-9 flex items-center justify-center active:scale-95 transition-all"
                    aria-label="Join Discord"
                  >
                    <DiscordIcon size={18} />
                  </a>
                </div>
              </div>
              <span className="font-mono text-[9px] text-black/35 tracking-wider text-center">
                © {new Date().getFullYear()} AGENT SPM PLATFORM
              </span>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
