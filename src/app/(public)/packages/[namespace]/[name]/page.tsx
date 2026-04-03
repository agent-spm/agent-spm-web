import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PackageHeader } from "@/components/packages/package-header";
import { PackageReadme } from "@/components/packages/package-readme";
import { PackageVersions } from "@/components/packages/package-versions";
import { InstallCommand } from "@/components/packages/install-command";
import { JsonLd } from "@/components/shared/json-ld";
import { buildPackageMetadata } from "@/lib/seo/metadata";
import { generatePackageJsonLd } from "@/lib/seo/json-ld";
import type { Package } from "@/types/package";

// In production, this uses registryApi.getPackage()
// For development, we use a mock
function getMockPackage(namespace: string, name: string): Package {
  return {
    id: `${namespace}-${name}`,
    namespace,
    name,
    displayName: `${namespace}/${name}`,
    description: `A powerful AI agent skill package for ${name} operations. Provides composable tools and middleware for building intelligent agent workflows.`,
    readme: `# ${namespace}/${name}

A powerful skill package for AI agents.

## Installation

\`\`\`bash
spm install ${namespace}/${name}
\`\`\`

## Usage

\`\`\`typescript
import { ${name}Skill } from "${namespace}/${name}";

const skill = new ${name}Skill({
  model: "gpt-4",
  temperature: 0.7,
});

const result = await skill.execute({
  input: "Hello, world!",
});
\`\`\`

## Features

- 🚀 **High Performance** — Optimized for low-latency agent workflows
- 🔒 **Secure** — Built-in input validation and output sanitization
- 📦 **Composable** — Works seamlessly with other SPM packages
- 🎯 **Type-safe** — Full TypeScript support with inference

## API Reference

| Method | Description |
|--------|-------------|
| \`execute()\` | Run the skill with given input |
| \`validate()\` | Validate input before execution |
| \`configure()\` | Update runtime configuration |

## License

MIT
`,
    license: "MIT",
    repositoryUrl: `https://github.com/${namespace}/${name}`,
    homepageUrl: undefined,
    keywords: ["ai", "agent", "skill", name],
    latestVersion: "1.2.0",
    versions: [
      { version: "1.2.0", publishedAt: "2025-03-28T00:00:00Z", digest: "sha256:abc123", downloads: 1200, },
      { version: "1.1.0", publishedAt: "2025-02-15T00:00:00Z", digest: "sha256:def456", downloads: 3400, },
      { version: "1.0.0", publishedAt: "2025-01-01T00:00:00Z", digest: "sha256:ghi789", downloads: 5600, },
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

interface PackagePageProps {
  params: Promise<{ namespace: string; name: string }>;
}

export async function generateMetadata({
  params,
}: PackagePageProps): Promise<Metadata> {
  const { namespace, name } = await params;
  // In production: const pkg = await registryApi.getPackage(namespace, name);
  const pkg = getMockPackage(namespace, name);
  if (!pkg) return {};
  return buildPackageMetadata(pkg);
}

export default async function PackageDetailPage({
  params,
}: PackagePageProps) {
  const { namespace, name } = await params;

  // In production: const pkg = await registryApi.getPackage(namespace, name);
  const pkg = getMockPackage(namespace, name);

  if (!pkg) {
    notFound();
  }

  return (
    <>
      <JsonLd data={generatePackageJsonLd(pkg)} />

      <PackageHeader pkg={pkg} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main content */}
          <div className="min-w-0 space-y-8">
            <PackageReadme content={pkg.readme} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <InstallCommand namespace={namespace} name={name} />
            <PackageVersions versions={pkg.versions} />

            {/* Dependencies */}
            {pkg.dependencies.length > 0 && (
              <div className="rounded-xl border border-surface-200 bg-surface-0 p-6 dark:border-surface-800 dark:bg-surface-950">
                <h2 className="font-semibold text-surface-900 dark:text-surface-50">
                  Dependencies ({pkg.dependencies.length})
                </h2>
                <ul className="mt-3 space-y-2">
                  {pkg.dependencies.map((dep) => (
                    <li key={`${dep.namespace}/${dep.name}`}>
                      <a
                        href={`/packages/${dep.namespace}/${dep.name}`}
                        className="text-sm text-brand-500 hover:text-brand-600"
                      >
                        {dep.namespace}/{dep.name}
                        <span className="ml-1 text-surface-400">
                          {dep.versionConstraint}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Keywords */}
            {pkg.keywords.length > 0 && (
              <div className="rounded-xl border border-surface-200 bg-surface-0 p-6 dark:border-surface-800 dark:bg-surface-950">
                <h2 className="font-semibold text-surface-900 dark:text-surface-50">
                  Keywords
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pkg.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-lg bg-surface-100 px-2.5 py-1 text-xs font-medium text-surface-600 dark:bg-surface-800 dark:text-surface-400"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
