'use client';

import { useEffect, useRef } from 'react';

/**
 * SPMLoader
 * ─────────────────────────────────────────────────────────
 * A pixel-grid loading animation inspired by the Anthropic
 * Claude loader (https://x.com/60fpsdesign/status/2063291246383370377).
 *
 * The Agent SPM logo (rounded square with "S" cutout) is
 * built from individually-animated rounded-square pixels that
 * scatter and reassemble in a continuous loop:
 *
 *   1. Squares converge from random positions → full-size logo
 *   2. Hold with subtle breathing pulse
 *   3. Squares scatter outward in all directions
 *   4. Squares converge → smaller logo
 *   5. Hold
 *   6. Scatter → loop
 *
 * Renders on a HiDPI <canvas> for silky-smooth 60 fps.
 */

interface SPMLoaderProps {
  /** Canvas width & height in CSS px. */
  size?: number;
  /** Brand hex colour. */
  color?: string;
  /** Extra CSS class for the <canvas>. */
  className?: string;
}

/* ────────────── helpers ────────────── */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function clamp(v: number, lo = 0, hi = 1) {
  return Math.min(hi, Math.max(lo, v));
}

/** Deceleration with slight overshoot → "snap into place" feel. */
function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/** Gentle acceleration for scatter. */
function easeInQuad(t: number): number {
  return t * t;
}

/** Point-to-segment distance. */
function dSeg(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number,
): number {
  const dx = bx - ax, dy = by - ay;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - ax, py - ay);
  const t = clamp(((px - ax) * dx + (py - ay) * dy) / l2);
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** Returns true when the grid coordinate (gx, gy) falls
 *  inside the active S-shaped logo segments. */
function isLogoCellActive(gx: number, gy: number): boolean {
  if (gy >= 2 && gy <= 6) {
    return gx >= 2 && gx <= 15;
  }
  if (gy === 7) {
    return gx >= 4 && gx <= 9;
  }
  if (gy === 8) {
    return gx >= 6 && gx <= 10;
  }
  if (gy === 9) {
    return gx >= 8 && gx <= 11;
  }
  if (gy >= 10 && gy <= 15) {
    return gx >= 2 && gx <= 11;
  }
  return false;
}

/* ────────────── component ────────────── */

