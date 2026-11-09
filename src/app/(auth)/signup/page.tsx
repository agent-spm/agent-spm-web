"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/data/session-context";
import { Building2, ArrowRight, Shield, Check } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { setPersona } = useSession();

  const [orgName, setOrgName] = useState("");
  const [scope, setScope] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<"free" | "pro" | "enterprise">("pro");
  const [loading, setLoading] = useState(false);

  const handleOrgNameChange = (val: string) => {
    setOrgName(val);
    const sanitized = val
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    setScope(sanitized ? `@${sanitized}` : "");
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPersona("owner");
      router.push("/app");
    }, 800);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* ── Eyebrow Badge ── */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 backdrop-blur-md px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-black shadow-sm">
        <span className="w-2 h-2 rounded-full bg-[#1B5FED] animate-pulse" />
        ORGANIZATION ONBOARDING
      </div>

      {/* ── Headline & Subcopy ── */}
      <div className="text-center max-w-xl mb-8 sm:mb-10">
        <h1
          className="font-instrument-serif text-5xl sm:text-6xl lg:text-[68px] leading-[1.05] italic font-normal tracking-tight text-black mb-3 select-none"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          Create an organization.
        </h1>
        <p className="font-sans text-base sm:text-lg text-black/75 font-medium leading-relaxed max-w-md mx-auto">
          Reserve your package namespace scope, configure private registry policies, and invite your team.
        </p>
      </div>

      {/* ── 4-Layer Liquid Glass Signup Card ── */}
      <div className="glass-card-shell relative w-full max-w-[480px] rounded-[8px] border border-black/10 shadow-2xl text-black flex flex-col justify-between transition-transform hover:scale-[1.005]">
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
              <Building2 className="h-4 w-4 text-[#1B5FED]" />
              <span className="font-mono text-xs uppercase tracking-wider text-black/70 font-semibold">
                STEP 1: ORG &amp; SCOPE RESERVATION
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider bg-black/5 px-2 py-0.5 rounded text-black/60 font-semibold">
              INSTANT PROVISION
            </span>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 font-semibold mb-1.5">
                Organization Name
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => handleOrgNameChange(e.target.value)}
                placeholder="e.g. Acme Robotics"
                className="w-full rounded-[4px] border border-black/10 bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-black/35 focus:border-[#1B5FED] focus:outline-none focus:ring-2 focus:ring-[#1B5FED]/20 font-sans shadow-sm"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 font-semibold mb-1.5">
                Package Scope Handle
              </label>
              <div className="flex rounded-[4px] border border-black/10 bg-white focus-within:border-[#1B5FED] focus-within:ring-2 focus-within:ring-[#1B5FED]/20 shadow-sm overflow-hidden">
                <input
                  type="text"
                  required
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  placeholder="@acme-robotics"
                  className="w-full bg-transparent px-3.5 py-2.5 text-sm font-mono text-[#1B5FED] font-bold placeholder:text-black/35 focus:outline-none"
                />
                <span className="px-3 py-2.5 font-mono text-xs text-emerald-700 bg-emerald-500/10 border-l border-black/10 flex items-center gap-1 font-semibold">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  AVAILABLE
                </span>
              </div>
              <p className="mt-1.5 text-[11px] text-black/50">
                All skills will be published under <span className="font-mono font-bold text-black">{scope || "@your-org"}/skill-name</span>.
              </p>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 font-semibold mb-1.5">
                Admin Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="lead@acmerobotics.com"
                className="w-full rounded-[4px] border border-black/10 bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-black/35 focus:border-[#1B5FED] focus:outline-none focus:ring-2 focus:ring-[#1B5FED]/20 font-sans shadow-sm"
              />
            </div>

            {/* Plan Selection Tier */}
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 font-semibold mb-2">
                Select Organization Plan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "free", name: "Free", price: "$0", skills: "5 skills", seats: "3 seats" },
                  { id: "pro", name: "Pro", price: "$29/mo", skills: "50 skills", seats: "10 seats" },
                  { id: "enterprise", name: "Enterprise", price: "Custom", skills: "Unlimited", seats: "Unlimited" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlan(p.id as any)}
                    className={`rounded-[6px] border p-2.5 text-left transition-all cursor-pointer ${
                      plan === p.id
                        ? "border-[#1B5FED] bg-[#1B5FED]/10 text-black shadow-sm ring-1 ring-[#1B5FED]"
                        : "border-black/10 bg-[#FAFAFA] text-black/70 hover:border-black/30 hover:bg-white"
                    }`}
                  >
                    <div className="font-mono text-xs font-semibold">{p.name}</div>
                    <div className="font-mono text-sm font-bold text-black mt-0.5">{p.price}</div>
                    <div className="text-[10px] text-black/50 mt-1">{p.skills}</div>
                    <div className="text-[10px] text-black/50">{p.seats}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[4px] bg-[#1B5FED] hover:bg-[#154ec4] px-4 py-3 text-xs font-mono font-semibold uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? "Provisioning Organization..." : "Create Organization & Continue"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-black/60">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-mono text-black font-semibold underline underline-offset-4 hover:text-[#1B5FED] transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
