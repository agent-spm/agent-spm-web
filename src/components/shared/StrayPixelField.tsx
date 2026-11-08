"use client";

import React from "react";

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface StrayPixel {
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  delay: number;
  duration: number;
}

const STRAY_COLORS = ["#ECF8FF", "#C5EAFF", "#B7E5FF", "#A9E0FF", "#8ED6FF"];

function generateStrayPixels(seed = 404_001): StrayPixel[] {
  const rng = mulberry32(seed);
  const pixels: StrayPixel[] = [];
  const count = 15;

  for (let i = 0; i < count; i++) {
    let x: number, y: number;
    let attempts = 0;
    do {
      x = rng() * 92 + 4;
      y = rng() * 80 + 8;
      attempts++;
    } while (
      x > 25 && x < 75 && y > 15 && y < 80 &&
      attempts < 20
    );

    pixels.push({
      x,
      y,
      size: Math.floor(rng() * 14) + 10,
      color: STRAY_COLORS[Math.floor(rng() * STRAY_COLORS.length)],
      opacity: rng() * 0.2 + 0.12,
      delay: rng() * 6,
      duration: rng() * 3 + 4,
    });
  }
  return pixels;
}

const STRAY_PIXELS = generateStrayPixels(505_002);

export function StrayPixelField() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-10"
      aria-hidden="true"
    >
      {STRAY_PIXELS.map((px, i) => (
        <div
          key={i}
          className="absolute pixel-debris-breathe"
          style={{
            left: `${px.x}%`,
            top: `${px.y}%`,
            width: px.size,
            height: px.size,
            backgroundColor: px.color,
            opacity: 0,
            animationDelay: `${px.delay}s`,
            animationDuration: `${px.duration}s`,
            // @ts-expect-error CSS custom property for per-pixel max opacity
            "--pixel-max-opacity": px.opacity,
          }}
        />
      ))}
    </div>
  );
}

export default StrayPixelField;
