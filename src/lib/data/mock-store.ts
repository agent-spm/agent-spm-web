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
  details?: Record<string, any>;
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

// ── SEED ORGANIZATIONS ──
export const SEED_ORGANIZATIONS: Organization[] = [
  {
    id: "org_acme_labs",
    slug: "@acme-labs",
    name: "Acme Labs",
    plan: "pro",
    seatsUsed: 8, // 6 active + 2 pending
    seatsAllowed: 10,
    skillsCount: 12,
    skillsAllowed: 50,
    registryVersion: "v1.2.4",
    createdAt: "2026-01-15T08:00:00Z",
  },
  {
    id: "org_acme_enterprise",
    slug: "@acme-enterprise",
    name: "Acme Enterprise Global",
    plan: "enterprise",
    seatsUsed: 42,
    seatsAllowed: 9999,
    skillsCount: 128,
    skillsAllowed: 9999,
    registryVersion: "v1.2.4",
    createdAt: "2025-08-10T08:00:00Z",
  },
  {
    id: "org_personal_lab",
    slug: "@personal-dev",
    name: "Personal Workspace",
    plan: "free",
    seatsUsed: 1,
    seatsAllowed: 3,
    skillsCount: 3,
    skillsAllowed: 5,
    registryVersion: "v1.2.4",
    createdAt: "2026-03-01T08:00:00Z",
  },
];

// ── AVAILABLE PERSONAS FOR LOCAL DEMO SWITCHER ──
export const AVAILABLE_PERSONAS: Record<string, UserPersona> = {
  owner: {
    id: "usr_owner_alex",
    name: "Alex Chen",
    email: "alex@acme.labs",
    role: "owner",
    orgId: "org_acme_labs",
    isStaff: false,
    plan: "pro",
  },
  admin: {
    id: "usr_admin_sarah",
    name: "Sarah Lin",
    email: "sarah@acme.labs",
    role: "admin",
    orgId: "org_acme_labs",
    isStaff: false,
    plan: "pro",
  },
  member: {
    id: "usr_member_david",
    name: "David Kim",
    email: "david@acme.labs",
    role: "member",
    orgId: "org_acme_labs",
    isStaff: false,
    plan: "pro",
  },
  viewer: {
    id: "usr_viewer_elena",
    name: "Elena Rostova",
    email: "elena@acme.labs",
    role: "viewer",
    orgId: "org_personal_lab",
    isStaff: false,
    plan: "free",
  },
  enterprise_admin: {
    id: "usr_ent_admin",
    name: "Marcus Vance",
    email: "marcus.v@acme.corp",
    role: "owner",
    orgId: "org_acme_enterprise",
    isStaff: false,
    plan: "enterprise",
  },
  superadmin: {
    id: "usr_staff_root",
    name: "Staff Admin",
    email: "root@agent-spm.com",
    role: "owner",
    orgId: "org_acme_enterprise",
    isStaff: true,
    plan: "enterprise",
  },
};

