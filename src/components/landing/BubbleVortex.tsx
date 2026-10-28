"use client";

import React, { useEffect, useRef } from 'react';

// Neon colors restricted to the 3 colors of the cyber tunnel images:
// 1. Electric Cyan
// 2. Vibrant Violet/Purple
// 3. Glowing White
const NEON_COLORS = [
  "hsl(195, 100%, 50%)", // Neon Cyan
  "hsl(275, 100%, 55%)", // Violet/Purple
  "hsl(0, 0%, 100%)"     // Glowing White
];

interface Particle {
  armIndex: number;    // Which spiral arm it belongs to (-1 if free-floating)
  angleOffset: number; // Wide angular offset or raw angle
  radius: number;      // Current distance from center
  vRad: number;        // Radial speed (moving inward)
  vAng: number;        // Angular orbit speed
  maxSize: number;     // Size at outer edge
  color: string;
}

export const BubbleVortex = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];

    // Vortex geometry config
    const numArms = 7;         // 7 overlapping spiral arms
    const spiralTightness = -1.75; // Spiral wrap tightness
    const ellipseAspect = 1.45; // Horizontal stretching for elliptical layout
    const rMin = 135;          // Inner ellipse radius boundary (vertical)
    let rMax = 0;              // Outer radius boundary
    let globalSpinOffset = 0;  // Slow rotation of the entire vortex

    const resize = () => {
      const rect = containerRef.current?.getBoundingClientRect() || { width: 800, height: 500 };
      width = rect.width;
      height = rect.height;

      // Set high DPR size
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      rMax = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2);

      if (particles.length === 0) {
        initParticles();
      }
    };

    const initParticles = () => {
      const particleCount = 1250; // Dense particle field
      particles = [];

      for (let i = 0; i < particleCount; i++) {
        // Distribute starting radii across the canvas
        const radius = rMin + Math.random() * (rMax - rMin);
        
        // 75% on structured spiral arms, 25% free-floating at random angles
        const isFree = Math.random() < 0.25;
        const armIndex = isFree ? -1 : i % numArms;

        // Random starting angle/offset
        const angleOffset = isFree 
          ? Math.random() * Math.PI * 2 // Raw random angle
          : (Math.random() - 0.5) * 0.85; // Wide offset for spiral arm

        // =========================================================================
        // 🛠️ CUSTOMIZE: MOVEMENT SPEEDS (RADIAL & ANGULAR)
        // Reduced to match the slow, majestic cinematic timeline of the YT video
        // =========================================================================
        const vRad = 0.12 + Math.random() * 0.22;  // Inward speed (3-4x slower)
        const vAng = 0.0004 + Math.random() * 0.0008; // Orbit speed (3-4x slower)

        // ==========================================
        // 🛠️ CUSTOMIZE: MAXIMUM BUBBLE SIZE (SPAWN)
        // ==========================================
        const maxSize = 30 + Math.random() * 58;

        const color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];

        particles.push({
          armIndex,
          angleOffset,
          radius,
          vRad,
          vAng,
          maxSize,
          color
        });
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      // Clear with trail effect
      ctx.fillStyle = 'rgba(11, 11, 12, 0.10)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Slow global spin of the vortex
      globalSpinOffset += 0.0004;

      particles.forEach((p) => {
        // 1. Move inward slowly
        p.radius -= p.vRad;

        // 2. Organic sway: add a tiny random wiggle/drift to all bubbles on each frame
        p.angleOffset += (Math.random() - 0.5) * 0.0016;

        // 3. Compute current angle based on arm type
        let angle = 0;
        if (p.armIndex >= 0) {
          // Structured spiral arm particle
          const armBaseAngle = (p.armIndex / numArms) * Math.PI * 2;
          const spiralAngle = spiralTightness * Math.log(Math.max(p.radius, 10));
          angle = armBaseAngle + spiralAngle + p.angleOffset + globalSpinOffset;
        } else {
          // Free-floating particle orbiting at a random angle
          p.angleOffset += p.vAng; // Custom individual speed orbit
          angle = p.angleOffset + globalSpinOffset;
        }

        // 4. Size shrinks as it approaches the center elliptical boundary
        // Math.pow(sizeRatio, exponent) controls how fast bubbles shrink.
        const sizeRatio = Math.max(0, (p.radius - rMin) / (rMax - rMin));
        const currentSize = p.maxSize * Math.pow(sizeRatio, 0.85);

        // 5. Opacity fades out near rMin and fades in near rMax
        const opacity = Math.min(1, (p.radius - rMin) / 60) * Math.min(1, (rMax - p.radius) / 45);

        // 6. Calculate Cartesian positions with horizontal stretch factor
        const x = cx + p.radius * ellipseAspect * Math.cos(angle);
        const y = cy + p.radius * Math.sin(angle);

        // 7. Draw bubble
        if (p.radius > rMin && opacity > 0 && currentSize > 0.5) {
          ctx.beginPath();
          ctx.arc(x, y, currentSize, 0, Math.PI * 2);

          // Adaptive line width: thinner borders for smaller bubbles
          const strokeWidth = Math.min(2.0, currentSize * 0.10 + 0.6);

          // Draw the primary colored border
          ctx.strokeStyle = p.color.replace(")", `, ${opacity * 0.85})`).replace("hsl", "hsla");
          ctx.lineWidth = strokeWidth;
          ctx.stroke();

          // Subtle bubble volume fill
          ctx.fillStyle = p.color.replace(")", `, ${opacity * 0.05})`).replace("hsl", "hsla");
          ctx.fill();

          // Secondary neon glow aura
          ctx.beginPath();
          ctx.arc(x, y, currentSize + 3.0, 0, Math.PI * 2);
          ctx.strokeStyle = p.color.replace(")", `, ${opacity * 0.14})`).replace("hsl", "hsla");
          ctx.lineWidth = 3.0;
          ctx.stroke();
        }

        // 8. Respawn logic
        if (p.radius <= rMin) {
          p.radius = rMax - Math.random() * 40;
          
          const isFree = Math.random() < 0.25;
          p.armIndex = isFree ? -1 : Math.floor(Math.random() * numArms);
          p.angleOffset = isFree 
            ? Math.random() * Math.PI * 2 
            : (Math.random() - 0.5) * 0.85;

          p.vRad = 0.12 + Math.random() * 0.22;
          p.vAng = 0.0004 + Math.random() * 0.0008;
          p.maxSize = 30 + Math.random() * 58;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[520px] md:h-[600px] lg:h-[650px] bg-[#0B0B0C] rounded-2xl overflow-hidden border border-black/10 shadow-2xl flex items-center justify-center select-none"
    >
      {/* HTML5 Canvas Background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full block" 
      />

      {/* Central Floating Text Overlay (Fully User Inert & Transparent) */}
      <div 
        className="relative z-10 pointer-events-none select-none flex flex-col items-center justify-center text-center px-4"
      >
        <span className="font-mono text-xs md:text-sm font-semibold tracking-[0.22em] text-brand-blue uppercase mb-2">
          Agent SPM
        </span>
        <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-4xl font-bold text-white tracking-tight leading-none max-w-xl">
          The legendary Registry
          <span className="block mt-1 font-sans text-white/90">you know</span>
        </h1>
      </div>
    </div>
  );
};
