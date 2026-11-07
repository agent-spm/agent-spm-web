"use client";

import React, { useRef, useEffect } from "react";

/**
 * Pixel-art digit bitmaps for "4", "0", "4".
 * Each digit is 7 columns × 9 rows.
 * 1 = filled pixel, 0 = empty.
 */
const DIGIT_4: number[][] = [
  [0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 1, 1, 0, 0],
  [0, 0, 1, 0, 1, 0, 0],
  [0, 1, 0, 0, 1, 0, 0],
  [1, 0, 0, 0, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 1, 0, 0],
];

const DIGIT_0: number[][] = [
  [0, 1, 1, 1, 1, 1, 0],
  [1, 1, 0, 0, 0, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 0, 0, 0, 1, 1],
  [0, 1, 1, 1, 1, 1, 0],
];

/** Cyan-to-azure color palette from the footer pixel system */
const COLORS = [
  "#ECF8FF",
  "#C5EAFF",
  "#B7E5FF",
  "#A9E0FF",
  "#8ED6FF",
  "#64C8FF",
  "#50BFFF",
  "#3BB9FF",
  "#2DB4FF",
];

/** Deterministic Mulberry32 PRNG — identical to PixelBox.tsx */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface GlyphCell {
  /** Row in the full composite grid */
  r: number;
  /** Column in the full composite grid */
  c: number;
  /** Fill color from the cyan palette */
  color: string;
  /** Deterministic dither rank for reveal/dissolve ordering */
  rank: number;
}

/**
 * Build the full cell list for "4 · 0 · 4" laid out across a composite grid.
 * Layout: [4] gap [0] gap [4]
 * Each digit is 7 cols wide, gaps are 3 cols → total = 7+3+7+3+7 = 27 cols, 9 rows.
 */
function buildGlyphCells(): { cells: GlyphCell[]; cols: number; rows: number } {
  const DIGIT_COLS = 7;
  const GAP_COLS = 3;
  const ROWS = 9;
  const TOTAL_COLS = DIGIT_COLS * 3 + GAP_COLS * 2; // 27

  const digits = [DIGIT_4, DIGIT_0, DIGIT_4];
  const rng = mulberry32(404);
  const raw: GlyphCell[] = [];

  digits.forEach((bitmap, digitIdx) => {
    const colOffset = digitIdx * (DIGIT_COLS + GAP_COLS);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < DIGIT_COLS; c++) {
        if (bitmap[r][c] === 1) {
          // Pick color: outer edges get lighter tones, inner gets deeper cyan
          const distFromCenter = Math.abs(r - 4) / 4; // 0 at center row, 1 at edges
          const colorIdx = Math.min(
            COLORS.length - 1,
            Math.floor(distFromCenter * 4 + rng() * 5)
          );
          raw.push({
            r,
            c: colOffset + c,
            color: COLORS[colorIdx],
            rank: 0,
          });
        }
      }
    }
  });

  // Assign deterministic dither ranks for staggered reveal — same algorithm as PixelBox
  const hashed = raw.map((cell, i) => {
    const hash =
      Math.abs(
        Math.sin(cell.r * 12.9898 + cell.c * 78.233 + i * 137.95) * 43758.5453
      ) % 1;
    // Mix spatial position with randomness for organic dither
    const rank = (cell.c / TOTAL_COLS) * 0.25 + (cell.r / ROWS) * 0.15 + hash * 0.6;
    return { ...cell, rank };
  });

  hashed.sort((a, b) => a.rank - b.rank);

  return { cells: hashed, cols: TOTAL_COLS, rows: ROWS };
}

const { cells: GLYPH_CELLS, cols: GLYPH_COLS, rows: GLYPH_ROWS } = buildGlyphCells();

/**
 * Animation timeline (seconds):
 *   0.0 – 2.0  : Assemble (pixels dither in)
 *   2.0 – 3.8  : Hold (fully visible)
 *   3.8 – 5.8  : Dissolve (pixels dither out)
 *   5.8 – 6.6  : Pause (empty)
 *   6.6+        : Loop
 */
const ASSEMBLE_END = 2.0;
const HOLD_END = 3.8;
const DISSOLVE_END = 5.8;
const CYCLE_DURATION = 6.6;

function getVisibleCount(timeInCycle: number, total: number): number {
  if (timeInCycle < ASSEMBLE_END) {
    // Ease-out cubic for organic assembly feel
    const t = timeInCycle / ASSEMBLE_END;
    const eased = 1 - Math.pow(1 - t, 3);
    return Math.round(eased * total);
  }
  if (timeInCycle < HOLD_END) {
    return total;
  }
  if (timeInCycle < DISSOLVE_END) {
    // Ease-in cubic for dissolve
    const t = (timeInCycle - HOLD_END) / (DISSOLVE_END - HOLD_END);
    const eased = 1 - Math.pow(t, 3);
    return Math.round(eased * total);
  }
  return 0;
}

export interface Pixel404GlyphProps {
  className?: string;
}

/**
 * Pixel404Glyph — renders "4 0 4" as a pixel mosaic on canvas
 * with a perpetual assemble → hold → dissolve → pause cycle.
 * Uses the exact same rendering approach, PRNG, and color palette
 * as the site-wide PixelBox system.
 */
export const Pixel404Glyph: React.FC<Pixel404GlyphProps> = ({ className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = 1;
    let pixelSize = 0;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      const w = container!.offsetWidth;
      pixelSize = w / GLYPH_COLS;
      const h = GLYPH_ROWS * pixelSize;

      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      container!.style.height = h + "px";

      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(visibleCount: number) {
      const p = pixelSize;
      const w = container!.offsetWidth;
      const h = GLYPH_ROWS * p;

      ctx!.clearRect(0, 0, w, h);
      if (visibleCount === 0) return;

      const count = Math.min(visibleCount, GLYPH_CELLS.length);
      for (let i = 0; i < count; i++) {
        const cell = GLYPH_CELLS[i];
        ctx!.fillStyle = cell.color;
        const x0 = Math.floor(cell.c * p);
        const x1 = Math.floor((cell.c + 1) * p);
        const y0 = Math.floor(cell.r * p);
        const y1 = Math.floor((cell.r + 1) * p);
        ctx!.fillRect(x0, y0, x1 - x0, y1 - y0);
      }
    }

    let startTime: number | null = null;
    let animId: number;

    function tick(timestamp: number) {
      if (startTime === null) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;
      const timeInCycle = elapsed % CYCLE_DURATION;
      const visible = getVisibleCount(timeInCycle, GLYPH_CELLS.length);
      draw(visible);
      animId = requestAnimationFrame(tick);
    }

    let resizeTimer: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
      }, 100);
    }

    resize();
    draw(0);
    animId = requestAnimationFrame(tick);
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-[540px] mx-auto relative select-none transform-gpu ${className}`}
    >
      <canvas ref={canvasRef} className="block w-full transform-gpu" />
    </div>
  );
};
