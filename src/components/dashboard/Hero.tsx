"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';

const BUBBLES_DATA = [
  { label: "Tokens Saved", value: "82.17 M", r: 82 },
  { label: "Active Agents", value: "3.1k", r: 70 },
  { label: "Downloads", value: "1.2 M", r: 74 },
  { label: "Total Packages", value: "12.8k", r: 68 },
  { label: "Contributors", value: "101", r: 64 },
  { label: "API Calls", value: "4.7 B", r: 66 },
  { label: "Agents", value: "392", r: 72 },
  { label: "Success Rate", value: "99.8%", r: 56 },
  { label: "Uptime", value: "99.99%", r: 52 },
  { label: "Skills", value: "2.4k", r: 50 },
  { label: "GitHub Stars", value: "9.2k", r: 48 },
  { label: "Integrations", value: "150+", r: 46 },
  { label: "Enterprise", value: "38", r: 42 },
  { label: "Languages", value: "24", r: 38 },
  { label: "Verified", value: "86", r: 36 },
];

// Fisher-Yates shuffle — randomize bubble positions on every page load
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Randomize radii slightly too — ±8% jitter so bubbles feel organic
function jitterData(data: typeof BUBBLES_DATA) {
  return shuffle(data).map(b => ({
    ...b,
    r: Math.round(b.r * (0.92 + Math.random() * 0.16)),
  }));
}

interface Bubble {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  label: string; value: string;
}

const GRAVITY = 0.38;
const FRICTION = 0.987;
const BOUNCE = 0.5;
const COLLISION_DAMPING = 0.6;

