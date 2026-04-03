import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <p className="font-mono text-7xl font-bold text-brand-500">404</p>
        <h1 className="mt-4 text-2xl font-bold text-surface-900 dark:text-surface-50">
          Package not found
        </h1>
        <p className="mt-2 text-surface-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Go Home
          </Link>
          <Link
            href="/search"
            className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-100 dark:border-surface-800 dark:text-surface-300 dark:hover:bg-surface-800"
          >
            Search Packages
          </Link>
        </div>
      </div>
    </div>
  );
}
