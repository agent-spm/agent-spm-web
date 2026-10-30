"use client";

import React from "react";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "dark";
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({
  variant = "light",
  children,
  className = "",
  ...props
}: GlassCardProps) {
  const isDark = variant === "dark";

  return (
    <div className={`glass-card-shell ${className}`} {...props}>
      {/* Layer 0: Liquid Distortion Backdrop Filter */}
      <div className="glass-card-filter" aria-hidden="true" />

      {/* Layer 1: Translucent Material Tint */}
      <div
        className={isDark ? "glass-card-overlay-dark" : "glass-card-overlay"}
        aria-hidden="true"
      />

      {/* Layer 2: Razor-Thin Specular Rim Highlight */}
      <div
        className={isDark ? "glass-card-specular-dark" : "glass-card-specular"}
        aria-hidden="true"
      />

      {/* Layer 3: Crisp Foreground Content */}
      <div className="glass-card-content">{children}</div>
    </div>
  );
}

export default GlassCard;