// ── SEED SKILLS (12 skills matching PDF guide requirements) ──
export const SEED_SKILLS: Skill[] = [
  {
    id: "skl_browser_tools",
    scope: "@acme-labs",
    name: "browser-tools",
    version: "1.2.0",
    status: "published",
    visibility: "public",
    description: "Autonomous browser interaction, dom inspection, and high-fidelity screenshot pipeline.",
    license: "MIT",
    readme: `# @acme-labs/browser-tools

Empower your AI agents to interact directly with web applications using headless Chrome and Playwright.

## Capabilities
- 1-click snapshot rendering
- DOM tree exploration and element bounding box calculation
- Real-time cookie and local-storage injection
- Session replay and synthetic user interaction

## Usage
\`\`\`typescript
import { BrowserSkill } from "@acme-labs/browser-tools";

const browser = new BrowserSkill({ headless: true });
await browser.navigate("https://app.acme.labs");
const screenshot = await browser.captureScreen();
\`\`\`

## Authentication
Requires standard Chromium binary or configured \`CHROME_REMOTE_DEBUGGING_PORT\`.`,
    repositoryUrl: "https://github.com/acme-labs/browser-tools",
    keywords: ["browser", "playwright", "automation", "dom", "headless"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: true },
    totalDownloads: 142850,
    downloadSparkline: [2100, 2400, 2900, 3100, 3400, 4200, 4800, 5100, 5600, 6200, 7100, 7800, 8500, 9400],
    updatedAt: "2 hours ago",
    versions: [
      {
        version: "1.2.0",
        digest: "sha256:4a8b79e2c10b4f3a8d9e2b1c4e7f8a9d0b1c2e3f4a5b6c7d8e9f0a1b2c3d4e5f",
        signature: "spm_sig_ed25519:7b1e4a...",
        tarballSize: "142 KB",
        downloads: 48200,
        publishedAt: "2026-11-06T14:20:00Z",
        publishedBy: "Alex Chen",
        changelog: "Added support for Chrome DevTools Protocol v128 and reduced memory footprint.",
      },
      {
        version: "1.1.2",
        digest: "sha256:9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d",
        signature: "spm_sig_ed25519:3c2f1a...",
        tarballSize: "138 KB",
        downloads: 94650,
        publishedAt: "2026-10-18T09:10:00Z",
        publishedBy: "Sarah Lin",
        changelog: "Fixed viewport emulation on retina displays.",
      },
    ],
  },
  {
    id: "skl_code_analysis",
    scope: "@acme-labs",
    name: "code-analysis",
    version: "0.9.4",
    status: "published",
    visibility: "private",
    description: "Deep AST parsing, symbol resolution, and lint rule generation for multi-repo agent codebases.",
    license: "Apache-2.0",
    readme: `# @acme-labs/code-analysis\n\nEnterprise semantic AST indexing and lint enforcement for proprietary internal libraries.`,
    repositoryUrl: "https://github.com/acme-labs/code-analysis",
    keywords: ["ast", "typescript", "lint", "codebase"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: false },
    totalDownloads: 89400,
    downloadSparkline: [1200, 1400, 1600, 1900, 2100, 2400, 2600, 2900, 3100, 3500, 3800, 4100, 4500, 4900],
    updatedAt: "1 day ago",
    versions: [
      {
        version: "0.9.4",
        digest: "sha256:1a2b3c4d...",
        signature: "spm_sig_ed25519:4d3c2b...",
        tarballSize: "284 KB",
        downloads: 89400,
        publishedAt: "2026-11-05T11:00:00Z",
        publishedBy: "Sarah Lin",
      },
    ],
  },
  {
    id: "skl_slack_notifier",
    scope: "@acme-labs",
    name: "slack-notifier",
    version: "2.1.0",
    status: "published",
    visibility: "public",
    description: "Multi-channel Slack interactive block builder and incident alerting integration.",
    license: "MIT",
    readme: `# @acme-labs/slack-notifier\n\nInstant block-kit formatting for autonomous agent status notifications.`,
    repositoryUrl: "https://github.com/acme-labs/slack-notifier",
    keywords: ["slack", "notifications", "alerts", "webhooks"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: true },
    totalDownloads: 64200,
    downloadSparkline: [900, 1100, 1300, 1500, 1700, 1900, 2100, 2300, 2600, 2900, 3200, 3600, 3900, 4200],
    updatedAt: "3 days ago",
    versions: [],
  },
  {
    id: "skl_sql_generator",
    scope: "@acme-labs",
    name: "sql-generator",
    version: "0.4.1",
    status: "published",
    visibility: "public",
    description: "Postgres and ClickHouse query synthesis with automated explain-plan optimization.",
    license: "MIT",
    readme: `# @acme-labs/sql-generator\n\nSynthesize parameterized SQL queries with safety AST validation.`,
    repositoryUrl: "https://github.com/acme-labs/sql-generator",
    keywords: ["sql", "postgres", "database", "analytics"],
    agentCompatibility: { gpt4: true, claude: true, gemini: false, llama: true },
    totalDownloads: 41800,
    downloadSparkline: [600, 750, 900, 1100, 1300, 1500, 1750, 2000, 2200, 2500, 2800, 3100, 3400, 3700],
    updatedAt: "4 days ago",
    versions: [],
  },
  {
    id: "skl_security_scanner",
    scope: "@acme-labs",
    name: "security-scanner",
    version: "1.0.2",
    status: "published",
    visibility: "private",
    description: "Static secret scanner and dependency vulnerability checker for agent tool calls.",
    license: "Proprietary",
    readme: `# @acme-labs/security-scanner\n\nScans input prompts and code outputs for secret leaks.`,
    keywords: ["security", "secrets", "audit"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: true },
    totalDownloads: 38900,
    downloadSparkline: [400, 550, 700, 900, 1100, 1300, 1600, 1900, 2200, 2600, 2900, 3300, 3700, 4100],
    updatedAt: "1 week ago",
    versions: [],
  },
  {
    id: "skl_pdf_extractor",
    scope: "@acme-labs",
    name: "pdf-extractor",
    version: "0.8.0",
    status: "published",
    visibility: "public",
    description: "Fast tabular extraction and semantic chunking for enterprise PDF documents.",
    license: "MIT",
    readme: `# @acme-labs/pdf-extractor\n\nOCR and tabular parsing for financial and legal reports.`,
    keywords: ["pdf", "ocr", "documents", "rag"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: true },
    totalDownloads: 29400,
    downloadSparkline: [300, 400, 550, 700, 850, 1000, 1200, 1400, 1650, 1900, 2200, 2500, 2800, 3100],
    updatedAt: "1 week ago",
    versions: [],
  },
  {
    id: "skl_github_agent",
    scope: "@acme-labs",
    name: "github-agent",
    version: "3.0.1",
    status: "published",
    visibility: "public",
    description: "Automated PR reviews, merge conflict resolutions, and CI status checks.",
    license: "Apache-2.0",
    readme: `# @acme-labs/github-agent\n\nGitHub API bindings for pull request automation.`,
    keywords: ["github", "pr", "review", "git"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: true },
    totalDownloads: 24100,
    downloadSparkline: [200, 300, 450, 600, 750, 900, 1100, 1300, 1500, 1750, 2000, 2300, 2600, 2900],
    updatedAt: "2 weeks ago",
    versions: [],
  },
  {
    id: "skl_figma_tokens",
    scope: "@acme-labs",
    name: "figma-tokens",
    version: "0.3.0-beta",
    status: "draft",
    visibility: "private",
    description: "Sync design variables directly from Figma files into Tailwind CSS and React themes.",
    license: "MIT",
    readme: `# @acme-labs/figma-tokens\n\nPre-release draft package for design token synchronization.`,
    keywords: ["figma", "tokens", "design-system"],
    agentCompatibility: { gpt4: true, claude: false, gemini: false, llama: false },
    totalDownloads: 0,
    downloadSparkline: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    updatedAt: "4 hours ago",
    versions: [],
  },
  {
    id: "skl_voice_transcriber",
    scope: "@acme-labs",
    name: "voice-transcriber",
    version: "0.1.0-alpha",
    status: "draft",
    visibility: "private",
    description: "Streaming audio transcription using Whisper with real-time speaker diarization.",
    license: "MIT",
    readme: `# @acme-labs/voice-transcriber\n\nAlpha release for real-time speech-to-text.`,
    keywords: ["audio", "speech", "whisper", "voice"],
    agentCompatibility: { gpt4: false, claude: true, gemini: true, llama: false },
    totalDownloads: 0,
    downloadSparkline: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    updatedAt: "yesterday",
    versions: [],
  },
  {
    id: "skl_legacy_crawler",
    scope: "@acme-labs",
    name: "legacy-crawler",
    version: "0.2.1",
    status: "deprecated",
    visibility: "public",
    description: "Deprecated puppeteer scraper. Superseded by @acme-labs/browser-tools.",
    license: "MIT",
    readme: `# @acme-labs/legacy-crawler\n\n⚠️ **DEPRECATION NOTICE**: Please migrate to \`@acme-labs/browser-tools\`.`,
    keywords: ["crawler", "legacy", "deprecated"],
    agentCompatibility: { gpt4: false, claude: false, gemini: false, llama: false },
    totalDownloads: 12400,
    downloadSparkline: [1800, 1700, 1500, 1300, 1100, 950, 800, 650, 500, 400, 300, 200, 100, 50],
    updatedAt: "1 month ago",
    versions: [],
  },
  {
    id: "skl_deprecated_auth",
    scope: "@acme-labs",
    name: "deprecated-auth",
    version: "0.1.4",
    status: "deprecated",
    visibility: "private",
    description: "Legacy OAuth 1.0 client. Decommissioned in favor of modern SAML SSO.",
    license: "Proprietary",
    readme: `# @acme-labs/deprecated-auth\n\n⚠️ Deprecated auth library. Do not use for new implementations.`,
    keywords: ["auth", "oauth1", "deprecated"],
    agentCompatibility: { gpt4: false, claude: false, gemini: false, llama: false },
    totalDownloads: 3400,
    downloadSparkline: [600, 550, 500, 420, 380, 310, 260, 210, 160, 120, 80, 50, 30, 10],
    updatedAt: "2 months ago",
    versions: [],
  },
  {
    id: "skl_jira_sync",
    scope: "@acme-labs",
    name: "jira-sync",
    version: "1.1.0",
    status: "published",
    visibility: "private",
    description: "Bi-directional issue sync and sprint lifecycle management for engineering agents.",
    license: "MIT",
    readme: `# @acme-labs/jira-sync\n\nJira Cloud REST API wrapper for automated sprint tracking.`,
    keywords: ["jira", "atlassian", "tickets", "scrum"],
    agentCompatibility: { gpt4: true, claude: true, gemini: true, llama: true },
    totalDownloads: 18700,
    downloadSparkline: [250, 350, 500, 650, 800, 950, 1100, 1300, 1500, 1750, 2000, 2300, 2600, 2900],
    updatedAt: "3 weeks ago",
    versions: [],
  },
];

