import Link from "next/link";
import { ArrowRight, Download, Package, Terminal, Zap } from "lucide-react";
import { JsonLd } from "@/components/shared/json-ld";
import { generateOrganizationJsonLd } from "@/lib/seo/json-ld";

export default function HomePage() {
  return (
    <>
      <JsonLd data={generateOrganizationJsonLd()} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Gradient backdrop */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-brand-500/20 via-accent-500/10 to-transparent blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(99,102,241,0.08)_1px,_transparent_0)] bg-[length:32px_32px]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-400">
              <Zap className="h-4 w-4" />
              The agent skills ecosystem
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-surface-900 dark:text-surface-50 sm:text-6xl lg:text-7xl">
              Ship agent skills{" "}
              <span className="bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">
                at lightspeed
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-surface-600 dark:text-surface-400 sm:text-xl">
              The open registry for AI agent skill packages. Discover, publish,
              and manage reusable agent capabilities — with a single command.
            </p>

            {/* CTA */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/search"
                className="group inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-700 hover:shadow-brand-500/40"
              >
                Explore Packages
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-0 px-4 py-3 font-mono text-sm dark:border-surface-800 dark:bg-surface-900">
                <Terminal className="h-4 w-4 text-surface-400" />
                <span className="text-surface-500">$</span>
                <span className="text-surface-900 dark:text-surface-50">
                  npx spm init
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-20 grid max-w-2xl grid-cols-3 gap-8">
            {[
              { icon: Package, label: "Packages", value: "2,400+" },
              { icon: Download, label: "Downloads / mo", value: "180K" },
              { icon: Zap, label: "Avg install", value: "<2s" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="mx-auto h-6 w-6 text-brand-500" />
                <p className="mt-2 text-2xl font-bold text-surface-900 dark:text-surface-50">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-surface-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-t border-surface-200 bg-surface-50 py-24 dark:border-surface-800 dark:bg-surface-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-surface-900 dark:text-surface-50">
              Built for the agent ecosystem
            </h2>
            <p className="mt-4 text-lg text-surface-500">
              Everything you need to build, share, and scale AI agent
              capabilities.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Publish in seconds",
                description:
                  "Package your agent skills with a single CLI command. Version control, dependency resolution, and integrity checks built in.",
                icon: "📦",
              },
              {
                title: "Secure by default",
                description:
                  "Every package is scanned for malicious payloads. Signed checksums, provenance attestations, and automated vulnerability detection.",
                icon: "🔒",
              },
              {
                title: "Team analytics",
                description:
                  "Track API usage, download metrics, and package adoption across your organization with a real-time dashboard.",
                icon: "📊",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-surface-200 bg-surface-0 p-8 transition-all hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/5 dark:border-surface-800 dark:bg-surface-950 dark:hover:border-brand-700"
              >
                <div className="text-3xl">{feature.icon}</div>
                <h3 className="mt-4 text-lg font-semibold text-surface-900 dark:text-surface-50">
                  {feature.title}
                </h3>
                <p className="mt-2 leading-relaxed text-surface-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