export default function SPMLoader({
  size = 180,
  color = '#1B5FED',
  className,
}: SPMLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    /* HiDPI canvas */
    const dpr = window.devicePixelRatio || 1;
    cvs.width  = size * dpr;
    cvs.height = size * dpr;
    cvs.style.width  = `${size}px`;
    cvs.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const [R, G, B] = hexToRgb(color);

    /* Grid dimensions */
    const GRID   = 18;
    const cell   = size / GRID;
    const pxRad  = cell * 0.28;        // corner radius for scattered squares
    const half   = size / 2;           // canvas centre

    /* ── Build particle list from logo shape ── */
    interface P { tx: number; ty: number; delay: number }
    const particles: P[] = [];
    for (let gy = 0; gy < GRID; gy++) {
      for (let gx = 0; gx < GRID; gx++) {
        if (isLogoCellActive(gx, gy)) {
          particles.push({
            tx: gx * cell + cell / 2,
            ty: gy * cell + cell / 2,
            delay: Math.random(),
          });
        }
      }
    }
    const N = particles.length;

    /* ── Random scatter-position buffer ── */
    function randScatter(): Float64Array {
      const buf = new Float64Array(N * 2);
      for (let i = 0; i < N; i++) {
        const a = Math.random() * Math.PI * 2;
        const d = size * 0.55 + Math.random() * size * 0.6;
        buf[i * 2]     = half + Math.cos(a) * d;
        buf[i * 2 + 1] = half + Math.sin(a) * d;
      }
      return buf;
    }

    /* ── Phase timeline ── */
    const STAGGER = 0.42;

    interface Phase {
      type: 'assemble' | 'hold' | 'scatter' | 'pause';
      dur: number;
      scale?: number;
      fromScale?: number;
    }

    const phases: Phase[] = [
      { type: 'hold',     dur: 1400, scale: 1.0 },
      { type: 'scatter',  dur: 600,  fromScale: 1.0 },
      { type: 'pause',    dur: 100 },
      { type: 'assemble', dur: 750,  scale: 0.55 },
      { type: 'hold',     dur: 800,  scale: 0.55 },
      { type: 'scatter',  dur: 600,  fromScale: 0.55 },
      { type: 'pause',    dur: 100 },
      { type: 'assemble', dur: 750,  scale: 1.0 },
    ];
    const cycleDur = phases.reduce((s, p) => s + p.dur, 0);

    let fromScatter = randScatter();   // source positions for assemble
    let toScatter   = randScatter();   // destination positions for scatter
    let lastIdx     = -1;
    let rafId       = 0;
    const t0        = performance.now();

    /* ── Draw one rounded rect (path only) ── */
    function rr(x: number, y: number, w: number, h: number, r: number) {
      ctx!.beginPath();
      ctx!.moveTo(x + r, y);
      ctx!.arcTo(x + w, y, x + w, y + h, r);
      ctx!.arcTo(x + w, y + h, x, y + h, r);
      ctx!.arcTo(x, y + h, x, y, r);
      ctx!.arcTo(x, y, x + w, y, r);
      ctx!.closePath();
    }

    /* ── Draw one smooth vector logo (sharp corners) ── */
    function drawVectorLogo(scale: number, breathe: number) {
      if (!ctx) return;
      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = `rgb(${R},${G},${B})`;

      const vertices = [
        { x: -0.3889, y: -0.3889 },
        { x:  0.3889, y: -0.3889 },
        { x:  0.3889, y: -0.1111 },
        { x:  0.0556, y: -0.1111 },
        { x:  0.1667, y:  0.1111 },
        { x:  0.1667, y:  0.3889 },
        { x: -0.3889, y:  0.3889 },
        { x: -0.3889, y:  0.1111 },
        { x: -0.0556, y:  0.1111 },
        { x: -0.3889, y: -0.1111 },
      ];

      ctx.beginPath();
      const startX = half + vertices[0].x * size * scale * breathe;
      const startY = half + vertices[0].y * size * scale * breathe;
      ctx.moveTo(startX, startY);

      for (let i = 1; i < vertices.length; i++) {
        const x = half + vertices[i].x * size * scale * breathe;
        const y = half + vertices[i].y * size * scale * breathe;
        ctx.lineTo(x, y);
      }

      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    /* ── Render loop ── */
    function tick(now: number) {
      let rem = (now - t0) % cycleDur;

      /* Determine current phase */
      let idx = 0;
      for (let i = 0; i < phases.length; i++) {
        if (rem < phases[i].dur) { idx = i; break; }
        rem -= phases[i].dur;
      }
      const ph   = phases[idx];
      const prog = clamp(rem / ph.dur);

      /* Swap scatter buffers when entering an assemble phase */
      if (idx !== lastIdx) {
        if (lastIdx >= 0 && ph.type === 'assemble') {
          fromScatter = toScatter;
          toScatter   = randScatter();
        }
        lastIdx = idx;
      }

      ctx!.clearRect(0, 0, size, size);

      /* Draw vector S-shape directly during hold phases for absolute smoothness */
      if (ph.type === 'hold') {
        const sc = ph.scale!;
        const breathe = 1 + Math.sin(prog * Math.PI * 3) * 0.012;
        drawVectorLogo(sc, breathe);
        rafId = requestAnimationFrame(tick);
        return;
      }

      /* Per-particle rendering */
      for (let i = 0; i < N; i++) {
        const p = particles[i];
        let x: number, y: number, a: number, s: number, rad: number;

        switch (ph.type) {
          /* ─ ASSEMBLE: fly in from scattered positions ─ */
          case 'assemble': {
            const sc  = ph.scale!;
            const toX = half + (p.tx - half) * sc;
            const toY = half + (p.ty - half) * sc;
            const fX  = fromScatter[i * 2];
            const fY  = fromScatter[i * 2 + 1];

            const start = p.delay * STAGGER;
            const lt    = clamp((prog - start) / (1 - start));
            const e     = easeOutBack(lt);

            x = fX + (toX - fX) * e;
            y = fY + (toY - fY) * e;
            a = clamp(lt * 2.5);

            const targetFactor = sc === 1.0 ? 1.04 : 0.75;
            const sizeFactor = 0.2 + (targetFactor - 0.2) * clamp(lt);
            s = cell * sc * sizeFactor;

            const radFactor = sc === 1.0 ? clamp(1.0 - lt * 1.5) : 1.0;
            rad = pxRad * sc * radFactor * (sizeFactor / targetFactor);
            break;
          }


          /* ─ SCATTER: fly outward ─ */
          case 'scatter': {
            const fsc = ph.fromScale!;
            const fX  = half + (p.tx - half) * fsc;
            const fY  = half + (p.ty - half) * fsc;
            const tX  = toScatter[i * 2];
            const tY  = toScatter[i * 2 + 1];

            const start = (1 - p.delay) * STAGGER;
            const lt    = clamp((prog - start) / (1 - start));
            const e     = easeInQuad(lt);

            x = fX + (tX - fX) * e;
            y = fY + (tY - fY) * e;
            a = clamp(1 - lt * 1.6);

            const sourceFactor = fsc === 1.0 ? 1.04 : 0.75;
            const sizeFactor = sourceFactor + (0.2 - sourceFactor) * clamp(lt);
            s = cell * fsc * sizeFactor;

            const radFactor = fsc === 1.0 ? clamp(lt * 1.5) : 1.0;
            rad = pxRad * fsc * radFactor * (sizeFactor / sourceFactor);
            break;
          }

          /* ─ PAUSE ─ */
          default:
            continue; // nothing visible
        }

        if (a < 0.01 || s < 0.4) continue;

        ctx!.globalAlpha = a;
        ctx!.fillStyle = `rgb(${R},${G},${B})`;
        const h2 = s / 2;
        rr(x - h2, y - h2, s, s, rad);
        ctx!.fill();
      }

      ctx!.globalAlpha = 1;
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [size, color]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block' }}
      aria-label="Loading"
      role="status"
    />
  );
}
