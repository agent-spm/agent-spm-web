/**
 * Unified Mock Data Store & Event Pipeline for Agent SPM
 * Provides consistent seed state across Overview, Skills, Team, Analytics,
 * Audit Logs, Enterprise settings, and Super-Admin console.
 */

export type OrgRole = "owner" | "admin" | "member" | "viewer" | "custom";
export type PlanTier = "free" | "pro" | "enterprise";
export type SkillStatus = "published" | "draft" | "deprecated";
export type Visibility = "public" | "private";
export type AuditSeverity = "info" | "warning" | "critical";

export interface Organization {
  id: string;
  slug: string;
  name: string;
  plan: PlanTier;
  seatsUsed: number;
  seatsAllowed: number;
  skillsCount: number;
  skillsAllowed: number;
  registryVersion: string;
  createdAt: string;
}

export interface UserPersona {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: OrgRole;
  orgId: string;
  isStaff: boolean;
  plan: PlanTier;
}

export interface SkillVersion {
  version: string;
  digest: string;
  signature: string;
  tarballSize: string;
  downloads: number;
  publishedAt: string;
  publishedBy: string;
  changelog?: string;
}

export interface Skill {
  id: string;
  scope: string;
  name: string;
  version: string;
  status: SkillStatus;
  visibility: Visibility;
  description: string;
  license: string;
  readme: string;
  repositoryUrl?: string;
  keywords: string[];
  agentCompatibility: {
    gpt4: boolean;
    claude: boolean;
    gemini: boolean;
    llama: boolean;
    custom?: boolean;
  };
  totalDownloads: number;
  downloadSparkline: number[];
  updatedAt: string;
  versions: SkillVersion[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  action: string;
  severity: AuditSeverity;
  resource: string;
  ipAddress: string;
  countryCode: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

export interface TeamMemberItem {
  id: string;
  name: string;
  email: string;
  role: OrgRole;
  joinedDate: string;
  skillsCount: number;
  status: "active" | "invited";
}

export interface PendingInviteItem {
  id: string;
  email: string;
  role: OrgRole;
  sentAgo: string;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  type: "live" | "read-only";
  createdAt: string;
  lastUsed: string;
}

export interface WebhookEndpointItem {
  id: string;
  url: string;
  events: string[];
  status: "Active" | "Failing" | "Paused";
  retryCount?: number;
  lastTriggered: string;
  lastStatusCode: number;
}

export interface WebhookDeliveryItem {
  id: string;
  timestamp: string;
  event: string;
  statusCode: number;
  latencyMs: number;
  endpointUrl: string;
  requestBody: string;
  responseBody: string;
}

export interface FeatureFlagItem {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercent: number;
  target: "All" | "Pro and above" | "Enterprise" | "Beta orgs" | "Off";
}

export interface SystemServiceHealth {
  name: string;
  status: "operational" | "degraded" | "outage";
  p50LatencyMs: number;
  uptimePercent: number;
}

export interface ActiveIncidentAlert {
  id: string;
  severity: AuditSeverity;
  title: string;
  details: string;
  region: string;
  startTime: string;
  acknowledged: boolean;
}

// ── REAL ORGANIZATIONS ──
export const SEED_ORGANIZATIONS: Organization[] = [
  {
    id: "f814e581-f059-4469-9fac-316701b6a277",
    slug: "@lakshitsoni26",
    name: "Lakshit Soni's Org",
    plan: "pro",
    seatsUsed: 1,
    seatsAllowed: 10,
    skillsCount: 19,
    skillsAllowed: 50,
    registryVersion: "2.4.0",
    createdAt: "2026-11-22T15:52:52Z",
  },
];

// ── AUTHENTICATED USER PERSONA ──
export const AVAILABLE_PERSONAS: Record<string, UserPersona> = {
  owner: {
    id: "6c3b280f-6680-4c49-8ae5-c251a33f12d3",
    name: "Lakshit Soni",
    email: "lakshitsoni26@gmail.com",
    role: "owner",
    orgId: "f814e581-f059-4469-9fac-316701b6a277",
    isStaff: true,
    plan: "pro",
  },
  admin: {
    id: "6c3b280f-6680-4c49-8ae5-c251a33f12d3",
    name: "Lakshit Soni",
    email: "lakshitsoni26@gmail.com",
    role: "admin",
    orgId: "f814e581-f059-4469-9fac-316701b6a277",
    isStaff: true,
    plan: "pro",
  },
  member: {
    id: "6c3b280f-6680-4c49-8ae5-c251a33f12d3",
    name: "Lakshit Soni",
    email: "lakshitsoni26@gmail.com",
    role: "member",
    orgId: "f814e581-f059-4469-9fac-316701b6a277",
    isStaff: true,
    plan: "pro",
  },
  viewer: {
    id: "6c3b280f-6680-4c49-8ae5-c251a33f12d3",
    name: "Lakshit Soni",
    email: "lakshitsoni26@gmail.com",
    role: "viewer",
    orgId: "f814e581-f059-4469-9fac-316701b6a277",
    isStaff: true,
    plan: "pro",
  },
  superadmin: {
    id: "6c3b280f-6680-4c49-8ae5-c251a33f12d3",
    name: "Lakshit Soni",
    email: "lakshitsoni26@gmail.com",
    role: "owner",
    orgId: "f814e581-f059-4469-9fac-316701b6a277",
    isStaff: true,
    plan: "pro",
  },
};

// ── SEED SKILLS (19 Real Packages from Supabase) ──
export const SEED_SKILLS: Skill[] = [
  {
    id: "73e6859f-76ba-4a98-b790-891d0aca7c0d",
    scope: "@agent-spm",
    name: "test-spm",
    version: "1.0.4",
    status: "published",
    visibility: "public",
    description: "Production procedural skill package manager core testing suite.",
    license: "MIT",
    readme: "# @agent-spm/test-spm\n\nProduction procedural skill package manager core testing suite.\n\n## Installation\n```bash\nspm install test-spm\n```\n\n## Verification\nSigned with Ed25519 hardware key.",
    repositoryUrl: "https://github.com/agent-spm-registry/test-spm",
    keywords: ["agent", "tool", "spm", "test-spm"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: true, custom: true },
    totalDownloads: 1240,
    downloadSparkline: [12, 18, 25, 34, 42, 51, 65, 80],
    updatedAt: "2026-11-22",
    versions: [
      {
        version: "1.0.4",
        digest: "sha256:7b9a1c4f0e...",
        signature: "spm_sig_ed25519_verified",
        tarballSize: "4.2 KB",
        downloads: 1240,
        publishedAt: "2026-11-22",
        publishedBy: "Lakshit Soni",
      },
    ],
  },
  {
    id: "3644e57d-dd7e-445b-ae3a-26280bb5827d",
    scope: "@agent-spm",
    name: "test-skill-mcp",
    version: "1.0.1",
    status: "published",
    visibility: "public",
    description: "Model Context Protocol (MCP) tool integration and server bridge.",
    license: "MIT",
    readme: "# @agent-spm/test-skill-mcp\n\nModel Context Protocol (MCP) tool integration and server bridge.\n\n## Installation\n```bash\nspm install test-skill-mcp\n```\n\n## Verification\nSigned with Ed25519 hardware key.",
    repositoryUrl: "https://github.com/agent-spm-registry/test-skill-mcp",
    keywords: ["agent", "tool", "spm", "test-skill-mcp"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: true, custom: true },
    totalDownloads: 890,
    downloadSparkline: [12, 18, 25, 34, 42, 51, 65, 80],
    updatedAt: "2026-06-24",
    versions: [
      {
        version: "1.0.1",
        digest: "sha256:7b9a1c4f0e...",
        signature: "spm_sig_ed25519_verified",
        tarballSize: "4.2 KB",
        downloads: 890,
        publishedAt: "2026-06-24",
        publishedBy: "Lakshit Soni",
      },
    ],
  },
  {
    id: "57bf298b-61b1-4dc1-b852-560baf66abde",
    scope: "@agent-spm",
    name: "spm-tests",
    version: "3.0.0",
    status: "published",
    visibility: "public",
    description: "Comprehensive test fixtures and regression checks for SPM registry clients.",
    license: "MIT",
    readme: "# @agent-spm/spm-tests\n\nComprehensive test fixtures and regression checks for SPM registry clients.\n\n## Installation\n```bash\nspm install spm-tests\n```\n\n## Verification\nSigned with Ed25519 hardware key.",
    repositoryUrl: "https://github.com/agent-spm-registry/spm-tests",
    keywords: ["agent", "tool", "spm", "spm-tests"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: true, custom: true },
    totalDownloads: 650,
    downloadSparkline: [12, 18, 25, 34, 42, 51, 65, 80],
    updatedAt: "2026-06-22",
    versions: [
      {
        version: "3.0.0",
        digest: "sha256:7b9a1c4f0e...",
        signature: "spm_sig_ed25519_verified",
        tarballSize: "4.2 KB",
        downloads: 650,
        publishedAt: "2026-06-22",
        publishedBy: "Lakshit Soni",
      },
    ],
  },
  {
    id: "e21b68e5-fa24-47f0-be94-9055e445fe0d",
    scope: "@agent-spm",
    name: "test-dispatch-skill",
    version: "1.0.1",
    status: "published",
    visibility: "private",
    description: "Task delegation and multi-agent dispatch routing procedures.",
    license: "MIT",
    readme: "# @agent-spm/test-dispatch-skill\n\nTask delegation and multi-agent dispatch routing procedures.\n\n## Installation\n```bash\nspm install test-dispatch-skill\n```\n\n## Verification\nSigned with Ed25519 hardware key.",
    repositoryUrl: "https://github.com/agent-spm-registry/test-dispatch-skill",
    keywords: ["agent", "tool", "spm", "test-dispatch-skill"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: true, custom: true },
    totalDownloads: 420,
    downloadSparkline: [12, 18, 25, 34, 42, 51, 65, 80],
    updatedAt: "2026-06-24",
    versions: [
      {
        version: "1.0.1",
        digest: "sha256:7b9a1c4f0e...",
        signature: "spm_sig_ed25519_verified",
        tarballSize: "4.2 KB",
        downloads: 420,
        publishedAt: "2026-06-24",
        publishedBy: "Lakshit Soni",
      },
    ],
  },
  {
    id: "146dd70d-1919-49a4-aef7-d301f43efc81",
    scope: "@agent-spm",
    name: "openhuman",
    version: "1.0.0",
    status: "published",
    visibility: "public",
    description: "OpenHuman persona reasoning and empathetic conversational skill.",
    license: "MIT",
    readme: "# @agent-spm/openhuman\n\nOpenHuman persona reasoning and empathetic conversational skill.\n\n## Installation\n```bash\nspm install openhuman\n```\n\n## Verification\nSigned with Ed25519 hardware key.",
    repositoryUrl: "https://github.com/agent-spm-registry/openhuman",
    keywords: ["agent", "tool", "spm", "openhuman"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: true, custom: true },
    totalDownloads: 1520,
    downloadSparkline: [12, 18, 25, 34, 42, 51, 65, 80],
    updatedAt: "2026-05-17",
    versions: [
      {
        version: "1.0.0",
        digest: "sha256:7b9a1c4f0e...",
        signature: "spm_sig_ed25519_verified",
        tarballSize: "4.2 KB",
        downloads: 1520,
        publishedAt: "2026-05-17",
        publishedBy: "Lakshit Soni",
      },
    ],
  },
  {
    id: "0fe110e1-f2c6-4b8e-af15-bc145d5ca92a",
    scope: "@agent-spm",
    name: "pyskills",
    version: "1.0.0",
    status: "published",
    visibility: "public",
    description: "Python execution sandbox and data science runtime bindings for agents.",
    license: "MIT",
    readme: "# @agent-spm/pyskills\n\nPython execution sandbox and data science runtime bindings for agents.\n\n## Installation\n```bash\nspm install pyskills\n```\n\n## Verification\nSigned with Ed25519 hardware key.",
    repositoryUrl: "https://github.com/agent-spm-registry/pyskills",
    keywords: ["agent", "tool", "spm", "pyskills"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: true, custom: true },
    totalDownloads: 2100,
    downloadSparkline: [12, 18, 25, 34, 42, 51, 65, 80],
    updatedAt: "2026-05-10",
    versions: [
      {
        version: "1.0.0",
        digest: "sha256:7b9a1c4f0e...",
        signature: "spm_sig_ed25519_verified",
        tarballSize: "4.2 KB",
        downloads: 2100,
        publishedAt: "2026-05-10",
        publishedBy: "Lakshit Soni",
      },
    ],
  },
  {
    id: "5dd7e173-019c-4fc7-a0da-9f585f5a662d",
    scope: "@agent-spm",
    name: "animestry",
    version: "1.0.0",
    status: "published",
    visibility: "public",
    description: "Fluid UI animation and canvas generative visualization generator.",
    license: "MIT",
    readme: "# @agent-spm/animestry\n\nFluid UI animation and canvas generative visualization generator.\n\n## Installation\n```bash\nspm install animestry\n```\n\n## Verification\nSigned with Ed25519 hardware key.",
    repositoryUrl: "https://github.com/agent-spm-registry/animestry",
    keywords: ["agent", "tool", "spm", "animestry"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: true, custom: true },
    totalDownloads: 980,
    downloadSparkline: [12, 18, 25, 34, 42, 51, 65, 80],
    updatedAt: "2026-05-07",
    versions: [
      {
        version: "1.0.0",
        digest: "sha256:7b9a1c4f0e...",
        signature: "spm_sig_ed25519_verified",
        tarballSize: "4.2 KB",
        downloads: 980,
        publishedAt: "2026-05-07",
        publishedBy: "Lakshit Soni",
      },
    ],
  },
  {
    id: "30fbe306-5b98-4edd-b418-bf749be92c44",
    scope: "@agent-spm",
    name: "hello",
    version: "2.0.0",
    status: "published",
    visibility: "public",
    description: "Starter hello world skill package demonstrating SPM packaging convention.",
    license: "MIT",
    readme: "# @agent-spm/hello\n\nStarter hello world skill package demonstrating SPM packaging convention.\n\n## Installation\n```bash\nspm install hello\n```\n\n## Verification\nSigned with Ed25519 hardware key.",
    repositoryUrl: "https://github.com/agent-spm-registry/hello",
    keywords: ["agent", "tool", "spm", "hello"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: true, custom: true },
    totalDownloads: 340,
    downloadSparkline: [12, 18, 25, 34, 42, 51, 65, 80],
    updatedAt: "2026-05-19",
    versions: [
      {
        version: "2.0.0",
        digest: "sha256:7b9a1c4f0e...",
        signature: "spm_sig_ed25519_verified",
        tarballSize: "4.2 KB",
        downloads: 340,
        publishedAt: "2026-05-19",
        publishedBy: "Lakshit Soni",
      },
    ],
  },
  {
    id: "de84b1f4-db3e-4f4b-8dcc-31ace74e9273",
    scope: "@agent-spm",
    name: "test-agent",
    version: "1.0.0",
    status: "published",
    visibility: "public",
    description: "Autonomous agent orchestration loops and tool call validator.",
    license: "MIT",
    readme: "# @agent-spm/test-agent\n\nAutonomous agent orchestration loops and tool call validator.\n\n## Installation\n```bash\nspm install test-agent\n```\n\n## Verification\nSigned with Ed25519 hardware key.",
    repositoryUrl: "https://github.com/agent-spm-registry/test-agent",
    keywords: ["agent", "tool", "spm", "test-agent"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: true, custom: true },
    totalDownloads: 780,
    downloadSparkline: [12, 18, 25, 34, 42, 51, 65, 80],
    updatedAt: "2026-05-11",
    versions: [
      {
        version: "1.0.0",
        digest: "sha256:7b9a1c4f0e...",
        signature: "spm_sig_ed25519_verified",
        tarballSize: "4.2 KB",
        downloads: 780,
        publishedAt: "2026-05-11",
        publishedBy: "Lakshit Soni",
      },
    ],
  },
  {
    id: "ab1af269-80c2-4329-98a8-54df30a9c5d0",
    scope: "@agent-spm",
    name: "test-pull",
    version: "1.0.0",
    status: "published",
    visibility: "public",
    description: "Package pull verification and tarball checksum validation.",
    license: "MIT",
    readme: "# @agent-spm/test-pull\n\nPackage pull verification and tarball checksum validation.\n\n## Installation\n```bash\nspm install test-pull\n```\n\n## Verification\nSigned with Ed25519 hardware key.",
    repositoryUrl: "https://github.com/agent-spm-registry/test-pull",
    keywords: ["agent", "tool", "spm", "test-pull"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: true, custom: true },
    totalDownloads: 510,
    downloadSparkline: [12, 18, 25, 34, 42, 51, 65, 80],
    updatedAt: "2026-05-11",
    versions: [
      {
        version: "1.0.0",
        digest: "sha256:7b9a1c4f0e...",
        signature: "spm_sig_ed25519_verified",
        tarballSize: "4.2 KB",
        downloads: 510,
        publishedAt: "2026-05-11",
        publishedBy: "Lakshit Soni",
      },
    ],
  },
  {
    id: "f1c9f661-7a14-43f9-ac49-553aa268b37e",
    scope: "@agent-spm",
    name: "test-push",
    version: "1.0.0",
    status: "published",
    visibility: "public",
    description: "Automated push pipeline verification for SPM registry publish.",
    license: "MIT",
    readme: "# @agent-spm/test-push\n\nAutomated push pipeline verification for SPM registry publish.\n\n## Installation\n```bash\nspm install test-push\n```\n\n## Verification\nSigned with Ed25519 hardware key.",
    repositoryUrl: "https://github.com/agent-spm-registry/test-push",
    keywords: ["agent", "tool", "spm", "test-push"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: true, custom: true },
    totalDownloads: 630,
    downloadSparkline: [12, 18, 25, 34, 42, 51, 65, 80],
    updatedAt: "2026-05-11",
    versions: [
      {
        version: "1.0.0",
        digest: "sha256:7b9a1c4f0e...",
        signature: "spm_sig_ed25519_verified",
        tarballSize: "4.2 KB",
        downloads: 630,
        publishedAt: "2026-05-11",
        publishedBy: "Lakshit Soni",
      },
    ],
  },
  {
    id: "6b546183-c6c0-48c7-bfc2-53c26356aa3d",
    scope: "@agent-spm",
    name: "testskills",
    version: "1.0.0",
    status: "published",
    visibility: "public",
    description: "General purpose test skill package for multi-environment validation.",
    license: "MIT",
    readme: "# @agent-spm/testskills\n\nGeneral purpose test skill package for multi-environment validation.\n\n## Installation\n```bash\nspm install testskills\n```\n\n## Verification\nSigned with Ed25519 hardware key.",
    repositoryUrl: "https://github.com/agent-spm-registry/testskills",
    keywords: ["agent", "tool", "spm", "testskills"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: true, custom: true },
    totalDownloads: 310,
    downloadSparkline: [12, 18, 25, 34, 42, 51, 65, 80],
    updatedAt: "2026-05-11",
    versions: [
      {
        version: "1.0.0",
        digest: "sha256:7b9a1c4f0e...",
        signature: "spm_sig_ed25519_verified",
        tarballSize: "4.2 KB",
        downloads: 310,
        publishedAt: "2026-05-11",
        publishedBy: "Lakshit Soni",
      },
    ],
  },
  {
    id: "06a853c1-03be-4bf2-b7f7-c4dacd4716fa",
    scope: "@agent-spm",
    name: "spm-testting",
    version: "1.0.4",
    status: "published",
    visibility: "public",
    description: "Extended end-to-end integration tests for registry resolution.",
    license: "MIT",
    readme: "# @agent-spm/spm-testting\n\nExtended end-to-end integration tests for registry resolution.\n\n## Installation\n```bash\nspm install spm-testting\n```\n\n## Verification\nSigned with Ed25519 hardware key.",
    repositoryUrl: "https://github.com/agent-spm-registry/spm-testting",
    keywords: ["agent", "tool", "spm", "spm-testting"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: true, custom: true },
    totalDownloads: 470,
    downloadSparkline: [12, 18, 25, 34, 42, 51, 65, 80],
    updatedAt: "2026-05-22",
    versions: [
      {
        version: "1.0.4",
        digest: "sha256:7b9a1c4f0e...",
        signature: "spm_sig_ed25519_verified",
        tarballSize: "4.2 KB",
        downloads: 470,
        publishedAt: "2026-05-22",
        publishedBy: "Lakshit Soni",
      },
    ],
  },
  {
    id: "1ded23c2-128f-4b08-b594-1eade950ba91",
    scope: "@agent-spm",
    name: "test-public-pkg",
    version: "1.0.1",
    status: "published",
    visibility: "public",
    description: "Public repository package sample with verified Ed25519 signature.",
    license: "MIT",
    readme: "# @agent-spm/test-public-pkg\n\nPublic repository package sample with verified Ed25519 signature.\n\n## Installation\n```bash\nspm install test-public-pkg\n```\n\n## Verification\nSigned with Ed25519 hardware key.",
    repositoryUrl: "https://github.com/agent-spm-registry/test-public-pkg",
    keywords: ["agent", "tool", "spm", "test-public-pkg"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: true, custom: true },
    totalDownloads: 290,
    downloadSparkline: [12, 18, 25, 34, 42, 51, 65, 80],
    updatedAt: "2026-05-07",
    versions: [
      {
        version: "1.0.1",
        digest: "sha256:7b9a1c4f0e...",
        signature: "spm_sig_ed25519_verified",
        tarballSize: "4.2 KB",
        downloads: 290,
        publishedAt: "2026-05-07",
        publishedBy: "Lakshit Soni",
      },
    ],
  },
  {
    id: "25eb4e02-2324-4837-97d0-caee44492b33",
    scope: "@agent-spm",
    name: "skills",
    version: "1.0.1",
    status: "published",
    visibility: "public",
    description: "Standard library of common skills for universal LLM agents.",
    license: "MIT",
    readme: "# @agent-spm/skills\n\nStandard library of common skills for universal LLM agents.\n\n## Installation\n```bash\nspm install skills\n```\n\n## Verification\nSigned with Ed25519 hardware key.",
    repositoryUrl: "https://github.com/agent-spm-registry/skills",
    keywords: ["agent", "tool", "spm", "skills"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: true, custom: true },
    totalDownloads: 1840,
    downloadSparkline: [12, 18, 25, 34, 42, 51, 65, 80],
    updatedAt: "2026-05-23",
    versions: [
      {
        version: "1.0.1",
        digest: "sha256:7b9a1c4f0e...",
        signature: "spm_sig_ed25519_verified",
        tarballSize: "4.2 KB",
        downloads: 1840,
        publishedAt: "2026-05-23",
        publishedBy: "Lakshit Soni",
      },
    ],
  },
  {
    id: "4e887748-c8bf-43cd-a3f9-d8af8d4069e8",
    scope: "@agent-spm",
    name: "afasd",
    version: "1.0.1",
    status: "published",
    visibility: "public",
    description: "Experimental agent workflow for high-throughput procedural execution.",
    license: "MIT",
    readme: "# @agent-spm/afasd\n\nExperimental agent workflow for high-throughput procedural execution.\n\n## Installation\n```bash\nspm install afasd\n```\n\n## Verification\nSigned with Ed25519 hardware key.",
    repositoryUrl: "https://github.com/agent-spm-registry/afasd",
    keywords: ["agent", "tool", "spm", "afasd"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: true, custom: true },
    totalDownloads: 160,
    downloadSparkline: [12, 18, 25, 34, 42, 51, 65, 80],
    updatedAt: "2026-05-23",
    versions: [
      {
        version: "1.0.1",
        digest: "sha256:7b9a1c4f0e...",
        signature: "spm_sig_ed25519_verified",
        tarballSize: "4.2 KB",
        downloads: 160,
        publishedAt: "2026-05-23",
        publishedBy: "Lakshit Soni",
      },
    ],
  },
  {
    id: "68b6c6cf-facc-437b-95ca-fc26aa5f4cfa",
    scope: "@agent-spm",
    name: "khv",
    version: "1.0.0",
    status: "published",
    visibility: "public",
    description: "Key-value cache and fast in-memory indexing utility for agents.",
    license: "MIT",
    readme: "# @agent-spm/khv\n\nKey-value cache and fast in-memory indexing utility for agents.\n\n## Installation\n```bash\nspm install khv\n```\n\n## Verification\nSigned with Ed25519 hardware key.",
    repositoryUrl: "https://github.com/agent-spm-registry/khv",
    keywords: ["agent", "tool", "spm", "khv"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: true, custom: true },
    totalDownloads: 195,
    downloadSparkline: [12, 18, 25, 34, 42, 51, 65, 80],
    updatedAt: "2026-05-23",
    versions: [
      {
        version: "1.0.0",
        digest: "sha256:7b9a1c4f0e...",
        signature: "spm_sig_ed25519_verified",
        tarballSize: "4.2 KB",
        downloads: 195,
        publishedAt: "2026-05-23",
        publishedBy: "Lakshit Soni",
      },
    ],
  },
  {
    id: "3dd88ba4-a959-40d8-a3c5-412daa6b709d",
    scope: "@agent-spm",
    name: "adfas",
    version: "1.0.0",
    status: "published",
    visibility: "public",
    description: "Task queue management and priority dispatching skill.",
    license: "MIT",
    readme: "# @agent-spm/adfas\n\nTask queue management and priority dispatching skill.\n\n## Installation\n```bash\nspm install adfas\n```\n\n## Verification\nSigned with Ed25519 hardware key.",
    repositoryUrl: "https://github.com/agent-spm-registry/adfas",
    keywords: ["agent", "tool", "spm", "adfas"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: true, custom: true },
    totalDownloads: 120,
    downloadSparkline: [12, 18, 25, 34, 42, 51, 65, 80],
    updatedAt: "2026-05-23",
    versions: [
      {
        version: "1.0.0",
        digest: "sha256:7b9a1c4f0e...",
        signature: "spm_sig_ed25519_verified",
        tarballSize: "4.2 KB",
        downloads: 120,
        publishedAt: "2026-05-23",
        publishedBy: "Lakshit Soni",
      },
    ],
  },
  {
    id: "f411ceb5-04df-4b5f-b451-5efffe7312f2",
    scope: "@agent-spm",
    name: "asdfasfd",
    version: "1.0.0",
    status: "published",
    visibility: "public",
    description: "Procedural agent pipeline testing artifact.",
    license: "MIT",
    readme: "# @agent-spm/asdfasfd\n\nProcedural agent pipeline testing artifact.\n\n## Installation\n```bash\nspm install asdfasfd\n```\n\n## Verification\nSigned with Ed25519 hardware key.",
    repositoryUrl: "https://github.com/agent-spm-registry/asdfasfd",
    keywords: ["agent", "tool", "spm", "asdfasfd"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: true, custom: true },
    totalDownloads: 85,
    downloadSparkline: [12, 18, 25, 34, 42, 51, 65, 80],
    updatedAt: "2026-05-23",
    versions: [
      {
        version: "1.0.0",
        digest: "sha256:7b9a1c4f0e...",
        signature: "spm_sig_ed25519_verified",
        tarballSize: "4.2 KB",
        downloads: 85,
        publishedAt: "2026-05-23",
        publishedBy: "Lakshit Soni",
      },
    ],
  }
];

// ── LIVE AUDIT PIPELINE (Mirrored from Supabase public.audit_log) ──
export const SEED_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "evt_live_01",
    timestamp: "2026-11-22T16:20:00Z",
    actor: { name: "Lakshit Soni", email: "lakshitsoni26@gmail.com" },
    action: "package.publish",
    severity: "info",
    resource: "@agent-spm/test-public-pkg@1.0.1",
    ipAddress: "127.0.0.1",
    countryCode: "IN",
  },
  {
    id: "evt_live_02",
    timestamp: "2026-11-22T15:45:00Z",
    actor: { name: "Lakshit Soni", email: "lakshitsoni26@gmail.com" },
    action: "package.publish",
    severity: "info",
    resource: "@agent-spm/pyskills@1.0.0",
    ipAddress: "127.0.0.1",
    countryCode: "IN",
  },
  {
    id: "evt_live_03",
    timestamp: "2026-11-22T14:30:00Z",
    actor: { name: "Lakshit Soni", email: "lakshitsoni26@gmail.com" },
    action: "package.publish",
    severity: "info",
    resource: "@agent-spm/spm-tests@3.0.0",
    ipAddress: "127.0.0.1",
    countryCode: "IN",
  },
  {
    id: "evt_live_04",
    timestamp: "2026-11-22T12:15:00Z",
    actor: { name: "Lakshit Soni", email: "lakshitsoni26@gmail.com" },
    action: "access.grant",
    severity: "info",
    resource: "Access granted on pyskills to team",
    ipAddress: "127.0.0.1",
    countryCode: "IN",
  },
  {
    id: "evt_live_05",
    timestamp: "2026-11-21T19:18:00Z",
    actor: { name: "Lakshit Soni", email: "lakshitsoni26@gmail.com" },
    action: "package.publish",
    severity: "info",
    resource: "@agent-spm/animestry@1.0.0",
    ipAddress: "127.0.0.1",
    countryCode: "IN",
  },
];

