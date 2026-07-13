"use client";

import React from "react";
import { PixelBox } from "./PixelBox";

interface ExcellenceItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const ITEMS: ExcellenceItem[] = [
  {
    title: "Designers",
    description:
      "Use the command line interface and VS code extension to manage you skills for each workspace separately and effectively",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-[22px] h-[22px] text-neutral-700"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.53 16.122l9.37-9.37a2.121 2.121 0 113 3l-9.37 9.37a4.5 4.5 0 01-1.897 1.13L6 21l.88-3.63a4.5 4.5 0 011.13-1.897l9.37-9.37"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 7.5L19 10M6 21L3 18m6 3l-3-3m0 0l-3.75 3.75"
        />
      </svg>
    ),
  },
  {
    title: "Developers",
    description:
      "Use the command line interface and VS code extension to manage you skills for each workspace separately and effectively",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-[22px] h-[22px] text-neutral-700"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
        />
      </svg>
    ),
  },
  {
    title: "Senior Engineers",
    description:
      "Use the command line interface and VS code extension to manage you skills for each workspace separately and effectively",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-[22px] h-[22px] text-neutral-700"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l-2 2a1.5 1.5 0 11-2.121-2.121l2-2m2.121 2.121a2.828 2.828 0 11-4-4l2-2m2.122 2.122L12 12m-6 0a3 3 0 100-6 3 3 0 000 6z"
        />
      </svg>
    ),
  },
  {
    title: "Enterprise Companies",
    description:
      "Use the command line interface and VS code extension to manage you skills for each workspace separately and effectively",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-[22px] h-[22px] text-neutral-700"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M21 21h-6v-3.75h6V21z"
        />
      </svg>
    ),
  },
  {
    title: "Founders and Operators",
    description:
      "Use the command line interface and VS code extension to manage you skills for each workspace separately and effectively",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-[22px] h-[22px] text-neutral-700"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.64 8.38m5.95 5.99a5.96 5.96 0 00-3.1-3.1m0 0l-5.64-5.64m0 0a1.5 1.5 0 10-2.12 2.12l5.64 5.64m0 0H3.75v4.83a6 6 0 001.62 4.24l.58.58M21 3l-3.75 3.75"
        />
      </svg>
    ),
  },
  {
    title: "Personal Use",
    description:
      "Use the command line interface and VS code extension to manage you skills for each workspace separately and effectively",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-[22px] h-[22px] text-neutral-700"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    ),
  },
];

export default function ExcellenceGrid() {
  return (
    <section className="relative w-full bg-white text-black py-24 z-20 overflow-hidden">
      {/* ─── Light Blue Pixel Art Background ─── */}
      <div className="absolute top-0 left-0 w-full z-10 pointer-events-none select-none opacity-85">
        <PixelBox color="#E3F2FD" />
      </div>

      <div className="max-w-[1200px] mx-auto px-6 flex flex-col items-center relative z-20">
        {/* Section Header */}
        <div className="text-center max-w-[700px] mb-16 flex flex-col items-center gap-y-4">
          <h2
            style={{
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: "clamp(32px, 4.5vw, 48px)",
              lineHeight: "1.1",
              letterSpacing: "-0.03em",
              color: "#000000",
            }}
          >
            Build for people
            <br />
            with excellence
          </h2>
          <p
            style={{
              fontFamily: "Inter",
              fontWeight: 400,
              fontSize: "16px",
              lineHeight: "1.2",
              color: "#777777",
              maxWidth: "500px",
              letterSpacing: "-0.03em",
            }}
          >
            Use the command line interface and VS code extension to manage you
            skills for each workspace separately and effectively
          </p>
        </div>

        {/* 6-Card Grid */}
        <div className="w-full max-w-[1040px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#F7F7F7] rounded-[4px] p-9 sm:p-10 md:p-11 flex flex-col items-start text-left gap-y-7 min-h-[280px] sm:min-h-[300px] md:min-h-[300px]"
            >
              {/* Circular Icon Wrapper */}
              <div className="w-12 h-12 rounded-full bg-white border border-neutral-200/40 flex items-center justify-center flex-shrink-0 shadow-sm">
                {item.icon}
              </div>

              {/* Title & Description */}
              <div className="flex flex-col gap-y-2">
                <h3
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 600,
                    fontSize: "24px",
                    lineHeight: "1.2",
                    letterSpacing: "-0.02em",
                    color: "#000000",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "1.2",
                    color: "#777777",
                    maxWidth: "220px",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
