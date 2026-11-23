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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const verifyTotpCode = async (code: string) => {
    if (code.length !== 6) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
      const supabase = createSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setErrorMessage("Your session has expired. Please sign in again.");
        setLoading(false);
        return;
      }

      const { data: factorsData, error: factorsErr } = await supabase.auth.mfa.listFactors();
      if (factorsErr) {
        setErrorMessage(factorsErr.message || "Unable to verify MFA factors.");
        setLoading(false);
        return;
      }

      const totpFactor =
        factorsData?.totp?.find((f: { status?: string; id: string }) => f.status === "verified") ||
        factorsData?.totp?.[0];

      if (!totpFactor) {
        setErrorMessage(
          "No TOTP authenticator is enrolled on this account. Enroll one in Settings → Security first."
        );
        setLoading(false);
        return;
      }

      const { error: verifyErr } = await supabase.auth.mfa.challengeAndVerify({
        factorId: totpFactor.id,
        code,
      });

      if (verifyErr) {
        setErrorMessage(verifyErr.message || "Invalid 6-digit verification code.");
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        setLoading(false);
        return;
      }

      setPersona("owner");
      router.push("/app");
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Verification failed.");
      setLoading(false);
    }
  };

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
      void verifyTotpCode(newDigits.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleBiometric = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
      const supabase = createSupabaseBrowserClient();
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const verifiedFactors = (factorsData?.all || []).filter(
        (f: { status?: string; factor_type?: string }) =>
          f.status === "verified" && f.factor_type === "webauthn"
      );
      if (verifiedFactors.length === 0) {
        setErrorMessage(
          "No WebAuthn passkey factor is enrolled on your account. Please enter your 6-digit authenticator code."
        );
        setLoading(false);
        return;
      }
      setErrorMessage("Please complete verification with your 6-digit authenticator code.");
      setLoading(false);
    } catch {
      setErrorMessage("WebAuthn verification failed. Please use your 6-digit authenticator code.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* ── Eyebrow Badge ── */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 backdrop-blur-md px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-black shadow-sm">
        <span className="w-2 h-2 rounded-full bg-[#1B5FED] animate-pulse" />
        HARDWARE &amp; TOTP AUTHENTICATION
      </div>

      {/* ── Headline & Subcopy ── */}
      <div className="text-center max-w-xl mb-8 sm:mb-10 px-2">
        <h1
          className="font-instrument-serif text-4xl sm:text-6xl lg:text-[68px] leading-[1.05] italic font-normal tracking-tight text-black mb-3 select-none"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          Two-factor verification.
        </h1>
        <p className="font-sans text-sm sm:text-lg text-black/75 font-medium leading-relaxed max-w-md mx-auto">
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
        <div className="glass-card-content relative z-10 p-4 sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-4">
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
            <div className="grid grid-cols-6 gap-1.5 sm:gap-2.5">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  aria-label={`Verification digit ${idx + 1}`}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="h-11 sm:h-14 w-full min-w-0 rounded-[4px] border border-black/10 bg-white text-center font-mono text-lg sm:text-2xl font-bold text-black focus:border-[#1B5FED] focus:outline-none focus:ring-2 focus:ring-[#1B5FED]/20 shadow-sm"
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {errorMessage && (
              <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-600 font-mono">
                {errorMessage}
              </div>
            )}

            <button
              type="button"
              disabled={loading || digits.some((d) => !d)}
              onClick={() => void verifyTotpCode(digits.join(""))}
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
            <span className="text-[11px] text-black/40">Secured via WebAuthn</span>
          </div>
        </div>
      </div>
    </div>
  );
}
