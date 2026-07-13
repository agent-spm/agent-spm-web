"use client";

import React from "react";

interface FeatureCard {
  title: string;
  description: string;
}

const FEATURES: FeatureCard[] = [
  {
    title: "Skills and MCP context are managed with our extension",
    description:
      "Use the command line interface and VS code extension to manage you skills for each workspace separately and effectively",
  },
  {
    title: "Use Skill mode context protocol (SMCP)",
    description:
      "Use the command line interface and VS code extension to manage you skills for each workspace separately and effectively",
  },
  {
    title: "SuperAgent makes it whole",
    description:
      "Use the command line interface and VS code extension to manage you skills for each workspace separately and effectively",
  },
];

export default function WorkspaceFeatures() {
  return (
    <section className="relative w-full bg-white text-black py-24 z-20">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center max-w-[700px] mb-16 flex flex-col items-center gap-y-4">
          <h2
            style={{
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: "clamp(32px, 4.5vw, 48px)",
              lineHeight: "1",
              letterSpacing: "-5%",
              color: "#000000",
            }}
          >
            Your workspace skills,
            <br />
            wherever you need it
          </h2>
          <p
            style={{
              fontFamily: "Inter",
              fontWeight: 400,
              fontSize: "16px",
              lineHeight: "1.2",
              color: "#777777",
              maxWidth: "500px",
              letterSpacing: '-3%'
            }}
          >
            Use the command line interface and VS code extension to manage you
            skills for each workspace separately and effectively
          </p>
        </div>

        {/* Feature Cards Stack */}
        <div className="w-full max-w-[960px] flex flex-col gap-y-8">
          {FEATURES.map((feature, idx) => (
            <div
              key={idx}
              className="w-full bg-[#F5F5F7] rounded-[4px] p-8 md:p-12 flex flex-col items-center text-center gap-y-6 md:gap-y-8 border border-neutral-100/50 shadow-sm"
            >
              {/* Card Text */}
              <div className="max-w-[740px] flex flex-col gap-y-3">
                <h3
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 600,
                    fontSize: "28px",
                    lineHeight: "1.2",
                    letterSpacing: "-0.02em",
                    color: "#000000",

                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "1.2",
                    color: "#777777",
                    maxWidth: "500px",
                    letterSpacing: "-0.03em",
                    margin: "0 auto",
                  }}
                >
                  {feature.description}
                </p>
              </div>

              {/* Mock Video Box */}
              <div className="w-full aspect-[16/9] bg-[#D9D9D9] rounded-[4px] flex items-center justify-center relative overflow-hidden group cursor-pointer border border-neutral-200/40">

                {/* Subtle shine / premium styling inside card */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/[0.02] to-white/[0.08] pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
