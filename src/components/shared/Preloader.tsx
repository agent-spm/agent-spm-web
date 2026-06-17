'use client';

import { useState, useEffect } from 'react';
import SPMLoader from './SPMLoader';

export default function Preloader() {
  const [mounted, setMounted] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Automatically start fade out after one full cycle (5.1 seconds)
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 5100);

    // Unmount after fade out transition completes (700ms)
    const unmountTimer = setTimeout(() => {
      setMounted(false);
    }, 5800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-surface-50/95 dark:bg-surface-950/95 backdrop-blur-[8px] transition-opacity duration-700 ease-in-out select-none ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Premium ambient radial glow */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
        <div className="h-[350px] w-[350px] rounded-full bg-[#1B5FED]/8 blur-[90px] animate-pulse" />
      </div>

      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative flex items-center justify-center">
          <SPMLoader size={180} color="#1B5FED" />
        </div>
        
        <div className="text-center">
          <p className="text-xs font-mono tracking-[0.25em] text-[#1B5FED] uppercase animate-pulse">
            Compiling Skills Registry
          </p>
        </div>
      </div>
    </div>
  );
}

