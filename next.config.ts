import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Set to project root to avoid climbing to /Users/lakshitsoni/Desktop and hitting permission errors
    // You may need to change this string if your project path changes
    root: "/Users/lakshitsoni/Desktop/freelancing/agent-spm-web",
  } as any,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
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
