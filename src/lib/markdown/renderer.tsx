"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { readmeSanitizeSchema } from "./sanitize-config";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState, useCallback } from "react";

/* ─── Copy Button for Code Blocks ─── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="absolute right-3 top-3 rounded-md bg-surface-800/80 p-1.5 text-surface-200 opacity-0 backdrop-blur-sm transition-all hover:bg-surface-800 hover:text-white group-hover:opacity-100"
      aria-label="Copy code"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

/* ─── Custom Components ─── */

const markdownComponents = {
  pre: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLPreElement>) => {
    // Extract the code content for the copy button
    const codeElement = children as React.ReactElement<{
      children?: string;
    }>;
    const codeText =
      typeof codeElement?.props?.children === "string"
        ? codeElement.props.children
        : "";

    return (
      <div className="group relative">
        <pre
          className="overflow-x-auto rounded-xl border border-surface-200 bg-surface-950 p-4 text-sm leading-relaxed dark:border-surface-800"
          {...props}
        >
          {children}
        </pre>
        {codeText && <CopyButton text={codeText} />}
      </div>
    );
  },

  code: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLElement>) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          className="rounded-md border border-surface-200 bg-surface-100 px-1.5 py-0.5 font-mono text-sm text-brand-600 dark:border-surface-800 dark:bg-surface-900 dark:text-brand-400"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={cn("font-mono", className)} {...props}>
        {children}
      </code>
    );
  },

  a: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      href={href}
      target="_blank"
      rel="nofollow noopener noreferrer"
      className="text-brand-500 underline decoration-brand-500/30 underline-offset-2 transition-colors hover:text-brand-400 hover:decoration-brand-500/60"
      {...props}
    >
      {children}
    </a>
  ),

  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="mb-4 mt-8 border-b border-surface-200 pb-2 text-2xl font-bold dark:border-surface-800"
      {...props}
    >
      {children}
    </h1>
  ),

  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="mb-3 mt-6 border-b border-surface-200 pb-2 text-xl font-semibold dark:border-surface-800"
      {...props}
    >
      {children}
    </h2>
  ),

  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mb-2 mt-5 text-lg font-semibold" {...props}>
      {children}
    </h3>
  ),

  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-surface-200 dark:border-surface-800">
      <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-800" {...props}>
        {children}
      </table>
    </div>
  ),

  th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="bg-surface-50 px-4 py-2 text-left text-sm font-semibold dark:bg-surface-900"
      {...props}
    >
      {children}
    </th>
  ),

  td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className="px-4 py-2 text-sm"
      {...props}
    >
      {children}
    </td>
  ),

  blockquote: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="my-4 border-l-4 border-brand-500/50 bg-brand-50/50 py-1 pl-4 pr-4 text-surface-800 dark:bg-brand-950/20 dark:text-surface-200"
      {...props}
    >
      {children}
    </blockquote>
  ),

  img: ({
    src,
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt || ""}
      className="my-4 max-w-full rounded-lg border border-surface-200 dark:border-surface-800"
      loading="lazy"
      {...props}
    />
  ),

  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="my-2 list-disc space-y-1 pl-6" {...props}>
      {children}
    </ul>
  ),

  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="my-2 list-decimal space-y-1 pl-6" {...props}>
      {children}
    </ol>
  ),

  hr: () => (
    <hr className="my-6 border-surface-200 dark:border-surface-800" />
  ),

  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="my-3 leading-7" {...props}>
      {children}
    </p>
  ),
};

/* ─── Main Renderer ─── */

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <article
      className={cn(
        "prose-spm max-w-none text-surface-900 dark:text-surface-100",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [rehypeSanitize, readmeSanitizeSchema],
          rehypeHighlight,
          rehypeSlug,
        ]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
