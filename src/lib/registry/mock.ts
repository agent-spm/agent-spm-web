import type { Package } from "@/types/package";

export const MOCK_PACKAGES: Package[] = [
  {
    id: "core-http",
    namespace: "core",
    name: "http",
    displayName: "core/http",
    description: "High-performance HTTP client for agent workflows with automatic retries and rate limiting.",
    readme: "# core/http\n\nHTTP client skill.",
    license: "MIT",
    repositoryUrl: "https://github.com/core/http",
    homepageUrl: undefined,
    keywords: ["http", "request", "fetch"],
    latestVersion: "1.2.0",
    versions: [
      { version: "1.2.0", publishedAt: "2025-03-28T00:00:00Z", digest: "sha256:abc123", downloads: 1200 },
    ],
    author: { name: "core", email: "core@spm.dev", githubUsername: "core" },
    dependencies: [],
    totalDownloads: 10200,
    weeklyDownloads: 850,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-03-28T00:00:00Z",
  },
  {
    id: "utils-json",
    namespace: "utils",
    name: "json",
    displayName: "utils/json",
    description: "Robust JSON parsing and validation with schema support.",
    readme: "# utils/json\n\nJSON parser skill.",
    license: "MIT",
    repositoryUrl: "https://github.com/utils/json",
    homepageUrl: undefined,
    keywords: ["json", "parser", "schema"],
    latestVersion: "2.0.1",
    versions: [
      { version: "2.0.1", publishedAt: "2025-04-10T00:00:00Z", digest: "sha256:def456", downloads: 3400 },
    ],
    author: { name: "utils", email: "utils@spm.dev", githubUsername: "utils" },
    dependencies: [],
    totalDownloads: 25000,
    weeklyDownloads: 2100,
    createdAt: "2024-11-15T00:00:00Z",
    updatedAt: "2025-04-10T00:00:00Z",
  },
  {
    id: "ai-vision",
    namespace: "ai",
    name: "vision",
    displayName: "ai/vision",
    description: "Computer vision skill for analyzing images and extracting text using state-of-the-art models.",
    readme: "# ai/vision\n\nVision analysis skill.",
    license: "MIT",
    repositoryUrl: "https://github.com/ai/vision",
    homepageUrl: undefined,
    keywords: ["vision", "ocr", "image"],
    latestVersion: "0.9.5",
    versions: [
      { version: "0.9.5", publishedAt: "2025-04-20T00:00:00Z", digest: "sha256:ghi789", downloads: 500 },
    ],
    author: { name: "ai", email: "ai@spm.dev", githubUsername: "ai" },
    dependencies: [],
    totalDownloads: 1200,
    weeklyDownloads: 300,
    createdAt: "2025-02-01T00:00:00Z",
    updatedAt: "2025-04-20T00:00:00Z",
  }
];

export function getMockPackage(namespace: string, name: string): Package {
  const found = MOCK_PACKAGES.find((p) => p.namespace === namespace && p.name === name);
  if (found) return found;

  // Fallback mock
  return {
    id: `${namespace}-${name}`,
    namespace,
    name,
    displayName: `${namespace}/${name}`,
    description: `A powerful AI agent skill package for ${name} operations. Provides composable tools and middleware for building intelligent agent workflows.`,
    readme: `# ${namespace}/${name}\n\nA powerful skill package for AI agents.`,
    license: "MIT",
    repositoryUrl: `https://github.com/${namespace}/${name}`,
    homepageUrl: undefined,
    keywords: ["ai", "agent", "skill", name],
    latestVersion: "1.2.0",
    versions: [
      { version: "1.2.0", publishedAt: "2025-03-28T00:00:00Z", digest: "sha256:abc123", downloads: 1200 },
    ],
    author: {
      name: namespace,
      email: `${namespace}@spm.dev`,
      githubUsername: namespace,
    },
    dependencies: [],
    totalDownloads: 10200,
    weeklyDownloads: 850,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-03-28T00:00:00Z",
  };
}
