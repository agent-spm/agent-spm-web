"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const footerLinks = {
  Product: [
/* ... truncated for readability here, but I will provide the full file contents in the tool call if needed ... */
    { label: "Pricing", href: "/pricing" },
    { label: "Documentation", href: "/docs" },
  ],
  Resources: [
    { label: "CLI Guide", href: "/docs/cli" },
    { label: "Publishing", href: "/docs/publishing" },
    { label: "API Reference", href: "/docs/api" },
    { label: "Status", href: "https://status.spm.dev" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
  ],
};

export function PublicFooter() {
  const pathname = usePathname();

  if (pathname === "/connect") return null;

  return (
    <footer className="border-t border-surface-200 bg-surface-50 dark:border-surface-800 dark:bg-surface-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Image 
                src="/images/logo.png" 
                alt="Agent SPM Logo" 
                width={24} 
                height={24} 
                className="object-contain"
              />
              <span className="font-bold tracking-tight text-surface-900 dark:text-surface-50 text-sm">
                spm.dev
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-surface-500 dark:text-surface-400">
              The open registry for AI agent skill packages.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50">
                {section}
              </h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-surface-500 transition-colors hover:text-brand-500 dark:text-surface-400 dark:hover:text-brand-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-surface-200 pt-6 dark:border-surface-800">
          <p className="text-center text-xs text-surface-400">
            &copy; {new Date().getFullYear()} SPM. Built for the agent
            ecosystem.
          </p>
        </div>
      </div>
    </footer>
  );
}