function PhysicsBubbles({ width, height }: { width: number; height: number }) {
  const bubblesRef = useRef<Bubble[]>([]);
  const animRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ idx: number; offX: number; offY: number } | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const [tick, setTick] = useState(0);
  const initRef = useRef(false);

  // Auto-scale bubbles to fill ~65% of the invisible box
  const totalArea = BUBBLES_DATA.reduce((s, b) => s + Math.PI * b.r * b.r, 0);
  const scale = Math.sqrt((width * height * 0.50) / totalArea);

  useEffect(() => {
    if (initRef.current && bubblesRef.current.length > 0) return;
    if (width === 0 || height === 0) return;
    initRef.current = true;

    const cols = 5;
    const shuffled = jitterData(BUBBLES_DATA);
    bubblesRef.current = shuffled.map((b, i) => {
      const col = i % cols;
      const spacing = width / (cols + 0.5);
      return {
        x: spacing * (col + 0.5) + (Math.random() - 0.5) * 20,
        y: -(b.r * scale) - Math.random() * 150 - i * 45,
        vx: (Math.random() - 0.5) * 1.2,
        vy: Math.random() * 1.5,
        r: Math.round(b.r * scale),
        label: b.label,
        value: b.value,
      };
    });
  }, [width, height, scale]);

  useEffect(() => {
    let frame = 0;
    // Inner padding — bubbles stay this many px inside the container edges
    // so they're never clipped visually
    const PAD = 6;
    const step = () => {
      const bs = bubblesRef.current;
      const drag = dragRef.current;

      for (let i = 0; i < bs.length; i++) {
        const b = bs[i];
        if (drag?.idx === i) {
          b.x = mouseRef.current.x - drag.offX;
          b.y = mouseRef.current.y - drag.offY;
          // Clamp dragged bubble inside padded bounds
          b.x = Math.max(b.r + PAD, Math.min(width - b.r - PAD, b.x));
          b.y = Math.max(b.r + PAD, Math.min(height - b.r - PAD, b.y));
          b.vx = (mouseRef.current.x - mouseRef.current.px) * 0.35;
          b.vy = (mouseRef.current.y - mouseRef.current.py) * 0.35;
          continue;
        }

        b.vy += GRAVITY;
        b.vx *= FRICTION;
        b.vy *= FRICTION;
        b.x += b.vx;
        b.y += b.vy;

        // Invisible padded walls — bubbles stay fully visible
        if (b.x - b.r < PAD) { b.x = b.r + PAD; b.vx = Math.abs(b.vx) * BOUNCE; }
        if (b.x + b.r > width - PAD) { b.x = width - b.r - PAD; b.vx = -Math.abs(b.vx) * BOUNCE; }
        if (b.y - b.r < PAD) { b.y = b.r + PAD; b.vy = Math.abs(b.vy) * BOUNCE; }
        if (b.y + b.r > height - PAD) {
          b.y = height - b.r - PAD;
          b.vy = -Math.abs(b.vy) * BOUNCE;
          if (Math.abs(b.vy) < 0.5) b.vy = 0;
          if (Math.abs(b.vx) < 0.2) b.vx = 0;
        }

        // Bubble collisions
        for (let j = i + 1; j < bs.length; j++) {
          const o = bs[j];
          const dx = o.x - b.x, dy = o.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const min = b.r + o.r;
          if (dist < min && dist > 0.1) {
            const nx = dx / dist, ny = dy / dist;
            const overlap = (min - dist) / 2;
            b.x -= nx * overlap; b.y -= ny * overlap;
            o.x += nx * overlap; o.y += ny * overlap;

            const dvx = b.vx - o.vx, dvy = b.vy - o.vy;
            const dot = dvx * nx + dvy * ny;
            if (dot > 0) {
              const m1 = b.r * b.r, m2 = o.r * o.r, tm = m1 + m2;
              b.vx -= (2 * m2 / tm) * dot * nx * COLLISION_DAMPING;
              b.vy -= (2 * m2 / tm) * dot * ny * COLLISION_DAMPING;
              o.vx += (2 * m1 / tm) * dot * nx * COLLISION_DAMPING;
              o.vy += (2 * m1 / tm) * dot * ny * COLLISION_DAMPING;
            }
          }
        }
      }

      if (++frame % 2 === 0) setTick(t => t + 1);
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height]);

  const onDown = useCallback((e: React.PointerEvent, i: number) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const b = bubblesRef.current[i];
    dragRef.current = { idx: i, offX: mx - b.x, offY: my - b.y };
    mouseRef.current = { x: mx, y: my, px: mx, py: my };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current.px = mouseRef.current.x;
    mouseRef.current.py = mouseRef.current.y;
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
  }, []);

  const onUp = useCallback(() => { dragRef.current = null; }, []);

  void tick;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
    >
      {bubblesRef.current.map((b, i) => {
        const isDragging = dragRef.current?.idx === i;
        const valueSize = Math.max(13, b.r * 0.36);
        const labelSize = Math.max(8, b.r * 0.17);
        return (
          <div
            key={`${b.label}-${i}`}
            onPointerDown={(e) => onDown(e, i)}
            className="absolute flex flex-col items-center justify-center rounded-full select-none touch-none"
            style={{
              width: b.r * 2,
              height: b.r * 2,
              left: b.x - b.r,
              top: b.y - b.r,
              background: '#EDEDEB',
              border: '1px solid rgba(0,0,0,0.05)',
              cursor: isDragging ? 'grabbing' : 'grab',
              boxShadow: isDragging
                ? '0 20px 60px rgba(0,0,0,0.12), 0 0 0 2px rgba(27,95,237,0.12)'
                : 'none',
              zIndex: isDragging ? 50 : 1,
              transform: isDragging ? 'scale(1.05)' : 'scale(1)',
              transition: isDragging ? 'none' : 'transform 0.25s ease, box-shadow 0.25s ease',
            }}
          >
            <span
              className="text-black/30 font-medium font-sans whitespace-nowrap pointer-events-none leading-none"
              style={{ fontSize: labelSize, marginBottom: 3 }}
            >
              {b.label}
            </span>
            <span
              className="font-semibold text-black/85 leading-none pointer-events-none tracking-tight"
              style={{ fontSize: valueSize }}
            >
              {b.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export const Hero = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setDims({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <section className="relative flex flex-col flex-1 min-h-0 pt-3 sm:pt-4 pb-3 sm:pb-4">
      {/* Text */}
      <div className="relative z-10 w-full flex-shrink-0">
        <h1 className="text-[clamp(2.4rem,5vw,3.75rem)] leading-[0.93] font-extralight text-brand-black">
          Welcome to
        </h1>
        <h1 className="text-[clamp(2.4rem,5vw,3.75rem)] leading-[0.93] font-medium text-brand-blue">
          Agent Skills<br />
          Package Manager
        </h1>
        <p className="mt-3 sm:mt-4 text-[clamp(0.85rem,1.2vw,1.1rem)] leading-[1.55] font-normal font-sans text-brand-black/80 max-w-[640px]">
          Stop rebuilding. Start compounding. Skills arm your agents with
          battle-tested procedural knowledge — installed in seconds,
          shared across teams, refined over time. We&apos;re building the arsenal.
          You bring the mission.
        </p>
      </div>

      {/* Physics bubbles — flex-1 fills all remaining left-column height */}
      <div
        ref={boxRef}
        className="relative z-0 mt-4 sm:mt-5 w-full flex-1 min-h-0"
        style={{ minHeight: 180 }}
      >
        {dims.w > 0 && <PhysicsBubbles width={dims.w} height={dims.h} />}
      </div>
    </section>
  );
};
