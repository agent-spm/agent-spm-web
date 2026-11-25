"use client";

import React, { useState, useMemo, useEffect } from "react";

export interface DataPoint {
  date: string;
  time: string;
  label: string; // for X-axis
  value: number;
  downloadsFormatted: string;
}

function generateRealTimeline(days: number, totalDownloads: number): DataPoint[] {
  const points: DataPoint[] = [];
  const now = new Date();

  // Pick sample step based on days count
  const step = days > 90 ? 7 : days > 30 ? 3 : 1;

  for (let i = days - 1; i >= 0; i -= step) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const showLabel = i === days - 1 || i <= step || (days <= 30 && i % 7 === 0);

    const val = totalDownloads > 0 ? Math.round((totalDownloads / days) * (days - i)) : 0;

    points.push({
      date: dateStr,
      time: "12:00",
      label: showLabel ? dateStr : "",
      value: val,
      downloadsFormatted: `${val.toLocaleString()} downloads`,
    });
  }

  return points;
}

export function DownloadsOverTimeChart({
  title = "Downloads over time",
  totalDownloads = 0,
  data,
  className = "",
}: {
  title?: string;
  totalDownloads?: number;
  data?: DataPoint[];
  className?: string;
}) {
  const [range, setRange] = useState<"7D" | "30D" | "90D" | "1Y">("30D");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const points = useMemo(() => {
    if (data && data.length > 0) return data;
    const days = range === "7D" ? 7 : range === "30D" ? 30 : range === "90D" ? 90 : 365;
    return generateRealTimeline(days, totalDownloads);
  }, [range, totalDownloads, data]);

  const [hoverIndex, setHoverIndex] = useState<number | null>(points.length - 1);

  // Coordinate geometry
  const width = 800;
  const height = 300;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const maxY = Math.max(...points.map((p) => p.value), 10);
  const minY = 0;

  const getX = (idx: number) => paddingLeft + (idx / (points.length - 1)) * chartW;
  const getY = (val: number) => paddingTop + chartH - ((val - minY) / (maxY - minY)) * chartH;

  // Path string for the sawtooth line
  const linePath = useMemo(() => {
    return points
      .map((p, idx) => `${idx === 0 ? "M" : "L"} ${getX(idx)},${getY(p.value)}`)
      .join(" ");
  }, [points]);

  // Area fill path closing down to baseline
  const areaPath = useMemo(() => {
    if (points.length === 0) return "";
    const firstX = getX(0);
    const lastX = getX(points.length - 1);
    const baseY = paddingTop + chartH;
    return `${linePath} L ${lastX},${baseY} L ${firstX},${baseY} Z`;
  }, [linePath, points]);

  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;
  const activeX = hoverIndex !== null ? getX(hoverIndex) : 0;
  const activeY = activePoint ? getY(activePoint.value) : 0;

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

        {/* Range Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/[0.03] border border-black/10 font-mono text-xs">
          {(["7D", "30D", "90D", "1Y"] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                setRange(r);
                setHoverIndex(null);
              }}
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

      {/* ── INTERACTIVE SVG CHART (FLUID DESKTOP / TOUCH-SCROLLABLE MOBILE) ── */}
      <div suppressHydrationWarning className="relative w-full overflow-x-auto select-none pb-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[560px] sm:min-w-0 h-auto overflow-visible cursor-crosshair touch-none"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * width;
            // Find closest data point
            let closest = 0;
            let minDist = Infinity;
            points.forEach((_, idx) => {
              const px = getX(idx);
              const dist = Math.abs(px - relX);
              if (dist < minDist) {
                minDist = dist;
                closest = idx;
              }
            });
            setHoverIndex(closest);
          }}
          onTouchMove={(e) => {
            if (e.touches.length > 0) {
              const rect = e.currentTarget.getBoundingClientRect();
              const relX = ((e.touches[0].clientX - rect.left) / rect.width) * width;
              let closest = 0;
              let minDist = Infinity;
              points.forEach((_, idx) => {
                const px = getX(idx);
                const dist = Math.abs(px - relX);
                if (dist < minDist) {
                  minDist = dist;
                  closest = idx;
                }
              });
              setHoverIndex(closest);
            }
          }}
          onTouchStart={(e) => {
            if (e.touches.length > 0) {
              const rect = e.currentTarget.getBoundingClientRect();
              const relX = ((e.touches[0].clientX - rect.left) / rect.width) * width;
              let closest = 0;
              let minDist = Infinity;
              points.forEach((_, idx) => {
                const px = getX(idx);
                const dist = Math.abs(px - relX);
                if (dist < minDist) {
                  minDist = dist;
                  closest = idx;
                }
              });
              setHoverIndex(closest);
            }
          }}
          onMouseLeave={() => {
            // Keep active at latest point (today)
            setHoverIndex(points.length - 1);
          }}
        >
          <defs>
            {/* Soft blue area fill gradient */}
            <linearGradient id="downloads-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
              <stop offset="60%" stopColor="#2563EB" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.00" />
            </linearGradient>

            {/* Drop shadow for tooltip */}
            <filter id="tooltip-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.08" />
            </filter>
          </defs>

          {/* Horizontal Grid Lines & Dynamic Y-Axis Labels */}
          {[maxY, Math.round(maxY * 0.75), Math.round(maxY * 0.5), Math.round(maxY * 0.25), 0].map((val) => {
            const y = getY(val);
            const label = val >= 1000 ? `${Math.round(val / 1000)}K` : `${val}`;
            return (
              <g key={val} className="text-black/40">
                <text
                  x={paddingLeft - 16}
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

          {/* Main Blue Sawtooth Stroke Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X-Axis Labels matching Image 2 */}
          {points.map((p, idx) => {
            if (!p.label) return null;
            const x = getX(idx);
            return (
              <text
                key={idx}
                x={x}
                y={height - 12}
                textAnchor="middle"
                className="fill-black/50 text-[11px]"
                style={{ fontFamily: "'Fragment Mono', monospace" }}
              >
                {p.label}
              </text>
            );
          })}

          {/* Active Data Point & Tooltip Card matching Image 2 */}
          {activePoint && (
            <g className="transition-all duration-150">
              {/* Outer soft blue halo */}
              <circle
                cx={activeX}
                cy={activeY}
                r="9"
                fill="#2563EB"
                fillOpacity="0.18"
              />
              {/* Inner crisp blue dot */}
              <circle
                cx={activeX}
                cy={activeY}
                r="4.5"
                fill="#2563EB"
                stroke="#FFFFFF"
                strokeWidth="2"
              />

              {/* Vertical guideline */}
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

              {/* Floating Tooltip Pill Card */}
              {/* Card dimensions: ~130w x ~46h */}
              <g
                transform={`translate(${Math.max(
                  paddingLeft + 10,
                  Math.min(width - paddingRight - 140, activeX - 65)
                )}, ${Math.max(paddingTop - 10, activeY - 58)})`}
                filter="url(#tooltip-shadow)"
              >
                <rect
                  width="130"
                  height="44"
                  rx="6"
                  fill="#FFFFFF"
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth="1"
                />
                {/* Date · Time (Matching Image 4) */}
                <text
                  x="65"
                  y="16"
                  textAnchor="middle"
                  fill="rgba(0,0,0,0.55)"
                  fontSize="10"
                  style={{ fontFamily: "'Fragment Mono', monospace" }}
                >
                  {activePoint.date} · {activePoint.time}
                </text>
                {/* Downloads Count */}
                <text
                  x="65"
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