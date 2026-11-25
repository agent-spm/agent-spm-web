"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/data/session-context";
import { useToast } from "@/components/ui/ToastProvider";
import {
  CreditCard,
  Download,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  Users,
  TerminalSquare,
  Activity,
  ArrowUpRight,
  Sparkles,
  Receipt,
  Clock,
  Check,
} from "lucide-react";

interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: string;
  status: "paid" | "pending" | "failed";
  plan: string;
  pdfUrl?: string;
}

export default function WorkspaceBillingPage() {
  const { currentOrg, teamMembers, skills, userProfile } = useSession();
  const { showToast } = useToast();

  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [requestedPlan, setRequestedPlan] = useState<string | null>(null);
  const [upgradedPlan, setUpgradedPlan] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const planParam = new URLSearchParams(window.location.search).get("plan");
      if (planParam) {
        setRequestedPlan(planParam.toLowerCase());
      }
    }
  }, []);

  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const activePlan = (upgradedPlan || currentOrg.plan || "free").toLowerCase();
  const isEnterprisePlan = activePlan.includes("enterprise");
  const isProPlan = !isEnterprisePlan && activePlan.includes("pro");

  const seatsUsed = teamMembers.length;
  const seatsAllowed = currentOrg.seatsAllowed || (isEnterprisePlan ? 500 : isProPlan ? 100 : 3);
  const seatsPct = seatsAllowed > 0 ? Math.round((seatsUsed / seatsAllowed) * 100) : 0;

  const skillsUsed = skills.length;
  const skillsAllowed = currentOrg.skillsAllowed || (isEnterprisePlan ? 500 : isProPlan ? 50 : 5);
  const skillsPct = skillsAllowed > 0 ? Math.round((skillsUsed / skillsAllowed) * 100) : 0;

  const handleDownloadInvoice = (inv: Invoice) => {
    // Generate clean text invoice receipt
    const receiptContent = `================================================
AGENT SPM REGISTRY - PAYMENT RECEIPT
================================================
Invoice Number: ${inv.number}
Date:           ${inv.date}
Organization:   ${currentOrg.name} (${currentOrg.slug})
Billing Email:  ${userProfile?.email || "billing@agentspm.com"}
Plan:           ${inv.plan}
Amount Paid:    ${inv.amount} USD
Payment Method: Razorpay Verified Checkout
Status:         COMPLETED / PAID
Transaction ID: ${inv.id}

Line Items:
1. ${inv.plan}                              ${inv.amount}
Subtotal:                                       ${inv.amount}
Tax (0%):                                       $0.00
Total Paid:                                     ${inv.amount} USD
================================================
Thank you for supporting autonomous AI agent infrastructure.
For billing inquiries: billing@agent-spm.com
================================================`;

    const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${inv.number}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      title: "Invoice Downloaded",
      message: `Downloaded receipt for ${inv.number} (${inv.amount} USD).`,
      type: "success",
    });
  };

  const handleTriggerCheckout = async (planName: string, price: string) => {
    setUpgradingPlan(planName);

    try {
      const email = userProfile?.email;
      if (!email) {
        setUpgradingPlan(null);
        showToast({
          title: "Authentication Required",
          message: "Please sign in before modifying your billing plan.",
          type: "error",
        });
        return;
      }

      const planId = planName.toLowerCase();

      // 1. Create order (authoritative pricing resolved on server)
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          email,
        }),
      });

      const orderData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(orderData.error || "Failed to initialize checkout order");
      }

      const orderId = orderData.order_id;
      const keyId = orderData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

      // 2. Check if Razorpay JS SDK can be loaded
      const loadRazorpay = (): Promise<boolean> => {
        return new Promise((resolve) => {
          if (typeof window !== "undefined" && (window as Window & { Razorpay?: unknown }).Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const sdkLoaded = orderData.is_test ? false : await loadRazorpay();

      // If live Razorpay keys are configured and SDK loaded
      const RazorpayCtor = (
        window as Window & {
          Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
        }
      ).Razorpay;
      if (sdkLoaded && !orderData.is_test && keyId && RazorpayCtor) {
        const rzp = new RazorpayCtor({
          key: keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Agent SPM Registry",
          description: `${planName} Subscription Tier`,
          order_id: orderId,
          prefill: {
            name: userProfile?.name || "Workspace Member",
            email: email,
          },
          theme: {
            color: "#1B5FED",
          },
          handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
            try {
              const verifyRes = await fetch("/api/checkout/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  planId,
                  email,
                }),
              });

              const verifyData = await verifyRes.json().catch(() => ({}));
              if (verifyRes.ok) {
                const nextOrgPlan = verifyData.orgPlan || (planId.includes("enterprise") ? "enterprise" : "pro");
                setUpgradedPlan(nextOrgPlan);
                setInvoices((prev) => [
                  {
                    id: String(response.razorpay_order_id),
                    number: `INV-${new Date().getFullYear()}-${String(prev.length + 1).padStart(3, "0")}`,
                    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                    amount: price,
                    status: "paid",
                    plan: verifyData.plan || planName,
                  },
                  ...prev,
                ]);
                showToast({
                  title: `${planName} Plan Activated!`,
                  message: `Payment verified. Entitlements provisioned for ${email}.`,
                  type: "success",
                });
              } else {
                showToast({
                  title: "Payment Verification Failed",
                  message: verifyData.error || "Unable to verify payment signature.",
                  type: "error",
                });
              }
            } catch (err) {
              console.error("Verification error:", err);
            }
          },
        });
        rzp.open();
        setUpgradingPlan(null);
      } else if (orderData.is_test) {
        // Explicit local-development fallback when RAZORPAY_KEY_SECRET is unset
        const verifyRes = await fetch("/api/checkout/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_payment_id: `pay_dev_${Date.now()}`,
            razorpay_order_id: orderId,
            razorpay_signature: "dev_local_placeholder",
            planId,
            email,
          }),
        });

        const verifyData = await verifyRes.json().catch(() => ({}));
        setUpgradingPlan(null);
        if (verifyRes.ok) {
          const nextOrgPlan = verifyData.orgPlan || (planId.includes("enterprise") ? "enterprise" : "pro");
          setUpgradedPlan(nextOrgPlan);
          setInvoices((prev) => [
            {
              id: String(orderId),
              number: `INV-${new Date().getFullYear()}-${String(prev.length + 1).padStart(3, "0")}`,
              date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              amount: price,
              status: "paid",
              plan: verifyData.plan || planName,
            },
            ...prev,
          ]);
          showToast({
            title: `${planName} Plan Activated (Dev Mode)`,
            message: `Local development entitlement provisioned for ${email}.`,
            type: "success",
          });
        } else {
          showToast({
            title: "Checkout Verification Blocked",
            message: verifyData.error || "Live payment credentials required.",
            type: "error",
          });
        }
      } else {
        setUpgradingPlan(null);
        showToast({
          title: "Checkout SDK Unavailable",
          message: "Failed to load Razorpay Checkout SDK. Please verify network access and retry.",
          type: "error",
        });
      }
    } catch (err: unknown) {
      setUpgradingPlan(null);
      showToast({
        title: "Checkout Error",
        message: (err instanceof Error ? err.message : null) || "Failed to process checkout.",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6 text-black">
      {/* ── TOP HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#1B5FED]" />
            <h1 className="text-xl font-bold font-sans text-black">Billing & Usage Subscriptions</h1>
            <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#1B5FED]/10 text-[#1B5FED] border border-[#1B5FED]/20">
              {isEnterprisePlan ? "ENTERPRISE ACTIVE" : isProPlan ? "PRO ACTIVE" : "FREE TIER"}
            </span>
          </div>
          <p className="text-xs font-mono text-black/60 mt-1">
            Manage your organization plan, payment instruments, consumption quotas, and immutable receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/pricing"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-black font-mono text-xs uppercase font-semibold transition-all shadow-xs"
          >
            <span>Public Pricing Guide</span>
            <ExternalLink className="w-3.5 h-3.5 text-black/40" />
          </Link>
        </div>
      </div>

      {requestedPlan === "enterprise_lifetime" && !isEnterprisePlan && (
        <div className="rounded-2xl border border-[#1B5FED]/30 bg-[#1B5FED]/[0.04] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#1B5FED]">
              Enterprise Founder Lifetime Offer Selected
            </div>
            <p className="text-xs text-black/75 font-sans mt-1">
              Claim lifetime Enterprise Registry access (up to 500 seats &amp; 500 packages) for a single $15 payment via Razorpay.
            </p>
          </div>
          <button
            onClick={() => handleTriggerCheckout("enterprise_lifetime", "$15.00")}
            disabled={upgradingPlan === "enterprise_lifetime"}
            className="px-4 py-2.5 rounded-xl bg-black hover:bg-black/90 text-white font-mono text-xs font-semibold uppercase tracking-wider cursor-pointer whitespace-nowrap shadow-sm"
          >
            {upgradingPlan === "enterprise_lifetime" ? "Initializing..." : "Pay $15 via Razorpay →"}
          </button>
        </div>
      )}

      {/* ── CURRENT ACTIVE SUBSCRIPTION CARD ── */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#1B5FED]/10 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase font-bold text-black/50">Current Plan:</span>
              <span className="font-mono text-sm font-bold text-[#1B5FED] bg-[#1B5FED]/10 px-2 py-0.5 rounded">
                {isEnterprisePlan ? "ENTERPRISE" : isProPlan ? "PRO WORKSPACE" : "COMMUNITY FREE"}
              </span>
              <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {isProPlan || isEnterprisePlan ? "Active Plan" : "Free Forever"}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-sans text-black">
                {isEnterprisePlan ? "$15.00" : isProPlan ? "$29.00" : "$0.00"}
              </span>
              <span className="text-xs font-mono text-black/60">
                {isEnterprisePlan ? "founder license" : isProPlan ? "/ month" : "/ forever"}
              </span>
            </div>

            <p className="text-xs text-black/70 font-sans leading-relaxed">
              Workspace <strong>{currentOrg.slug}</strong> currently supports up to{" "}
              <strong>{seatsAllowed} seats</strong> and <strong>{skillsAllowed} skill packages</strong>.
            </p>
          </div>

          {/* Payment Method Details */}
          <div className="p-4 rounded-xl border border-black/10 bg-black/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-[320px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-mono text-[10px] font-bold tracking-widest shadow-xs">
                RZP
              </div>
              <div>
                <div className="font-mono text-xs font-bold text-black">Razorpay Standard Checkout</div>
                <div className="text-[11px] font-mono text-black/50">
                  {userProfile?.email || "No billing email linked"}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleTriggerCheckout("enterprise_lifetime", "$15.00")}
              className="px-3 py-1.5 rounded-lg border border-black/10 bg-white hover:bg-black/5 text-black font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-xs whitespace-nowrap"
            >
              {isEnterprisePlan ? "License Active" : "Claim $15 Access"}
            </button>
          </div>
        </div>
      </div>

      {/* ── QUOTA & CONSUMPTION GAUGES ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Team Seats */}
        <div className="rounded-xl border border-black/10 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-black/50">
            <span className="font-mono text-xs uppercase font-semibold">Team Seats</span>
            <Users className="w-4 h-4 text-[#1B5FED]" />
          </div>
          <div>
            <div className="text-2xl font-bold font-sans text-black">
              {seatsUsed} <span className="text-xs font-mono text-black/50 font-normal">/ {seatsAllowed} seats</span>
            </div>
            <div className="w-full bg-black/5 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-[#1B5FED] h-1.5 rounded-full transition-all" style={{ width: `${Math.min(seatsPct, 100)}%` }} />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-black/50">
            <span>{seatsPct}% allocated</span>
            <Link href="/app/team" className="text-[#1B5FED] hover:underline font-semibold">Invite →</Link>
          </div>
        </div>

        {/* Metric 2: Published Skills */}
        <div className="rounded-xl border border-black/10 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-black/50">
            <span className="font-mono text-xs uppercase font-semibold">Skill Packages</span>
            <TerminalSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold font-sans text-black">
              {skillsUsed} <span className="text-xs font-mono text-black/50 font-normal">/ {skillsAllowed} pkgs</span>
            </div>
            <div className="w-full bg-black/5 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-emerald-600 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(skillsPct, 100)}%` }} />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-black/50">
            <span>{skillsPct}% used</span>
            <Link href="/app/skills/publish" className="text-[#1B5FED] hover:underline font-semibold">+ Publish</Link>
          </div>
        </div>

        {/* Metric 3: Fleet API Calls */}
        <div className="rounded-xl border border-black/10 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-black/50">
            <span className="font-mono text-xs uppercase font-semibold">Fleet RPC Calls</span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold font-sans text-black">
              1.42 M <span className="text-xs font-mono text-black/50 font-normal">/ 5.0 M max</span>
            </div>
            <div className="w-full bg-black/5 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-amber-600 h-1.5 rounded-full transition-all" style={{ width: "28.4%" }} />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-black/50">
            <span>28.4% monthly cycle</span>
            <span className="text-emerald-700 font-semibold">Healthy</span>
          </div>
        </div>

        {/* Metric 4: Schema Compression */}
        <div className="rounded-xl border border-black/10 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-black/50">
            <span className="font-mono text-xs uppercase font-semibold">Token Diet Engine</span>
            <Zap className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-bold font-sans text-black">
              48.2 MB <span className="text-xs font-mono text-black/50 font-normal">/ 100 MB</span>
            </div>
            <div className="w-full bg-black/5 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-purple-600 h-1.5 rounded-full transition-all" style={{ width: "48.2%" }} />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-black/50">
            <span>48.2% compressed</span>
            <Link href="/app/tools/schema-diet" className="text-[#1B5FED] hover:underline font-semibold">Open Tool →</Link>
          </div>
        </div>
      </div>

      {/* ── PLAN UPGRADE / COMPARISON TIERS ── */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-black">Available Workspace Plans</h2>
            <p className="text-xs font-mono text-black/60 mt-0.5">
              Scale your team seats, autonomous agent compute quotas, and SLA guarantees.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/[0.04] border border-black/10 font-mono text-xs">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                billingCycle === "monthly" ? "bg-white text-black shadow-xs" : "text-black/50 hover:text-black"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                billingCycle === "annual" ? "bg-white text-black shadow-xs" : "text-black/50 hover:text-black"
              }`}
            >
              <span>Annual</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Tier 1: Free */}
          <div className="rounded-xl border border-black/10 bg-white p-5 flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-black/70">Community</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-sans text-black">$0</span>
                <span className="text-xs font-mono text-black/50">/ forever</span>
              </div>
              <p className="text-xs text-black/70 font-sans">
                For solo developers building and testing procedural skills.
              </p>
              <ul className="space-y-2 text-xs font-mono text-black/70 border-t border-black/10 pt-4">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-black/40" /> 3 Team Seats</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-black/40" /> 5 Public Skills</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-black/40" /> Community Discord Support</li>
              </ul>
            </div>
            <div className="mt-6">
              <button
                disabled
                className="w-full py-2.5 rounded-xl bg-black/5 text-black/40 font-mono text-xs font-semibold uppercase border border-black/10 cursor-not-allowed"
              >
                Included
              </button>
            </div>
          </div>

          {/* Tier 2: Pro */}
          <div className="rounded-xl border-2 border-[#1B5FED] bg-[#1B5FED]/[0.02] p-5 flex flex-col justify-between shadow-md relative">
            {isProPlan && (
              <div className="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-[#1B5FED] text-white font-mono text-[10px] font-bold uppercase tracking-wider shadow-sm">
                Current Plan
              </div>
            )}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1B5FED]">Pro Workspace</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-sans text-black">
                  {billingCycle === "monthly" ? "$29" : "$24"}
                </span>
                <span className="text-xs font-mono text-black/50">/ user / mo</span>
              </div>
              <p className="text-xs text-black/70 font-sans">
                For autonomous AI agent engineering teams publishing production skills.
              </p>
              <ul className="space-y-2 text-xs font-mono text-black/80 border-t border-black/10 pt-4">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#1B5FED]" /> 100 Team Seats</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#1B5FED]" /> 50 Skill Packages (Public & Private)</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#1B5FED]" /> Multi-Agent DAG Studio (Canvas)</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#1B5FED]" /> Priority Support & Webhooks</li>
              </ul>
            </div>
            <div className="mt-6">
              {isProPlan || isEnterprisePlan ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl bg-[#1B5FED]/10 text-[#1B5FED] font-mono text-xs font-bold uppercase border border-[#1B5FED]/30 cursor-default"
                >
                  {isProPlan ? "Active Subscription" : "Included in Enterprise"}
                </button>
              ) : (
                <button
                  onClick={() => handleTriggerCheckout("pro", "$29.00")}
                  disabled={upgradingPlan === "pro"}
                  className="w-full py-2.5 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                >
                  {upgradingPlan === "pro" ? "Initializing..." : "Upgrade to Pro"}
                </button>
              )}
            </div>
          </div>

          {/* Tier 3: Enterprise */}
          <div className="rounded-xl border border-black/10 bg-white p-5 flex flex-col justify-between shadow-xs hover:border-black/30 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-purple-700">Enterprise</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-sans text-black">$15</span>
                <span className="text-xs font-mono text-black/50">/ founder lifetime (or $999 SLA)</span>
              </div>
              <p className="text-xs text-black/70 font-sans">
                Dedicated multi-region hosting, SAML SSO, and unlimited private skill packages.
              </p>
              <ul className="space-y-2 text-xs font-mono text-black/70 border-t border-black/10 pt-4">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-600" /> 500 Team Seats</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-600" /> 500 Private Skills & Air-Gap</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-600" /> Okta / Azure AD SAML SSO</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-600" /> 24/7 Dedicated SLA & SOC 2 Vault</li>
              </ul>
            </div>
            <div className="mt-6 space-y-2">
              <button
                onClick={() => handleTriggerCheckout("enterprise_lifetime", "$15.00")}
                disabled={isEnterprisePlan || upgradingPlan === "enterprise_lifetime"}
                className="w-full py-2.5 rounded-xl bg-black hover:bg-black/90 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isEnterprisePlan
                  ? "Enterprise Active"
                  : upgradingPlan === "enterprise_lifetime"
                    ? "Processing..."
                    : "Claim Enterprise — $15"}
              </button>
              {!isEnterprisePlan && (
                <button
                  onClick={() => handleTriggerCheckout("enterprise", "$999.00")}
                  disabled={upgradingPlan === "enterprise"}
                  className="w-full py-1.5 rounded-xl border border-black/15 bg-white hover:bg-black/5 text-black/70 font-mono text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer"
                >
                  {upgradingPlan === "enterprise" ? "Contacting..." : "Enterprise Annual SLA — $999"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── INVOICE HISTORY TABLE ── */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-black">Invoice & Payment History</h2>
            <p className="text-xs font-mono text-black/60 mt-0.5">
              Verified cryptographically signed transaction receipts.
            </p>
          </div>
        </div>

        <div className="border border-black/10 rounded-xl overflow-hidden font-mono text-xs">
          <div className="grid grid-cols-12 bg-black/[0.03] p-3 font-bold text-black/50 uppercase border-b border-black/10 text-[11px]">
            <div className="col-span-3">Invoice Number</div>
            <div className="col-span-3">Billing Period</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Receipt</div>
          </div>

          <div className="divide-y divide-black/10">
            {invoices.length === 0 ? (
              <div className="p-6 text-center text-black/50 font-mono text-xs">
                No payment receipts recorded in this session yet. Verified Razorpay transactions appear here automatically.
              </div>
            ) : (
              invoices.map((inv) => (
                <div key={inv.id} className="grid grid-cols-12 p-3 items-center hover:bg-black/[0.01] transition-colors">
                  <div className="col-span-3 font-bold text-black flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-black/40" />
                    <span>{inv.number}</span>
                  </div>
                  <div className="col-span-3 text-black/70">{inv.date}</div>
                  <div className="col-span-2 font-bold text-black">{inv.amount} USD</div>
                  <div className="col-span-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase inline-flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      {inv.status}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <button
                      onClick={() => handleDownloadInvoice(inv)}
                      className="inline-flex items-center gap-1 text-[#1B5FED] hover:underline font-semibold cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
