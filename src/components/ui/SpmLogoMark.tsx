import React from "react";

/**
 * Official Agent SPM mark (pixel-identical to public/images/figma/spm-logo-cta.svg and logo.png).
 */
export function SpmLogoMark({
  size = 20,
  variant = "badge",
  className = "",
}: {
  size?: number;
  variant?: "badge" | "mark";
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`shrink-0 ${className}`.trim()}
    >
      {variant === "badge" && <rect width="30" height="30" rx="2" fill="#1B5FED" />}
      <path
        d="M9 6.75H21V15H14.625L18 18.375V22.5H9V18.375H12.375L9 15V6.75Z"
        fill={variant === "badge" ? "#FFFFFF" : "#1B5FED"}
      />
    </svg>
  );
}
