export interface DemoPackageItem {
  id: string;
  namespace: string;
  name: string;
  fullName: string;
  description: string;
  latestVersion: string;
  totalDownloads: number;
  verified: boolean;
  keywords: string[];
}

export interface DemoPackageDetail {
  id: string;
  namespace: string;
  name: string;
  displayName: string;
  description: string;
  latestVersion: string;
  verified: boolean;
  totalDownloads: number;
  repositoryUrl?: string;
  integrity: string;
  sizeBytes?: number;
  fileCount?: number;
  readmeSource: "github-skill" | "github-readme" | "generated";
  readmeSnippet: string;
  dependencies: Array<{
    name: string;
    namespace: string;
    versionConstraint: string;
  }>;
  keywords: string[];
}

export type AgentClientTarget = "cursor" | "claude" | "vscode" | "antigravity";

export const FALLBACK_DEMO_PACKAGES: DemoPackageItem[] = [
  {
    id: "fallback-antiskill",
    namespace: "@lakshitsoni26",
    name: "antiskill",
    fullName: "@lakshitsoni26/antiskill",
    description: "Autonomous agent procedural execution package with verified registry metadata.",
    latestVersion: "1.0.0",
    totalDownloads: 0,
    verified: true,
    keywords: ["agent", "spm", "skill", "antiskill"],
  },
  {
    id: "fallback-web-crawler",
    namespace: "@lakshitsoni26",
    name: "web-crawler",
    fullName: "@lakshitsoni26/web-crawler",
    description: "Structured web extraction skill for AI research and ingestion pipelines.",
    latestVersion: "1.0.0",
    totalDownloads: 0,
    verified: true,
    keywords: ["agent", "spm", "web"],
  },
  {
    id: "fallback-test-spm",
    namespace: "@agent-spm",
    name: "test-spm",
    fullName: "test-spm",
    description: "CLI-published MCP test package with GitHub Release archive and SHA-256 digest.",
    latestVersion: "1.0.4",
    totalDownloads: 0,
    verified: false,
    keywords: ["agent", "spm", "mcp", "testing"],
  },
];

const NOISY_TEST_SLUGS = new Set(["asdfasfd", "adfas", "afasd", "khv"]);

/**
 * Deduplicate mirror pairs (e.g. `@lakshitsoni26/antiskill` and `antiskill`) by leaf
 * package name while preferring scoped/verified records for homepage showcase pickers.
 */
export function pickUniqueDemoPackages(
  items: DemoPackageItem[],
  limit = 10
): DemoPackageItem[] {
  const byLeaf = new Map<string, DemoPackageItem>();

  for (const item of items) {
    const leaf = item.name.toLowerCase();
    if (NOISY_TEST_SLUGS.has(leaf)) continue;

    const existing = byLeaf.get(leaf);
    if (!existing) {
      byLeaf.set(leaf, item);
      continue;
    }

    const itemIsScoped = item.fullName.startsWith("@");
    const existingIsScoped = existing.fullName.startsWith("@");
    if (
      (item.verified && !existing.verified) ||
      (itemIsScoped && !existingIsScoped && item.verified === existing.verified)
    ) {
      byLeaf.set(leaf, item);
    }
  }

  const deduped = Array.from(byLeaf.values());
  return (deduped.length > 0 ? deduped : FALLBACK_DEMO_PACKAGES).slice(0, limit);
}

export function formatReadmeSourceLabel(
  source?: DemoPackageDetail["readmeSource"] | null
): string {
  if (source === "github-skill") return "GitHub SKILL.md";
  if (source === "github-readme") return "GitHub README";
  return "Registry Manifest";
}

export function formatCompactBytes(bytes?: number): string {
  if (typeof bytes !== "number" || bytes <= 0) return "Archive Ready";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

export function buildSpmYamlPreview(
  pkg: DemoPackageItem,
  detail?: DemoPackageDetail | null,
  workspaceList?: DemoPackageItem[]
): string {
  const deps = (workspaceList && workspaceList.length > 0 ? workspaceList : [pkg])
    .map((item) => `  "${item.fullName}": "^${item.latestVersion}"`)
    .join("\n");

  const digestLine =
    detail?.integrity && detail.integrity !== "unrecorded"
      ? `  digest: "${detail.integrity}"`
      : `  digest: "pending-cli-attestation"`;

  const repoLine = detail?.repositoryUrl
    ? `  repository: "${detail.repositoryUrl}"`
    : `  repository: "https://github.com/agent-spm-registry/${pkg.name}"`;

  return `# Auto-synced by Agent SPM Workspace Extension
name: "my-agent-workspace"
runtime: "mcp-2025-03"

dependencies:
${deps}

integrity:
  package: "${pkg.fullName}@${pkg.latestVersion}"
${digestLine}
${repoLine}`;
}

export function buildClientConfigSnippet(
  client: AgentClientTarget,
  pkg: DemoPackageItem
): string {
  const safeKey = pkg.name.replace(/[^a-zA-Z0-9_-]/g, "-");
  if (client === "cursor") {
    return JSON.stringify(
      {
        mcpServers: {
          [safeKey]: {
            command: "npx",
            args: ["-y", "agent-spm@latest", "run", pkg.fullName],
            env: { SPM_VERIFY_INTEGRITY: "strict" },
          },
        },
      },
      null,
      2
    );
  }
  if (client === "claude") {
    return JSON.stringify(
      {
        mcpServers: {
          [safeKey]: {
            command: "spm",
            args: ["mcp", "serve", `${pkg.fullName}@${pkg.latestVersion}`],
          },
        },
      },
      null,
      2
    );
  }
  if (client === "vscode") {
    return JSON.stringify(
      {
        servers: {
          [safeKey]: {
            type: "stdio",
            command: "spm",
            args: ["exec", pkg.fullName, "--verified-only"],
          },
        },
      },
      null,
      2
    );
  }
  return `# Install & attach inside Antigravity / Terminal
spm install ${pkg.fullName}
spm connect --client antigravity --skill ${pkg.fullName}`;
}
