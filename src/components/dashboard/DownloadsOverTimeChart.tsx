"use client";

import React, { useState, useMemo, useEffect } from "react";

export type ChartRange = "7D" | "30D" | "90D" | "1Y";

export interface DataPoint {
  date: string;
  subtitle: string;
  label: string;
  value: number;
  downloadsFormatted: string;
}

export interface TimelineSourceEvent {
  date: string; // YYYY-MM-DD
  downloads: number;
}

function formatUtcShortDate(date: Date, includeYear = false): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(includeYear ? { year: "2-digit" } : {}),
    timeZone: "UTC",
  });
}

function toUtcDayKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function generateTimelinePoints(
  days: number,
  totalDownloads: number,
  events?: TimelineSourceEvent[]
): DataPoint[] {
  const now = new Date();
  const todayUtcMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const step = days > 90 ? 7 : days > 30 ? 3 : 1;

  // Build descending offsets ending strictly at 0 (today)
  const offsets: number[] = [];
  for (let offset = days - 1; offset > 0; offset -= step) {
    offsets.push(offset);
  }
  if (offsets[offsets.length - 1] !== 0) {
    offsets.push(0);
  }

  // Pick at most 5 evenly distributed tick indices so labels never collide
  const tickCount = Math.min(5, offsets.length);
  const labelIndices = new Set<number>();
  if (offsets.length <= 5) {
    offsets.forEach((_, idx) => labelIndices.add(idx));
  } else {
    for (let t = 0; t < tickCount; t++) {
      const idx = Math.round((t * (offsets.length - 1)) / (tickCount - 1));
      labelIndices.add(idx);
    }
  }

  // Normalize optional real timeline events by YYYY-MM-DD
  const validEvents = (events || [])
    .map((ev) => ({
      dayKey: String(ev.date || "").slice(0, 10),
      downloads: Number(ev.downloads) || 0,
    }))
    .filter((ev) => /^\d{4}-\d{2}-\d{2}$/.test(ev.dayKey));

  const useRealEvents = validEvents.length > 0;
  const eventsTotal = validEvents.reduce((sum, ev) => sum + ev.downloads, 0);
  const scaleFactor =
    useRealEvents && totalDownloads > 0 && eventsTotal > 0 && eventsTotal !== totalDownloads
      ? totalDownloads / eventsTotal
      : 1;

  return offsets.map((offsetDays, idx) => {
    const bucketDate = new Date(todayUtcMs - offsetDays * 24 * 60 * 60 * 1000);
    const bucketKey = toUtcDayKey(bucketDate);
    const shortDate = formatUtcShortDate(bucketDate, days > 90);

    let val = 0;
    if (totalDownloads > 0) {
      if (useRealEvents) {
        const cumulativeRaw = validEvents.reduce(
          (acc, ev) => (ev.dayKey <= bucketKey ? acc + ev.downloads : acc),
          0
        );
        val = Math.round(cumulativeRaw * scaleFactor);
      } else {
        // Fallback cumulative progression across window
        val = Math.round((totalDownloads / days) * (days - offsetDays));
      }
    }

    return {
      date: formatUtcShortDate(bucketDate, true),
      subtitle: offsetDays === 0 ? "Latest (Today UTC)" : "Cumulative",
      label: labelIndices.has(idx) ? shortDate : "",
      value: val,
      downloadsFormatted: `${val.toLocaleString()} downloads`,
    };
  });
}

