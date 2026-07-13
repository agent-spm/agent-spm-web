import { Navbar } from "@/components/layout/Navbar";
import { PixelBox } from "@/components/landing/PixelBox";
import Hero from "@/components/landing/Hero";
import OpenSourceStats from "@/components/landing/OpenSourceStats";
import WorkspaceFeatures from "@/components/landing/WorkspaceFeatures";
import ExcellenceGrid from "@/components/landing/ExcellenceGrid";

/**
 * Landing page — composed entirely of self-contained section components.
 * This file is intentionally minimal: it owns only the top-level gradient
 * wrapper and the scroll structure. All content lives in /components/landing/.
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black font-sans relative overflow-x-hidden">

      {/* ─── Single continuous gradient: Hero → PixelArt → OpenSource stats ─── */}
      <section
        className="relative w-full"
        style={{
          background:
            "linear-gradient(180deg, #190096 0%, #0080FF 18%, #78D2FF 53%, #cce9ff 72%, #ffffff 100%)",
          boxShadow:
            "inset 0 0 120px rgba(255,255,255,0.85), inset 0 0 40px rgba(255,255,255,0.5)",
        }}
      >
        {/* Page 1 — Hero (full viewport height) */}
        <div className="relative w-full min-h-screen flex flex-col justify-between">
          {/* Navbar */}
          <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-12 flex-shrink-0 relative z-20">
            <Navbar />
          </div>

          {/* Hero content: eyebrow, headline, body, CTA */}
          <Hero />
        </div>

        {/* Page 2 — Pixel art scroll-reveal zone */}
        <div className="relative h-[59vh] w-full pointer-events-none">
          <div
            className="absolute left-0 w-full z-30 pointer-events-none select-none transform-gpu -translate-y-[10%]"
            style={{ top: 0 }}
          >
            <PixelBox color="#ffffff" />
          </div>
        </div>

        {/* Open Source stats — transparent, inherits parent gradient */}
        <OpenSourceStats />

      </section>

      {/* ─── Workspace Features Section ─── */}
      <WorkspaceFeatures />

      {/* ─── Excellence Grid Section ─── */}
      <ExcellenceGrid />

      {/* ─── Future sections go here ─── */}
      {/* <Pricing /> */}

    </main>
  );
}
