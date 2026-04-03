"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { AnalyticsDataPoint } from "@/types/analytics";

interface UsageChartProps {
  data: AnalyticsDataPoint[];
  title: string;
  color?: string;
  gradientId?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-surface-200 bg-surface-0 px-3 py-2 shadow-lg dark:border-surface-800 dark:bg-surface-950">
      <p className="text-xs text-surface-400">{label}</p>
      <p className="text-sm font-semibold text-surface-900 dark:text-surface-50">
        {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

export function UsageChart({
  data,
  title,
  color = "#6366f1",
  gradientId = "chartGradient",
}: UsageChartProps) {
  // Format timestamps for display
  const chartData = data.map((point) => ({
    ...point,
    label: new Date(point.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="rounded-xl border border-surface-200 bg-surface-0 p-6 dark:border-surface-800 dark:bg-surface-950">
      <h3 className="mb-4 text-sm font-semibold text-surface-900 dark:text-surface-50">
        {title}
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-surface-200 dark:text-surface-800"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              className="text-surface-400"
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              className="text-surface-400"
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString()
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{
                r: 4,
                strokeWidth: 2,
                fill: color,
                stroke: "var(--color-surface-0, #fff)",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
