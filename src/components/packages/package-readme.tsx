"use client";

import { MarkdownRenderer } from "@/lib/markdown/renderer";

interface PackageReadmeProps {
  content: string;
}

export function PackageReadme({ content }: PackageReadmeProps) {
  if (!content) {
    return (
      <div className="rounded-xl border border-surface-200 bg-surface-50 p-8 text-center dark:border-surface-800 dark:bg-surface-900">
        <p className="text-surface-400">No README provided for this package.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-surface-200 bg-surface-0 p-6 dark:border-surface-800 dark:bg-surface-950 sm:p-8">
      <MarkdownRenderer content={content} />
    </div>
  );
}
