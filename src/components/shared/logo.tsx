import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeMap = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <Link href="/" className={cn("group flex items-center gap-2", className)}>
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 opacity-20 blur-sm transition-opacity group-hover:opacity-40" />
        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500">
          <span className="font-mono text-sm font-bold text-white">S</span>
        </div>
      </div>
      <span
        className={cn(
          "font-bold tracking-tight text-surface-900 dark:text-surface-50",
          sizeMap[size]
        )}
      >
        spm
        <span className="text-brand-500">.</span>
        <span className="text-surface-400">dev</span>
      </span>
    </Link>
  );
}
