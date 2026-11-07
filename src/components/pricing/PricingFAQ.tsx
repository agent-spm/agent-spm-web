"use client";

import React, { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "Is the $15 Enterprise plan truly a one-time purchase?",
    answer:
      "Yes. You pay $15 once and receive perpetual access for your team. There are no recurring subscriptions, hidden maintenance fees, or surprise tiers.",
  },
  {
    question: "How do I receive my license key after checkout?",
    answer:
      "License keys and authentication tokens are generated instantly via Polar.sh upon checkout and emailed directly to your billing email address.",
  },
  {
    question: "Can I host a private skill registry internally?",
    answer:
      "Yes. Enterprise access includes instructions and container images for running air-gapped, on-premise private registries behind your corporate VPN or VPC.",
  },
  {
    question: "Do you offer custom invoicing or purchase orders?",
    answer:
      "Yes. If your company requires ACH, wire transfers, or custom PO invoicing, contact our team directly via the Connect page.",
  },
  {
    question: "What is your refund policy?",
    answer:
      "We offer a 14-day money-back guarantee. If Agent SPM doesn't streamline your agent development workflows, email support for a full refund.",
  },
  {
    question: "Can I use public skills with the free developer tier?",
    answer:
      "Absolutely. The open-source CLI, public registry search, and unlimited package installs are free forever for everyone in the developer ecosystem.",
  },
];

export const PricingFAQ = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-12">
        <h2
          className="font-instrument-serif text-3xl sm:text-5xl italic text-black font-normal tracking-tight"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          Frequently Asked Questions
        </h2>
        <p className="mt-2 text-sm sm:text-base text-black/60 font-sans">
          Common questions about enterprise access, licensing, and private registries.
        </p>
      </div>

      {/* 2-Column FAQ Grid matching Home Page FAQSection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-[#F7F7F7] border border-black/5 rounded-[6px] p-5 sm:p-6 transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full flex items-start justify-between gap-4 text-left cursor-pointer group"
              >
                <span className="font-sans text-base sm:text-lg font-semibold text-black group-hover:text-[#1A5FED] transition-colors leading-snug">
                  {faq.question}
                </span>
                <span className="w-6 h-6 rounded-[2px] bg-white border border-black/10 flex items-center justify-center font-mono text-xs font-bold shrink-0 text-black/70 group-hover:border-[#1A5FED] group-hover:text-[#1A5FED] transition-all">
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              {isOpen && (
                <div className="mt-4 pt-4 border-t border-black/5 animate-in fade-in duration-200">
                  <p className="font-sans text-sm sm:text-base text-black/70 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
