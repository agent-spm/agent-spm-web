import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { NAV_ITEMS } from "@/lib/constants";
import { Search } from "lucide-react";

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-surface-200/80 bg-surface-0/80 backdrop-blur-xl dark:border-surface-800/80 dark:bg-surface-950/80">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left */}
        <div className="flex items-center gap-8">
          <Logo />
          <div className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-50"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="flex items-center gap-2 rounded-lg border border-surface-200 bg-surface-50 px-3 py-1.5 text-sm text-surface-400 transition-all hover:border-brand-300 hover:bg-surface-100 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-brand-700 dark:hover:bg-surface-800"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search packages…</span>
            <kbd className="hidden rounded border border-surface-300 bg-surface-100 px-1.5 py-0.5 font-mono text-xs text-surface-400 dark:border-surface-700 dark:bg-surface-800 sm:inline">
              /
            </kbd>
          </Link>
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand-700 hover:shadow-glow"
          >
            Sign In
          </Link>
        </div>
      </nav>
    </header>
  );
}
