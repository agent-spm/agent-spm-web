<div align="center">
  <h3>⚡️ SPM (Skills Package Manager) — Web Platform</h3>
  <p>The high-performance, enterprise-ready registry and web dashboard for the SPM ecosystem.</p>
</div>

---

## 🚀 Overview

**Agent SPM Web** is the official web platform for the Skills Package Manager. It is designed as a hybrid Next.js 15 (App Router) application that effortlessly bridges the gap between a high-traffic, SEO-optimized public registry and a secure, data-rich internal SaaS dashboard.

This monolithic frontend serves two primary personas:
1. **Developers**: Actively searching, discovering, and evaluating packages via the public registry (think *npmjs.com*).
2. **Publishers & Teams**: Engaging with an authenticated internal dashboard for analytics, API keys, and billing (think *PostHog* or *Vercel* dashboards).

## ✨ Key Features

- **Next.js 15 App Router**: Fully leverages React Server Components, Server Actions, and Partial Prerendering (PPR) for lightning-fast edge performance.
- **Strict Route Group Segregation**: 
  - `(public)` route group: Read-heavy pages optimally cached on the edge (`/`, `/search`, `/packages`).
  - `(dashboard)` route group: Authenticated and highly interactive portal (`/dashboard`, `/team`, `/billing`).
- **Authentication**: SSR-compatible Supabase Auth with GitHub OAuth and magic link strategies.
- **Monetization & Billing**: Deep integration with [Polar.sh](https://polar.sh) and the `@polar-sh/nextjs` SDK for subscriptions, customer portals, and enterprise team management.
- **Design System**: A sleek, custom internal design system built with Tailwind CSS v4 (`@theme`), Shadcn UI, and Lucide Icons. Features an automated dark/light mode with a signature "Electric Indigo & Cyan" developer-centric theme.
- **Extreme Security**: Integrated `rehype-sanitize` strict Markdown pipelines designed to defend against Cross-Site Scripting (XSS) from malicious package READMEs.
- **SEO & Discoverability**: Edge-computed dynamic Open Graph images (`og:image`) and heavily optimized semantic structures.

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Auth & Database**: [Supabase](https://supabase.com/)
- **Billing Infrastructure**: [Polar.sh](https://polar.sh/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js 20+ and `pnpm` installed.

### 1. Clone the repository
```bash
git clone https://github.com/your-org/agent-spm-web.git
cd agent-spm-web
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Configure Environments
Duplicate the provided example environment variables file and fill in your keys:
```bash
cp .env.example .env.local
```
*(Ensure all Supabase keys, Polar secrets, and API Base URLs are provisioned via your platform dashboards).*

### 4. Run the Development Server
```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The application supports Turbopack compilation out of the box.

## 🛡️ License

SPM Web is proprietary and closed-source software unless stated otherwise.
Copyright &copy; 2026. All rights reserved.
