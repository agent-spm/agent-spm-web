"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const SpmBlueMark = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="shrink-0"
  >
    <path d="M12 9H28V20H19.5L24 24.5V30H12V24.5H16.5L12 20V9Z" fill="#1B5FED" />
  </svg>
);

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
  ariaLabel,
  onClick,
}: {
  prefixChar?: string;
  label?: string;
  active?: boolean;
  icon?: React.ReactNode;
  href?: string;
  ariaLabel?: string;
  onClick?: (e: React.MouseEvent) => void;
}) => {

  const baseClass = "group flex items-center justify-center transition-all duration-200 active:scale-95 shadow-sm cursor-pointer select-none";

  // Typography: Fragment Mono, 400, 20px, -5% letter-spacing, uppercase, line-height 100%
  const typographyStyle: React.CSSProperties = {
    fontFamily: "'Fragment Mono', monospace",
    fontWeight: 400,
    fontSize: '20px',
    lineHeight: '100%',
    letterSpacing: '-0.05em',
    textTransform: 'uppercase',
  };

  let customClass = "";
  if (icon) {
    // Icon button style - exactly 36x36px to match nav button height
    customClass = `${baseClass} w-9 h-9 bg-white text-black rounded-[4px] border-2 border-white hover:bg-brand-blue hover:text-white hover:border-white hover:shadow-md hover:-translate-y-[1px]`;
  } else {
    // Text navigation button - height 36px (h-9) to fit 20px font
    if (active) {
      // Active pill: blue bg, white border, rounded-full
      customClass = `${baseClass} h-9 px-[12px] bg-brand-blue text-white rounded-full border-2 border-white shadow-md hover:bg-brand-blue/90`;
    } else {
      // Inactive: white bg, morphs into rounded-[18px] blue pill with white border on hover
      customClass = `${baseClass} h-9 px-[12px] bg-white text-black rounded-[4px] border-2 border-white hover:bg-brand-blue hover:text-white hover:border-white hover:rounded-[18px] hover:shadow-md hover:-translate-y-[1px]`;
    }
  }

  const inner = icon ? (
    <span className="flex items-center justify-center">{icon}</span>
  ) : (
    <span style={typographyStyle} className="flex items-center whitespace-nowrap">
      <span>[{prefixChar}]</span>
      <span style={{ marginLeft: '0.3em' }}>{label}</span>
    </span>
  );

  if (href) {
    const isExternal = href.startsWith("http");
    return (
      <Link
        href={href}
        onClick={onClick}
        className={customClass}
        aria-label={ariaLabel || label}
        aria-current={active ? "page" : undefined}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={customClass}
      aria-label={ariaLabel || label}
      onClick={onClick}
    >
      {inner}
    </button>
  );
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
  active?: boolean;
  onClick: () => void;
  index: number;
}

const MobileNavItem = ({ num, label, shortcut, href, active = false, onClick, index }: MobileNavItemProps) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex items-center justify-between min-h-[52px] py-4 px-2 border-b border-black/5 group cursor-pointer active:bg-black/[0.02] transition-colors ${
        active ? "bg-[#1A5FED]/[0.04] rounded-[8px] px-3 border-transparent" : ""
      }`}
      style={{
        animation: `slideInRightElastic 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both`,
        animationDelay: `${0.06 * index}s`
      }}
    >
      <div className="flex items-baseline gap-4 min-w-0">
        {/* Index */}
        <span className={`font-mono text-xs font-semibold ${active ? "text-[#1A5FED]" : "text-brand-blue/70"}`}>
          {num}
        </span>
        {/* Menu label */}
        <span
          className={`font-sans text-xl font-medium tracking-tight group-hover:translate-x-1 transition-transform duration-200 uppercase truncate ${
            active ? "text-[#1A5FED] font-semibold" : "text-black"
          }`}
        >
          {label}
        </span>
      </div>

      {/* Keycap Indicator */}
      <span
        className={`font-mono text-xs px-2 py-0.5 rounded border shrink-0 transition-all duration-200 uppercase ${
          active
            ? "bg-brand-blue text-white border-transparent font-bold"
            : "bg-black/5 text-black/45 border-black/5 group-hover:bg-brand-blue group-hover:text-white group-hover:border-transparent"
        }`}
      >
        {shortcut}
      </span>
    </Link>
  );
};

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Close mobile drawer on route transitions
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Synchronize native top-layer <dialog> modality
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (menuOpen && !dialog.open) {
      dialog.showModal();
    } else if (!menuOpen && dialog.open) {
      dialog.close();
    }
  }, [menuOpen]);

  // Global Keyboard Navigation Shortcuts: [S] Search Skills, [D] Docs, [C] Connect, [L] Login, [H] Home
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 's') {
        e.preventDefault();
        setMenuOpen(false);
        router.push('/search');
      } else if (key === 'd') {
        e.preventDefault();
        setMenuOpen(false);
        router.push('/docs');
      } else if (key === 'c') {
        e.preventDefault();
        setMenuOpen(false);
        router.push('/connect');
      } else if (key === 'l') {
        e.preventDefault();
        setMenuOpen(false);
        router.push('/login');
      } else if (key === 'h') {
        e.preventDefault();
        setMenuOpen(false);
        router.push('/');
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const isLinkActive = (href: string) => {
    if (!pathname) return false;
    const normalizedPath = pathname.replace(/\/$/, '');
    const normalizedHref = href.replace(/\/$/, '');
    return normalizedPath === normalizedHref || normalizedPath.startsWith(normalizedHref + '/');
  };

  const isGradientBg =
    !pathname ||
    pathname === '/' ||
    pathname === '/pricing' ||
    pathname === '/connect' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/verify-2fa');

  const isSearchActive = isLinkActive('/search') || isLinkActive('/packages');
  const isDocsActive = isLinkActive('/docs');
  const isConnectActive = isLinkActive('/connect');
  const isLoginActive = isLinkActive('/login') || isLinkActive('/signup') || isLinkActive('/verify-2fa');

  return (
    <>
      <nav
        className="flex flex-wrap items-center gap-1.5 sm:gap-[5px] py-4 sm:py-5 w-full transition-opacity duration-300 opacity-100"
        aria-label="Main navigation"
      >

        {/* Logo container - 36x36px matching nav pill height */}
        <Link
          href="/"
          aria-label="Agent SPM Home"
          className="flex items-center justify-center w-9 h-9 bg-white rounded-[4px] border-2 border-white flex-shrink-0 cursor-pointer hover:opacity-90 active:scale-95 transition-all shadow-sm"
        >
          <SpmBlueMark size={26} />
        </Link>

        {/* ── MOBILE & TABLET: Social icon buttons next to logo ── */}
        <div className="flex items-center gap-1.5 sm:gap-[6px] lg:hidden">
          <NavButton ariaLabel="Follow us on GitHub" icon={<GithubIcon size={18} />} href="https://github.com/agent-spm" />
          <NavButton ariaLabel="Watch us on YouTube" icon={<YoutubeIcon size={18} />} href="https://youtube.com/" />
          <NavButton ariaLabel="Follow us on X (Twitter)" icon={<XIcon size={18} />} href="https://x.com/agentspm" />
          <NavButton ariaLabel="Join us on Discord" icon={<DiscordIcon size={20} />} href="https://discord.gg/Qgg73H9Jm" />
        </div>

        {/* ── DESKTOP: nav links (36px pills, Skill Search replaces Blog) ── */}
        <div className="hidden lg:flex items-center gap-[5px] flex-nowrap">
          <NavButton prefixChar="S" label="SEARCH" href="/search" active={isSearchActive} />
          <NavButton prefixChar="D" label="DOCS" href="/docs" active={isDocsActive} />
          <NavButton prefixChar="C" label="CONNECT" href="/connect" active={isConnectActive} />
        </div>

        {/* ── DESKTOP: auth & icon links ── */}
        <div className="hidden lg:flex items-center gap-[5px] flex-nowrap ml-auto">
          <NavButton prefixChar="L" label="LOGIN" href="/login" active={isLoginActive} />

          {/* Adaptive hairline dock divider */}
          <div
            className={`w-[1px] h-[18px] mx-1 shrink-0 self-center transition-colors duration-200 ${
              isGradientBg ? "bg-white/40" : "bg-black/15"
            }`}
            aria-hidden="true"
          />

          <NavButton ariaLabel="Follow us on GitHub" icon={<GithubIcon size={20} />} href="https://github.com/agent-spm" />
          <NavButton ariaLabel="Watch us on YouTube" icon={<YoutubeIcon size={20} />} href="https://youtube.com/" />
          <NavButton ariaLabel="Follow us on X (Twitter)" icon={<XIcon size={20} />} href="https://x.com/agentspm" />
          <NavButton ariaLabel="Join us on Discord" icon={<DiscordIcon size={22} />} href="https://discord.gg/Qgg73H9Jm" />
        </div>

        {/* ── MOBILE & TABLET: Menu Grid Toggle Button ── */}
        <div className="ml-auto lg:hidden">
          <button
            type="button"
            className="w-9 h-9 bg-white text-black rounded-[4px] border-2 border-white flex items-center justify-center transition-all duration-200 active:scale-95 shadow-sm hover:bg-brand-blue hover:text-white hover:border-brand-blue cursor-pointer"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
            onClick={() => setMenuOpen(true)}
          >
            <GridMenuIcon />
          </button>
        </div>

      </nav>

      {/* ── ACCESSIBLE TOP-LAYER MOBILE NAVIGATION DRAWER ── */}
      <dialog
        id="mobile-nav-drawer"
        ref={dialogRef}
        aria-label="Mobile navigation menu"
        onCancel={(e) => {
          e.preventDefault();
          setMenuOpen(false);
        }}
        onClick={(e) => {
          if (e.target === dialogRef.current) {
            setMenuOpen(false);
          }
        }}
        className="spm-nav-dialog lg:hidden m-0 p-3 sm:p-4 w-full max-w-none h-full max-h-none bg-transparent border-0 open:flex items-center justify-center"
      >
        {menuOpen && (
          <div
            className="w-full max-w-md h-full max-h-[calc(100svh-1.5rem)] bg-[#F4F4F2]/98 backdrop-blur-md rounded-[20px] shadow-2xl border border-white/40 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto overscroll-contain animate-[scaleInFade_0.35s_cubic-bezier(0.34,1.56,0.64,1)_both]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-black/5 shrink-0">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 min-w-0"
              >
                <div className="w-8 h-8 rounded-[4px] bg-white border border-black/10 flex items-center justify-center shrink-0 shadow-xs">
                  <SpmBlueMark size={20} />
                </div>
                <span className="font-mono text-xs font-bold tracking-widest text-black/50 uppercase whitespace-nowrap">
                  NAVIGATION
                </span>
              </Link>

              <button
                type="button"
                autoFocus
                className="w-9 h-9 bg-white text-black rounded-[6px] border border-black/10 flex items-center justify-center shrink-0 active:scale-95 transition-all hover:bg-brand-blue hover:text-white hover:border-brand-blue cursor-pointer"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Staggered Elastic Items */}
            <div className="flex flex-col my-auto py-4 gap-1">
              <MobileNavItem num="01" label="Search Skills" shortcut="[S]" href="/search" active={isSearchActive} onClick={() => setMenuOpen(false)} index={0} />
              <MobileNavItem num="02" label="Docs" shortcut="[D]" href="/docs" active={isDocsActive} onClick={() => setMenuOpen(false)} index={1} />
              <MobileNavItem num="03" label="Connect" shortcut="[C]" href="/connect" active={isConnectActive} onClick={() => setMenuOpen(false)} index={2} />
              <MobileNavItem num="04" label="Login" shortcut="[L]" href="/login" active={isLoginActive} onClick={() => setMenuOpen(false)} index={3} />
            </div>

            {/* Footer with branding */}
            <div className="pt-4 border-t border-black/5 flex flex-col gap-4 shrink-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-sans text-xs text-black/45 font-medium whitespace-nowrap">FOLLOW US</span>
                <div className="flex items-center gap-2.5">
                  <a
                    href="https://youtube.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-white text-black rounded-[6px] border border-black/5 flex items-center justify-center transition-all duration-200 hover:bg-brand-blue hover:text-white active:scale-95 shadow-xs"
                    aria-label="Watch us on YouTube"
                  >
                    <YoutubeIcon size={16} />
                  </a>
                  <a
                    href="https://github.com/agent-spm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-white text-black rounded-[6px] border border-black/5 flex items-center justify-center transition-all duration-200 hover:bg-brand-blue hover:text-white active:scale-95 shadow-xs"
                    aria-label="Follow us on GitHub"
                  >
                    <GithubIcon size={16} />
                  </a>
                  <a
                    href="https://x.com/agentspm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-white text-black rounded-[6px] border border-black/5 flex items-center justify-center transition-all duration-200 hover:bg-brand-blue hover:text-white active:scale-95 shadow-xs"
                    aria-label="Follow us on X"
                  >
                    <XIcon size={16} />
                  </a>
                  <a
                    href="https://discord.gg/Qgg73H9Jm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-white text-black rounded-[6px] border border-black/5 flex items-center justify-center transition-all duration-200 hover:bg-brand-blue hover:text-white active:scale-95 shadow-xs"
                    aria-label="Join Discord"
                  >
                    <DiscordIcon size={18} />
                  </a>
                </div>
              </div>
              <span suppressHydrationWarning className="font-mono text-[9px] text-black/35 tracking-wider text-center">
                © {new Date().getFullYear()} AGENT SPM PLATFORM
              </span>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
};
