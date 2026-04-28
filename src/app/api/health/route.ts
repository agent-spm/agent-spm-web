import { NextResponse } from "next/server";

/**
 * Health check endpoint for uptime monitoring and deployment verification.
 * GET /api/health
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "0.0.0",
      uptime: process.uptime(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
