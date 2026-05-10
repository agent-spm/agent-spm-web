import type { Package } from "@/types/package";

export const MOCK_PACKAGES: Package[] = [
  {
    id: "core-http",
    namespace: "core",
    name: "http",
    displayName: "core/http",
    description: "High-performance HTTP client for agent workflows with automatic retries and rate limiting.",
    readme: `# core/http

High-performance HTTP client tailored for AI agent workflows.

## Features

- **Automatic Retries:** Seamlessly handles transient network failures.
- **Rate Limiting:** Built-in token bucket rate limiting to respect API constraints.
- **Agent Integration:** Native support for tool-calling interfaces.

## Installation

\`\`\`bash
spm install core/http
\`\`\`

## Usage

\`\`\`typescript
import { HttpClient } from "core/http";

const client = new HttpClient({
  retries: 3,
  timeout: 5000
});

const response = await client.get("https://api.example.com/data");
console.log(response.data);
\`\`\`

## License
MIT`,
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
    readme: `# utils/json

Robust JSON parsing and validation with schema support, designed specifically for ensuring LLM outputs conform to expected structures.

## Features

- **Strict Validation:** Validate parsed JSON against JSON Schema.
- **Auto-Fixing:** Heuristics to fix common LLM JSON formatting errors (e.g., missing quotes, trailing commas).

## Installation

\`\`\`bash
spm install utils/json
\`\`\`

## Usage

\`\`\`typescript
import { parseAndValidate } from "utils/json";

const schema = {
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "number" }
  },
  required: ["name", "age"]
};

// LLM output with a trailing comma
const rawOutput = '{ "name": "Alice", "age": 30, }';

const data = parseAndValidate(rawOutput, schema);
// Successfully parses and validates!
\`\`\`
`,
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
    readme: `# ai/vision

Computer vision skill for analyzing images and extracting text using state-of-the-art models.

## Features

- **Object Detection:** Identify objects and their bounding boxes.
- **OCR:** Extract text from images with high accuracy.
- **Image Captioning:** Generate descriptive captions for images.

## Installation

\`\`\`bash
spm install ai/vision
\`\`\`

## Usage

\`\`\`typescript
import { VisionAgent } from "ai/vision";

const agent = new VisionAgent({ apiKey: process.env.VISION_API_KEY });

const result = await agent.analyzeImage("./receipt.jpg", {
  features: ["OCR", "DOCUMENT_TEXT_DETECTION"]
});

console.log(result.text);
\`\`\`
`,
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
    readme: `# ${namespace}/${name}

A powerful skill package for AI agents.

## Features

- Fully typed interface.
- Seamless integration with SPM.
- Extensible middleware support.

## Usage

\`\`\`typescript
import { ${name} } from "${namespace}/${name}";

const agent = new ${name}();
agent.execute();
\`\`\`
`,
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
