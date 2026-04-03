"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { DASHBOARD_NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  CreditCard,
};

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-950">
      {/* Top */}
      <div className="flex h-16 items-center gap-2 border-b border-surface-200 px-6 dark:border-surface-800">
        <Logo size="sm" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400"
                  : "text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-50"
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive
                      ? "text-brand-600 dark:text-brand-400"
                      : "text-surface-400"
                  )}
                />
              )}
              {item.label}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-surface-200 p-3 dark:border-surface-800">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
        >
          <ExternalLink className="h-4 w-4" />
          View Registry
        </Link>
      </div>
    </aside>
  );
}
