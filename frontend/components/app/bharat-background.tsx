'use client';

import React from 'react';

// Pre-calculate 24 spokes with 3-decimal rounded precision to prevent SSR hydration floating-point mismatch
const ASHOKA_SPOKES = Array.from({ length: 24 }).map((_, i) => {
  const angle = (i * 360) / 24;
  const rad = (angle * Math.PI) / 180;
  return {
    x1: Number((50 + 10 * Math.cos(rad)).toFixed(3)),
    y1: Number((50 + 10 * Math.sin(rad)).toFixed(3)),
    x2: Number((50 + 42 * Math.cos(rad)).toFixed(3)),
    y2: Number((50 + 42 * Math.sin(rad)).toFixed(3)),
  };
});

export function BharatBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      
      {/* Top Right Saffron Soft Glow */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-amber-400/20 via-orange-500/15 to-transparent blur-3xl" />

      {/* Bottom Left India Green Soft Glow */}
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-emerald-600/20 via-teal-500/15 to-transparent blur-3xl" />

      {/* Center Soft Navy & Sky Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-radial from-sky-300/15 via-blue-500/5 to-transparent blur-3xl" />

      {/* Subtle Geometric Radial Dots Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.07]" />

      {/* Rotating Ashoka Chakra Watermark (24 Spokes) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] md:w-[650px] md:h-[650px] opacity-[0.04] dark:opacity-[0.07] animate-[spin_120s_linear_infinite] text-blue-900 dark:text-blue-200">
        <svg viewBox="0 0 100 100" suppressHydrationWarning className="w-full h-full fill-none stroke-current stroke-[1.2]">
          {/* Outer Ring */}
          <circle cx="50" cy="50" r="46" />
          <circle cx="50" cy="50" r="42" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="10" strokeWidth="1" />
          <circle cx="50" cy="50" r="3" fill="currentColor" />

          {/* 24 Wheel Spokes with Fixed Float Precision */}
          {ASHOKA_SPOKES.map((spoke, i) => (
            <line
              key={i}
              x1={spoke.x1}
              y1={spoke.y1}
              x2={spoke.x2}
              y2={spoke.y2}
              strokeWidth="0.8"
            />
          ))}
        </svg>
      </div>

      {/* Top & Bottom Accent Lines - Subtle Saffron White Green Stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-white via-50% to-emerald-600 opacity-90 shadow-sm" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-white via-50% to-amber-500 opacity-90 shadow-sm" />
    </div>
  );
}

export default BharatBackground;
