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
        <h2 className="text-3xl font-extrabold tracking-tight text-black sm:text-4xl uppercase font-mono">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-sm sm:text-base text-zinc-600">
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
              className="rounded-2xl border-2 border-black bg-white overflow-hidden transition-all duration-200 shadow-[2px_2px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px]"
            >
              {/* Question Trigger */}
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="flex items-center justify-between w-full p-6 text-left font-bold text-black hover:text-[#1B5FED] transition-colors cursor-pointer select-none"
              >
                <span className="pr-4 text-base sm:text-lg tracking-tight font-mono uppercase">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-black shrink-0 transform transition-transform duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isOpen ? "rotate-180 text-[#1B5FED]" : ""
                  }`}
                />
              </button>

              {/* Smooth Grid Rows Height Transition Accordion */}
              <div
                className={`grid transition-all duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100 border-t-2 border-black"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-6 text-sm sm:text-base leading-relaxed text-zinc-700 bg-[#E8E9ED]/20 font-medium">
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
