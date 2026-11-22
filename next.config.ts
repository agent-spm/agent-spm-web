import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/security/headers";

const isStaticExport = process.env.STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  // Disable static export on Vercel or when not explicitly requested via STATIC_EXPORT=true,
  // allowing dynamic API routes (/api/checkout/*) and serverless functions to run properly.
  output: isStaticExport ? "export" : undefined,
  trailingSlash: false,
  turbopack: {
    // Set to project root to avoid climbing up and hitting permission errors
    root: process.cwd(),
  },
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "cdn.spm.dev",
        pathname: "/packages/**",
      },
    ],
  },
  serverExternalPackages: ["shiki"],
  ...(isStaticExport
    ? {}
    : {
        async headers() {
          return [
            {
              source: "/(.*)",
              headers: securityHeaders,
            },
          ];
        },
      }),
};

export default nextConfig;
