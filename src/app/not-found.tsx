import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0A0A0A] text-white">

      {/* Dot grid background */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <defs>
          <pattern id="dots404" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.06)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots404)" />
      </svg>

      {/* Huge ERROR 404 watermark */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono font-medium whitespace-nowrap select-none pointer-events-none text-[120px] sm:text-[200px] md:text-[280px] lg:text-[380px] leading-none"
        style={{
          letterSpacing: '-0.06em',
          color: 'transparent',
          WebkitTextStroke: '1.5px rgba(255,255,255,0.08)',
        }}
      >
        ERROR 404
      </div>

      {/* Breadcrumb path */}
      <div
        aria-hidden="true"
        className="absolute left-4 sm:left-8 top-16 sm:top-[110px] font-mono text-[10px] sm:text-[11px] text-white/35"
        style={{ letterSpacing: '0.18em' }}
      >
        / RESPONSE / 404 / PACKAGE-NOT-FOUND
      </div>

      {/* Corner ticks — top-left */}
      <div className="absolute left-4 sm:left-8 top-20 sm:top-24 w-3.5 h-3.5 border-t border-l border-white/40" />
      {/* Corner ticks — top-right */}
      <div className="absolute right-4 sm:right-8 top-20 sm:top-24 w-3.5 h-3.5 border-t border-r border-white/40" />
      {/* Corner ticks — bottom-left */}
      <div className="absolute left-4 sm:left-8 bottom-20 sm:bottom-24 w-3.5 h-3.5 border-b border-l border-white/40" />
      {/* Corner ticks — bottom-right */}
      <div className="absolute right-4 sm:right-8 bottom-20 sm:bottom-24 w-3.5 h-3.5 border-b border-r border-white/40" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-5 sm:gap-7 px-4 sm:px-8 max-w-[980px]">

        {/* Status bar with dots */}
        <div className="flex items-center gap-3 font-mono text-[10px] sm:text-[11px] text-white/55" style={{ letterSpacing: '0.12em' }}>
          <span className="w-2 h-2 rounded-full bg-[#CF0003]" />
          <span className="w-2 h-2 rounded-full bg-[#FFB300]" />
          <span className="w-2 h-2 rounded-full bg-[#1A5FED]" />
          <span className="ml-1">SIGNAL LOST · REGISTRY 404</span>
        </div>

        {/* Large heading */}
        <h1
          className="font-mono font-medium text-[32px] sm:text-[48px] md:text-[72px] lg:text-[96px] leading-[0.95] max-w-[980px]"
          style={{ letterSpacing: '-0.04em' }}
        >
          Looks like this skill<br className="hidden sm:block" />{' '}
          hasn&apos;t been{' '}
          <span className="text-[#1A5FED]">discovered</span> yet.
        </h1>

        {/* Description */}
        <p className="text-[13px] sm:text-[15px] md:text-[16px] leading-relaxed text-white/55 max-w-[560px]">
          We searched <span className="font-mono text-white">14,237</span> manifests
          across <span className="font-mono text-white">2,841</span> scopes and came back empty-handed.
          Either the package was unpublished — or it&apos;s still waiting to be written.
        </p>

        {/* Terminal readout */}
        <div
          className="font-mono text-left text-[10px] sm:text-[11.5px] md:text-[12.5px] text-white/70 w-full max-w-[520px] px-4 sm:px-[22px] py-3 sm:py-[14px] rounded-[4px]"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            letterSpacing: '0.02em',
          }}
        >
          <div><span className="text-white/40">$</span> spm install <span className="text-[#FFB300]">@unknown/skill-404</span></div>
          <div className="text-[#CF0003]">  ✗ E_NOT_FOUND  ·  no manifest at registry.spm.dev/v1</div>
          <div className="text-white/50">  ↳ trace_id  : 7c2f-1a8e-9b3d-f042</div>
          <div className="text-white/50">  ↳ retry-in  : try a search query, or browse trending</div>
        </div>

        {/* CTA buttons */}
        <div className="flex gap-3 mt-1 sm:mt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] sm:text-[12px] font-medium uppercase px-4 sm:px-5 py-3 sm:py-[13px] bg-white text-[#0A0A0A] rounded-[2px] hover:bg-white/90 transition-colors"
            style={{ letterSpacing: '0.06em' }}
          >
            <span className="opacity-50">[H]</span> GO HOME
            <span className="opacity-50">↗</span>
          </Link>
          <Link
            href="/search/"
            className="inline-flex items-center gap-2 font-mono text-[11px] sm:text-[12px] uppercase px-4 sm:px-5 py-3 sm:py-[13px] bg-transparent text-white rounded-[2px] hover:bg-white/10 transition-colors"
            style={{
              border: '1px solid rgba(255,255,255,0.3)',
              letterSpacing: '0.06em',
            }}
          >
            <span className="opacity-50">[/]</span> SEARCH SKILLS
          </Link>
        </div>

        {/* Publish CTA */}
        <p className="font-mono text-[9px] sm:text-[10.5px] text-white/35 mt-1 sm:mt-3" style={{ letterSpacing: '0.08em' }}>
          OR PUBLISH IT YOURSELF —{' '}
          <span className="text-white underline">spm publish</span>
        </p>
      </div>
    </div>
  );
}
