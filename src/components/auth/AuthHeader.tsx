"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function AuthHeader() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <header className="w-full flex items-center justify-between py-4 sm:py-6">
      {/* Brand logo & name linking back to home */}
      <Link
        href="/"
        className="flex items-center gap-2.5 group cursor-pointer select-none"
        title="Return to Agent SPM Home"
      >
        <div className="w-9 h-9 rounded-[6px] bg-white border border-white/80 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
          <Image
            src="/images/blueLogo.png"
            alt="Agent SPM Logo"
            width={24}
            height={24}
            className="object-contain"
            priority
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-sans font-bold text-base text-white tracking-tight">
            Agent SPM
          </span>
          <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/15 text-white/90 border border-white/20 font-semibold uppercase">
            v2.4
          </span>
        </div>
      </Link>

      {/* Right navigation cluster */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          href="/docs"
          className="text-xs font-mono font-semibold text-white/80 hover:text-white transition-colors hidden sm:inline-block"
        >
          [D] DOCS
        </Link>

        <a
          href="https://github.com/agent-spm"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-white/80 hover:text-white transition-colors"
          title="GitHub Repository"
        >
          <GithubIcon className="w-4 h-4" />
        </a>

        <div className="w-[1px] h-4 bg-white/20 hidden sm:block" aria-hidden="true" />

        {isLoginPage ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-white/70 hidden md:inline">Don&apos;t have an account?</span>
            <Link
              href="/signup"
              className="px-3.5 py-1.5 rounded-[6px] bg-white text-black font-sans font-semibold hover:bg-white/90 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign up →
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-white/70 hidden md:inline">Already registered?</span>
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-[6px] bg-white text-black font-sans font-semibold hover:bg-white/90 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign in →
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
