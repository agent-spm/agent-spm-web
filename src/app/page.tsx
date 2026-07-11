import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black font-sans relative overflow-x-hidden">
      {/* ── Gradient Hero Section — exactly 100vh, flex col ── */}
      <section
        className="relative w-full overflow-hidden"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #002DDF 0%, #3B8EFF 35%, #7EC6FF 65%, #DAEEFF 85%, #ffffff 100%)',
        }}
      >
        {/* Navbar — pinned to top */}
        <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 flex-shrink-0">
          <Navbar />
        </div>

        {/* ── Hero Content — grows to fill remaining height, centers vertically ── */}
        <div
          className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6"
          style={{ paddingBottom: '6vh' }}
        >

          {/* Eyebrow: white logo + product name */}
          <div className="flex items-center justify-center gap-[6px] mb-1.5">
            <Image
              src="/images/white.png"
              alt="Agent SPM"
              width={18}
              height={18}
              className="object-contain flex-shrink-0"
              // style={{ width: 'clamp(14px, 1.2vw, 18px)', height: 'clamp(14px, 1.2vw, 18px)' }}
            />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: '24px',
                letterSpacing: '0.01em',
                color: '#ffffff',
                whiteSpace: 'nowrap',
              }}
            >
              Agent Skills Package Manager
            </span>
          </div>

          {/* ── Main Headline ── */}
          {/* Spec: Instrument Serif, 400, italic, 128px → clamp-scaled for viewport */}
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

          {/* ── Body Copy — Inter Bold, white, centered ── */}
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
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
            Stop rebuilding. Start compounding. Skills arm your agents with battle–tested
            <br className="hidden md:inline" />
            procedural knowledge, installed in seconds, shared across teams, refined
            <br className="hidden md:inline" />
            over time. We&apos;re building the arsenal. You bring the mission.
          </p>

          {/* ── CTA Button ── */}
          <a
            href="#"
            style={{
              marginTop: 'clamp(24px, 2.8vw, 40px)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: 'clamp(22px, 2vw, 32px)',
              paddingRight: 'clamp(22px, 2vw, 32px)',
              paddingTop: 'clamp(9px, 0.8vw, 12px)',
              paddingBottom: 'clamp(9px, 0.8vw, 12px)',
              borderRadius: '9999px',
              background: '#ffffff',
              color: '#1B5FED',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: 'clamp(12px, 1vw, 15px)',
              letterSpacing: '-0.01em',
              border: '2px solid rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textDecoration: 'none',
              boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
            }}
          >
            Download the CLI
          </a>
        </div>

      </section>
    </main>
  );
}
