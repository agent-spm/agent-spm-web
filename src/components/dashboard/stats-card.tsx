import { cn, formatNumber } from "@/lib/utils";
import { TrendIndicator } from "./trend-indicator";
import type { UsageTrend } from "@/types/analytics";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  trend: UsageTrend;
  icon: LucideIcon;
  className?: string;
}

export function StatsCard({
  title,
  value,
  trend,
  icon: Icon,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "group rounded-xl border border-surface-200 bg-surface-0 p-6 transition-all hover:shadow-lg hover:shadow-brand-500/5 dark:border-surface-800 dark:bg-surface-950",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-surface-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-surface-900 dark:text-surface-50">
            {formatNumber(value)}
          </p>
        </div>
        <div className="rounded-lg bg-brand-50 p-2.5 dark:bg-brand-950/50">
          <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <TrendIndicator trend={trend} />
        <span className="text-xs text-surface-400">vs last period</span>
      </div>
    </div>
  );
}
