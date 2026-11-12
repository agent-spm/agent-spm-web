"use client";

import React, { useState, useMemo } from "react";

interface DataPoint {
  date: string;
  time: string;
  label: string; // for X-axis
  value: number; // e.g. 10000 to 92000
  downloadsFormatted: string; // e.g. "2,847 downloads"
}

// Default 30D seed matching Image 2 with sawtooth rising pattern
const DATA_30D: DataPoint[] = [
  { date: "Apr 1", time: "00:00", label: "Apr 1", value: 11200, downloadsFormatted: "1,120 downloads" },
  { date: "Apr 2", time: "12:00", label: "", value: 16800, downloadsFormatted: "1,680 downloads" },
  { date: "Apr 4", time: "08:00", label: "", value: 14500, downloadsFormatted: "1,450 downloads" },
  { date: "Apr 6", time: "18:00", label: "", value: 23100, downloadsFormatted: "2,310 downloads" },
  { date: "Apr 8", time: "12:00", label: "Apr 8", value: 20400, downloadsFormatted: "2,040 downloads" },
  { date: "Apr 10", time: "09:00", label: "", value: 28900, downloadsFormatted: "2,890 downloads" },
  { date: "Apr 12", time: "15:00", label: "", value: 34100, downloadsFormatted: "3,410 downloads" },
  { date: "Apr 13", time: "22:00", label: "", value: 27500, downloadsFormatted: "2,750 downloads" },
  { date: "Apr 15", time: "12:00", label: "Apr 15", value: 38200, downloadsFormatted: "3,820 downloads" },
  { date: "Apr 16", time: "14:00", label: "", value: 43600, downloadsFormatted: "4,360 downloads" },
  { date: "Apr 18", time: "07:00", label: "", value: 41200, downloadsFormatted: "4,120 downloads" },
  { date: "Apr 19", time: "20:00", label: "", value: 47800, downloadsFormatted: "4,780 downloads" },
  { date: "Apr 20", time: "11:00", label: "", value: 52400, downloadsFormatted: "5,240 downloads" },
  { date: "Apr 21", time: "16:00", label: "", value: 48900, downloadsFormatted: "4,890 downloads" },
  { date: "Apr 22", time: "12:00", label: "Apr 22", value: 61500, downloadsFormatted: "2,847 downloads" },
  { date: "Apr 23", time: "17:00", label: "", value: 64900, downloadsFormatted: "6,490 downloads" },
  { date: "Apr 25", time: "09:00", label: "", value: 59800, downloadsFormatted: "5,980 downloads" },
  { date: "Apr 26", time: "21:00", label: "", value: 72400, downloadsFormatted: "7,240 downloads" },
  { date: "Apr 27", time: "10:00", label: "", value: 81600, downloadsFormatted: "8,160 downloads" },
  { date: "Apr 28", time: "19:00", label: "", value: 78200, downloadsFormatted: "7,820 downloads" },
  { date: "Apr 29", time: "12:00", label: "Apr 29", value: 91400, downloadsFormatted: "9,140 downloads" },
];

export function DownloadsOverTimeChart({
  title = "Downloads over time",
  className = "",
}: {
  title?: string;
  className?: string;
}) {
  const [range, setRange] = useState<"7D" | "30D" | "90D" | "1Y">("30D");
  // Default hover index on Apr 22 matching the reference image!
  const [hoverIndex, setHoverIndex] = useState<number | null>(14);

  const points = useMemo(() => {
    if (range === "7D") return DATA_30D.slice(-7);
    if (range === "90D") return DATA_30D;
    if (range === "1Y") return DATA_30D;
    return DATA_30D;
  }, [range]);

  // Coordinate geometry
  const width = 800;
  const height = 300;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const maxY = 100000;
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
      <div className="relative w-full overflow-x-auto select-none pb-1">
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
            // Keep active at Apr 22 or latest point
            setHoverIndex(14 < points.length ? 14 : points.length - 1);
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

          {/* Horizontal Grid Lines & Y-Axis Labels matching Image 2 */}
          {[100000, 75000, 50000, 25000, 0].map((val) => {
            const y = getY(val);
            const label = val === 0 ? "0K" : `${val / 1000}K`;
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