// ── UNIFIED EVENT PIPELINE (Feeds Overview Activity Feed + Enterprise Audit Log) ──
export const SEED_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "evt_001",
    timestamp: "2026-11-08T03:45:12Z",
    actor: { name: "Alex Chen", email: "alex@acme.labs" },
    action: "published",
    severity: "info",
    resource: "@acme-labs/browser-tools@1.2.0",
    ipAddress: "192.0.2.42",
    countryCode: "US",
  },
  {
    id: "evt_002",
    timestamp: "2026-11-08T02:18:04Z",
    actor: { name: "Sarah Lin", email: "sarah@acme.labs" },
    action: "created API key",
    severity: "info",
    resource: "spm_live_ci_publish_7b1e...",
    ipAddress: "198.51.100.23",
    countryCode: "DE",
  },
  {
    id: "evt_003",
    timestamp: "2026-11-07T21:30:19Z",
    actor: { name: "Alex Chen", email: "alex@acme.labs" },
    action: "invited",
    severity: "info",
    resource: "jordan@acme.labs to member",
    ipAddress: "192.0.2.42",
    countryCode: "US",
  },
  {
    id: "evt_004",
    timestamp: "2026-11-07T18:12:45Z",
    actor: { name: "David Kim", email: "david@acme.labs" },
    action: "logged in",
    severity: "info",
    resource: "SSO via Okta",
    ipAddress: "203.0.113.88",
    countryCode: "KR",
  },
  {
    id: "evt_005",
    timestamp: "2026-11-07T14:05:00Z",
    actor: { name: "System Pipeline", email: "bot@agent-spm.com" },
    action: "download milestone",
    severity: "info",
    resource: "@acme-labs/browser-tools crossed 100k downloads",
    ipAddress: "127.0.0.1",
    countryCode: "US",
  },
  {
    id: "evt_006",
    timestamp: "2026-11-07T11:40:22Z",
    actor: { name: "Alex Chen", email: "alex@acme.labs" },
    action: "changed role",
    severity: "warning",
    resource: "Elena Rostova to viewer",
    ipAddress: "192.0.2.42",
    countryCode: "US",
  },
  {
    id: "evt_007",
    timestamp: "2026-11-06T19:22:10Z",
    actor: { name: "Sarah Lin", email: "sarah@acme.labs" },
    action: "updated settings",
    severity: "info",
    resource: "Enforced 2FA grace period to 7 days",
    ipAddress: "198.51.100.23",
    countryCode: "DE",
  },
  {
    id: "evt_008",
    timestamp: "2026-11-06T16:04:31Z",
    actor: { name: "Security Watchdog", email: "security@agent-spm.com" },
    action: "login.suspicious",
    severity: "critical",
    resource: "Unrecognized ASN from 185.220.101.5",
    ipAddress: "185.220.101.5",
    countryCode: "RU",
  },
  {
    id: "evt_009",
    timestamp: "2026-11-05T09:12:00Z",
    actor: { name: "Sarah Lin", email: "sarah@acme.labs" },
    action: "deprecated",
    severity: "warning",
    resource: "@acme-labs/legacy-crawler@0.2.1",
    ipAddress: "198.51.100.23",
    countryCode: "DE",
  },
  {
    id: "evt_010",
    timestamp: "2026-11-04T12:00:00Z",
    actor: { name: "Alex Chen", email: "alex@acme.labs" },
    action: "deleted",
    severity: "critical",
    resource: "@acme-labs/scratch-experiment@0.0.1",
    ipAddress: "192.0.2.42",
    countryCode: "US",
  },
];

