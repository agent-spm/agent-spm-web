"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { PixelBox } from "@/components/landing/PixelBox";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Pixel404Glyph } from "@/components/landing/Pixel404Glyph";

/**
 * Ambient stray pixel debris — gentle breathing squares scattered
 * across the gradient background, reinforcing the "failed assembly" theme.
 * Each pixel fades in, holds, fades out with staggered timing.
 * Deterministic seed so SSR matches hydration.
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface StrayPixel {
  x: number; // % from left
  y: number; // % from top
  size: number; // px
  color: string;
  opacity: number;
  delay: number; // animation-delay in seconds
  duration: number; // full cycle duration in seconds
}

const STRAY_COLORS = ["#ECF8FF", "#C5EAFF", "#B7E5FF", "#A9E0FF", "#8ED6FF"];

function generateStrayPixels(): StrayPixel[] {
  const rng = mulberry32(404_001);
  const pixels: StrayPixel[] = [];
  const count = 15;

  // Exclusion zone: center 40% width × 30-85% height (where text/glyph lives)
  for (let i = 0; i < count; i++) {
    let x: number, y: number;
    let attempts = 0;
    do {
      x = rng() * 92 + 4; // 4% to 96%
      y = rng() * 80 + 8; // 8% to 88%
      attempts++;
    } while (
      // Avoid center content zone
      x > 25 && x < 75 && y > 15 && y < 80 &&
      attempts < 20
    );

    pixels.push({
      x,
      y,
      size: Math.floor(rng() * 14) + 10, // 10-24px
      color: STRAY_COLORS[Math.floor(rng() * STRAY_COLORS.length)],
      opacity: rng() * 0.2 + 0.12, // 0.12 to 0.32
      delay: rng() * 6, // 0-6s stagger
      duration: rng() * 3 + 4, // 4-7s per full breathe cycle
    });
  }
  return pixels;
}

const STRAY_PIXELS = generateStrayPixels();

function StrayPixelField() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-10"
      aria-hidden="true"
    >
      {STRAY_PIXELS.map((px, i) => (
        <div
          key={i}
          className="absolute pixel-debris-breathe"
          style={{
            left: `${px.x}%`,
            top: `${px.y}%`,
            width: px.size,
            height: px.size,
            backgroundColor: px.color,
            opacity: 0,
            animationDelay: `${px.delay}s`,
            animationDuration: `${px.duration}s`,
            // @ts-expect-error CSS custom property for per-pixel max opacity
            "--pixel-max-opacity": px.opacity,
          }}
        />
      ))}
    </div>
  );
}

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="min-h-screen bg-white text-black font-sans relative overflow-x-hidden flex flex-col justify-between">
      {/* ─── Hero Gradient (identical to landing page) ─── */}
      <section
        className="relative w-full flex-1 flex flex-col"
        style={{
          background:
            "linear-gradient(180deg, #190096 0%, #0080FF 18%, #78D2FF 53%, #cce9ff 72%, #ffffff 100%)",
          boxShadow:
            "inset 0 0 120px rgba(255,255,255,0.85), inset 0 0 40px rgba(255,255,255,0.5)",
        }}
      >
        {/* Ambient Stray Pixel Debris */}
        <StrayPixelField />

        {/* Navbar */}
        <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-12 relative z-30 flex-shrink-0">
          <Navbar />
        </div>

        {/* 404 Content — Centered Vertically */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-8">
          {/* Animated Pixel "4 0 4" Glyph */}
          <div
            className={`w-full max-w-[420px] sm:max-w-[480px] md:max-w-[540px] mb-8 sm:mb-10 hero-transition-base duration-1000 ${
              mounted
                ? "opacity-100 blur-0 translate-y-0 scale-100"
                : "opacity-0 blur-[18px] translate-y-6 scale-90"
            }`}
            style={{ transitionDelay: "80ms" }}
          >
            <Pixel404Glyph />
          </div>

          {/* Eyebrow Status Pill */}
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-mono text-xs sm:text-sm mb-5 shadow-sm hero-transition-base duration-900 ${
              mounted
                ? "opacity-100 blur-0 translate-y-0"
                : "opacity-0 blur-[10px] translate-y-3"
            }`}
            style={{ transitionDelay: "220ms" }}
          >
            <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-pulse" />
            <span className="tracking-wide uppercase font-semibold">
              404 : Skill Not Found
            </span>
          </div>

          {/* Headline — Instrument Serif Italic */}
          <h1
            className={`text-3xl sm:text-5xl md:text-6xl lg:text-[68px] font-normal italic leading-[1.08] tracking-tight text-white mb-5 select-none text-center max-w-[700px] hero-transition-base duration-1000 ${
              mounted
                ? "opacity-100 blur-0 translate-y-0"
                : "opacity-0 blur-[14px] translate-y-4"
            }`}
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              transitionDelay: "350ms",
            }}
          >
            This page couldn&apos;t
            <br className="hidden sm:inline" /> resolve.
          </h1>

          {/* Subtitle */}
          <p
            className={`font-sans text-sm sm:text-base md:text-lg text-white/90 max-w-[560px] font-medium leading-relaxed mb-8 sm:mb-10 text-center hero-transition-base duration-1000 ${
              mounted
                ? "opacity-95 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
            style={{
              letterSpacing: "-0.02em",
              transitionDelay: "500ms",
            }}
          >
            The skill, route, or package you&apos;re looking for doesn&apos;t exist
            in the registry. It may have been unpublished, moved, or is waiting
            to be authored.
          </p>

          {/* Dynamic Route Reflection — shows the actual failed path */}
          {pathname && (
            <div
              className={`font-mono text-[11px] text-white/30 mb-6 text-center tracking-wide hero-transition-base duration-900 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
              style={{ transitionDelay: "620ms" }}
            >
              spm resolve{" "}
              <span className="text-white/50">{pathname}</span>
              {" "}→ 404_NOT_FOUND
            </div>
          )}

          {/* Action CTAs */}
          <div
            className={`flex flex-wrap items-center justify-center gap-4 hero-transition-base duration-900 ${
              mounted
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-5 scale-95"
            }`}
            style={{ transitionDelay: "680ms" }}
          >
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 h-[46px] sm:h-[48px] px-7 sm:px-8 rounded-full bg-white text-black font-sans text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200"
              style={{ letterSpacing: "-0.03em" }}
            >
              <span>Back to Home</span>
              <span className="text-xs">→</span>
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 h-[46px] sm:h-[48px] px-7 sm:px-8 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white font-sans text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
              style={{ letterSpacing: "-0.03em" }}
            >
              <span>Explore Skills &amp; MCPs</span>
              <span className="text-xs">↗</span>
            </Link>
          </div>

          {/* Keyboard Shortcut Hints */}
          <div
            className={`flex items-center gap-3 mt-5 hero-transition-base duration-900 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
            style={{ transitionDelay: "820ms" }}
            aria-label="Keyboard shortcuts"
          >
            <span className="font-mono text-[10px] text-white/30 tracking-wide select-none">
              <kbd className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-[3px] bg-white/10 border border-white/20 font-mono text-[10px] text-white/50 mr-1">H</kbd>
              Home
            </span>
            <span className="text-white/20 text-[10px]">·</span>
            <span className="font-mono text-[10px] text-white/30 tracking-wide select-none">
              <kbd className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-[3px] bg-white/10 border border-white/20 font-mono text-[10px] text-white/50 mr-1">S</kbd>
              Search
            </span>
          </div>
        </div>

        {/* White Pixel Dissolve Seam — identical to homepage Hero → Content transition */}
        <div className="relative w-full z-20 pointer-events-none select-none">
          <PixelBox color="#ffffff" />
        </div>
      </section>

      {/* ─── Landing Footer with Pixel Bar ─── */}
      <LandingFooter />
    </main>
  );
}
