<div align="center">
  <img src="public/images/blueLogo.png" alt="Agent SPM Logo" width="64" height="64" />
  <h1>Agent SPM (Skills Package Manager)</h1>
  <p><strong>The Universal Package Registry, MCP Runtime & Multi-Agent Orchestration Platform</strong></p>
  <p>
    <a href="https://github.com/agent-spm/agent-spm-web">
      <img src="https://img.shields.io/badge/Next.js-16.2.2-0070F3?style=flat-square&logo=next.js" alt="Next.js 16" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
    </a>
    <a href="https://tailwindcss.com/">
      <img src="https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
    </a>
    <a href="https://modelcontextprotocol.io/">
      <img src="https://img.shields.io/badge/MCP-Native-10B981?style=flat-square" alt="MCP Native" />
    </a>
    <a href="https://slsa.dev/">
      <img src="https://img.shields.io/badge/Security-SLSA_L3-8B5CF6?style=flat-square" alt="SLSA Level 3" />
    </a>
  </p>
</div>

---

## ⚡️ Overview

**Agent SPM Web** is the official web platform and registry for the Skills Package Manager. Built on Next.js 16 with Turbopack, it seamlessly bridges an ultra-fast, SEO-optimized public registry with an enterprise-grade multi-agent operations war room and platform administration console.

* Stop rebuilding procedural prompts and custom wrappers from scratch.
* Discover, evaluate, and test battle-tested AI agent skills in seconds.
* Run in-browser MCP tool executions without local setup.
* Wire skills into Cursor, Claude Desktop, LangGraph, and LlamaIndex with a single click.

---

## 💎 Key Platform Features

### 1. Public Registry & Discovery Hub
* **Curated Skill Bundles**: Fast-filter packages by operational domain—*Autonomous Web Agents*, *DevSecOps & Shield*, *Enterprise SQL & Data*, and *Vision & Multimodal*.
* **Keyboard-First Search & Quick-Peek**: Full arrow-key navigation (`↑` / `↓`) and Spacebar-activated slide-out **Quick-Peek Drawer** for rapid inspection without losing your search context.
* **In-Browser Live MCP Tool Playground**: Interactive execution harness supporting JSON Schema Draft 2020-12 parameter inputs, live stopwatch latency tracking, and a terminal-style bidirectional **JSON-RPC 2.0 wire inspector**.
* **1-Click Agent Runtime Connectors**: Instant configuration export for:
  * **Cursor**: `.cursor/mcp.json` with dynamic `${env:SPM_API_KEY}` interpolation and deep-link launcher.
  * **Claude Desktop**: `claude_desktop_config.json` with auto-detected OS paths.
  * **LangChain & LlamaIndex**: Copy-ready Python tool wrappers.
* **SPM Security Shield Scorecard**: 0–100 verified trust rating based on SLSA Level 3 provenance, static AST taint analysis (guarding against unauthorized networking, child processes, and filesystem escapes), and prompt injection resistance.

### 2. Multi-Agent Workspace Suite (`/app`)
* **Multi-Agent DAG Studio (`/app/skills/workspace`)**:
  * Interactive SVG/Canvas node-link orchestration graph connecting Agent Roles (e.g., *Triage Sentinel*, *Code Review Bot*) to SPM skill packages and tool leaves.
  * Live animated particle wires simulating active JSON-RPC channels.
  * 3-Way Mode Switcher: *Topology View*, *Live Traffic Simulation*, and *Blast Radius Heatmap*.
  * 1-Click export to **LangGraph Studio** (`langgraph.json`) and YAML manifests.
* **Live Agent Fleet War-Room (`/app/fleet`)**:
  * Real-time streaming tool execution monitor tracking 40+ active agent worker instances.
  * Top-ribbon telemetry: Active Workers, Throughput (calls/min), P95 Wire Latency, Hourly Token Burn, and Security Taint Shield.
  * Bidirectional JSON-RPC 2.0 wire drawer displaying raw payloads, caller metadata, and SLSA audit clearance.
* **Sawtooth Telemetry Charts**: Interactive `DownloadsOverTimeChart` with scrubbable timestamps, range selectors (`7D`, `30D`, `90D`, `1Y`), and floating inspection tooltips.
* **4-Step Publish Wizard (`/app/skills/publish`)**: Manifest validation, tarball inspection, pre-flight security scans, and automated release pipeline.
* **Enterprise Workspace Management**:
  * Team seat quotas and member invitations (`/app/team`).
  * API Key generator with fine-grained agent scopes and IP allowlists (`/app/settings`).
  * RFC 4180-compliant audit logs with real CSV & JSON SIEM ingestion exports (`/app/settings/audit`).
  * SAML 2.0 / SSO configuration and 2FA enforcement (`/app/settings/security`).
  * Fine-grained RBAC matrix and custom role designer (`/app/settings/access`).
  * Interactive Webhook Simulator with live ping test (`/app/settings/integrations`).

### 3. Super-Admin Control Plane (`/admin`)
* Dedicated platform governance suite with staff safety banners.
* **Tenant & User Oversight**: Cross-organization user directory with read-only tenant impersonation ("View As") and quota controls.
* **Quarantine Kill-Switch**: Emergency moderation action enabling instant global edge cache revocation and reinstatement for malicious or compromised skills.
* **Feature Flag Rollout Matrix**: Granular percentage sliders and rule-based targeting.
* **Global System Health**: Telemetry grid tracking cache hit ratios, queue depth, and edge latency.