// ── TEAM MEMBERS (6 active + 2 pending = 8/10 seats) ──
export const SEED_TEAM_MEMBERS: TeamMemberItem[] = [
  { id: "tm_1", name: "Alex Chen", email: "alex@acme.labs", role: "owner", joinedDate: "Jan 15, 2026", skillsCount: 6, status: "active" },
  { id: "tm_2", name: "Sarah Lin", email: "sarah@acme.labs", role: "admin", joinedDate: "Feb 01, 2026", skillsCount: 4, status: "active" },
  { id: "tm_3", name: "David Kim", email: "david@acme.labs", role: "member", joinedDate: "Mar 10, 2026", skillsCount: 2, status: "active" },
  { id: "tm_4", name: "Maya Patel", email: "maya@acme.labs", role: "member", joinedDate: "Apr 04, 2026", skillsCount: 0, status: "active" },
  { id: "tm_5", name: "James Wu", email: "james@acme.labs", role: "member", joinedDate: "May 18, 2026", skillsCount: 0, status: "active" },
  { id: "tm_6", name: "Elena Rostova", email: "elena@acme.labs", role: "viewer", joinedDate: "Jun 22, 2026", skillsCount: 0, status: "active" },
];

export const SEED_PENDING_INVITES: PendingInviteItem[] = [
  { id: "inv_1", email: "jordan@acme.labs", role: "member", sentAgo: "2 days ago" },
  { id: "inv_2", email: "hannah@acme.labs", role: "member", sentAgo: "5 hours ago" },
];

