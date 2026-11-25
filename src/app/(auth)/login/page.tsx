"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/data/session-context";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { GithubSetupModal } from "@/components/auth/GithubSetupModal";
import {
  Mail,
  ShieldCheck,
  ArrowRight,
  Building2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RotateCcw,
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

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/app";

  const { setPersona } = useSession();
  const [authMethod, setAuthMethod] = useState<"otp" | "sso">("otp");
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [ssoDomain, setSsoDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [showGithubSetupModal, setShowGithubSetupModal] = useState(false);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((c) => c - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Step 1: Request 6-digit OTP code to email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Validate eligibility (existing user or invited collaborator) and dispatch OTP via hardened backend route
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMessage(
          data.error || "Failed to send verification code. Please sign up with GitHub first."
        );
        setLoading(false);
        return;
      }

      setStep("code");
      setCooldown(45);
      setOtpCode(""); // Strict blank - user enters genuine code from inbox
      setLoading(false);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to dispatch verification code.");
      setLoading(false);
    }
  };

  // Step 2: Verify 6-digit OTP code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      setErrorMessage("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = otpCode.trim();

    try {
      const supabase = createSupabaseBrowserClient();

      // 1. Try Supabase native verifyOtp
      let sessionEstablished = false;
      const { data: sbVerifyData, error: sbVerifyError } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanCode,
        type: "email",
      });

      if (!sbVerifyError && sbVerifyData?.session) {
        sessionEstablished = true;
      }

      // 2. Also verify against backend route to synchronize session cookies and organization records
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, code: cleanCode }),
      });
      const data = await res.json().catch(() => ({}));

      if (!sessionEstablished && !res.ok) {
        setErrorMessage(data.error || sbVerifyError?.message || "Invalid verification code.");
        setLoading(false);
        return;
      }

      const superadminList = (process.env.NEXT_PUBLIC_SUPERADMIN_EMAILS || "lakshitsoni26@gmail.com")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
      if (superadminList.includes(cleanEmail)) {
        setPersona("superadmin");
      } else {
        setPersona("owner");
      }
      router.push(data.redirectUrl || redirectUrl);
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to verify code.");
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Check if Supabase project has GitHub OAuth enabled
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
        // Continue to OAuth if status endpoint is unavailable
      }

      const supabase = createSupabaseBrowserClient();
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectUrl)}`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: callbackUrl,
          scopes: "read:user user:email repo",
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
      setErrorMessage(err instanceof Error ? err.message : "Failed to initiate GitHub authentication.");
      setLoading(false);
    }
  };

  const handleProceedGithubAnyway = async () => {
    setShowGithubSetupModal(false);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectUrl)}`;
      const { data } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: callbackUrl,
          scopes: "read:user user:email repo",
        },
      });
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to initiate GitHub authentication.");
      setLoading(false);
    }
  };

  const handleSsoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssoDomain.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/auth/sso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: ssoDomain }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "SSO authentication failed.");
        setLoading(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setErrorMessage("No SAML SSO identity provider configured for this domain.");
      setLoading(false);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "SSO authentication failed.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* ── Eyebrow Badge ── */}
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 backdrop-blur-md px-3.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-white shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Secure Access Gateway</span>
      </div>

      {/* ── Headline & Subcopy ── */}
      <div className="text-center max-w-xl mb-6 sm:mb-7">
        <h1
          className="font-instrument-serif text-4xl sm:text-5xl lg:text-[58px] leading-[1.08] italic font-normal tracking-tight text-white mb-2.5 select-none"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          Sign in to Agent SPM
        </h1>
        <p className="font-sans text-sm sm:text-base text-white/90 font-normal leading-relaxed max-w-md mx-auto">
          Access your private skills, manage organization keys, and orchestrate verified agent tools.
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

          {step === "code" ? (
            /* Dedicated Vercel-Style 6-Digit Code Verification View */
            <div className="animate-[fadeIn_0.2s_ease-out]">
              <div className="text-center mb-5">
                <div className="relative w-12 h-12 mx-auto mb-3">
                  <div className="absolute inset-0 rounded-full bg-[#1B5FED]/20 animate-ping opacity-30" />
                  <div className="relative w-12 h-12 rounded-full bg-[#1B5FED]/10 text-[#1B5FED] flex items-center justify-center border border-[#1B5FED]/20 shadow-2xs">
                    <Mail className="w-6 h-6 text-[#1B5FED]" />
                  </div>
                </div>
                <h3 className="text-xl font-bold font-sans text-black tracking-tight">
                  Check your inbox
                </h3>
                <p className="text-xs font-sans text-black/60 mt-1">
                  Enter the 6-digit verification code sent to
                </p>
                <div className="text-sm font-mono font-semibold text-black mt-0.5 break-all">
                  {email}
                </div>
                <div className="mt-2.5 flex justify-center">
                  <WebmailButton email={email} />
                </div>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
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
                      <span>Verifying code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Enter Workspace</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs font-sans pt-1 text-black/60">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setOtpCode("");
                      setErrorMessage(null);
                    }}
                    className="hover:text-black hover:underline cursor-pointer flex items-center gap-1"
                  >
                    ← Use different email
                  </button>

                  <button
                    type="button"
                    disabled={cooldown > 0 || loading}
                    onClick={handleSendOtp}
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
            /* Initial Entry View: GitHub 1-Click + Method Switcher (OTP / SAML SSO) */
            <>
              {/* 1-Click GitHub Developer Login */}
              <button
                type="button"
                onClick={handleGithubLogin}
                disabled={loading}
                className="w-full h-11 rounded-xl bg-[#18181B] hover:bg-black text-white font-sans text-sm font-semibold flex items-center justify-center gap-2.5 transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                <GithubIcon className="h-4 w-4 fill-white" />
                <span>Continue with GitHub</span>
              </button>
              <p className="mt-1.5 text-center font-mono text-[10px] text-black/45 uppercase tracking-wider font-semibold">
                Instant 1-Click • No password needed
              </p>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/10" />
                </div>
                <div className="relative flex justify-center text-[10px] font-mono tracking-wider uppercase">
                  <span className="bg-white/95 px-3 text-black/50">or continue with email</span>
                </div>
              </div>

              {/* Segmented Auth Method Switcher */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-black/[0.04] border border-black/[0.06] mb-4.5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod("otp");
                    setStep("email");
                    setErrorMessage(null);
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-sans flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    authMethod === "otp"
                      ? "bg-white text-black shadow-xs font-semibold"
                      : "text-black/60 hover:text-black font-medium hover:bg-white/40"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Email Code (OTP)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod("sso");
                    setErrorMessage(null);
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-sans flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    authMethod === "sso"
                      ? "bg-white text-black shadow-xs font-semibold"
                      : "text-black/60 hover:text-black font-medium hover:bg-white/40"
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>SAML SSO</span>
                </button>
              </div>

              {authMethod === "otp" ? (
                /* Step 1: Input Email */
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-black/80 mb-1.5 font-sans">
                      Work or personal email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 pointer-events-none" />
                      <input
                        type="email"
                        required
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="developer@company.com"
                        className="w-full h-11 rounded-xl border border-black/15 bg-white pl-10 pr-3.5 font-sans text-sm text-black placeholder:text-black/40 focus:border-[#1B5FED] focus:ring-2 focus:ring-[#1B5FED]/20 focus:outline-none transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="w-full h-11 rounded-xl bg-[#1B5FED] hover:bg-[#154ec4] text-white font-sans text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.99] cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending verification code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send 6-Digit Code</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* SAML SSO Form */
                <form onSubmit={handleSsoSubmit} className="space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-black/80 font-sans">
                        Company or organization domain
                      </label>
                      <span className="text-[10px] font-mono text-black/50">Enterprise</span>
                    </div>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 pointer-events-none" />
                      <input
                        type="text"
                        required
                        autoFocus
                        value={ssoDomain}
                        onChange={(e) => setSsoDomain(e.target.value)}
                        placeholder="company.com or acme-corp"
                        className="w-full h-11 rounded-xl border border-black/15 bg-white pl-10 pr-3.5 font-sans text-sm text-black placeholder:text-black/40 focus:border-[#1B5FED] focus:ring-2 focus:ring-[#1B5FED]/20 focus:outline-none transition-all shadow-2xs"
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-black/50 font-sans leading-normal">
                      Supports Okta, Azure AD, Google Workspace, and PingFederate SAML 2.0.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !ssoDomain.trim()}
                    className="w-full h-11 rounded-xl bg-black hover:bg-black/90 text-white font-sans text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.99] cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Redirecting to IdP...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue with Enterprise SSO</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}

          {/* Card Bottom Links */}
          <div className="mt-5 pt-4 border-t border-black/[0.08] flex flex-col items-center gap-2">
            <p className="text-xs text-black/60 font-sans">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[#1B5FED] font-semibold hover:underline">
                Create an account →
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
        redirectUrl={redirectUrl}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="w-full flex flex-col justify-center items-center py-2 sm:py-4">
      <React.Suspense
        fallback={
          <div className="w-full max-w-[430px] h-[460px] rounded-2xl bg-white/20 animate-pulse border border-white/20" />
        }
      >
        <LoginFormContent />
      </React.Suspense>
    </div>
  );
}
