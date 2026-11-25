import { NextRequest, NextResponse } from "next/server";
import { registryApi, PackageNotFoundError } from "@/lib/registry/api";
import { demoInspectLimiter, getClientIp } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const VALID_PKG_REGEX = /^(@[a-zA-Z0-9_.-]+\/)?[a-zA-Z0-9_.-]+$/;
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
};

/**
 * Read-only registry inspection endpoint for interactive homepage demos.
 * Strictly reads public packages and never mutates download counts.
 */
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (!demoInspectLimiter.check(ip)) {
    return NextResponse.json(
      { error: "Demo inspect rate limit exceeded. Please pause briefly." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const pkgParam = (request.nextUrl.searchParams.get("package") || "").trim();
  const queryParam = (request.nextUrl.searchParams.get("q") || "").trim();

  if (pkgParam) {
    if (pkgParam.length > 160 || !VALID_PKG_REGEX.test(pkgParam)) {
      return NextResponse.json({ error: "Invalid package name." }, { status: 400 });
    }

    const parts = pkgParam.includes("/") ? pkgParam.split("/") : ["@agent-spm", pkgParam];
    const namespace = parts[0] || "@agent-spm";
    const name = parts[1] || pkgParam;

    try {
      const pkg = await registryApi.getPackage(namespace, name);
      return NextResponse.json(
        {
          mode: "package",
          package: {
            id: pkg.id,
            namespace: pkg.namespace,
            name: pkg.name,
            displayName: pkg.displayName,
            description: pkg.description,
            latestVersion: pkg.latestVersion,
            verified: Boolean(pkg.verified),
            totalDownloads: pkg.totalDownloads,
            repositoryUrl: pkg.repositoryUrl,
            integrity: pkg.integrity || "unrecorded",
            sizeBytes: pkg.sizeBytes,
            fileCount: pkg.fileCount,
            readmeSource: pkg.readmeSource || "generated",
            readmeSnippet: pkg.readme.split("\n").slice(0, 18).join("\n"),
            dependencies: pkg.dependencies,
            keywords: pkg.keywords,
          },
        },
        { status: 200, headers: CACHE_HEADERS }
      );
    } catch (err) {
      if (err instanceof PackageNotFoundError) {
        return NextResponse.json({ error: "Package not found." }, { status: 404 });
      }
      return NextResponse.json(
        { error: "Registry inspection temporarily unavailable." },
        { status: 503 }
      );
    }
  }

  if (queryParam.length > 120) {
    return NextResponse.json({ error: "Search query too long." }, { status: 400 });
  }

  try {
    const searchRes = await registryApi.searchPackages({
      query: queryParam,
      pageSize: 12,
      sort: "relevance",
    });

    return NextResponse.json(
      {
        mode: "search",
        query: queryParam,
        total: searchRes.total,
        packages: searchRes.packages.map((p) => ({
          id: p.id,
          namespace: p.namespace,
          name: p.name,
          fullName: p.namespace !== "@agent-spm" ? `${p.namespace}/${p.name}` : p.name,
          description: p.description,
          latestVersion: p.latestVersion,
          totalDownloads: p.totalDownloads,
          verified: Boolean(p.verified),
          keywords: p.keywords,
        })),
      },
      { status: 200, headers: CACHE_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { mode: "search", query: queryParam, total: 0, packages: [] },
      { status: 200 }
    );
  }
}
