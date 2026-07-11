import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black font-sans relative overflow-x-hidden">
      {/* ── Gradient Backdrop Section ── */}
      <section className="relative w-full min-h-screen bg-gradient-to-b from-[#002DDF] via-[#5EA6FE] to-white pt-2 sm:pt-4 pb-24 overflow-hidden">

        <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12">
          <Navbar />
        </div>

        {/* ── Hero Content ── */}
        <div className="flex flex-col items-center justify-center text-center px-4 sm:px-6 mt-8 sm:mt-12 lg:mt-16">

          {/* Eyebrow: white logo + product name */}
          <div className="flex items-center gap-2 mb-6 sm:mb-8">
            <Image
              src="/images/white.png"
              alt="Agent SPM"
              width={14}
              height={14}
              className="object-contain w-5 h-5 sm:w-6 sm:h-6"
            />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: '24px',
                letterSpacing: '0.01em',
                color: '#ffffff',
              }}
            >
              Agent Skills Package Manager
            </span>
          </div>

          {/* ── Main Headline ── */}
          <h1
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontWeight: 400,
              fontStyle: 'italic',
              // 128px spec, scaled responsively — clamp from 52px on mobile up to 96px on large screens
              fontSize: 'clamp(52px, 8.5vw, 96px)',
              lineHeight: '96%',
              letterSpacing: '-0.03em',
              textAlign: 'center',
              color: '#ffffff',
              maxWidth: '900px',
            }}
          >
            Intelligence should be Simple.
          </h1>

          {/* ── Body Copy ── */}
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(13px, 1.4vw, 16px)',
              lineHeight: '1.6',
              textAlign: 'center',
              color: '#ffffff',
              maxWidth: '540px',
              marginTop: 'clamp(24px, 3vw, 36px)',
            }}
          >
            Stop rebuilding. Start compounding. Skills arm your agents with battle-tested
            procedural knowledge, installed in seconds, shared across teams, refined
            over time. We&apos;re building the arsenal. You bring the mission.
          </p>

          {/* ── CTA Button ── */}
          <a
            href="#"
            style={{
              marginTop: 'clamp(28px, 3.5vw, 40px)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: 'clamp(20px, 2.5vw, 28px)',
              paddingRight: 'clamp(20px, 2.5vw, 28px)',
              paddingTop: '10px',
              paddingBottom: '10px',
              borderRadius: '9999px',
              background: '#ffffff',
              color: '#1B5FED',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: 'clamp(13px, 1.2vw, 15px)',
              letterSpacing: '-0.01em',
              border: '2px solid rgba(255,255,255,0.6)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textDecoration: 'none',
              boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
            }}
          >
            Download the CLI
          </a>
        </div>

      </section>
    </main>
  );
}
