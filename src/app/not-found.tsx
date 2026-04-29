import Link from "next/link";
import SplineErrorViewer from "@/components/spline-error-viewer";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white dark:bg-[#050505]">
      
      {/* Light grid background with radial fade */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07]" 
          style={{
            backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        />
        <div className="absolute inset-0 bg-white/50 dark:bg-[#050505]/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_80%)]" />
      </div>

      {/* Huge Background Text - High Contrast Glow */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center select-none">
        <h1 className="text-[20vw] leading-[0.75] font-black tracking-tighter text-center uppercase flex flex-col">
          <span className="bg-gradient-to-b from-black/5 to-black/10 bg-clip-text text-transparent dark:from-white/10 dark:to-white/5 drop-shadow-sm">ERROR</span>
          <span className="bg-gradient-to-b from-black/5 to-black/10 bg-clip-text text-transparent dark:from-white/10 dark:to-white/5 drop-shadow-sm">404</span>
        </h1>
      </div>

      {/* Interactive Spline 3D Scene */}
      <SplineErrorViewer />

      {/* Foreground Content */}
      <div className="relative z-20 mt-[35vh] flex flex-col items-center space-y-8 text-center px-4">
        
        <div className="rounded-2xl border border-black/5 bg-white/50 px-6 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
          <p className="text-sm font-medium tracking-wide text-surface-900 dark:text-white">
            Looks like this skill hasn&apos;t been discovered yet.
          </p>
        </div>
        
        <div className="flex w-full max-w-sm items-center justify-center gap-3">
          <Link
            href="/"
            className="group relative flex-1 overflow-hidden rounded-xl bg-brand-600 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all hover:scale-[1.02] hover:bg-brand-500 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:scale-[0.98] text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            Go Home
          </Link>
          <Link
            href="/search"
            className="flex-1 rounded-xl border border-surface-200 bg-white/80 px-4 py-3.5 text-sm font-semibold text-surface-900 shadow-sm backdrop-blur-md transition-all hover:scale-[1.02] hover:bg-surface-50 active:scale-[0.98] dark:border-surface-800 dark:bg-surface-900/50 dark:text-surface-100 dark:hover:bg-surface-800 text-center"
          >
            Search Skills
          </Link>
        </div>
      </div>
      
    </div>
  );
}
