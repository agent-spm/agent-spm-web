import Image from "next/image";

/**
 * Hero — the above-the-fold content: eyebrow, headline, body copy, CTA.
 * Designed to sit inside a full-screen flex column with the Navbar above it.
 * The parent section owns the gradient background.
 */
export default function Hero() {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center text-center px-6 sm:px-12 md:px-20 relative z-10 gap-y-4 md:gap-y-6"
      style={{ paddingBottom: "80px" }}
    >
      {/* Eyebrow: white logo + product name */}
      <div className="flex items-center justify-center gap-[6px]">
        <Image
          src="/images/white.png"
          alt="Agent SPM"
          width={16}
          height={16}
          className="object-contain flex-shrink-0"
          priority
        />
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(16px, 1.5vw, 20px)",
            letterSpacing: "0.01em",
            color: "#ffffff",
            whiteSpace: "nowrap",
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
          fontStyle: "italic",
          fontSize: "clamp(48px, 7.5vw, 108px)",
          lineHeight: "96%",
          letterSpacing: "-0.03em",
          textAlign: "center",
          color: "#ffffff",
          maxWidth: "clamp(480px, 70vw, 960px)",
          margin: "0 auto",
        }}
      >
        Intelligence should be Simple.
      </h1>

      {/* Body Copy */}
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          fontSize: "clamp(14px, 1.2vw, 18px)",
          lineHeight: "1.4",
          letterSpacing: "-0.02em",
          textAlign: "center",
          color: "#ffffff",
          maxWidth: "820px",
          margin: "0 auto",
          opacity: 0.95,
        }}
      >
        Stop rebuilding. Start compounding. Skills arm your agents with battle-tested
        <br className="hidden md:inline" />
        procedural knowledge, installed in seconds, shared across teams, refined
        <br className="hidden md:inline" />
        over time. We&apos;re building the arsenal. You bring the mission.
      </p>

      {/* CTA Button */}
      <a
        href="#"
        className="inline-flex items-center justify-center bg-white text-black font-semibold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 gap-2 cursor-pointer select-none text-base sm:text-lg px-8 sm:px-10 h-[52px] mt-2 group"
      >
        <span>Explore skills &amp; MCPs</span>
        <span className="transform transition-transform duration-200 group-hover:translate-x-1">
          →
        </span>
      </a>
    </div>
  );
}
