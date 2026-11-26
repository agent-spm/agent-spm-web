"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/data/session-context";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { GithubSetupModal } from "@/components/auth/GithubSetupModal";
import {
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Check,
  AlertCircle,
  KeyRound,
  Building2,
} from "lucide-react";
import { OtpInput } from "@/components/auth/OtpInput";
import { WebmailButton } from "@/components/auth/WebmailButton";

function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
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

function SignUpFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setPersona } = useSession();

  const tokenParam = searchParams.get("token") || "";
  const refParam = searchParams.get("ref") || "";
  const emailParam = searchParams.get("email") || "";

  const [step, setStep] = useState<"info" | "otp">("info");
  const [email, setEmail] = useState(emailParam || "");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [showGithubSetupModal, setShowGithubSetupModal] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((c) => c - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Primary developer registration method: GitHub 1-Click
  const handleGithubSignUp = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Check if Supabase project has GitHub provider enabled
      try {
        const statusRes = await fetch("/api/auth/providers/status");
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.githubEnabled === false) {
            setShowGithubSetupModal(true);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fall through to OAuth call
      }

      const supabase = createSupabaseBrowserClient();
      const callbackUrl = `${window.location.origin}/auth/callback?next=/app`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: callbackUrl,
          scopes: "read:user user:email repo",
          skipBrowserRedirect: true,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) {
        setShowGithubSetupModal(true);
        setLoading(false);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to initialize GitHub sign up.");
      setLoading(false);
    }
  };

  const handleProceedGithubAnyway = async () => {
    setShowGithubSetupModal(false);
    setLoading(true);
    setErrorMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/app")}`,
          scopes: "read:user user:email repo",
          skipBrowserRedirect: true,
          queryParams: {
            prompt: "select_account",
          },
        },
      });
      if (error) {
        setErrorMessage(error.message || "GitHub OAuth is not configured yet.");
        setLoading(false);
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to initialize GitHub sign up.");
      setLoading(false);
    }
  };

  // Step 1 for invited members: Send OTP
  const handleSendInviteOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !tokenParam) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          token: tokenParam,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to send verification code.");
        setLoading(false);
        return;
      }

      setStep("otp");
      setCooldown(45);
      setOtpCode("");
      setLoading(false);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to send verification code.");
      setLoading(false);
    }
  };

  // Step 2 for invited members: Verify OTP
  const handleVerifyInviteOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      setErrorMessage("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: otpCode.trim(),
          token: tokenParam,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Invalid verification code.");
        setLoading(false);
        return;
      }

      setPersona("owner");
      router.push("/app");
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to complete invite registration.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-2 sm:py-4">
      {/* ── Eyebrow Badge ── */}
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 backdrop-blur-md px-3.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-white shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>{tokenParam ? "Team Member Invitation" : "Verified Developer Onboarding"}</span>
      </div>

      {/* ── Headline & Subcopy ── */}
      <div className="text-center max-w-xl mb-6 sm:mb-7">
        <h1
          className="font-instrument-serif text-4xl sm:text-5xl lg:text-[58px] leading-[1.08] italic font-normal tracking-tight text-white mb-2.5 select-none"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          {tokenParam ? "Join Team Workspace" : "Sign up for Agent SPM"}
        </h1>
        <p className="font-sans text-sm sm:text-base text-white/90 font-normal leading-relaxed max-w-md mx-auto">
          {tokenParam
            ? "Accept your invitation to collaborate on verified agent skills and private tools."
            : "Connect your GitHub developer account to claim your verified @namespace and publish agent packages."}
        </p>
      </div>

      {/* ── High-End Auth Card ── */}
      <div className="relative w-full max-w-[430px] rounded-2xl border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl text-black transition-all">
        <div className="p-6 sm:p-7">
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-50/90 p-3 text-xs text-red-900 flex items-start gap-2.5 animate-[fadeIn_0.2s_ease-out]">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="font-sans font-medium">{errorMessage}</span>
            </div>
          )}

          {tokenParam && step === "otp" ? (
            /* Invite OTP Verification View */
            <div className="animate-[fadeIn_0.2s_ease-out]">
              <div className="text-center mb-5">
                <div className="relative w-12 h-12 mx-auto mb-3">
                  <div className="absolute inset-0 rounded-full bg-[#1B5FED]/20 animate-ping opacity-30" />
                  <div className="relative w-12 h-12 rounded-full bg-[#1B5FED]/10 text-[#1B5FED] flex items-center justify-center border border-[#1B5FED]/20 shadow-2xs">
                    <Mail className="w-6 h-6 text-[#1B5FED]" />
                  </div>
                </div>
                <h3 className="text-xl font-bold font-sans text-black tracking-tight">
                  Verify invite email
                </h3>
                <p className="text-xs font-sans text-black/60 mt-1">
                  Enter the 6-digit code sent to
                </p>
                <div className="text-sm font-mono font-semibold text-black mt-0.5 break-all">
                  {email}
                </div>
                <div className="mt-2.5 flex justify-center">
                  <WebmailButton email={email} />
                </div>
              </div>

              <form onSubmit={handleVerifyInviteOtp} className="space-y-4">
                <OtpInput
                  value={otpCode}
                  onChange={(val) => setOtpCode(val)}
                  disabled={loading}
                />

                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  className="w-full h-11 rounded-xl bg-[#1B5FED] hover:bg-[#154ec4] text-white font-sans text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Joining Workspace...</span>
                    </>
                  ) : (
                    <>
                      <span>Accept Invitation & Enter</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs font-sans pt-1 text-black/60">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("info");
                      setOtpCode("");
                      setErrorMessage(null);
                    }}
                    className="hover:text-black hover:underline cursor-pointer flex items-center gap-1"
                  >
                    ← Edit details
                  </button>

                  <button
                    type="button"
                    disabled={cooldown > 0 || loading}
                    onClick={handleSendInviteOtp}
                    className={`cursor-pointer ${
                      cooldown > 0
                        ? "text-black/40 cursor-not-allowed"
                        : "text-[#1B5FED] font-semibold hover:underline"
                    }`}
                  >
                    {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Primary Onboarding View */
            <>
              {/* 1-Click Primary Action: GitHub Sign Up */}
              <button
                type="button"
                onClick={handleGithubSignUp}
                disabled={loading}
                className="w-full h-12 rounded-xl bg-[#18181B] hover:bg-black text-white font-sans text-sm font-semibold flex items-center justify-center gap-3 transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                <GithubIcon className="h-5 w-5 fill-white" />
                <span>Sign up with GitHub (1-Click)</span>
              </button>
              <p className="mt-1.5 text-center font-mono text-[10px] text-black/45 uppercase tracking-wider font-semibold">
                Instant Onboarding • Verified GitHub email & @handle
              </p>

              {/* Developer Requirements & Trust Highlights */}
              <div className="mt-5 p-4 rounded-xl bg-black/[0.03] border border-black/[0.06] space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-black/80 font-sans leading-relaxed">
                  <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 mt-0.5 flex-shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-black">Verified GitHub Identity:</span>{" "}
                    Accounts are authenticated with your primary GitHub email to prevent namespace squatting.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-black/80 font-sans leading-relaxed">
                  <div className="p-1 rounded-md bg-[#1B5FED]/10 text-[#1B5FED] mt-0.5 flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-black">Automatic @Scope Claim:</span>{" "}
                    Your developer namespace (<code>@your-github-username/*</code>) is automatically claimed and verified.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-black/80 font-sans leading-relaxed">
                  <div className="p-1 rounded-md bg-purple-500/10 text-purple-600 mt-0.5 flex-shrink-0">
                    <KeyRound className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-black">CLI Publishing Compatible:</span>{" "}
                    Seamlessly push packages with <code>spm push</code> without extra token configuration.
                  </div>
                </div>
              </div>

              {/* Informational Guidance Notice */}
              <div className="mt-4 p-3 rounded-lg bg-blue-50/70 border border-blue-200/50 text-[11px] text-blue-950 font-sans leading-relaxed flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#1B5FED] flex-shrink-0 mt-0.5" />
                <span>
                  To safeguard software supply-chain integrity, all new developer accounts and registry namespaces must be created with a verified GitHub account.
                </span>
              </div>

              {/* Optional Invite Flow for Existing Teams */}
              {tokenParam && (
                <div className="mt-4 pt-4 border-t border-black/10">
                  <div className="text-center mb-3">
                    <span className="text-[11px] font-mono uppercase text-black/50">
                      or accept invite via email
                    </span>
                  </div>
                  <form onSubmit={handleSendInviteOtp} className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="invited-member@company.com"
                        className="w-full h-11 rounded-xl border border-black/15 bg-white pl-10 pr-3.5 font-sans text-sm text-black placeholder:text-black/40 focus:border-[#1B5FED] focus:ring-2 focus:ring-[#1B5FED]/20 focus:outline-none transition-all shadow-2xs"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !email.trim()}
                      className="w-full h-10 rounded-xl bg-black hover:bg-black/90 text-white font-sans text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <span>Accept Invite via Email Code</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </>
          )}

          {/* Card Bottom Links */}
          <div className="mt-5 pt-4 border-t border-black/[0.08] flex flex-col items-center gap-2">
            <p className="text-xs text-black/60 font-sans">
              Already have an account?{" "}
              <Link href="/login" className="text-[#1B5FED] font-semibold hover:underline">
                Sign in →
              </Link>
            </p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-black/45">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                <span>TLS 1.3 • FIDO2 WebAuthn</span>
              </span>
              <span>•</span>
              <Link href="/privacy" className="hover:text-black transition-colors">
                Privacy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-black transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>

      <GithubSetupModal
        isOpen={showGithubSetupModal}
        onClose={() => setShowGithubSetupModal(false)}
        onProceedAnyway={handleProceedGithubAnyway}
        redirectUrl="/app"
      />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[430px] h-[460px] rounded-2xl bg-white/20 animate-pulse border border-white/20" />
      }
    >
      <SignUpFormContent />
    </Suspense>
  );
}
