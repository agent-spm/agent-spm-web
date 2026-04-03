import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import type { UsageTrend } from "@/types/analytics";

interface TrendIndicatorProps {
  trend: UsageTrend;
  className?: string;
}

export function TrendIndicator({ trend, className }: TrendIndicatorProps) {
  const config: Record<
    UsageTrend["direction"],
    { icon: LucideIcon; color: string; bg: string }
  > = {
    up: {
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
    },
    down: {
      icon: TrendingDown,
      color: "text-red-500 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/50",
    },
    flat: {
      icon: Minus,
      color: "text-surface-400",
      bg: "bg-surface-100 dark:bg-surface-800",
    },
  };

  const { icon: Icon, color, bg } = config[trend.direction];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        color,
        bg,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(trend.changePercent).toFixed(1)}%
    </span>
  );
}
