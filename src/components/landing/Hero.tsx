"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Hero — the above-the-fold content: eyebrow, headline, body copy, CTA.
 * Designed to sit inside a full-screen flex column with the Navbar above it.
 * The parent section owns the gradient background.
 * Features Apple & Supaste-style optical blur resolve and physics spring entrance animation.
 */
export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger on mount after the first paint
    const t = setTimeout(() => {
      setMounted(true);
    }, 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center text-center px-6 sm:px-12 md:px-20 relative z-10"
      style={{ paddingBottom: "32px" }}
    >
      {/* Group Eyebrow and Headline for tight spacing */}
      <div className="flex flex-col items-center gap-y-1 md:gap-y-1.5">
        {/* Eyebrow: white logo + product name with scale & blur resolve */}
        <div
          className={`flex items-center justify-center gap-[4px] md:gap-[5px] lg:gap-[6px] hero-transition-base duration-900 ${
            mounted
              ? "opacity-100 blur-0 translate-y-0 scale-100"
              : "opacity-0 blur-[10px] translate-y-3 scale-95"
          }`}
          style={{ transitionDelay: "220ms" }}
        >
          <Image
            src="/images/white.png"
            alt="Agent SPM"
            width={16}
            height={16}
            className="object-contain flex-shrink-0 w-[12px] md:w-[14px] lg:w-[18px] h-[12px] md:h-[16px] lg:h-[22px]"
            priority
          />
          <span
            className="text-[14px] md:text-[16px] lg:text-[20px]"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              letterSpacing: "0.01em",
              color: "#ffffff",
              whiteSpace: "nowrap",
            }}
          >
            Agent Skills Package Manager
          </span>
        </div>

        {/* Main Headline with Staggered Optical Blur-In */}
        <h1
          className="text-[46px] sm:text-[48px] md:text-[78px] lg:text-[108px] max-w-[320px] sm:max-w-[480px] md:max-w-[680px] lg:max-w-[960px] w-full"
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontWeight: 400,
            fontStyle: "italic",
            lineHeight: "96%",
            letterSpacing: "-0.03em",
            textAlign: "center",
            color: "#ffffff",
            margin: "0 auto",
          }}
        >
          <span
            className={`inline-block hero-transition-base duration-1000 ${
              mounted
                ? "opacity-100 blur-0 translate-y-0"
                : "opacity-0 blur-[14px] translate-y-4"
            }`}
            style={{ transitionDelay: "80ms" }}
          >
            Intelligence should be
          </span>{" "}
          <span
            className={`inline-block hero-transition-base duration-1000 ${
              mounted
                ? "opacity-100 blur-0 translate-y-0"
                : "opacity-0 blur-[14px] translate-y-4"
            }`}
            style={{ transitionDelay: "260ms" }}
          >
            Simple.
          </span>
        </h1>

        {/* Subtitle Paragraph with Smooth Spring Slide-Up */}
        <p
          className={`text-[11px] sm:text-[15px] md:text-[16px] lg:text-[18px] max-w-[300px] sm:max-w-[540px] md:max-w-[720px] lg:max-w-[820px] w-full hero-transition-base duration-1000 ${
            mounted
              ? "opacity-95 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            lineHeight: "1.4",
            letterSpacing: "-0.02em",
            textAlign: "center",
            color: "#ffffff",
            margin: "0 auto",
            marginTop: "16px",
            transitionDelay: "450ms",
          }}
        >
          Stop rebuilding. Start compounding. Skills arm your agents with battle-tested{" "}
          <br className="hidden lg:inline" />
          procedural knowledge, installed in seconds, shared across teams, refined{" "}
          <br className="hidden lg:inline" />
          over time. We&apos;re building the arsenal. You bring the mission.
        </p>
      </div>

      {/* CTA Button with Tactile Hover & Spring Settle */}
      <Link
        href="/search"
        className={`inline-flex items-center justify-center bg-white text-black shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95 duration-200 gap-2 cursor-pointer select-none group w-[180px] sm:w-[225px] md:w-[242px] lg:w-[272px] h-[36px] sm:h-[42px] md:h-[46px] lg:h-[51px] text-[14px] sm:text-[15px] md:text-[16px] lg:text-[18px] mt-8 sm:mt-10 md:mt-12 hero-transition-base duration-900 ${
          mounted
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-5 scale-95"
        }`}
        style={{
          borderRadius: "41px",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          lineHeight: "100%",
          letterSpacing: "-0.05em",
          textAlign: "center",
          transitionDelay: "650ms",
        }}
      >
        <span>Explore skills &amp; MCPs</span>
        <span className="transform transition-transform duration-200 group-hover:translate-x-1">
          →
        </span>
      </Link>
    </div>
  );
}
