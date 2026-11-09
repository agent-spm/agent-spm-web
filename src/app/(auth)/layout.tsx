import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { PixelBox } from "@/components/landing/PixelBox";
import { StrayPixelField } from "@/components/shared/StrayPixelField";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-black font-sans relative selection:bg-[#1A5FED]/10 selection:text-[#1A5FED] overflow-x-hidden">
      {/* ─── Signature Continuous Hero Section with Deep Blue-Purple Gradient (Matching Home page) ─── */}
      <section
        className="relative w-full flex-1 flex flex-col justify-between overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #190096 0%, #0080FF 18%, #78D2FF 53%, #cce9ff 72%, #ffffff 100%)",
          boxShadow:
            "inset 0 0 120px rgba(255,255,255,0.85), inset 0 0 40px rgba(255,255,255,0.5)",
        }}
      >
        {/* Universal Agent SPM Navigation Bar sitting seamlessly on gradient with 0 offset */}
        <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-12 flex-shrink-0 relative z-20">
          <Navbar />
        </div>

        {/* Ambient Breathing Stray Pixel Debris */}
        <StrayPixelField />

        {/* Auth Content */}
        <div className="relative max-w-[1200px] mx-auto w-full flex flex-col items-center z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {children}
        </div>

        {/* ─── Page 2 — Working Pixel art scroll-reveal zone matching Home page ─── */}
        <div className="relative h-[24vh] sm:h-[32vh] w-full pointer-events-none mt-4">
          <div
            className="absolute left-0 w-full z-30 pointer-events-none select-none transform-gpu -translate-y-[10%]"
            style={{ top: 0 }}
          >
            <PixelBox color="#ffffff" />
          </div>
        </div>
      </section>

      {/* Universal Agent SPM Footer */}
      <LandingFooter />
    </div>
  );
}
