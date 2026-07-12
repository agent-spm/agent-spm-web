"use client";

import React, { useRef, useEffect } from 'react';

/**
 * Pixel art cell coordinates extracted from the user's SVG.
 * Grid: 42 columns × 11 rows. Cell size ≈ 45.708px in the 1920×504 viewBox.
 */
const CELLS: Array<{ r: number; c: number }> = [
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

const GRID_COLS = 42;
const GRID_ROWS = 11;

interface PixelBoxProps {
  color?: string;
}

export const PixelBox: React.FC<PixelBoxProps> = ({ color = '#ffffff' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let pixelSize = 0;
    let progress = 0;
    let dpr = 1;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      const w = container!.offsetWidth;
      pixelSize = w / GRID_COLS;
      const h = GRID_ROWS * pixelSize;

      canvas!.style.width = w + 'px';
      canvas!.style.height = h + 'px';
      container!.style.height = h + 'px';

      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function computeProgress() {
      const rect = container!.getBoundingClientRect();
      const vh = window.innerHeight;
      const travel = vh + rect.height;
      const gone = vh - rect.top;
      progress = Math.max(0, Math.min(1, (gone / travel) * 1.8));
    }

    function draw() {
      const p = pixelSize;
      const w = container!.offsetWidth;
      const h = GRID_ROWS * p;
      const total = SORTED_CELLS.length;
      const visible = Math.round(progress * total);

      ctx!.clearRect(0, 0, w, h);
      if (visible === 0) return;

      ctx!.fillStyle = color;
      for (let i = 0; i < visible; i++) {
        const cell = SORTED_CELLS[i];
        ctx!.fillRect(
          Math.floor(cell.c * p),
          Math.floor(cell.r * p),
          Math.ceil(p),
          Math.ceil(p)
        );
      }
    }

    let animId: number;
    let prevProgress = -1;

    function tick() {
      computeProgress();
      if (Math.abs(progress - prevProgress) > 0.0005) {
        draw();
        prevProgress = progress;
      }
      animId = requestAnimationFrame(tick);
    }

    let resizeTimer: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        computeProgress();
        draw();
      }, 100);
    }

    resize();
    computeProgress();
    draw();
    animId = requestAnimationFrame(tick);
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    };
  }, [color]);

  return (
    <div ref={containerRef} className="w-full relative pointer-events-none select-none">
      <canvas ref={canvasRef} className="block w-full" />
    </div>
  );
};
