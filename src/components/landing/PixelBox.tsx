"use client";

import React, { useRef, useEffect } from 'react';

/**
 * Pixel art cell coordinates extracted from the user's SVG.
 * Grid: 42 columns × 11 rows. Cell size ≈ 45.708px in the 1920×504 viewBox.
 */
const CELLS: Array<{ r: number; c: number }> = [
  // Original cells
  {r:3,c:5},{r:4,c:2},{r:4,c:3},{r:4,c:4},{r:4,c:7},{r:4,c:11},{r:4,c:12},
  {r:5,c:1},{r:5,c:2},{r:5,c:4},{r:5,c:6},{r:5,c:10},{r:5,c:11},
  {r:6,c:0},{r:6,c:1},{r:6,c:5},
  {r:2,c:13},{r:3,c:8},{r:3,c:9},{r:3,c:10},{r:4,c:9},{r:4,c:10},
  {r:5,c:6},{r:5,c:8},{r:6,c:8},{r:6,c:9},
  {r:7,c:7},{r:7,c:9},{r:7,c:10},{r:8,c:6},
  {r:9,c:6},{r:9,c:7},{r:10,c:6},
  {r:0,c:17},{r:1,c:12},{r:1,c:13},{r:1,c:14},
  {r:2,c:13},{r:2,c:14},{r:3,c:12},{r:3,c:14},
  {r:4,c:11},{r:4,c:12},{r:5,c:10},{r:5,c:11},{r:5,c:13},
  {r:6,c:14},{r:7,c:13},{r:7,c:14},{r:8,c:14},
  {r:1,c:18},{r:3,c:17},{r:4,c:15},{r:4,c:18},
  {r:5,c:14},{r:5,c:15},{r:5,c:17},{r:5,c:18},{r:5,c:23},
  {r:6,c:18},{r:6,c:23},{r:7,c:24},
  {r:5,c:21},{r:6,c:21},{r:6,c:22},{r:8,c:23},
  {r:0,c:28},{r:1,c:23},{r:1,c:24},{r:1,c:25},
  {r:2,c:24},{r:2,c:25},{r:3,c:21},{r:3,c:23},{r:3,c:24},
  {r:4,c:22},{r:4,c:23},{r:5,c:20},{r:5,c:22},{r:5,c:24},{r:5,c:25},
  {r:6,c:21},{r:6,c:25},{r:6,c:26},
  {r:7,c:19},{r:7,c:21},{r:8,c:18},{r:8,c:19},{r:8,c:20},
  {r:1,c:29},{r:3,c:28},{r:4,c:26},{r:4,c:29},
  {r:5,c:25},{r:5,c:26},{r:5,c:28},{r:5,c:29},{r:6,c:29},
  {r:4,c:29},{r:4,c:30},{r:4,c:34},
  {r:5,c:30},{r:5,c:31},
  {r:5,c:33},{r:5,c:35},{r:6,c:32},{r:6,c:33},
  {r:7,c:31},{r:7,c:32},
  {r:5,c:39},{r:5,c:40},{r:6,c:36},{r:6,c:40},{r:6,c:41},
  {r:7,c:34},{r:8,c:35},{r:9,c:34},{r:9,c:35},{r:10,c:35},
  {r:3,c:31},{r:3,c:32},{r:3,c:36},
  {r:4,c:32},{r:4,c:33},{r:4,c:37},{r:4,c:38},{r:4,c:39},
  {r:5,c:33},{r:5,c:35},{r:5,c:37},
];

