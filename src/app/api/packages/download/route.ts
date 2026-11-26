import { NextRequest, NextResponse } from "next/server";
import dns from "node:dns";
import { gzipSync } from "node:zlib";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { downloadApiLimiter, getClientIp } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

try {
  dns.setDefaultResultOrder?.("ipv4first");
} catch {
  // Ignore if unsupported by runtime.
}

const VALID_PKG_REGEX = /^(@[a-zA-Z0-9_.-]+\/)?[a-zA-Z0-9_.-]+$/;
const VALID_VER_REGEX = /^[a-zA-Z0-9_.+-]{1,40}$/;
const VALID_REPO_REGEX = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
const ALLOWED_GITHUB_HOSTS = new Set(["github.com", "objects.githubusercontent.com", "release-assets.githubusercontent.com"]);

interface TarEntry {
  path: string;
  content: Buffer;
}

/** Build a valid POSIX ustar .tar.gz buffer in memory with zero external dependencies. */
function buildTgzArchive(entries: TarEntry[]): Buffer {
  const blocks: Buffer[] = [];
  const mtimeOctal = Math.floor(Date.now() / 1000).toString(8).padStart(11, "0");

  for (const entry of entries) {
    const header = Buffer.alloc(512, 0);
    const nameBuf = Buffer.from(entry.path.slice(0, 99), "utf8");
    nameBuf.copy(header, 0);

    header.write("0000644\0", 100, "ascii");
    header.write("0000000\0", 108, "ascii");
    header.write("0000000\0", 116, "ascii");
    header.write(entry.content.length.toString(8).padStart(11, "0") + "\0", 124, "ascii");
    header.write(mtimeOctal + "\0", 136, "ascii");
    header.write("        ", 148, "ascii"); // checksum placeholder
    header.write("0", 156, "ascii"); // regular file
    header.write("ustar\0", 257, "ascii");
    header.write("00", 263, "ascii");

    let checksum = 0;
    for (let i = 0; i < 512; i++) {
      checksum += header[i];
    }
    header.write(checksum.toString(8).padStart(6, "0") + "\0 ", 148, "ascii");

    blocks.push(header);

    if (entry.content.length > 0) {
      blocks.push(entry.content);
      const remainder = entry.content.length % 512;
      if (remainder !== 0) {
        blocks.push(Buffer.alloc(512 - remainder, 0));
      }
    }
  }

  // Standard 1024-byte zero EOF marker
  blocks.push(Buffer.alloc(1024, 0));
  return gzipSync(Buffer.concat(blocks));
}

async function fetchTextWithTimeout(url: string, timeoutMs = 1200): Promise<string | null> {
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    const text = await res.text();
    return text.trim() ? text : null;
  } catch {
    return null;
  }
}

