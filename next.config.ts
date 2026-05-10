import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for easy deployment on Hostinger Shared Hosting
  output: "export",
  trailingSlash: true,
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
};

export default nextConfig;