// De-duplicate and sort in a completely random (but deterministic) order for dither reveal
const SORTED_CELLS = (() => {
  const seen = new Set<string>();
  const unique: Array<{ r: number; c: number }> = [];
  for (const cell of CELLS) {
    const key = `${cell.r},${cell.c}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(cell);
    }
  }

  // Maps to a deterministic random value to be SSR-safe
  const pixels = unique.map((cell, i) => {
    const hash = Math.abs(Math.sin(cell.r * 12.9898 + cell.c * 78.233 + i * 137.95) * 43758.5453) % 1;
    return { ...cell, hash };
  });

  // Sort completely randomly based on hash
  pixels.sort((a, b) => a.hash - b.hash);
  return pixels.map(({ r, c }) => ({ r, c }));
})();

export const GRID_COLS = 42;
export const GRID_ROWS = 11;

// Deterministic Mulberry32 generator for SSR consistency
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * EXACT 274 footer pixel art cells extracted directly from the user's reference mockup
 * (media_1793189313473_b32ee1d8.png).
 * Grid: 42 columns × 11 rows.
 * Features whisper-light ice cyan (#ECF8FF) at top rows 0-2 transitioning
 * through soft sky blues (#C5EAFF, #B7E5FF) to vibrant azure blue (#64C8FF, #50BFFF, #2DB4FF)
 * at rows 6-10 with organic digital scatter.
 */
export const EXACT_FOOTER_CELLS: Array<{ r: number; c: number; color: string }> = [
  {r:0,c:6,color:"#ECF8FF"}, {r:0,c:12,color:"#ECF8FF"}, {r:0,c:13,color:"#ECF8FF"}, {r:0,c:17,color:"#ECF8FF"}, {r:0,c:20,color:"#ECF8FF"},
  {r:0,c:23,color:"#ECF8FF"}, {r:0,c:24,color:"#ECF8FF"}, {r:0,c:28,color:"#ECF8FF"}, {r:0,c:31,color:"#ECF8FF"}, {r:0,c:35,color:"#ECF8FF"},
  {r:1,c:5,color:"#ECF8FF"}, {r:1,c:6,color:"#ECF8FF"}, {r:1,c:13,color:"#ECF8FF"}, {r:1,c:14,color:"#ECF8FF"}, {r:1,c:16,color:"#ECF8FF"},
  {r:1,c:18,color:"#ECF8FF"}, {r:1,c:20,color:"#ECF8FF"}, {r:1,c:21,color:"#ECF8FF"}, {r:1,c:24,color:"#ECF8FF"}, {r:1,c:25,color:"#ECF8FF"},
  {r:1,c:27,color:"#ECF8FF"}, {r:1,c:29,color:"#ECF8FF"}, {r:1,c:30,color:"#ECF8FF"}, {r:1,c:33,color:"#ECF8FF"}, {r:1,c:35,color:"#ECF8FF"},
  {r:1,c:36,color:"#ECF8FF"}, {r:2,c:6,color:"#ECF8FF"}, {r:2,c:8,color:"#ECF8FF"}, {r:2,c:9,color:"#ECF8FF"}, {r:2,c:13,color:"#ECF8FF"},
  {r:2,c:15,color:"#ECF8FF"}, {r:2,c:16,color:"#ECF8FF"}, {r:2,c:20,color:"#ECF8FF"}, {r:2,c:24,color:"#ECF8FF"}, {r:2,c:26,color:"#ECF8FF"},
  {r:2,c:27,color:"#ECF8FF"}, {r:2,c:31,color:"#ECF8FF"}, {r:2,c:32,color:"#ECF8FF"}, {r:2,c:35,color:"#ECF8FF"}, {r:3,c:2,color:"#ECF8FF"},
  {r:3,c:3,color:"#ECF8FF"}, {r:3,c:5,color:"#ECF8FF"}, {r:3,c:6,color:"#C5EAFF"}, {r:3,c:9,color:"#ECF8FF"}, {r:3,c:10,color:"#ECF8FF"},
  {r:3,c:12,color:"#B7E5FF"}, {r:3,c:13,color:"#C5EAFF"}, {r:3,c:14,color:"#D9F2FF"}, {r:3,c:15,color:"#ECF8FF"}, {r:3,c:17,color:"#B7E5FF"},
  {r:3,c:20,color:"#C5EAFF"}, {r:3,c:21,color:"#ECF8FF"}, {r:3,c:23,color:"#A9E0FF"}, {r:3,c:24,color:"#A9E0FF"}, {r:3,c:25,color:"#ECF8FF"},
  {r:3,c:26,color:"#ECF8FF"}, {r:3,c:28,color:"#B7E5FF"}, {r:3,c:31,color:"#C5EAFF"}, {r:3,c:32,color:"#ECF8FF"}, {r:3,c:33,color:"#ECF8FF"},
  {r:3,c:35,color:"#C5EAFF"}, {r:3,c:36,color:"#ECF8FF"}, {r:3,c:38,color:"#ECF8FF"}, {r:3,c:39,color:"#ECF8FF"}, {r:4,c:3,color:"#ECF8FF"},
  {r:4,c:4,color:"#ECF8FF"}, {r:4,c:5,color:"#C5EAFF"}, {r:4,c:6,color:"#C5EAFF"}, {r:4,c:7,color:"#ECF8FF"}, {r:4,c:11,color:"#D9F2FF"},
  {r:4,c:12,color:"#D9F2FF"}, {r:4,c:13,color:"#C5EAFF"}, {r:4,c:14,color:"#C5EAFF"}, {r:4,c:16,color:"#C5EAFF"}, {r:4,c:18,color:"#B7E5FF"},
  {r:4,c:20,color:"#C5EAFF"}, {r:4,c:21,color:"#B7E5FF"}, {r:4,c:22,color:"#ECF8FF"}, {r:4,c:23,color:"#D9F2FF"}, {r:4,c:24,color:"#C5EAFF"},
  {r:4,c:25,color:"#C5EAFF"}, {r:4,c:27,color:"#C5EAFF"}, {r:4,c:29,color:"#A9E0FF"}, {r:4,c:30,color:"#B7E5FF"}, {r:4,c:33,color:"#B7E5FF"},
  {r:4,c:34,color:"#ECF8FF"}, {r:4,c:35,color:"#C5EAFF"}, {r:4,c:36,color:"#C5EAFF"}, {r:4,c:37,color:"#ECF8FF"}, {r:4,c:38,color:"#ECF8FF"},
  {r:5,c:1,color:"#ECF8FF"}, {r:5,c:2,color:"#ECF8FF"}, {r:5,c:4,color:"#ECF8FF"}, {r:5,c:6,color:"#A9E0FF"}, {r:5,c:8,color:"#B7E5FF"},
  {r:5,c:9,color:"#C5EAFF"}, {r:5,c:10,color:"#D9F2FF"}, {r:5,c:11,color:"#D9F2FF"}, {r:5,c:13,color:"#B6E4FF"}, {r:5,c:15,color:"#C5EAFF"},
  {r:5,c:16,color:"#C5EAFF"}, {r:5,c:17,color:"#EBF7FF"}, {r:5,c:18,color:"#ECF8FF"}, {r:5,c:20,color:"#B6E4FF"}, {r:5,c:21,color:"#ECF8FF"},
  {r:5,c:22,color:"#D9F2FF"}, {r:5,c:24,color:"#B6E4FF"}, {r:5,c:25,color:"#ECF8FF"}, {r:5,c:26,color:"#C5EAFF"}, {r:5,c:27,color:"#C5EAFF"},
  {r:5,c:28,color:"#EBF7FF"}, {r:5,c:29,color:"#ECF8FF"}, {r:5,c:30,color:"#ECF8FF"}, {r:5,c:31,color:"#B6E4FF"}, {r:5,c:32,color:"#C5EAFF"},
  {r:5,c:33,color:"#ECF8FF"}, {r:5,c:35,color:"#A9E0FF"}, {r:5,c:37,color:"#ECF8FF"}, {r:5,c:39,color:"#ECF8FF"}, {r:5,c:40,color:"#ECF8FF"},
  {r:6,c:0,color:"#ECF8FF"}, {r:6,c:1,color:"#ECF8FF"}, {r:6,c:2,color:"#C5EAFF"}, {r:6,c:3,color:"#C5EAFF"}, {r:6,c:5,color:"#B7E4FF"},
  {r:6,c:6,color:"#64C8FF"}, {r:6,c:8,color:"#ECF8FF"}, {r:6,c:9,color:"#B7E5FF"}, {r:6,c:10,color:"#C5EAFF"}, {r:6,c:12,color:"#50BFFF"},
  {r:6,c:13,color:"#64C8FF"}, {r:6,c:14,color:"#8ED6FF"}, {r:6,c:15,color:"#C5EAFF"}, {r:6,c:17,color:"#50BFFF"}, {r:6,c:18,color:"#ECF8FF"},
  {r:6,c:20,color:"#64C8FF"}, {r:6,c:21,color:"#B7E5FF"}, {r:6,c:22,color:"#ECF8FF"}, {r:6,c:23,color:"#3BB9FF"}, {r:6,c:24,color:"#41BAFF"},
  {r:6,c:25,color:"#B7E5FF"}, {r:6,c:26,color:"#B7E5FF"}, {r:6,c:28,color:"#50BFFF"}, {r:6,c:29,color:"#ECF8FF"}, {r:6,c:31,color:"#63C8FF"},
  {r:6,c:32,color:"#B7E5FF"}, {r:6,c:33,color:"#B7E5FF"}, {r:6,c:35,color:"#64C8FF"}, {r:6,c:36,color:"#B7E4FF"}, {r:6,c:38,color:"#C5EAFF"},
  {r:6,c:39,color:"#C5EAFF"}, {r:6,c:40,color:"#ECF8FF"}, {r:6,c:41,color:"#ECF8FF"}, {r:7,c:3,color:"#C5EAFF"}, {r:7,c:4,color:"#C5EAFF"},
  {r:7,c:5,color:"#64C8FF"}, {r:7,c:6,color:"#64C8FF"}, {r:7,c:7,color:"#B7E5FF"}, {r:7,c:9,color:"#ECF7FF"}, {r:7,c:10,color:"#ECF8FF"},
  {r:7,c:11,color:"#99DAFF"}, {r:7,c:12,color:"#99DAFF"}, {r:7,c:13,color:"#5EC5FF"}, {r:7,c:14,color:"#5EC5FF"}, {r:7,c:16,color:"#64C8FF"},
  {r:7,c:18,color:"#50BFFF"}, {r:7,c:19,color:"#ECF8FF"}, {r:7,c:20,color:"#64C8FF"}, {r:7,c:21,color:"#4CBDFF"}, {r:7,c:22,color:"#C5EAFF"},
  {r:7,c:23,color:"#99DAFF"}, {r:7,c:24,color:"#5EC5FF"}, {r:7,c:25,color:"#64C8FF"}, {r:7,c:27,color:"#64C8FF"}, {r:7,c:29,color:"#41BAFF"},
  {r:7,c:30,color:"#50BFFF"}, {r:7,c:31,color:"#ECF8FF"}, {r:7,c:32,color:"#ECF8FF"}, {r:7,c:33,color:"#50BFFF"}, {r:7,c:34,color:"#B7E5FF"},
  {r:7,c:35,color:"#64C8FF"}, {r:7,c:36,color:"#64C8FF"}, {r:7,c:37,color:"#C5EAFF"}, {r:7,c:38,color:"#C5EAFF"}, {r:8,c:1,color:"#C5EAFF"},
  {r:8,c:2,color:"#C5EAFF"}, {r:8,c:4,color:"#C5EAFF"}, {r:8,c:6,color:"#3DBAFF"}, {r:8,c:8,color:"#51C0FF"}, {r:8,c:9,color:"#64C8FF"},
  {r:8,c:10,color:"#99DAFF"}, {r:8,c:11,color:"#99DAFF"}, {r:8,c:13,color:"#51C0FF"}, {r:8,c:14,color:"#ECF7FF"}, {r:8,c:15,color:"#64C8FF"},
  {r:8,c:16,color:"#64C8FF"}, {r:8,c:17,color:"#C5EAFF"}, {r:8,c:18,color:"#B7E5FF"}, {r:8,c:19,color:"#ECF8FF"}, {r:8,c:20,color:"#4BBEFF"},
  {r:8,c:21,color:"#C5EAFF"}, {r:8,c:22,color:"#99DAFF"}, {r:8,c:23,color:"#ECF7FF"}, {r:8,c:24,color:"#50BFFF"}, {r:8,c:25,color:"#C5EAFF"},
  {r:8,c:26,color:"#64C8FF"}, {r:8,c:27,color:"#64C8FF"}, {r:8,c:28,color:"#C5EAFF"}, {r:8,c:29,color:"#C5EAFF"}, {r:8,c:30,color:"#C5EAFF"},
  {r:8,c:31,color:"#4FC0FF"}, {r:8,c:32,color:"#64C8FF"}, {r:8,c:33,color:"#C5EAFF"}, {r:8,c:35,color:"#3DBAFF"}, {r:8,c:37,color:"#C5EAFF"},
  {r:8,c:39,color:"#C5EAFF"}, {r:8,c:40,color:"#C5EAFF"}, {r:9,c:0,color:"#C5EAFF"}, {r:9,c:1,color:"#C5EAFF"}, {r:9,c:2,color:"#64C8FF"},
  {r:9,c:3,color:"#64C8FF"}, {r:9,c:5,color:"#4FC0FF"}, {r:9,c:6,color:"#ECF8FF"}, {r:9,c:7,color:"#ECF7FF"}, {r:9,c:8,color:"#C5EAFF"},
  {r:9,c:9,color:"#4FC0FF"}, {r:9,c:10,color:"#64C8FF"}, {r:9,c:12,color:"#64C8FF"}, {r:9,c:14,color:"#25B1FF"}, {r:9,c:15,color:"#64C8FF"},
  {r:9,c:17,color:"#64C8FF"}, {r:9,c:18,color:"#C5EAFF"}, {r:9,c:21,color:"#4FC0FF"}, {r:9,c:22,color:"#C5EAFF"}, {r:9,c:23,color:"#25B1FF"},
  {r:9,c:24,color:"#2DB4FF"}, {r:9,c:25,color:"#4FC0FF"}, {r:9,c:26,color:"#4FC0FF"}, {r:9,c:28,color:"#64C8FF"}, {r:9,c:29,color:"#C5EAFF"},
  {r:9,c:32,color:"#4FC0FF"}, {r:9,c:33,color:"#4FC0FF"}, {r:9,c:34,color:"#ECF7FF"}, {r:9,c:35,color:"#ECF8FF"}, {r:9,c:36,color:"#4FC0FF"},
  {r:9,c:38,color:"#64C8FF"}, {r:9,c:39,color:"#64C8FF"}, {r:9,c:40,color:"#C5EAFF"}, {r:9,c:41,color:"#C5EAFF"}, {r:10,c:3,color:"#64C8FF"},
  {r:10,c:4,color:"#64C8FF"}, {r:10,c:6,color:"#ECF7FF"}, {r:10,c:7,color:"#50BFFF"}, {r:10,c:9,color:"#C5EAFF"}, {r:10,c:10,color:"#C5EAFF"},
  {r:10,c:11,color:"#2DB4FF"}, {r:10,c:12,color:"#2DB4FF"}, {r:10,c:13,color:"#C5EAFF"}, {r:10,c:14,color:"#C5EAFF"}, {r:10,c:18,color:"#64C8FF"},
  {r:10,c:19,color:"#C5EAFF"}, {r:10,c:21,color:"#4FC0FF"}, {r:10,c:22,color:"#64C8FF"}, {r:10,c:23,color:"#2DB4FF"}, {r:10,c:24,color:"#C5EAFF"},
  {r:10,c:29,color:"#2DB4FF"}, {r:10,c:30,color:"#64C8FF"}, {r:10,c:31,color:"#C5EAFF"}, {r:10,c:32,color:"#C5EAFF"}, {r:10,c:33,color:"#64C8FF"},
  {r:10,c:34,color:"#50BFFF"}, {r:10,c:35,color:"#ECF8FF"}, {r:10,c:37,color:"#64C8FF"}, {r:10,c:38,color:"#64C8FF"},
];

export const FOOTER_GRID_COLS = 42;
export const FOOTER_GRID_ROWS = 11;

/**
 * Precomputed deterministic sorted footer cells for smooth auto-scroll dither reveal.
 * Mixes vertical progression with organic dither hash so pixels pop in naturally.
 */
export const FOOTER_SORTED_CELLS = (() => {
  const hashed = EXACT_FOOTER_CELLS.map((cell, i) => {
    const hash =
      Math.abs(Math.sin(cell.r * 12.9898 + cell.c * 78.233 + i * 137.95) * 43758.5453) % 1;
    const rank = (cell.r / FOOTER_GRID_ROWS) * 0.35 + hash * 0.65;
    return { ...cell, rank };
  });

  hashed.sort((a, b) => a.rank - b.rank);
  return hashed.map(({ r, c, color }) => ({ r, c, color }));
})();

export const PRICING_GRID_COLS = 42;
export const PRICING_GRID_ROWS = 8;

/**
 * Precomputed deterministic white pixel dissolve for ABOVE the Pricing section:
 * - 42 columns matching the identical pixelSize = w / 42 across Hero & Footer
 * - Dissolves from solid white at top downwards into the light sky cyan gradient
 * - Deterministic dither reveal order identical to Hero
 */
export const PRICING_SORTED_CELLS = (() => {
  const rng = mulberry32(42);
  const densities = [1.0, 0.94, 0.78, 0.58, 0.38, 0.20, 0.08, 0.03];
  const grid: boolean[][] = Array.from({ length: PRICING_GRID_ROWS }, () =>
    Array(PRICING_GRID_COLS).fill(false)
  );

  const rawCells: Array<{ r: number; c: number; color: string }> = [];

  for (let r = 0; r < PRICING_GRID_ROWS; r++) {
    const baseProb = densities[r];
    for (let c = 0; c < PRICING_GRID_COLS; c++) {
      if (r === 0) {
        // Top-most row is 100% solid white to meet ExcellenceGrid seamlessly
        grid[r][c] = true;
        rawCells.push({ r, c, color: '#FFFFFF' });
        continue;
      }
      let prob = baseProb;
      if (r > 0 && grid[r - 1][c] && rng() < 0.35) {
        prob = Math.min(0.98, prob * 1.3);
      }
      if (c > 0 && grid[r][c - 1] && rng() < 0.25) {
        prob = Math.min(0.98, prob * 1.2);
      }
      if (rng() < prob) {
        grid[r][c] = true;
        rawCells.push({ r, c, color: '#FFFFFF' });
      }
    }
  }

  // Deterministic random order for scroll-reveal dither
  const hashed = rawCells.map((cell, i) => {
    const hash =
      Math.abs(Math.sin(cell.r * 12.9898 + cell.c * 78.233 + i * 137.95) * 43758.5453) % 1;
    const rank = (cell.r / PRICING_GRID_ROWS) * 0.35 + hash * 0.65;
    return { ...cell, rank };
  });

  hashed.sort((a, b) => a.rank - b.rank);
  return hashed.map(({ r, c, color }) => ({ r, c, color }));
})();

export const PRICING_BOTTOM_GRID_COLS = 42;
export const PRICING_BOTTOM_GRID_ROWS = 8;

/**
 * Precomputed deterministic white pixel dissolve for BELOW the Pricing section:
 * - 42 columns matching identical pixelSize = w / 42
 * - Dissolves from blue into pure solid white at the bottom where it joins FAQSection
 * - Row 7 is 100% solid white ensuring seamless zero-gap transition into FAQ
 */
export const PRICING_BOTTOM_SORTED_CELLS = (() => {
  const rng = mulberry32(101);
  const densities = [0.04, 0.12, 0.26, 0.46, 0.68, 0.85, 0.95, 1.0];
  const grid: boolean[][] = Array.from({ length: PRICING_BOTTOM_GRID_ROWS }, () =>
    Array(PRICING_BOTTOM_GRID_COLS).fill(false)
  );

  const rawCells: Array<{ r: number; c: number; color: string }> = [];

  for (let r = 0; r < PRICING_BOTTOM_GRID_ROWS; r++) {
    const baseProb = densities[r];
    for (let c = 0; c < PRICING_BOTTOM_GRID_COLS; c++) {
      if (r === PRICING_BOTTOM_GRID_ROWS - 1) {
        // Bottom-most row is 100% solid white to meet FAQSection seamlessly
        grid[r][c] = true;
        rawCells.push({ r, c, color: '#FFFFFF' });
        continue;
      }
      let prob = baseProb;
      if (r > 0 && grid[r - 1][c] && rng() < 0.35) {
        prob = Math.min(0.98, prob * 1.3);
      }
      if (c > 0 && grid[r][c - 1] && rng() < 0.25) {
        prob = Math.min(0.98, prob * 1.2);
      }
      if (rng() < prob) {
        grid[r][c] = true;
        rawCells.push({ r, c, color: '#FFFFFF' });
      }
    }
  }

  // Deterministic dither reveal rank
  const hashed = rawCells.map((cell, i) => {
    const hash =
      Math.abs(Math.sin(cell.r * 12.9898 + cell.c * 78.233 + i * 137.95) * 43758.5453) % 1;
    const rank = (cell.r / PRICING_BOTTOM_GRID_ROWS) * 0.35 + hash * 0.65;
    return { ...cell, rank };
  });

  hashed.sort((a, b) => a.rank - b.rank);
  return hashed.map(({ r, c, color }) => ({ r, c, color }));
})();

export interface PixelBoxProps {
  color?: string;
  variant?: 'white' | 'footer-gradient' | 'pricing-dissolve' | 'pricing-bottom-dissolve';
  className?: string;
}

export const PixelBox: React.FC<PixelBoxProps> = ({
  color = '#ffffff',
  variant = 'white',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isFooter = variant === 'footer-gradient';
    const isPricing = variant === 'pricing-dissolve';
    const isPricingBottom = variant === 'pricing-bottom-dissolve';

    const cols = isFooter
      ? FOOTER_GRID_COLS
      : isPricingBottom
      ? PRICING_BOTTOM_GRID_COLS
      : isPricing
      ? PRICING_GRID_COLS
      : GRID_COLS;

    const rows = isFooter
      ? FOOTER_GRID_ROWS
      : isPricingBottom
      ? PRICING_BOTTOM_GRID_ROWS
      : isPricing
      ? PRICING_GRID_ROWS
      : GRID_ROWS;

    const activeCells = isFooter
      ? FOOTER_SORTED_CELLS
      : isPricingBottom
      ? PRICING_BOTTOM_SORTED_CELLS
      : isPricing
      ? PRICING_SORTED_CELLS
      : SORTED_CELLS;

    let pixelSize = 0;
    let targetProgress = 0;
    let currentProgress = 0;
    let dpr = 1;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      const w = container!.offsetWidth;
      pixelSize = w / cols;
      const h = rows * pixelSize;

      canvas!.style.width = w + 'px';
      canvas!.style.height = h + 'px';
      container!.style.height = h + 'px';

      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function computeTargetProgress() {
      const rect = container!.getBoundingClientRect();
      const vh = window.innerHeight;

      if (isFooter) {
        // Footer auto-scroll reveal:
        // Generous scroll travel arc of 540px starting early as footer enters view.
        // Damped via lerp in tick() so the dither animation is clearly, pleasantly visible
        // and never runs too fast.
        const triggerY = vh + 160;
        const gone = triggerY - rect.top;
        const revealDist = Math.max(vh * 0.75, 540);
        let t = Math.max(0, Math.min(1, gone / revealDist));

        // When scrolled near bottom of page, ensure 100% completion
        const docHeight = document.documentElement.scrollHeight;
        const scrollBottom = window.scrollY + vh;
        if (docHeight - scrollBottom < 60) {
          t = 1.0;
        }
        targetProgress = t;
      } else if (isPricingBottom) {
        // Below Pricing dissolve reveal:
        const triggerY = vh + 100;
        const gone = triggerY - rect.top;
        const revealDist = Math.max(vh * 0.7, 500);
        targetProgress = Math.max(0, Math.min(1, gone / revealDist));
      } else if (isPricing) {
        // Above Pricing dissolve reveal:
        const gone = vh - rect.top;
        const targetDistance = Math.min(vh * 0.7, rect.height + 200);
        targetProgress = Math.max(0, Math.min(1, (gone / targetDistance) * 1.25));
      } else {
        // Hero reveal:
        const travel = vh + rect.height;
        const gone = vh - rect.top;
        targetProgress = Math.max(0, Math.min(1, (gone / travel) * 1.8));
      }
    }

    function draw(pVal: number) {
      const p = pixelSize;
      const w = container!.offsetWidth;
      const h = rows * p;
      const total = activeCells.length;
      const visible = Math.round(pVal * total);

      ctx!.clearRect(0, 0, w, h);
      if (visible === 0) return;

      for (let i = 0; i < visible; i++) {
        const cell = activeCells[i];
        ctx!.fillStyle = (cell as any).color || color;
        const x0 = Math.floor(cell.c * p);
        const x1 = Math.floor((cell.c + 1) * p);
        const y0 = Math.floor(cell.r * p);
        const y1 = Math.floor((cell.r + 1) * p);
        ctx!.fillRect(x0, y0, x1 - x0, y1 - y0);
      }
    }

    let animId: number;

    function tick() {
      computeTargetProgress();

      if (isFooter || isPricingBottom) {
        // Damped linear interpolation:
        // Slows down rapid flicks to a smooth ~1.0s cascade so the user can clearly see each pixel
        const diff = targetProgress - currentProgress;
        if (Math.abs(diff) > 0.0005) {
          currentProgress += diff * (diff > 0 ? 0.048 : 0.09);
          draw(currentProgress);
        } else if (currentProgress !== targetProgress) {
          currentProgress = targetProgress;
          draw(currentProgress);
        }
      } else {
        const diff = targetProgress - currentProgress;
        if (Math.abs(diff) > 0.001) {
          currentProgress += diff * 0.16;
          draw(currentProgress);
        } else if (currentProgress !== targetProgress) {
          currentProgress = targetProgress;
          draw(currentProgress);
        }
      }

      animId = requestAnimationFrame(tick);
    }

    let resizeTimer: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        computeTargetProgress();
        draw(currentProgress);
      }, 100);
    }

    resize();
    computeTargetProgress();
    currentProgress = targetProgress;
    draw(currentProgress);
    animId = requestAnimationFrame(tick);
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    };
  }, [color, variant]);

  return (
    <div ref={containerRef} className={`w-full relative pointer-events-none select-none transform-gpu ${className}`}>
      <canvas ref={canvasRef} className="block w-full transform-gpu" />
    </div>
  );
};