async function tryFetchGithubTarball(releaseUrl?: string | null): Promise<Buffer | null> {
  if (!releaseUrl) return null;
  try {
    const parsed = new URL(releaseUrl);
    if (parsed.protocol !== "https:" || !ALLOWED_GITHUB_HOSTS.has(parsed.hostname)) {
      return null;
    }

    const res = await fetch(parsed.toString(), {
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(4500),
    });
    if (!res.ok) return null;

    const finalUrl = new URL(res.url);
    if (finalUrl.protocol !== "https:" || !ALLOWED_GITHUB_HOSTS.has(finalUrl.hostname)) {
      return null;
    }

    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length > 0 ? buf : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const purpose = (
    request.headers.get("sec-purpose") ||
    request.headers.get("purpose") ||
    ""
  ).toLowerCase();
  if (purpose.includes("prefetch")) {
    return new NextResponse(null, { status: 204 });
  }

  const ip = getClientIp(request);
  if (!downloadApiLimiter.check(ip)) {
    return NextResponse.json(
      { error: "Download rate limit exceeded. Please try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
        },
      }
    );
  }

  const rawPkg = (request.nextUrl.searchParams.get("package") || "").trim();
  const requestedVersion = (request.nextUrl.searchParams.get("version") || "latest").trim();

  if (!rawPkg || rawPkg.length > 160 || !VALID_PKG_REGEX.test(rawPkg)) {
    return NextResponse.json({ error: "Invalid package identifier." }, { status: 400 });
  }
  if (!VALID_VER_REGEX.test(requestedVersion)) {
    return NextResponse.json({ error: "Invalid package version." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseServiceClient();

    // 1. Exact match on packages.name
    let { data: pkg } = await supabase
      .from("packages")
      .select("*")
      .eq("name", rawPkg)
      .maybeSingle();

    // 2. Scoped -> unscoped fallback
    if (!pkg && rawPkg.includes("/")) {
      const unscoped = rawPkg.split("/")[1];
      const fallback = await supabase
        .from("packages")
        .select("*")
        .eq("name", unscoped)
        .maybeSingle();
      if (fallback.data) pkg = fallback.data;
    }

    // 3. Unscoped -> scoped fallback
    if (!pkg && !rawPkg.includes("/")) {
      const fallback = await supabase
        .from("packages")
        .select("*")
        .like("name", `%/${rawPkg}`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (fallback.data) pkg = fallback.data;
    }

    if (!pkg) {
      return NextResponse.json({ error: "Package not found." }, { status: 404 });
    }

    if (pkg.status === "quarantined") {
      return NextResponse.json(
        { error: "This package has been quarantined by platform moderation and is unavailable for download." },
        { status: 403 }
      );
    }

    if (pkg.visibility !== "public") {
      return NextResponse.json(
        { error: "Private packages must be installed with authenticated CLI credentials." },
        { status: 403 }
      );
    }

    const leafName = pkg.name.includes("/") ? pkg.name.split("/")[1] : pkg.name;
    const rawLeaf = rawPkg.includes("/") ? rawPkg.split("/")[1] : rawPkg;
    const candidateNames = Array.from(new Set([pkg.name, rawPkg, leafName, rawLeaf]));

    let verQuery = supabase
      .from("package_versions")
      .select("version, github_release_url, integrity, dependencies, size_bytes")
      .in("package_name", candidateNames)
      .eq("confirmed", true);

    if (requestedVersion === "latest") {
      verQuery = verQuery.order("created_at", { ascending: false }).limit(1);
    } else {
      verQuery = verQuery.eq("version", requestedVersion).limit(1);
    }

    const { data: versions, error: verError } = await verQuery;
    const resolvedVer = versions?.[0];
    if (verError || !resolvedVer) {
      return NextResponse.json({ error: "Package version not found." }, { status: 404 });
    }

    // Check upstream GitHub Release tarball first; if 404/missing, synthesize clean archive from GitHub files/metadata.
    let tarballBuffer = await tryFetchGithubTarball(resolvedVer.github_release_url);
    let tarballSource = "github-release";

    if (!tarballBuffer) {
      tarballSource = "registry-archive";
      const repoSlug = (pkg.github_repo || "").trim();
      const [skillMd, readmeMd] = VALID_REPO_REGEX.test(repoSlug)
        ? await Promise.all([
            fetchTextWithTimeout(`https://raw.githubusercontent.com/${repoSlug}/main/SKILL.md`),
            fetchTextWithTimeout(`https://raw.githubusercontent.com/${repoSlug}/main/README.md`),
          ])
        : [null, null];

      const manifestYaml = [
        `name: ${JSON.stringify(pkg.name)}`,
        `version: ${JSON.stringify(resolvedVer.version)}`,
        `description: ${JSON.stringify(pkg.description || "Agent SPM skill package")}`,
        `license: "MIT"`,
        repoSlug ? `repository: "https://github.com/${repoSlug}"` : null,
        resolvedVer.integrity && resolvedVer.integrity !== "unrecorded"
          ? `integrity: ${JSON.stringify(resolvedVer.integrity)}`
          : null,
        "",
      ]
        .filter((line): line is string => line !== null)
        .join("\n");

      const fallbackSkill = [
        `# ${pkg.name}`,
        "",
        pkg.description || "Autonomous agent skill package from Agent SPM Registry.",
        "",
        "## Install",
        "```bash",
        `spm install ${rawPkg}`,
        "```",
        "",
      ].join("\n");

      const entries: TarEntry[] = [
        { path: "package/spm.yaml", content: Buffer.from(manifestYaml, "utf8") },
        { path: "package/SKILL.md", content: Buffer.from(skillMd || fallbackSkill, "utf8") },
      ];
      if (readmeMd) {
        entries.push({ path: "package/README.md", content: Buffer.from(readmeMd, "utf8") });
      }
      tarballBuffer = buildTgzArchive(entries);
    }

    // Atomically increment download counters across scoped/unscoped mirrors
    const { data: updatedDownloads, error: rpcError } = await supabase.rpc(
      "increment_package_downloads",
      {
        p_package_id: pkg.id,
        p_owner_id: pkg.owner_id ?? null,
        p_github_repo: pkg.github_repo ?? null,
      }
    );
    if (rpcError) {
      console.warn("[DownloadRoute] increment_package_downloads warning:", rpcError.message);
    }

    const safeFileLeaf = leafName.replace(/[^a-zA-Z0-9._-]/g, "-");
    const safeFileVer = String(resolvedVer.version).replace(/[^a-zA-Z0-9._-]/g, "-");
    const filename = `${safeFileLeaf}-${safeFileVer}.tgz`;

    return new NextResponse(new Uint8Array(tarballBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(tarballBuffer.length),
        "Cache-Control": "no-store, max-age=0",
        "X-Download-Count": String(
          typeof updatedDownloads === "number" ? updatedDownloads : (pkg.total_downloads ?? 0) + 1
        ),
        "X-Tarball-Source": tarballSource,
      },
    });
  } catch (err) {
    console.warn(
      "[DownloadRoute] Failed to serve package tarball:",
      err instanceof Error ? err.message : String(err)
    );
    return NextResponse.json({ error: "Failed to prepare package download." }, { status: 500 });
  }
}
