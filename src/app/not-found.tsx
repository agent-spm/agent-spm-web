import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-gray px-4 text-center">
      {/* 404 Badge */}
      <span className="mono rounded-full bg-brand-blue/10 px-4 py-1.5 text-xs font-bold tracking-widest text-brand-blue">
        404
      </span>

      <h1 className="mt-6 text-4xl font-bold tracking-tighter text-brand-black">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-base text-brand-black/60">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Check the URL or head back to safety.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-blue/90 active:scale-[0.98]"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-lg border border-btn-gray bg-white px-5 py-2.5 text-sm font-semibold text-brand-black transition-all hover:bg-bg-gray active:scale-[0.98]"
        >
          <Search className="h-4 w-4" />
          Search Packages
        </Link>
      </div>
    </div>
  );
}
