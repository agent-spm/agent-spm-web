"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';

const STATIC_BUBBLES = [
  { id: 'agents', label: 'Agents', value: '392', cx: 409, cy: 420, r: 160 },
  { id: 'contributors', label: 'Contributors', value: '101', cx: 601, cy: 79, r: 130 },
  { id: 'tokens', label: 'Tokens Saved', value: '82.17 M', cx: 913, cy: 225, r: 160 },
  { id: 'e1', label: 'API Calls', value: '4.7 B', cx: 130, cy: 209, r: 130 },
  { id: 'e2', label: 'Success Rate', value: '99.8%', cx: 146, cy: 444, r: 60 },
  { id: 'e3', label: 'Languages', value: '24', cx: 214, cy: 362, r: 40 },
  { id: 'e4', label: 'GitHub Stars', value: '9.2k', cx: 358, cy: 132, r: 90 },
  { id: 'e5', label: 'Uptime', value: '99.99%', cx: 479, cy: 218, r: 50 },
  { id: 'e6', label: 'Integrations', value: '150+', cx: 590, cy: 274, r: 65 },
  { id: 'e7', label: 'Skills', value: '2.4k', cx: 701, cy: 237, r: 45 },
  { id: 'e8', label: 'Downloads', value: '1.2 M', cx: 636, cy: 561, r: 85 },
  { id: 'e9', label: 'Total Packages', value: '12.8k', cx: 708, cy: 386, r: 95 },
  { id: 'e10', label: '', value: '', cx: 832, cy: 402, r: 25 },
  { id: 'e11', label: 'Enterprise', value: '38', cx: 902, cy: 431, r: 45 },
  { id: 'e12', label: 'Active Agents', value: '3.1k', cx: 1013, cy: 477, r: 70 },
  { id: 'e13', label: 'Verified', value: '86', cx: 298, cy: 251, r: 35 },
  { id: 'e14', label: '', value: '', cx: 588, cy: 367, r: 20 },
  { id: 'e15', label: '', value: '', cx: 734, cy: 165, r: 25 },
  { id: 'e16', label: 'Models', value: '42', cx: 514, cy: 591, r: 30 },
  { id: 'e17', label: 'Sandbox Runs', value: '8.4 M', cx: 216, cy: 571, r: 75 },
  { id: 'e18', label: 'Categories', value: '14', cx: 78, cy: 548, r: 55 },
  { id: 'e19', label: 'Weekly Installs', value: '45k', cx: 822, cy: 530, r: 80 },
  { id: 'e20', label: 'Avg Latency', value: '12ms', cx: 953, cy: 604, r: 60 }
];

function StaticBubbles({ width, height }: { width: number; height: number }) {
  // Use window.innerWidth to determine mobile layout, falling back to container width for SSR
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 1024 : width < 1024;
  const bubbles = STATIC_BUBBLES; // Use the full cluster for both

  // --- Math ---
  const REF_W = 980; 
  const BOTTOM_Y = 664;
  const TOP_Y = -51;
  const TRUE_H = BOTTOM_Y - TOP_Y; // 715

  // --- Mobile Math ---
  const MOBILE_CLUSTER_W = 990; // True width of desktop bubbles (1013 max X - 23 min X)
  const MOBILE_MIN_X = 23; // Leftmost bubble boundary (e18)
  const MOBILE_REF_W = MOBILE_CLUSTER_W + 20; // Add 20px of total padding

  // Scale dynamically
  let scale = Math.min(width / REF_W, height / (TRUE_H * 1.02));
  
  if (isMobile) {
    // Production grade pattern: Don't shrink to fit. Enforce a minimum scale so bubbles stay large, 
    // and let the outer bubbles elegantly bleed off the screen edges.
    scale = Math.max(0.55, scale);
  }
  
  // X offset: mobile mathematically centers the true bounds (allowing negative offset to bleed equally), desktop bleeds left.
  const xOffset = isMobile
    ? ((width - (MOBILE_CLUSTER_W * scale)) / 2) - (MOBILE_MIN_X * scale)
    : (Math.max(0, width - (REF_W * scale)) / 2) - (100 * scale);
  
  // Y offset: mobile is vertically centered in the remaining space, desktop is anchored to bottom.
  const yOffset = isMobile
    ? ((height - (TRUE_H * scale)) / 2)
    : height - (BOTTOM_Y * scale);

  return (
    <div className="relative w-full h-full">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bubblePop {
          0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0; }
          60% { transform: translate(-50%, -50%) scale(1.05); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}} />
      {bubbles.map((b, i) => {
        const scaledR = b.r * scale;
        const scaledX = (b.cx * scale) + xOffset;
        const scaledY = (b.cy * scale) + (isMobile ? yOffset : (yOffset > 0 ? yOffset : 0));

        const valueSize = Math.max(13, scaledR * 0.36);
        const labelSize = Math.max(8, scaledR * 0.17);
        const showText = true;

        return (
          <div
            key={b.id}
            className="absolute flex flex-col items-center justify-center rounded-full select-none pointer-events-none"
            style={{
              width: scaledR * 2,
              height: scaledR * 2,
              left: scaledX,
              top: scaledY,
              background: '#EDEDEB',
              border: '1px solid rgba(0,0,0,0.05)',
              zIndex: 1,
              opacity: 0,
              // translate(-50%, -50%) handles centering exactly on cx, cy
              animation: `bubblePop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.04}s forwards`,
            }}
          >
            {showText && b.label && (
              <>
                <span
                  className="text-black/30 font-medium font-sans whitespace-nowrap leading-none"
                  style={{ fontSize: labelSize, marginBottom: 3 }}
                >
                  {b.label}
                </span>
                <span
                  className="font-semibold text-black/85 leading-none tracking-tight"
                  style={{ fontSize: valueSize }}
                >
                  {b.value}
                </span>
              </>
            )}
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

      {/* Bubbles — flex-1 fills all remaining left-column height */}
      <div
        ref={boxRef}
        className="relative z-0 mt-4 sm:mt-5 w-full flex-1 min-h-0 overflow-hidden"
        style={{ minHeight: 180 }}
      >
        {dims.w > 0 && <StaticBubbles width={dims.w} height={dims.h} />}
      </div>
    </section>
  );
};
