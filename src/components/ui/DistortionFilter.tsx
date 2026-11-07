"use client";

import React from "react";

export function DistortionFilter() {
  return (
    <svg
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        pointerEvents: "none",
        zIndex: 9998,
      }}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        {/* Primary Agent SPM Liquid Glass Filter */}
        <filter
          id="spm-glass-dist"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          filterUnits="objectBoundingBox"
          primitiveUnits="userSpaceOnUse"
          colorInterpolationFilters="linearRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.008"
            numOctaves="2"
            seed="92"
            stitchTiles="stitch"
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurred"
            scale="35"
            xChannelSelector="R"
            yChannelSelector="G"
            result="disp"
          />
          <feComposite in="disp" operator="over" />
        </filter>

        {/* Alias for backward compatibility with tests & legacy modules */}
        <filter
          id="liquid-glass-dist"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          filterUnits="objectBoundingBox"
          primitiveUnits="userSpaceOnUse"
          colorInterpolationFilters="linearRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.008"
            numOctaves="2"
            seed="92"
            stitchTiles="stitch"
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurred"
            scale="35"
            xChannelSelector="R"
            yChannelSelector="G"
            result="disp"
          />
          <feComposite in="disp" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

export default DistortionFilter;
