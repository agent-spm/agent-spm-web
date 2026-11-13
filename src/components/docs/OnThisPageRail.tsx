"use client";

import React, { useState, useEffect } from "react";
import { List, ThumbsUp, ThumbsDown, MessageSquare, ExternalLink, Zap } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/ToastProvider";

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export function OnThisPageRail() {
  const { showToast } = useToast();
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    // Collect all h2 and h3 elements within article
    const article = document.querySelector("article");
    if (!article) return;

    const elements = Array.from(article.querySelectorAll("h2, h3"));
    const items: HeadingItem[] = elements
      .map((el, index) => {
        if (!el.id) {
          el.id = `heading-${index}-${el.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || ""}`;
        }
        return {
          id: el.id,
          text: el.textContent || "",
          level: el.tagName === "H2" ? 2 : 3,
        };
      })
      .filter((item) => item.text.trim().length > 0);

    setHeadings(items);

    // Intersection observer for scroll spy
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0% -60% 0%" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleFeedback = (type: "up" | "down") => {
    setFeedbackSent(true);
    showToast({
      title: "Feedback Recorded",
      message: type === "up" ? "Thanks for your feedback!" : "We'll work on improving this guide.",
      type: "success",
    });
  };

  if (headings.length === 0) return null;

  return (
    <div className="w-56 sticky top-28 space-y-6 font-sans text-xs select-none">
      {/* Table of contents */}
      <div className="space-y-3">
        <span className="font-mono text-[10px] uppercase font-bold text-black/40 flex items-center gap-1.5 tracking-wider">
          <List className="w-3.5 h-3.5 text-[#1A5FED]" />
          On This Page
        </span>

        <nav className="space-y-1 border-l border-black/10 pl-3">
          {headings.map((h) => {
            const isActive = activeId === h.id;
            return (
              <a
                key={h.id}
                href={`#${h.id}`}
                className={`block transition-colors py-1 truncate leading-snug cursor-pointer ${
                  h.level === 3 ? "pl-2 text-[11px]" : ""
                } ${
                  isActive
                    ? "text-[#1A5FED] font-bold border-l-2 -ml-[13px] pl-3 border-[#1A5FED]"
                    : "text-black/60 hover:text-black"
                }`}
              >
                {h.text}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Quick Developer Utility Banner */}
      <div className="p-3.5 rounded-xl border border-black/10 bg-[#FAFAFA] space-y-2">
        <span className="font-mono text-[10px] uppercase font-bold text-[#1A5FED] block">
          Developer Tools
        </span>
        <Link
          href="/tools/schema-diet"
          className="text-xs font-semibold text-black hover:text-[#1A5FED] flex items-center gap-1 leading-tight group"
        >
          <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Schema Token Diet Tool</span>
        </Link>
        <p className="text-[11px] text-black/50 leading-relaxed">
          Compress tool schemas to cut context token costs by 50%+.
        </p>
      </div>

      {/* Helpful feedback micro-widget */}
      <div className="pt-4 border-t border-black/10 space-y-2">
        <span className="font-mono text-[10px] text-black/50 uppercase tracking-wider block">
          Was this page helpful?
        </span>
        {feedbackSent ? (
          <span className="font-mono text-[11px] text-emerald-700 font-semibold block">
            ✓ Feedback submitted
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFeedback("up")}
              className="p-1.5 rounded-lg border border-black/10 hover:bg-black/5 text-black/60 hover:text-black transition-colors cursor-pointer"
              title="Yes, helpful"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleFeedback("down")}
              className="p-1.5 rounded-lg border border-black/10 hover:bg-black/5 text-black/60 hover:text-black transition-colors cursor-pointer"
              title="Could be better"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
