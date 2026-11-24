"use client";

import React from "react";
import ExtensionRegistryDemo from "./demos/ExtensionRegistryDemo";
import SmcpProtocolDemo from "./demos/SmcpProtocolDemo";
import SuperAgentSecurityDemo from "./demos/SuperAgentSecurityDemo";
import {
  DemoPackageItem,
  FALLBACK_DEMO_PACKAGES,
  pickUniqueDemoPackages,
} from "./demos/demo-types";

interface FeatureCardSpec {
  id: "extension" | "smcp" | "superagent";
  tag: string;
  title: string;
  description: string;
}

const FEATURES: FeatureCardSpec[] = [
  {
    id: "extension",
    tag: "[01] IDE EXTENSION & REGISTRY",
    title: "Skills and MCP context are managed with our extension",
    description:
      "Search the live registry, install skills into your workspace, and sync runtime configs directly in Cursor, Claude, VS Code, or Antigravity.",
  },
  {
    id: "smcp",
    tag: "[02] SMCP PROTOCOL & SCHEMA DIET",
    title: "Use Skill mode context protocol (SMCP)",
    description:
      "Run real registry commands, inspect JSON-RPC 2.0 tool envelopes, and trim redundant prompt tokens with live Schema Diet compression.",
  },
  {
    id: "superagent",
    tag: "[03] SUPERAGENT INTEGRITY GATE",
    title: "SuperAgent makes it whole",
    description:
      "Connect scoped skills to agent workflows with cryptographic SHA-256 verification gates and isolated runtime permissions.",
  },
];

export default function WorkspaceFeatures({
  initialPackages,
}: {
  initialPackages?: DemoPackageItem[];
}) {
  const safePackages = pickUniqueDemoPackages(
    initialPackages && initialPackages.length > 0
      ? initialPackages
      : FALLBACK_DEMO_PACKAGES,
    12
  );

  return (
    <section className="relative w-full bg-white text-black py-24 z-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center max-w-[700px] mb-14 sm:mb-16 flex flex-col items-center gap-y-4">
          <h2
            style={{
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: "clamp(32px, 4.5vw, 48px)",
              lineHeight: "1",
              letterSpacing: "-0.05em",
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
              lineHeight: "1.35",
              color: "#52525B",
              maxWidth: "520px",
              letterSpacing: "-0.02em",
            }}
          >
            Try Agent SPM right here — browse real registry packages, test SMCP CLI &amp; Schema Diet commands, and verify SHA-256 integrity checks.
          </p>
        </div>

        {/* Interactive Feature Demo Cards Stack */}
        <div className="w-full max-w-[1000px] flex flex-col gap-y-10">
          {FEATURES.map((feature) => (
            <div
              key={feature.id}
              className="w-full bg-[#F5F5F7] rounded-[6px] p-4 sm:p-8 md:p-10 flex flex-col items-center text-center gap-y-5 sm:gap-y-6 border border-black/5 shadow-sm"
            >
              {/* Card Header */}
              <div className="max-w-[740px] flex flex-col items-center gap-y-2.5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-[3px] border border-black/10 bg-white font-mono text-[10px] font-semibold uppercase tracking-wider text-[#1B5FED]">
                  {feature.tag}
                </span>
                <h3
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 600,
                    fontSize: "clamp(20px, 3vw, 28px)",
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
                    fontSize: "15px",
                    lineHeight: "1.4",
                    color: "#52525B",
                    maxWidth: "580px",
                    letterSpacing: "-0.015em",
                    margin: "0 auto",
                  }}
                >
                  {feature.description}
                </p>
              </div>

              {/* Interactive Dark IDE Workbench (Replaced Static Placeholder) */}
              {feature.id === "extension" && (
                <ExtensionRegistryDemo initialPackages={safePackages} />
              )}
              {feature.id === "smcp" && (
                <SmcpProtocolDemo initialPackages={safePackages} />
              )}
              {feature.id === "superagent" && (
                <SuperAgentSecurityDemo initialPackages={safePackages} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