// ── API KEYS ──
export const SEED_API_KEYS: ApiKeyItem[] = [
  { id: "key_1", name: "CI publish bot", prefix: "spm_live_9a8f...", type: "live", createdAt: "2026-09-12", lastUsed: "12 mins ago" },
  { id: "key_2", name: "local dev", prefix: "spm_live_3b7c...", type: "live", createdAt: "2026-10-01", lastUsed: "2 hours ago" },
  { id: "key_3", name: "read-only metrics", prefix: "spm_read_8d1e...", type: "read-only", createdAt: "2026-10-15", lastUsed: "Yesterday" },
  { id: "key_4", name: "staging deploy", prefix: "spm_live_4f2a...", type: "live", createdAt: "2026-11-01", lastUsed: "Never" },
];

// ── WEBHOOKS & DELIVERIES ──
export const SEED_WEBHOOKS: WebhookEndpointItem[] = [
  {
    id: "wh_1",
    url: "https://api.acme.labs/webhooks/spm",
    events: ["skill.published", "skill.deprecated", "team.member_added"],
    status: "Active",
    lastTriggered: "14 mins ago",
    lastStatusCode: 200,
  },
  {
    id: "wh_2",
    url: "https://slack.com/api/workflows/spm-bot",
    events: ["skill.published", "login.suspicious"],
    status: "Active",
    lastTriggered: "2 hours ago",
    lastStatusCode: 200,
  },
  {
    id: "wh_3",
    url: "https://internal-metrics.acme.corp/events",
    events: ["skill.deleted", "plan.upgraded"],
    status: "Failing",
    retryCount: 3,
    lastTriggered: "1 day ago",
    lastStatusCode: 502,
  },
];

export const SEED_WEBHOOK_DELIVERIES: WebhookDeliveryItem[] = [
  {
    id: "del_1",
    timestamp: "2026-11-08T03:45:12Z",
    event: "skill.published",
    statusCode: 200,
    latencyMs: 84,
    endpointUrl: "https://api.acme.labs/webhooks/spm",
    requestBody: JSON.stringify({ event: "skill.published", skill: "@acme-labs/browser-tools", version: "1.2.0", timestamp: "2026-11-08T03:45:12Z" }, null, 2),
    responseBody: JSON.stringify({ success: true, processedInMs: 42 }, null, 2),
  },
  {
    id: "del_2",
    timestamp: "2026-11-08T02:18:04Z",
    event: "api_key.created",
    statusCode: 200,
    latencyMs: 112,
    endpointUrl: "https://slack.com/api/workflows/spm-bot",
    requestBody: JSON.stringify({ event: "api_key.created", keyPrefix: "spm_live_9a8f...", actor: "sarah@acme.labs" }, null, 2),
    responseBody: JSON.stringify({ ok: true }, null, 2),
  },
  {
    id: "del_3",
    timestamp: "2026-11-07T14:05:00Z",
    event: "skill.deleted",
    statusCode: 502,
    latencyMs: 5012,
    endpointUrl: "https://internal-metrics.acme.corp/events",
    requestBody: JSON.stringify({ event: "skill.deleted", resource: "@acme-labs/scratch-experiment@0.0.1" }, null, 2),
    responseBody: "502 Bad Gateway: Upstream timeout after 5000ms",
  },
];

