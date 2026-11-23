"use client";

import React from "react";
import { ArrowUpRight, Mail } from "lucide-react";
import { getWebmailInfo } from "@/lib/webmail";

function GoogleIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function MicrosoftIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
      <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

interface WebmailButtonProps {
  email: string;
  className?: string;
}

export function WebmailButton({ email, className = "" }: WebmailButtonProps) {
  const info = getWebmailInfo(email);
  if (!info) return null;

  return (
    <a
      href={info.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium text-black/75 hover:text-black bg-black/[0.04] hover:bg-black/[0.08] border border-black/10 transition-all hover:scale-[1.02] active:scale-[0.98] group cursor-pointer shadow-xs ${className}`}
    >
      {info.provider === "gmail" || info.provider === "default" ? (
        <GoogleIcon className="w-3.5 h-3.5 flex-shrink-0" />
      ) : info.provider === "outlook" ? (
        <MicrosoftIcon className="w-3.5 h-3.5 flex-shrink-0" />
      ) : (
        <Mail className="w-3.5 h-3.5 flex-shrink-0 text-black/60" />
      )}
      <span>{info.label}</span>
      <ArrowUpRight className="w-3.5 h-3.5 text-black/40 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
    </a>
  );
}
