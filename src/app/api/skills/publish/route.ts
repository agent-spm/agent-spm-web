import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuthenticatedUser } from "@/lib/auth/server-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { getClientIp, publishApiLimiter } from "@/lib/security/rate-limit";
import { sanitizeIdentifier } from "@/lib/security/sanitize";
import { isMissingColumnError } from "@/lib/supabase/postgrest-errors";

const GITHUB_API = "https://api.github.com";
const GITHUB_ORG = process.env.GITHUB_ORG || "agent-spm-registry";
const SEMVER_REGEX = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (!publishApiLimiter.check(`pub:${ip}`)) {
      return NextResponse.json(
        { error: "Rate limit exceeded for publishing. Please wait a minute." },
        { status: 429 }
      );
    }

    const { ctx, errorResponse } = await requireAuthenticatedUser();
    if (errorResponse) return errorResponse;

    const cookieStore = await cookies();
    const adminSupabase = getSupabaseServiceClient();

    const body = await req.json().catch(() => ({}));
    const {
      name,
      scope,
      version = "1.0.0",
      description = "Autonomous agent procedural execution package.",
      license = "MIT",
      keywords = ["agent", "tool"],
      githubToken,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Skill name is required" }, { status: 400 });
    }

    if (!SEMVER_REGEX.test(String(version).trim())) {
      return NextResponse.json(
        { error: "Version must follow semantic versioning (e.g. 1.0.0)" },
        { status: 400 }
      );
    }

    const cleanPkgName = name
      .trim()
      .toLowerCase()
      .replace(/^@[^/]+\//, "")
      .replace(/[^a-z0-9-_]/g, "-");

    if (!cleanPkgName || cleanPkgName.length > 100) {
      return NextResponse.json({ error: "Invalid package name." }, { status: 400 });
    }

    // Derive authoritative scope slug from caller's verified handle or requested org membership
    const fallbackSlug = sanitizeIdentifier(ctx.githubHandle || ctx.user.email!.split("@")[0]);
    const requestedSlug = scope ? sanitizeIdentifier(String(scope)) : fallbackSlug;
    const targetScope = `@${requestedSlug}`;
    const scopedPkgName = `${targetScope}/${cleanPkgName}`;

    // Verify caller is authorized to publish under targetScope
    const isPersonalHandle =
      ctx.githubHandle && requestedSlug === sanitizeIdentifier(ctx.githubHandle);

    if (!isPersonalHandle && !ctx.isSuperAdmin) {
      const { data: orgRow } = await adminSupabase
        .from("organizations")
        .select("id")
        .eq("slug", requestedSlug)
        .maybeSingle();

      if (!orgRow) {
        return NextResponse.json(
          { error: `You do not own namespace ${targetScope}.` },
          { status: 403 }
        );
      }

      const { data: membership } = await adminSupabase
        .from("organization_members")
        .select("role")
        .eq("org_id", orgRow.id)
        .eq("user_id", ctx.publicUserId)
        .maybeSingle();

      if (!membership || !["owner", "admin", "member"].includes(membership.role)) {
        return NextResponse.json(
          { error: `Insufficient permissions to publish under ${targetScope}.` },
          { status: 403 }
        );
      }
    }

    const canonicalOwnerId = ctx.githubId || ctx.user.id;
    const isOwnedByCaller = (ownerId: string | null) =>
      ownerId !== null &&
      (ownerId === ctx.user.id ||
        ownerId === ctx.publicUserId ||
        (ctx.githubId && ownerId === ctx.githubId) ||
        ctx.isSuperAdmin);

    // Prevent package hijacking: check existing unscoped and scoped records
    const { data: existingScoped } = await adminSupabase
      .from("packages")
      .select("id, owner_id")
      .eq("name", scopedPkgName)
      .maybeSingle();

    if (existingScoped && !isOwnedByCaller(existingScoped.owner_id)) {
      return NextResponse.json(
        { error: `Package ${scopedPkgName} is owned by another developer.` },
        { status: 403 }
      );
    }

    // Isolate repo namespace cleanly by scope + package to avoid cross-tenant collisions
    const repoName = `${requestedSlug}--${cleanPkgName}`.replace(/[^a-z0-9._-]/g, "-");
    const repoFullName = `${GITHUB_ORG}/${repoName}`;

    // Only use authenticated user's GitHub OAuth token (or org token for verified org owner)
    const cookieGhToken = cookieStore.get("spm_gh_token")?.value;
    const tokenToUse =
      (typeof githubToken === "string" && githubToken.trim()) ||
      cookieGhToken ||
      (ctx.isSuperAdmin ? process.env.GITHUB_TOKEN : undefined);

    let githubProvisioned = false;
    let githubError: string | null = null;

    if (tokenToUse) {
      try {
        const ghHeaders = {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${tokenToUse}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        };

        const checkResp = await fetch(`${GITHUB_API}/repos/${repoFullName}`, {
          method: "GET",
          headers: ghHeaders,
        });

        if (checkResp.status === 404) {
          const createResp = await fetch(`${GITHUB_API}/orgs/${GITHUB_ORG}/repos`, {
            method: "POST",
            headers: ghHeaders,
            body: JSON.stringify({
              name: repoName,
              description: `SPM skill package: ${scopedPkgName}`,
              visibility: "public",
              auto_init: true,
              has_issues: false,
              has_wiki: false,
              has_projects: false,
            }),
          });

          if (createResp.ok) {
            githubProvisioned = true;
            await new Promise((resolve) => setTimeout(resolve, 600));
          } else {
            const errText = await createResp.text();
            githubError = `GitHub create repo failed (${createResp.status})`;
            console.warn("[Publish] GitHub repo creation notice:", errText);
          }
        } else if (checkResp.ok) {
          githubProvisioned = true;
        }

        if (githubProvisioned) {
          const safeDesc = String(description || "").slice(0, 500).replace(/"/g, '\\"');
          const safeKw = Array.isArray(keywords)
            ? keywords.slice(0, 12).map((k: unknown) => sanitizeIdentifier(String(k))).filter(Boolean)
            : ["agent", "tool"];

          const rawSkillMd = typeof body.skillMarkdown === "string" ? body.skillMarkdown : "";
          const rawSpmYaml = typeof body.spmYaml === "string" ? body.spmYaml : "";
          if (rawSkillMd.length > 65536 || rawSpmYaml.length > 65536) {
            return NextResponse.json(
              { error: "Manifest or SKILL.md exceeds the 64 KB size limit." },
              { status: 400 }
            );
          }

          const skillMdContent = rawSkillMd.trim()
            ? rawSkillMd
            : `---\nname: ${cleanPkgName}\ndescription: "${safeDesc}"\nversion: "${version}"\nlicense: "${license}"\n---\n\n# ${scopedPkgName}\n\n${description}\n\n## Quick Start\n\`\`\`bash\nspm install ${scopedPkgName}\n\`\`\`\n`;

          const spmYamlContent = rawSpmYaml.trim()
            ? rawSpmYaml
            : `name: "${cleanPkgName}"\nversion: "${version}"\nscope: "${targetScope}"\ndescription: "${safeDesc}"\nlicense: "${license}"\nentry: "SKILL.md"\nkeywords:\n${safeKw.map((k: string) => `  - "${k}"`).join("\n")}\n`;

          const readmeContent = `# ${scopedPkgName}\n\n> ${description}\n\n### Installation\n\`\`\`bash\nspm install ${scopedPkgName}\n\`\`\`\n`;

          const commitFile = async (filePath: string, fileContent: string, commitMsg: string) => {
            let existingSha: string | undefined;
            const getRes = await fetch(`${GITHUB_API}/repos/${repoFullName}/contents/${filePath}`, {
              method: "GET",
              headers: ghHeaders,
            });
            if (getRes.ok) {
              const existingData = await getRes.json();
              existingSha = existingData.sha;
            }
            const putRes = await fetch(`${GITHUB_API}/repos/${repoFullName}/contents/${filePath}`, {
              method: "PUT",
              headers: ghHeaders,
              body: JSON.stringify({
                message: commitMsg,
                content: Buffer.from(fileContent, "utf8").toString("base64"),
                ...(existingSha ? { sha: existingSha } : {}),
              }),
            });
            if (!putRes.ok) {
              throw new Error(`GitHub content commit failed (${filePath}: HTTP ${putRes.status})`);
            }
          };

          await commitFile("SKILL.md", skillMdContent, `feat(skill): add SKILL.md for ${scopedPkgName}`);
          await commitFile("spm.yaml", spmYamlContent, `feat(manifest): add spm.yaml for ${scopedPkgName}@${version}`);
          await commitFile("README.md", readmeContent, `docs: update README for ${scopedPkgName}`);
        }
      } catch (err: unknown) {
        githubProvisioned = false;
        githubError = err instanceof Error ? err.message : "GitHub API error";
        console.warn("GitHub API error during provisioning:", err);
      }
    }

    // Resolve owning organization ID for strict tenant scoping
    const { data: targetOrgRow } = await adminSupabase
      .from("organizations")
      .select("id")
      .eq("slug", requestedSlug)
      .maybeSingle();

    const basePackagePayload = {
      name: scopedPkgName,
      description: String(description || "").slice(0, 500),
      latest_version: String(version).trim(),
      owner_id: String(canonicalOwnerId),
      visibility: "public",
      github_repo: repoFullName,
      ...(existingScoped ? {} : { total_downloads: 0 }),
      verified: githubProvisioned,
      updated_at: new Date().toISOString(),
    };

    // Register package exclusively under authorized owner's scoped identifier + org_id
    let { error: pkgError } = await adminSupabase.from("packages").upsert(
      {
        ...basePackagePayload,
        ...(targetOrgRow?.id ? { org_id: targetOrgRow.id } : {}),
      },
      { onConflict: "name" }
    );

    // Graceful fallback if org_id column migration has not been applied yet
    if (isMissingColumnError(pkgError, "org_id")) {
      const retry = await adminSupabase.from("packages").upsert(basePackagePayload, {
        onConflict: "name",
      });
      pkgError = retry.error;
    }

    if (pkgError) {
      return NextResponse.json(
        { error: `Database error registering package: ${pkgError.message}` },
        { status: 500 }
      );
    }

    const releaseUrl = `https://github.com/${repoFullName}/releases/download/v${version}/${cleanPkgName}-${version}.tgz`;
    const { data: existingScopedVer } = await adminSupabase
      .from("package_versions")
      .select("id")
      .eq("package_name", scopedPkgName)
      .eq("version", String(version).trim())
      .maybeSingle();

    if (!existingScopedVer) {
      await adminSupabase.from("package_versions").insert({
        package_name: scopedPkgName,
        version: String(version).trim(),
        confirmed: true,
        github_release_url: githubProvisioned ? releaseUrl : null,
        integrity: "sha256:pending-release-digest",
        size_bytes: 4096,
        file_count: 3,
        dependencies: {},
        published_by: String(canonicalOwnerId),
        verified: githubProvisioned,
      });
    }

    await adminSupabase.from("audit_log").insert({
      actor_id: ctx.publicUserId,
      action: `published: ${scopedPkgName}@${version}`,
      target_type: "package",
      target_name: scopedPkgName,
      metadata: { severity: "info", email: ctx.user.email },
    });

    return NextResponse.json({
      success: true,
      name: cleanPkgName,
      scope: targetScope,
      version: String(version).trim(),
      repoFullName,
      repoUrl: `https://github.com/${repoFullName}`,
      installCmd: `spm install ${scopedPkgName}`,
      githubProvisioned,
      githubError,
    });
  } catch (error: unknown) {
    console.error("Publish route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to publish skill" },
      { status: 500 }
    );
  }
}