// ── FEATURE FLAGS (Super-Admin) ──
export const SEED_FEATURE_FLAGS: FeatureFlagItem[] = [
  { id: "flag_1", name: "realtime-collab", description: "Real-time multi-agent editing and lock negotiation", enabled: true, rolloutPercent: 100, target: "All" },
  { id: "flag_2", name: "ai-skill-recommendations", description: "Vector-based skill graph semantic recommendations", enabled: true, rolloutPercent: 50, target: "Pro and above" },
  { id: "flag_3", name: "enterprise-sso-saml", description: "Okta and Azure AD enterprise SAML 2.0 gateway", enabled: true, rolloutPercent: 100, target: "Enterprise" },
  { id: "flag_4", name: "new-publish-wizard", description: "4-step stepper with AST secret linting pipeline", enabled: true, rolloutPercent: 25, target: "Beta orgs" },
  { id: "flag_5", name: "spm-cli-v3", description: "Rust-native zero-allocation package resolver CLI", enabled: false, rolloutPercent: 0, target: "Off" },
  { id: "flag_6", name: "bulk-skill-export", description: "Asynchronous organization ZIP data exporter", enabled: true, rolloutPercent: 100, target: "Enterprise" },
];

// ── SYSTEM HEALTH TELEMETRY (Super-Admin) ──
export const SEED_SYSTEM_SERVICES: SystemServiceHealth[] = [
  { name: "API Gateway", status: "operational", p50LatencyMs: 12, uptimePercent: 99.99 },
  { name: "Registry CDN", status: "operational", p50LatencyMs: 6, uptimePercent: 100.0 },
  { name: "Edge Caching", status: "operational", p50LatencyMs: 4, uptimePercent: 99.99 },
  { name: "Database (Postgres)", status: "operational", p50LatencyMs: 18, uptimePercent: 99.95 },
  { name: "Job Queue (BullMQ)", status: "operational", p50LatencyMs: 9, uptimePercent: 99.99 },
  { name: "Search (Typesense)", status: "degraded", p50LatencyMs: 84, uptimePercent: 99.85 },
];

export const SEED_ACTIVE_ALERTS: ActiveIncidentAlert[] = [
  {
    id: "alt_1",
    severity: "warning",
    title: "Elevated Search Latency in EU-Central",
    details: "P95 query response time rose to 340ms due to cache warming re-index.",
    region: "eu-west-1",
    startTime: "42 mins ago",
    acknowledged: false,
  },
  {
    id: "alt_2",
    severity: "info",
    title: "Scheduled Secondary DB Failover Test",
    details: "Automated replica promotion readiness test scheduled for Sunday 02:00 UTC.",
    region: "us-east-1",
    startTime: "2 hours ago",
    acknowledged: true,
  },
];

// ── KPI AGGREGATIONS ──
export const SEED_OVERVIEW_KPIS = {
  totalSkills: { value: 12, changeVsLastMonth: "+2 this month", trend: "up" },
  downloads: { value: "368,450", changeThisMonth: "+18.4%", trend: "up" },
  teamMembers: { value: "8 / 10", note: "6 active, 2 pending", trend: "flat" },
  apiCalls: { value: "1.42 M", changeThisMonth: "+24.1%", trend: "up" },
};

export const SEED_PLATFORM_KPIS = {
  totalUsers: { value: "14,820", change: "+12.4% weekly" },
  totalOrgs: { value: "2,410", change: "+8.1% weekly" },
  totalSkills: { value: "48,910", change: "+15.2% weekly" },
  registrySize: { value: "4.82 TB", change: "+420 GB weekly" },
  uptime90Days: { value: "99.99%", incidents: "2 minor incidents" },
};
