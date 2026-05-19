"use client";

import React, { useState } from "react";
import { PricingToggle } from "./PricingToggle";
import { PricingCard } from "./PricingCard";
import { FeatureTable } from "./FeatureTable";
import { PricingFAQ } from "./PricingFAQ";
import { Terminal, ArrowRight } from "lucide-react";
import Link from "next/link";

export const PricingPageContent = () => {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");

  const isYearly = billingInterval === "yearly";

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* 1. Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-surface-900 dark:text-surface-50 sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-base sm:text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto leading-relaxed">
          Scale your AI agent capabilities with secure private registries, custom namespace reservation, and dedicated priority endpoints.
        </p>
      </div>

      {/* 2. Billing Toggle */}
      <PricingToggle billingInterval={billingInterval} setBillingInterval={setBillingInterval} />

      {/* 3. Pricing Cards Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 items-stretch">
        {/* Starter Plan */}
        <PricingCard
          name="Starter"
          price="$0"
          period="/ forever"
          tagline="For individual developers and open-source projects."
          features={[
            "Unlimited public package installs",
            "Publish up to 5 public packages",
            "Community support (GitHub / Discord)",
            "Basic package analytics (total downloads)",
            "CLI access (spm install, spm publish)",
            "100 API requests / hour",
          ]}
          ctaText="Get Started — Free"
          ctaHref="/search/"
        />

        {/* Pro Plan */}
        <PricingCard
          name="Pro"
          price={isYearly ? "$15" : "$19"}
          period={isYearly ? "/ month, billed annually" : "/ month"}
          tagline="For professional developers and growing teams."
          features={[
            "Publish unlimited public packages",
            "Publish up to 25 private packages",
            "Advanced analytics (weekly trends, regional)",
            "Priority search ranking for published packages",
            "Webhook notifications on version updates",
            "Private namespace reservation",
            "Email support (48h response SLA)",
            "5,000 API requests / hour",
          ]}
          ctaText="Upgrade to Pro"
          ctaHref="/connect/"
          popular={true}
        />

        {/* Enterprise Plan */}
        <PricingCard
          name="Enterprise"
          price="Custom"
          period=""
          tagline="For organizations building production AI agent infrastructure."
          features={[
            "Unlimited private packages",
            "SSO / SAML authentication",
            "Self-hosted registry option",
            "Dedicated account manager",
            "Custom SLA (99.9% uptime guarantee)",
            "Audit logs & compliance reports (SOC 2)",
            "Team management with roles & permissions",
            "Unlimited API requests",
            "On-call engineering support (4h SLA)",
            "Custom contract & invoicing",
          ]}
          ctaText="Contact Sales"
          ctaHref="/connect/"
        />
      </div>

      {/* 4. Comparison Table */}
      <FeatureTable />

      {/* 5. FAQ Section */}
      <PricingFAQ />

      {/* 6. Bottom Conversion CTA Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-950 px-6 py-20 mt-28 text-center sm:px-12 shadow-lg shadow-brand-blue/5 hover:border-brand-blue/20 transition-all duration-300">
        {/* Glowing Ambient Backdrop */}
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-brand-blue/10 blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute -right-40 -bottom-40 h-80 w-80 rounded-full bg-brand-blue/15 blur-[100px] pointer-events-none animate-pulse" />

        <div className="relative max-w-2xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue/10 px-3.5 py-1 text-[10px] tracking-widest font-bold text-brand-blue border border-brand-blue/25 uppercase mb-6">
            <Terminal className="h-3.5 w-3.5" />
            <span>Developer First</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-50 sm:text-4xl">
            Ready to scale your agent skills?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-surface-500 dark:text-surface-400 leading-relaxed max-w-lg">
            Get started for free or schedule a deep-dive call with our infrastructure team to orchestrate your private registry.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link
              href="/search/"
              className="group flex items-center gap-2 rounded-xl bg-brand-blue text-white px-6 py-3 text-sm font-semibold shadow-lg shadow-brand-blue/20 transition-all hover:bg-brand-blue/90 hover:shadow-brand-blue/35 cursor-pointer"
            >
              <span>Explore Packages</span>
              <ArrowRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/connect/"
              className="flex items-center gap-2 rounded-xl border border-surface-200 hover:border-brand-blue/30 bg-surface-0 hover:bg-surface-50 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300 dark:hover:text-white py-3 px-6 text-sm font-semibold transition-all cursor-pointer"
            >
              Talk to an Expert
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