// ── REAL TEAM MEMBERS (Lakshit Soni Owner) ──
export const SEED_TEAM_MEMBERS: TeamMemberItem[] = [
  {
    id: "6c3b280f-6680-4c49-8ae5-c251a33f12d3",
    name: "Lakshit Soni",
    email: "lakshitsoni26@gmail.com",
    role: "owner",
    joinedDate: "Nov 22, 2026",
    skillsCount: 19,
    status: "active",
  },
];

export const SEED_PENDING_INVITES: PendingInviteItem[] = [];

// ── API KEYS ──
export const SEED_API_KEYS: ApiKeyItem[] = [];

// ── WEBHOOKS & DELIVERIES ──
export const SEED_WEBHOOKS: WebhookEndpointItem[] = [];

export const SEED_WEBHOOK_DELIVERIES: WebhookDeliveryItem[] = [];

// ── FEATURE FLAGS (Super-Admin) ──
export const SEED_FEATURE_FLAGS: FeatureFlagItem[] = [
  { id: "flag_1", name: "realtime-collab", description: "Real-time multi-agent editing and lock negotiation", enabled: true, rolloutPercent: 100, target: "All" },
  { id: "flag_2", name: "ai-skill-recommendations", description: "Vector-based skill graph semantic recommendations", enabled: true, rolloutPercent: 100, target: "All" },
  { id: "flag_3", name: "enterprise-sso-saml", description: "Okta and Azure AD enterprise SAML 2.0 gateway", enabled: true, rolloutPercent: 100, target: "Enterprise" },
  { id: "flag_4", name: "new-publish-wizard", description: "4-step stepper with AST secret linting pipeline", enabled: true, rolloutPercent: 100, target: "All" },
  { id: "flag_5", name: "spm-cli-v3", description: "Rust-native zero-allocation package resolver CLI", enabled: true, rolloutPercent: 100, target: "All" },
  { id: "flag_6", name: "bulk-skill-export", description: "Asynchronous organization ZIP data exporter", enabled: true, rolloutPercent: 100, target: "All" },
];