export function DownloadsOverTimeChart({
  title = "Downloads over time",
  totalDownloads = 0,
  events,
  data,
  range: controlledRange,
  onRangeChange,
  className = "",
}: {
  title?: string;
  totalDownloads?: number;
  events?: TimelineSourceEvent[];
  data?: DataPoint[];
  range?: ChartRange;
  onRangeChange?: (range: ChartRange) => void;
  className?: string;
}) {
  const [internalRange, setInternalRange] = useState<ChartRange>("30D");
  const range = controlledRange ?? internalRange;

  const setRange = (nextRange: ChartRange) => {
    if (onRangeChange) onRangeChange(nextRange);
    setInternalRange(nextRange);
  };

  const points = useMemo(() => {
    if (data && data.length > 0) return data;
    const days = range === "7D" ? 7 : range === "30D" ? 30 : range === "90D" ? 90 : 365;
    return generateTimelinePoints(days, totalDownloads, events);
  }, [range, totalDownloads, events, data]);

  const [hoverIndex, setHoverIndex] = useState<number>(Math.max(0, points.length - 1));

  useEffect(() => {
    setHoverIndex(Math.max(0, points.length - 1));
  }, [points.length, range]);

  const width = 800;
  const height = 300;
  const paddingLeft = 60;
  const paddingRight = 36;
  const paddingTop = 30;
  const paddingBottom = 42;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const maxY = Math.max(...points.map((p) => p.value), 10);
  const minY = 0;

  const getX = (idx: number) =>
    points.length <= 1
      ? paddingLeft + chartW / 2
      : paddingLeft + (idx / (points.length - 1)) * chartW;
  const getY = (val: number) =>
    paddingTop + chartH - ((val - minY) / (maxY - minY)) * chartH;

  const linePath = useMemo(() => {
    return points
      .map((p, idx) => `${idx === 0 ? "M" : "L"} ${getX(idx)},${getY(p.value)}`)
      .join(" ");
  }, [points, maxY]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return "";
    const firstX = getX(0);
    const lastX = getX(points.length - 1);
    const baseY = paddingTop + chartH;
    return `${linePath} L ${lastX},${baseY} L ${firstX},${baseY} Z`;
  }, [linePath, points]);

  const safeIndex = Math.min(Math.max(hoverIndex, 0), Math.max(0, points.length - 1));
  const activePoint = points[safeIndex] || null;
  const activeX = activePoint ? getX(safeIndex) : 0;
  const activeY = activePoint ? getY(activePoint.value) : 0;

  const handlePointerPosition = (clientX: number, rect: DOMRect) => {
    const relX = ((clientX - rect.left) / rect.width) * width;
    let closest = 0;
    let minDist = Infinity;
    points.forEach((_, idx) => {
      const dist = Math.abs(getX(idx) - relX);
      if (dist < minDist) {
        minDist = dist;
        closest = idx;
      }
    });
    setHoverIndex(closest);
  };

  const yTicks = [
    maxY,
    Math.round(maxY * 0.75),
    Math.round(maxY * 0.5),
    Math.round(maxY * 0.25),
    0,
  ];

  return (
    <div className={`rounded-2xl border border-black/10 bg-white p-6 shadow-sm ${className}`}>
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2
            className="text-base sm:text-lg font-bold text-black tracking-tight select-none"
            style={{ fontFamily: "'Fragment Mono', monospace" }}
          >
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/[0.03] border border-black/10 font-mono text-xs">
          {(["7D", "30D", "90D", "1Y"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-medium ${
                range === r
                  ? "bg-black text-white font-semibold shadow-xs"
                  : "text-black/60 hover:text-black hover:bg-black/5"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── INTERACTIVE SVG CHART ── */}
      <div suppressHydrationWarning className="relative w-full overflow-x-auto select-none pb-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[560px] sm:min-w-0 h-auto overflow-visible cursor-crosshair touch-none"
          onMouseMove={(e) => handlePointerPosition(e.clientX, e.currentTarget.getBoundingClientRect())}
          onTouchMove={(e) => {
            if (e.touches.length > 0) {
              handlePointerPosition(e.touches[0].clientX, e.currentTarget.getBoundingClientRect());
            }
          }}
          onTouchStart={(e) => {
            if (e.touches.length > 0) {
              handlePointerPosition(e.touches[0].clientX, e.currentTarget.getBoundingClientRect());
            }
          }}
          onMouseLeave={() => setHoverIndex(Math.max(0, points.length - 1))}
        >
          <defs>
            <linearGradient id="downloads-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
              <stop offset="60%" stopColor="#2563EB" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.00" />
            </linearGradient>

            <filter id="tooltip-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.08" />
            </filter>
          </defs>

          {/* Horizontal Grid Lines & Y-Axis Labels */}
          {yTicks.map((val, idx) => {
            const y = getY(val);
            const label = val >= 1000 ? `${Math.round(val / 1000)}K` : `${val}`;
            return (
              <g key={`${idx}-${val}`} className="text-black/40">
                <text
                  x={paddingLeft - 14}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-black/40 text-[11px]"
                  style={{ fontFamily: "'Fragment Mono', monospace" }}
                >
                  {label}
                </text>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="rgba(0,0,0,0.06)"
                  strokeWidth="1"
                  strokeDasharray={val === 0 ? undefined : "3 3"}
                />
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#downloads-fill)" />

          {/* Main Blue Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Non-overlapping X-Axis Labels */}
          {points.map((p, idx) => {
            if (!p.label) return null;
            const x = getX(idx);
            const anchor =
              idx === 0 ? "start" : idx === points.length - 1 ? "end" : "middle";
            return (
              <text
                key={`${idx}-${p.label}`}
                x={x}
                y={height - 12}
                textAnchor={anchor}
                className="fill-black/50 text-[11px]"
                style={{ fontFamily: "'Fragment Mono', monospace" }}
              >
                {p.label}
              </text>
            );
          })}

          {/* Active Data Point & Tooltip */}
          {activePoint && (
            <g className="transition-all duration-150">
              <circle cx={activeX} cy={activeY} r="9" fill="#2563EB" fillOpacity="0.18" />
              <circle
                cx={activeX}
                cy={activeY}
                r="4.5"
                fill="#2563EB"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <line
                x1={activeX}
                y1={activeY + 9}
                x2={activeX}
                y2={paddingTop + chartH}
                stroke="#2563EB"
                strokeWidth="1"
                strokeDasharray="2 2"
                strokeOpacity="0.3"
              />

              <g
                transform={`translate(${Math.max(
                  paddingLeft + 10,
                  Math.min(width - paddingRight - 150, activeX - 75)
                )}, ${Math.max(paddingTop - 10, activeY - 58)})`}
                filter="url(#tooltip-shadow)"
              >
                <rect
                  width="150"
                  height="44"
                  rx="6"
                  fill="#FFFFFF"
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth="1"
                />
                <text
                  x="75"
                  y="16"
                  textAnchor="middle"
                  fill="rgba(0,0,0,0.55)"
                  fontSize="10"
                  style={{ fontFamily: "'Fragment Mono', monospace" }}
                >
                  {activePoint.date} · {activePoint.subtitle}
                </text>
                <text
                  x="75"
                  y="33"
                  textAnchor="middle"
                  fill="#000000"
                  fontSize="12"
                  fontWeight="bold"
                  style={{ fontFamily: "'Fragment Mono', monospace" }}
                >
                  {activePoint.downloadsFormatted}
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
