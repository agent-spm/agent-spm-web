import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { StrayPixelField } from "@/components/shared/StrayPixelField";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-white text-black font-sans relative selection:bg-[#1A5FED]/10 selection:text-[#1A5FED] overflow-x-hidden">
      {/* ─── Signature Continuous Hero Section with Deep Blue-Purple Gradient (Matching Home page) ─── */}
      <section
        className="relative w-full min-h-dvh flex flex-col justify-between overflow-x-hidden"
        style={{
          background:
            "linear-gradient(180deg, #190096 0%, #0080FF 18%, #78D2FF 53%, #cce9ff 72%, #ffffff 100%)",
          boxShadow:
            "inset 0 0 120px rgba(255,255,255,0.85), inset 0 0 40px rgba(255,255,255,0.5)",
        }}
      >
        {/* Identical Unified Navigation Bar matching all site pages */}
        <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-12 flex-shrink-0 relative z-20">
          <Navbar />
        </div>

        {/* Ambient Subtle Stray Pixel Debris */}
        <StrayPixelField />

        {/* Auth Content Container */}
        <main className="relative max-w-[1300px] mx-auto w-full flex-1 flex flex-col justify-center items-center z-10 px-4 sm:px-6 lg:px-12 py-6 sm:py-8 min-w-0">
          {children}
        </main>

        {/* Minimalist, Clean Security & Copyright Footer */}
        <footer className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-black/60 relative z-20">
          <div className="flex items-center gap-2">
            <span>© 2026 Agent SPM, Inc.</span>
            <span>•</span>
            <span className="text-black/50">Open Source (Apache 2.0)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>All Systems Operational</span>
            </span>
            <span>•</span>
            <a href="/privacy" className="hover:text-black transition-colors">Privacy</a>
            <span>•</span>
            <a href="/terms" className="hover:text-black transition-colors">Terms</a>
          </div>
        </footer>
      </section>
    </div>
  );
}
