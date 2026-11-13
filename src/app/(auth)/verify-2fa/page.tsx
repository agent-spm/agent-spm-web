"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/data/session-context";
import { ShieldCheck, Fingerprint, ArrowLeft } from "lucide-react";

export default function Verify2faPage() {
  const router = useRouter();
  const { setPersona } = useSession();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...digits];
    newDigits[index] = val.slice(-1);
    setDigits(newDigits);

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all filled
    if (index === 5 && val && newDigits.every((d) => d !== "")) {
      setLoading(true);
      setTimeout(() => {
        setPersona("owner");
        router.push("/app");
      }, 600);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleBiometric = () => {
    setLoading(true);
    setTimeout(() => {
      setPersona("owner");
      router.push("/app");
    }, 700);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* ── Eyebrow Badge ── */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 backdrop-blur-md px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-black shadow-sm">
        <span className="w-2 h-2 rounded-full bg-[#1B5FED] animate-pulse" />
        HARDWARE &amp; TOTP AUTHENTICATION
      </div>

      {/* ── Headline & Subcopy ── */}
      <div className="text-center max-w-xl mb-8 sm:mb-10">
        <h1
          className="font-instrument-serif text-5xl sm:text-6xl lg:text-[68px] leading-[1.05] italic font-normal tracking-tight text-black mb-3 select-none"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          Two-factor verification.
        </h1>
        <p className="font-sans text-base sm:text-lg text-black/75 font-medium leading-relaxed max-w-md mx-auto">
          Enter the 6-digit code from your authenticator app (1Password, Google Authenticator) or use a passkey.
        </p>
      </div>

      {/* ── 4-Layer Liquid Glass 2FA Card ── */}
      <div className="glass-card-shell relative w-full max-w-[460px] rounded-[8px] border border-black/10 shadow-2xl text-black flex flex-col justify-between transition-transform hover:scale-[1.005]">
        {/* Layer 0: Distortion Filter */}
        <div className="glass-card-filter pointer-events-none" aria-hidden="true" />

        {/* Layer 1: Translucent White Overlay */}
        <div className="glass-card-overlay bg-white/95 backdrop-blur-md pointer-events-none" aria-hidden="true" />

        {/* Layer 2: Specular Rim Highlight */}
        <div className="glass-card-specular pointer-events-none" aria-hidden="true" />

        {/* Layer 3: Foreground Content */}
        <div className="glass-card-content relative z-10 p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#1B5FED]" />
              <span className="font-mono text-xs uppercase tracking-wider text-black/70 font-semibold">
                SECURITY CHALLENGE
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider bg-black/5 px-2 py-0.5 rounded text-black/60 font-semibold">
              TOTP / WEBAUTHN
            </span>
          </div>

          {/* 6-Digit Code Inputs */}
          <div className="mb-6">
            <div className="flex justify-between gap-2">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-[4px] border border-black/10 bg-white text-center font-mono text-xl sm:text-2xl font-bold text-black focus:border-[#1B5FED] focus:outline-none focus:ring-2 focus:ring-[#1B5FED]/20 shadow-sm"
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              disabled={loading || digits.some((d) => !d)}
              onClick={() => {
                setLoading(true);
                setTimeout(() => {
                  setPersona("owner");
                  router.push("/app");
                }, 600);
              }}
              className="w-full rounded-[4px] bg-[#1B5FED] hover:bg-[#154ec4] px-4 py-3 text-xs font-mono font-semibold uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Verifying Token..." : "Verify Code & Proceed"}
            </button>

            <button
              type="button"
              onClick={handleBiometric}
              className="w-full rounded-[4px] border border-black/10 bg-[#FAFAFA] hover:bg-white hover:border-[#1B5FED]/40 px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider text-black transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Fingerprint className="w-4 h-4 text-[#1B5FED]" />
              <span>Use WebAuthn / Touch ID</span>
            </button>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs font-mono text-black/60 pt-4 border-t border-black/10">
            <Link href="/login" className="hover:text-black flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              <span>Back to sign in</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setDigits(["1", "2", "3", "4", "5", "6"]);
              }}
              className="text-[#1B5FED] font-bold hover:underline cursor-pointer"
            >
              [Auto-fill Demo Code]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
