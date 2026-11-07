"use client";

import React, { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "What is Agent Skills Package Manager (SPM)?",
    answer:
      "SPM is the open-source registry and dependency manager for autonomous AI agent skills. Just like npm packages reusable JavaScript code, SPM allows developers to package, publish, version, and orchestrate complex agent skills and tool definitions in seconds.",
  },
  {
    question: "How does SPM integrate with MCP (Model Context Protocol)?",
    answer:
      "SPM natively integrates with MCP. Every skill package can expose an MCP server endpoint or load existing MCP tool servers directly, giving Claude, Cursor, and custom LangChain/LlamaIndex agents instant access.",
  },
  {
    question: "Is SPM free for open source developers?",
    answer:
      "Yes, 100%! All public skills, CLI commands (npx spm init, spm install), and community registry lookups are completely free forever.",
  },
  {
    question: "How are skills verified for security and safety?",
    answer:
      "Every package submitted to SPM undergoes automated AST analysis, dependency audit scans, and sandboxed validation to protect against prompt injection, malicious tool calling, and arbitrary code execution.",
  },
  {
    question: "Can I use SPM with private company repositories?",
    answer:
      "Yes. The Enterprise tier allows you to host private namespaces, manage internal skill access with team roles, and enforce strict governance policies across your engineering organization.",
  },
  {
    question: "Which programming languages and agent frameworks are supported?",
    answer:
      "SPM supports TypeScript, JavaScript, and Python out of the box, with native bindings for LangChain, LlamaIndex, AutoGen, CrewAI, and the Google Antigravity SDK.",
  },
  {
    question: "Where are skills stored and executed?",
    answer:
      "Skills are distributed via our edge CDN and executed in your own local or cloud agent environment. SPM never reads your proprietary prompt data or agent conversation memory.",
  },
  {
    question: "How do I publish my own skill package?",
    answer:
      "Run npx spm init inside your skill folder to create your spm.yaml manifest, test your schema, and publish with spm publish using your developer token.",
  },
  {
    question: "Does SPM support offline or air-gapped deployments?",
    answer:
      "Yes. Enterprise plans include offline bundle exports and on-premise registry mirrors for air-gapped defense, finance, and healthcare environments.",
  },
  {
    question: "How does payment and billing work?",
    answer:
      "We offer a simple one-time developer access payment or enterprise subscriptions securely processed via Polar.sh and Stripe.",
  },
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto flex flex-col items-center">
        {/* Header */}
        <div className="text-center max-w-4xl mb-14 sm:mb-20">
          <h2
            className="font-instrument-serif text-4xl sm:text-6xl lg:text-[64px] leading-[1.05] text-black font-normal italic tracking-tight mb-4"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            Frequently Asked Questions
          </h2>
          <p className="font-sans text-base sm:text-xl text-black/60 font-medium leading-relaxed max-w-[900px] mx-auto">
            Everything you need to know before getting started with Skills
            Package Manager, from privacy and compatibility to how your skills
            history is stored and handled .
          </p>
        </div>

        {/* 2-Column Accordion Grid (Exact 1000px = 490px + 20px gap + 490px from Figma) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-[1000px]">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-[#F7F7F7] rounded-[4px] border border-black/5 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  aria-expanded={isOpen}
                  className="w-full min-h-[62px] px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-[2px] bg-white border border-black/5 flex items-center justify-center font-mono text-base font-semibold text-black flex-shrink-0 shadow-xs">
                      {isOpen ? "−" : "+"}
                    </span>
                    <span className="font-sans text-sm sm:text-base font-medium text-black">
                      {faq.question}
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm font-sans text-neutral-600 leading-relaxed border-t border-black/5 animate-[fadeIn_0.2s_ease-out]">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
