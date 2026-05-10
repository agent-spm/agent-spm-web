"use client";

import React, { useState, useEffect } from 'react';

export default function SplineErrorViewer() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Dynamically load the Spline Viewer web component script
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer@1.9.82/build/spline-viewer.js';
    script.addEventListener('load', () => {
      if (!cancelled) setIsMounted(true);
    });
    document.head.appendChild(script);

    // If script is already cached and loaded
    if (customElements.get('spline-viewer')) {
      // Use microtask to avoid synchronous setState in effect body
      queueMicrotask(() => { if (!cancelled) setIsMounted(true); });
    }

    return () => {
      cancelled = true;
      document.head.removeChild(script);
    };
  }, []);

  if (!isMounted) return null;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <div className="w-full h-full pointer-events-auto">
        {/* @ts-expect-error - spline-viewer is a custom web component, not a React element */}
        <spline-viewer 
          url="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" 
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}