### 4. Developer Tools & Documentation Hub
* **Schema Token Diet Calculator (`/tools/schema-diet`)**: Standalone optimizer analyzing the context window token burden of tool schemas on every LLM turn, complete with 1-click intelligent schema minification (saving 40–60% tokens) and multi-model cost comparisons (Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Pro).
* **Elevated Reading Hub (`/docs`)**: Multi-language interactive `TabbedCodeBlock` (Bash, Cursor, Python) and sticky `OnThisPageRail` scroll-spy.
* **Direct Engineering Connect (`/connect`)**: Interactive booking calendar with dynamic current-date resolution and confirmed meeting metadata.
* **Comprehensive Trust Portal**: Dedicated `/privacy`, `/terms`, and `/security` compliance documentation.

### 5. Signature Hardware & Editorial Design System
* **Universal Hardware Navbar**:
  * Left cluster: `[Logo]` `[B] BLOG` `[D] DOCS` `[C] CONNECT`.
  * Right cluster: `[L] LOGIN` `│` `[GitHub]` `[YouTube]` `[X]` `[Discord]`.
  * Hardware-grade hairline dock divider with adaptive theme contrast (`bg-white/40` on blue gradients; `bg-black/15` on documentation pages).
  * Smooth hover morphs transforming rigid tiles (`rounded-[4px]`) into electric blue pills (`rounded-[18px] bg-brand-blue text-white`).
* **Procedural Pixel Dither Engine (`PixelBox`)**: High-DPI HTML5 canvas auto-scroll dither transitions dissolving the signature deep blue-purple hero into clean white page sections.
* **Global Registry Live Telemetry Ticker**: Persistent edge-status banner tracking live mesh health, active skills, daily calls, and zero AST escapes.

---

## ⌨️ Global Keyboard Navigation

The platform features global, accessible keyboard navigation active across all public routes:

| Shortcut | Action | Description |
| :---: | :--- | :--- |
| `[B]` or `b` | Smooth Scroll to Blog | Scrolls smoothly to `#blog` on home page |
| `[D]` or `d` | Go to Documentation | Navigates to `/docs` |
| `[C]` or `c` | Connect & Schedule | Navigates to `/connect` |
| `[L]` or `l` | Platform Login | Navigates to `/login` |
| `[S]` or `s` | Search Skills | Navigates to `/search` |
| `[H]` or `h` | Return Home | Navigates to `/` |
| `⌘K` or `Ctrl+K` | Command Palette | Opens global fuzzy search & quick action modal |
| `↑` / `↓` | Navigate Search | Cycles through search results |
| `Spacebar` | Quick-Peek | Opens package Quick-Peek drawer on search results |

*(Note: Shortcuts automatically yield when actively typing inside `input`, `textarea`, or modal forms).*

---

## 🛠 Tech Stack

* **Framework**: [Next.js 16.2.2](https://nextjs.org/) (App Router, Turbopack)
* **Runtime & Language**: [Node.js 20+](https://nodejs.org/), [TypeScript 5](https://www.typescriptlang.org/)
* **Styling & Effects**: [Tailwind CSS](https://tailwindcss.com/), Custom Hardware Bezier Animations, HTML5 Canvas PRNG
* **Icons**: [Lucide React](https://lucide.dev/), Custom SVGs
* **Typography**: Instrument Serif, Fragment Mono, Inter
* **Smooth Scrolling**: [Lenis](https://lenis.darkroom.engineering/)
* **Package Manager**: [pnpm](https://pnpm.io/)

---

## 🚀 Getting Started

### Prerequisites
* Node.js `20.x` or higher
* `pnpm` (`v9+`)

### 1. Clone the repository
```bash
git clone https://github.com/agent-spm/agent-spm-web.git
cd agent-spm-web
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Configure Environment Variables
Duplicate the environment template and set your keys:
```bash
cp .env.example .env.local
```

### 4. Run the Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build Verification
To compile all static routes and verify type integrity:
```bash
pnpm build
```

---

## 📁 Repository Structure

```text
agent-spm-web/
├── public/                     # Static assets, branding logos & fonts
├── src/
│   ├── app/
│   │   ├── (auth)/             # Authentication suite (/login, /signup, /verify-2fa)
│   │   ├── (public)/           # Public routes (/docs, /packages, /tools, /privacy, /terms)
│   │   ├── admin/              # Super-Admin Control Plane (/admin/*)
│   │   ├── app/                # Authenticated Workspace Suite (/app, /fleet, /workspace)
│   │   ├── connect/            # Engineering scheduling portal
│   │   ├── pricing/            # Interactive subscription plans
│   │   ├── page.tsx            # Signature landing page with pixel canvas
│   │   └── not-found.tsx       # Procedural pixel dither 404 handler
│   ├── components/
│   │   ├── connect/            # Interactive calendar & booking flows
│   │   ├── dashboard/          # Telemetry charts (Sawtooth Downloads over time)
│   │   ├── docs/               # TabbedCodeBlock & OnThisPageRail
│   │   ├── landing/            # Hero, ExcellenceGrid, PixelBox, CTABlockSection
│   │   ├── layout/             # Universal Navbar & responsive mobile drawers
│   │   ├── modals/             # CommandPalette, PersonaSwitcher, CreateApiKey
│   │   ├── packages/           # PublicPackageDetailClient, PackageCard
│   │   ├── search/             # QuickPeekDrawer, SearchResults with filter chips
│   │   └── shell/              # AppShell, AdminShell, Topbar, SidebarNav
│   └── lib/                    # Mock telemetry, registry data & utilities
└── README.md                   # Platform documentation
```

---

## 🛡️ License & Trademarks

Agent SPM Web is proprietary and closed-source software unless stated otherwise.  
Copyright &copy; 2026 Agent SPM. All rights reserved.
