"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "Can I switch plans at any time?",
    answer: "Yes. Upgrade instantly, downgrade at the end of your billing cycle. No lock-in contracts.",
  },
  {
    question: "What happens if I exceed the API rate limit?",
    answer: "Requests are throttled, not blocked. You'll receive a 429 response with a Retry-After header. Upgrade to Pro for higher limits.",
  },
  {
    question: "Do you offer discounts for open-source projects?",
    answer: "Yes — qualifying open-source projects get Pro features for free. Contact us with a link to your repo.",
  },
  {
    question: "Is there a free trial for Pro?",
    answer: "Yes — 14-day free trial, no credit card required. Cancel anytime.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "Visa, Mastercard, Amex via Stripe. Enterprise customers can pay via invoice.",
  },
];

export const PricingFAQ = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-28">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-surface-900 dark:text-surface-50 tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-sm sm:text-base text-surface-500 dark:text-surface-400">
          Have questions about billing, limits, or private registries? We have answers.
        </p>
      </div>

      {/* Accordion container */}
      <div className="space-y-4">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-0 overflow-hidden transition-all duration-300 hover:border-surface-300 dark:hover:border-surface-700 shadow-sm hover:shadow-md"
            >
              {/* Question Trigger */}
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="flex items-center justify-between w-full p-6 text-left font-semibold text-surface-900 dark:text-surface-100 hover:text-brand-blue dark:hover:text-brand-blue transition-colors cursor-pointer select-none"
              >
                <span className="pr-4 text-base sm:text-lg tracking-tight">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-surface-400 dark:text-surface-500 shrink-0 transform transition-transform duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isOpen ? "rotate-180 text-brand-blue dark:text-brand-blue" : ""
                  }`}
                />
              </button>

              {/* Smooth Grid Rows Height Transition Accordion */}
              <div
                className={`grid transition-all duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-6 pt-0 text-sm sm:text-base leading-relaxed text-surface-500 dark:text-surface-450 font-normal">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

