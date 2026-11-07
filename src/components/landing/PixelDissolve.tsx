"use client";

import React, { useMemo } from "react";

interface PixelDissolveProps {
  className?: string;
  cellSize?: number;
  height?: number;
  seed?: number;
  mode?: "dissolve-to-white" | "dissolve-from-white" | "faint-pattern";
}

// Deterministic PRNG
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * PixelDissolve Engine
 * Exact match to user upload media_1793083347377_81cc3a6c.png and Figma pixelated-bg-bar.
 * Chunky 36px square blocks with deterministic cluster seeding and seamless transition to pure white.
 */
export const PixelDissolve: React.FC<PixelDissolveProps> = ({
  className = "",
  cellSize = 36,
  height = 280,
  seed = 42,
  mode = "dissolve-to-white",
}) => {
  const VIEW_WIDTH = 1440;
  const cols = Math.ceil(VIEW_WIDTH / cellSize);
  const rows = Math.ceil(height / cellSize);

  const rects = useMemo(() => {
    const rng = mulberry32(seed);
    const cells: { x: number; y: number; w: number; h: number; fill: string; opacity?: number }[] = [];

    // Pre-generate matrix matching user's uploaded screenshot media_1793083347377_81cc3a6c.png
    const matrix: boolean[][] = [];
    for (let r = 0; r < rows; r++) {
      matrix[r] = [];
      const rowRatio = r / (rows - 1); // 0 at top, 1 at bottom

      // Density curve matching Supaste / Figma pixel dissolve
      let threshold = 0;
      if (mode === "dissolve-to-white") {
        if (rowRatio < 0.15) threshold = 0.04;
        else if (rowRatio < 0.3) threshold = 0.15;
        else if (rowRatio < 0.45) threshold = 0.35;
        else if (rowRatio < 0.6) threshold = 0.58;
        else if (rowRatio < 0.75) threshold = 0.82;
        else if (rowRatio < 0.88) threshold = 0.96;
        else threshold = 1.0;
      } else if (mode === "dissolve-from-white") {
        const inv = 1 - rowRatio;
        if (inv < 0.15) threshold = 0.04;
        else if (inv < 0.3) threshold = 0.15;
        else if (inv < 0.45) threshold = 0.35;
        else if (inv < 0.6) threshold = 0.58;
        else if (inv < 0.75) threshold = 0.82;
        else if (inv < 0.88) threshold = 0.96;
        else threshold = 1.0;
      } else {
        threshold = 0.10;
      }

      for (let c = 0; c < cols; c++) {
        let prob = rng();
        // Horizontal & vertical clustering (creates Tetris/Supaste stair-steps)
        if (c > 0 && matrix[r][c - 1] && rng() < 0.5) {
          prob *= 0.5;
        }
        if (r > 0 && matrix[r - 1][c] && rng() < 0.5) {
          prob *= 0.5;
        }

        // Guarantee 100% solid bottom for seamless blend into white sections
        const isFilled = prob < threshold || (mode === "dissolve-to-white" && r >= rows - 1);
        matrix[r][c] = isFilled;

        if (isFilled) {
          cells.push({
            x: c * cellSize,
            y: r * cellSize,
            w: cellSize + 0.5, // slight overlap to eliminate subpixel rounding seams
            h: cellSize + 0.5,
            fill: mode === "faint-pattern" ? "#1A5FED" : "#FFFFFF",
            opacity: mode === "faint-pattern" ? 0.06 : 1,
          });
        }
      }
    }
    return cells;
  }, [cols, rows, cellSize, seed, mode]);

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      className={`w-full h-auto select-none pointer-events-none block ${className}`}
      aria-hidden="true"
    >
      {rects.map((cell, idx) => (
        <rect
          key={idx}
          x={cell.x}
          y={cell.y}
          width={cell.w}
          height={cell.h}
          fill={cell.fill}
          opacity={cell.opacity}
        />
      ))}
    </svg>
  );
};
