"use client";

import React from "react";
import { LaurelLeft } from "@/components/icons/LaurelLeft";
import { LaurelRight } from "@/components/icons/LaurelRight";

interface StatItem {
  value: string;
  label: string;
}

const STATS: StatItem[] = [
  { value: "9,426", label: "Forks" },
  { value: "86,656", label: "Stars" },
  { value: "2,044", label: "Contributors" },
  { value: "10,000", label: "Skills" },
];

export default function OpenSourceStats() {
  return (
    <section className="relative w-full">
      {/* Content wrapper */}
      <div className="max-w-[1200px] mx-auto px-6 pt-12 pb-20 flex flex-col items-center gap-y-10">

        {/* "Open Source" heading */}
        <h2
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontWeight: 400,
            fontStyle: "italic",
            fontSize: "clamp(36px, 4vw, 60px)",
            lineHeight: 1.1,
            color: "#000000",
            textAlign: "center",
          }}
        >
          Open Source
        </h2>

        {/* Stats row */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-8 sm:gap-x-2 md:gap-x-2">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center"
            >
              {/* Left laurel */}
              <LaurelLeft
                width={52}
                height={74}
                aria-hidden="true"
                className="flex-shrink-0"
              />

              {/* Stat text */}
              <div className="flex flex-col items-center">
                <span
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontStyle: "normal",
                    fontSize: "30px",
                    lineHeight: "1",
                    color: "#000000",
                   
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    fontSize: "clamp(11px, 1vw, 13px)",
                    color: "#888888",
                    lineHeight: "1",
                    letterSpacing: "-3%",
                    marginTop: "2px",
                  }}
                >
                  {stat.label}
                </span>
              </div>

              {/* Right laurel */}
              <LaurelRight
                width={52}
                height={74}
                aria-hidden="true"
                className="flex-shrink-0"
              />
            </div>
          ))}
        </div>

        {/* Tagline */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: "16px",
            lineHeight: 1.6,
            color: "#000000",
            textAlign: "center",
            maxWidth: "520px",
          }}
        >
          Skills Package Manager is built by a global, growing, and thriving
          community of thousands of developers
        </p>
      </div>
    </section>
  );
}
