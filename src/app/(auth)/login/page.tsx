"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/data/session-context";
import { AVAILABLE_PERSONAS } from "@/lib/data/mock-store";
import { KeyRound, Mail, ShieldCheck, ArrowRight, Sparkles, Building2, UserCheck } from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/app";

  const { setPersona } = useSession();
  const [authMethod, setAuthMethod] = useState<"email" | "sso">("email");
  const [emailMode, setEmailMode] = useState<"magic" | "password">("password");
  const [email, setEmail] = useState("alex@acme.labs");
  const [password, setPassword] = useState("••••••••••••");
  const [ssoDomain, setSsoDomain] = useState("acme.corp");
  const [loading, setLoading] = useState(false);
  const [sentMagicLink, setSentMagicLink] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (emailMode === "magic") {
      setTimeout(() => {
        setLoading(false);
        setSentMagicLink(true);
      }, 700);
      return;
    }

    // Direct password sign in simulation
    setTimeout(() => {
      setLoading(false);
      setPersona("owner");
      router.push(redirectUrl);
    }, 600);
  };

  const handleSsoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPersona("enterprise_admin");
      router.push("/app");
    }, 700);
  };

  const handlePersonaQuickLogin = (personaRole: string) => {
    setLoading(true);
    setTimeout(() => {
      setPersona(personaRole as any);
      if (personaRole === "superadmin") {
        router.push("/admin");
      } else {
        router.push("/app");
      }
    }, 400);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* ── Eyebrow Badge ── */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-white shadow-sm">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        SECURE ACCESS GATEWAY
      </div>

      {/* ── Headline & Subcopy ── */}
      <div className="text-center max-w-xl mb-8 sm:mb-10">
        <h1
          className="font-instrument-serif text-5xl sm:text-6xl lg:text-[68px] leading-[1.05] italic font-normal tracking-tight text-white mb-3 select-none"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          Sign in. to Agent SPM.
        </h1>
        <p className="font-sans text-base sm:text-lg text-white/95 font-medium leading-relaxed max-w-md mx-auto">
          Access your private skills, manage organization keys, and orchestrate verified agent tools.
        </p>
      </div>

      {/* ── 4-Layer Liquid Glass Login Card ── */}
      <div className="glass-card-shell relative w-full max-w-[460px] rounded-[8px] border border-black/10 shadow-2xl text-black flex flex-col justify-between transition-transform hover:scale-[1.005]">
        {/* Layer 0: Distortion Filter */}
        <div className="glass-card-filter pointer-events-none" aria-hidden="true" />

        {/* Layer 1: Translucent White Overlay */}
        <div className="glass-card-overlay bg-white/95 backdrop-blur-md pointer-events-none" aria-hidden="true" />

        {/* Layer 2: Specular Rim Highlight */}
        <div className="glass-card-specular pointer-events-none" aria-hidden="true" />

        {/* Layer 3: Foreground Content */}
        <div className="glass-card-content relative z-10 p-6 sm:p-8">
          {/* Segmented Auth Method Switcher */}
          <div className="w-full h-[44px] bg-[#F5F5F5] rounded-[6px] p-1 flex items-center justify-between border border-black/5 mb-6">
            <button
              type="button"
              onClick={() => setAuthMethod("email")}
              className={`flex-1 h-full rounded-[4px] font-sans text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
                authMethod === "email"
                  ? "bg-black text-white shadow-sm font-semibold"
                  : "text-black/60 hover:text-black"
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Work Email</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod("sso")}
              className={`flex-1 h-full rounded-[4px] font-sans text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
                authMethod === "sso"
                  ? "bg-black text-white shadow-sm font-semibold"
                  : "text-black/60 hover:text-black"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>SAML SSO</span>
            </button>
          </div>

          {authMethod === "email" ? (
            sentMagicLink ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
                <ShieldCheck className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
                <h3 className="text-sm font-bold text-emerald-900">
                  Magic Link Dispatched
                </h3>
                <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                  We sent a secure login link to <span className="font-mono font-bold text-black">{email}</span>. Click the link to complete authentication.
                </p>
                <button
                  onClick={() => {
                    setPersona("owner");
                    router.push(redirectUrl);
                  }}
                  className="mt-4 w-full rounded-[4px] bg-[#1B5FED] px-4 py-2.5 text-xs font-mono uppercase font-semibold text-white hover:bg-[#154ec4] transition-all shadow-md cursor-pointer"
                >
                  [Simulate Magic Link Click]
                </button>
              </div>
            ) : (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-mono text-xs uppercase tracking-wider text-black/70 font-semibold">
                      Work Email
                    </label>
                    <div className="flex gap-2 text-[11px] font-mono text-black/50">
                      <button
                        type="button"
                        onClick={() => setEmailMode("password")}
                        className={`hover:text-black cursor-pointer ${emailMode === "password" ? "text-[#1B5FED] font-bold underline underline-offset-2" : ""}`}
                      >
                        Password
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => setEmailMode("magic")}
                        className={`hover:text-black cursor-pointer ${emailMode === "magic" ? "text-[#1B5FED] font-bold underline underline-offset-2" : ""}`}
                      >
                        Magic Link
                      </button>
                    </div>
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-[4px] border border-black/10 bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-black/35 focus:border-[#1B5FED] focus:outline-none focus:ring-2 focus:ring-[#1B5FED]/20 font-sans shadow-sm"
                  />
                </div>

                {emailMode === "password" && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-mono text-xs uppercase tracking-wider text-black/70 font-semibold">
                        Password
                      </label>
                      <Link
                        href="/verify-2fa"
                        className="text-[11px] font-mono text-black/50 hover:text-[#1B5FED] transition-colors"
                      >
                        Use 2FA Recovery
                      </Link>
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-[4px] border border-black/10 bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-black/35 focus:border-[#1B5FED] focus:outline-none focus:ring-2 focus:ring-[#1B5FED]/20 font-sans shadow-sm"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-[4px] bg-[#1B5FED] hover:bg-[#154ec4] px-4 py-3 text-xs font-mono font-semibold uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer"
                >
                  {loading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>{emailMode === "magic" ? "Send Magic Link" : "Sign In"}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handleSsoSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-black/70 font-semibold mb-1.5">
                  Corporate Identity Domain
                </label>
                <div className="flex rounded-[4px] border border-black/10 bg-white overflow-hidden focus-within:border-[#1B5FED] focus-within:ring-2 focus-within:ring-[#1B5FED]/20 shadow-sm">
                  <span className="px-3 py-2.5 font-mono text-xs text-black/50 bg-[#F5F5F5] border-r border-black/10 flex items-center">
                    sso://
                  </span>
                  <input
                    type="text"
                    required
                    value={ssoDomain}
                    onChange={(e) => setSsoDomain(e.target.value)}
                    placeholder="company.com"
                    className="w-full bg-transparent px-3.5 py-2.5 text-sm text-black placeholder:text-black/35 focus:outline-none font-mono"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-black/50">
                  Supports Okta, Azure AD, Ping, and Google Workspace SAML 2.0.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-[4px] bg-[#1B5FED] hover:bg-[#154ec4] px-4 py-3 text-xs font-mono font-semibold uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer"
              >
                {loading ? "Connecting to IdP..." : "Continue with SSO"}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          )}

          {/* ── 1-CLICK DEMO PERSONA LAUNCHER ── */}
          <div className="mt-6 pt-5 border-t border-black/10">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-black/60 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#1B5FED]" />
                Fast Demo Personas
              </span>
              <span className="text-[10px] font-mono text-black/40">Local Testing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              <button
                onClick={() => handlePersonaQuickLogin("owner")}
                className="rounded-[6px] border border-black/10 bg-[#FAFAFA] p-2.5 hover:bg-[#F0F7FF] hover:border-[#1B5FED]/50 transition-all text-left group cursor-pointer"
              >
                <div className="font-mono text-xs font-semibold text-black group-hover:text-[#1B5FED] flex items-center justify-between">
                  <span>Owner</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-[#1B5FED]/15 text-[#1B5FED] font-bold rounded">PRO</span>
                </div>
                <div className="text-[11px] text-black/60 mt-0.5 truncate">Alex Chen (@acme-labs)</div>
              </button>

              <button
                onClick={() => handlePersonaQuickLogin("member")}
                className="rounded-[6px] border border-black/10 bg-[#FAFAFA] p-2.5 hover:bg-[#F0F7FF] hover:border-[#1B5FED]/50 transition-all text-left group cursor-pointer"
              >
                <div className="font-mono text-xs font-semibold text-black group-hover:text-[#1B5FED] flex items-center justify-between">
                  <span>Member</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-black/10 text-black/70 font-bold rounded">DEV</span>
                </div>
                <div className="text-[11px] text-black/60 mt-0.5 truncate">David Kim (Contributor)</div>
              </button>

              <button
                onClick={() => handlePersonaQuickLogin("enterprise_admin")}
                className="rounded-[6px] border border-black/10 bg-[#FAFAFA] p-2.5 hover:bg-[#F0F7FF] hover:border-[#1B5FED]/50 transition-all text-left group cursor-pointer"
              >
                <div className="font-mono text-xs font-semibold text-black group-hover:text-[#1B5FED] flex items-center justify-between">
                  <span>Enterprise</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-purple-500/15 text-purple-700 font-bold rounded">SAML</span>
                </div>
                <div className="text-[11px] text-black/60 mt-0.5 truncate">Marcus Vance (Audit/SSO)</div>
              </button>

              <button
                onClick={() => handlePersonaQuickLogin("superadmin")}
                className="rounded-[6px] border border-amber-500/30 bg-amber-500/5 p-2.5 hover:bg-amber-500/15 hover:border-amber-500/60 transition-all text-left group cursor-pointer"
              >
                <div className="font-mono text-xs font-semibold text-amber-900 flex items-center justify-between">
                  <span>Super-Admin</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-800 font-bold rounded">STAFF</span>
                </div>
                <div className="text-[11px] text-amber-900/70 mt-0.5 truncate">Platform Control (/admin)</div>
              </button>
            </div>
          </div>

          {/* Bottom Switcher */}
          <div className="mt-6 text-center text-xs text-black/60">
            Don&apos;t have an organization account?{" "}
            <Link
              href="/signup"
              className="font-mono text-black font-semibold underline underline-offset-4 hover:text-[#1B5FED] transition-colors"
            >
              Create an organization
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-6 h-6 border-2 border-[#1B5FED] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </React.Suspense>
  );
}
