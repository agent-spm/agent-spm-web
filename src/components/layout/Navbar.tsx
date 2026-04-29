"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
  const content = (
    <button className={`bracket-btn ${active ? 'active' : ''}`} aria-label={ariaLabel || label}>
      {icon ? (
        <span className="flex items-center justify-center">
          {icon}
        </span>
      ) : (
        <>
          <span className="opacity-50">[{prefixChar}]</span>
          <span className="ml-1.5">{label}</span>
        </>
      )}
    </button>
  );

  if (href) {
    return (
      <Link href={href}>
        {content}
      </Link>
    );
  }

  return content;
};

export const Navbar = () => {

  return (
    <nav className="flex items-center px-2 py-6 w-full gap-[10px]" aria-label="Main navigation">
      {/* Logo Container */}
      <div className="flex items-center justify-center -mr-0.5">
        <Image 
          src="/images/logo.png" 
          alt="Agent SPM Logo" 
          width={32} 
          height={32} 
          className="object-contain"
        />
      </div>
      
      {/* Social Icons Group (Left Aligned) */}
      

      {/* Nav Links Group */}
      <NavButton prefixChar="H" label="HOME" href="/" />
      <NavButton prefixChar="B" label="BLOG" href="/blog" />
      <NavButton prefixChar="D" label="DOCS" href="/search" />
      <NavButton prefixChar="Y" label="YOUTUBE" href="/youtube" />
      <NavButton prefixChar="G" label="GITHUB" href="/github"  />
      <NavButton prefixChar="C" label="CONNECT" href="/connect" />

      <NavButton 
        ariaLabel="Follow us on X (Twitter)"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        } 
      />
      <NavButton 
        ariaLabel="Join us on Discord"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
             <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z"/>
          </svg>
        } 
      />
    </nav>
  );
};

