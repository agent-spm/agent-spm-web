"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Lenis smooth scroll with anchor support
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth cubic-bezier type easing
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.1, // Responsive scroll speed modifier
      anchors: true,
    });

    // Expose lenis instance globally for smooth programmatic scrolling
    (window as any).__lenis = lenis;

    // Handle initial hash on direct link visit or page reload (e.g. /#blog)
    if (window.location.hash) {
      setTimeout(() => {
        lenis.scrollTo(window.location.hash, { offset: -30 });
      }, 150);
    }

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      delete (window as any).__lenis;
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