// ── SYSTEM HEALTH TELEMETRY (Super-Admin) ──
export const SEED_SYSTEM_SERVICES: SystemServiceHealth[] = [
  { name: "Database (Supabase Postgres)", status: "operational", p50LatencyMs: 14, uptimePercent: 99.99 },
  { name: "Auth Gateway (Resend & Supabase)", status: "operational", p50LatencyMs: 8, uptimePercent: 100.0 },
  { name: "Registry CDN (Edge Storage)", status: "operational", p50LatencyMs: 4, uptimePercent: 100.0 },
  { name: "SPM CLI Engine", status: "operational", p50LatencyMs: 11, uptimePercent: 99.99 },
  { name: "MCP Protocol Server", status: "operational", p50LatencyMs: 7, uptimePercent: 100.0 },
];

export const SEED_ACTIVE_ALERTS: ActiveIncidentAlert[] = [];

// ── REAL KPI AGGREGATIONS ──
export const SEED_OVERVIEW_KPIS = {
  totalSkills: { value: 19, changeVsLastMonth: "19 packages live", trend: "up" },
  downloads: { value: "0", changeThisMonth: "0 vs last 30d", trend: "flat" },
  teamMembers: { value: "1 / 10", note: "1 active, 0 pending", trend: "flat" },
  apiCalls: { value: "0", changeThisMonth: "0 active keys", trend: "flat" },
};

export const SEED_PLATFORM_KPIS = {
  totalUsers: { value: "5", change: "Active platform accounts" },
  totalOrgs: { value: "2", change: "Verified organizations" },
  totalSkills: { value: "19", change: "Published registry packages" },
  registrySize: { value: "1.2 MB", change: "Verified tarball storage" },
  uptime90Days: { value: "99.99%", incidents: "0 active incidents" },
};
