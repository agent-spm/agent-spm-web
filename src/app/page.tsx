import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { PixelBox } from "@/components/landing/PixelBox";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black font-sans relative overflow-x-hidden">
      {/* Gradient Hero Section - extends to fit Page 1 & Page 2 content */}
      <section
        className="relative w-full"
        style={{
          background: 'linear-gradient(180deg, #190096 0%, #0080FF 18%, #78D2FF 53%, #FFFFFF 100%)',
          boxShadow: 'inset 0 0 120px rgba(255, 255, 255, 0.85), inset 0 0 40px rgba(255, 255, 255, 0.5)',
        }}
      >
         {/* Page 1: Hero Viewport (100vh) */}
        <div className="relative w-full min-h-screen flex flex-col justify-between">
          {/* Navbar — pinned to top */}
          <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-12 flex-shrink-0 relative z-20">
            <Navbar />
          </div>

          {/* Hero Content - centered in the viewport */}
          <div
            className="flex-1 flex flex-col items-center justify-center text-center px-6 sm:px-12 md:px-20 relative z-10"
            style={{ paddingBottom: '80px' }}
          >

            {/* Eyebrow: white logo + product name */}
            <div className="flex items-center justify-center gap-[6px] mb-1.5">
              <Image
                src="/images/white.png"
                alt="Agent SPM"
                width={16}
                height={16}
                className="object-contain flex-shrink-0"
              />
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: '20px',
                  letterSpacing: '0.01em',
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                }}
              >
                Agent Skills Package Manager
              </span>
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontWeight: 400,
                fontStyle: 'italic',
                fontSize: 'clamp(48px, 7.5vw, 108px)',
                lineHeight: '96%',
                letterSpacing: '-0.03em',
                textAlign: 'center',
                color: '#ffffff',
                maxWidth: 'clamp(480px, 70vw, 960px)',
                margin: '0 auto',
              }}
            >
              Intelligence should be Simple.
            </h1>

            {/* Body Copy - Inter Bold, white, centered */}
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: '18px',
                lineHeight: '1.35',
                letterSpacing: '-0.03em',
                textAlign: 'center',
                color: '#ffffff',
                maxWidth: '820px',
                marginTop: 'clamp(20px, 2.5vw, 36px)',
                opacity: 0.95,
              }}
            >
              Stop rebuilding. Start compounding. Skills arm your agents with battle-tested
              <br className="hidden md:inline" />
              procedural knowledge, installed in seconds, shared across teams, refined
              <br className="hidden md:inline" />
              over time. We're building the arsenal. You bring the mission.
            </p>

            {/* CTA Button */}
            <a
              href="#"
              className="inline-flex items-center justify-center bg-white text-black font-semibold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 gap-2 cursor-pointer select-none text-base sm:text-lg px-8 sm:px-10 h-13 sm:h-13 mt-8 sm:mt-10 group"
            >
              <span>Explore skills &amp; MCPs</span>
              <span className="transform transition-transform duration-200 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>

        {/* Page 2: Scroll Spacer (allows user to scroll to reveal the rest of the SVG) */}
        <div className="h-[100vh] w-full relative z-10 pointer-events-none">
          {/* Pixel Art — scroll-driven bottom-to-top reveal */}
          <div
            className="absolute left-0 w-full z-30 pointer-events-none select-none"
            style={{
              top: 0,
              transform: 'translateY(-50%)',
            }}
          >
            <PixelBox color="#ffffff" />
          </div>
        </div>

      </section>

      {/* Page 3: Features / Value Proposition Section (Solid White Background) */}
      <section className="bg-white text-black py-32 relative z-20">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-6">Why Agent SPM?</h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto mb-12">
            Compounding skills allows your agents to share battle-tested knowledge, install packages in seconds, and stay up to date dynamically.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-neutral-100 bg-neutral-50 text-left">
              <h3 className="text-lg font-semibold mb-2">Compounding Ability</h3>
              <p className="text-neutral-500">Skills are shared and nested, enabling agents to build on top of previous learnings seamlessly.</p>
            </div>
            <div className="p-8 rounded-2xl border border-neutral-100 bg-neutral-50 text-left">
              <h3 className="text-lg font-semibold mb-2">Instant Setup</h3>
              <p className="text-neutral-500">Deploy modular skills in seconds using our global package repository and CLI manager.</p>
            </div>
            <div className="p-8 rounded-2xl border border-neutral-100 bg-neutral-50 text-left">
              <h3 className="text-lg font-semibold mb-2">Team Collaboration</h3>
              <p className="text-neutral-500">Build, publish, and collaborate on specialized workflows within your organization.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
