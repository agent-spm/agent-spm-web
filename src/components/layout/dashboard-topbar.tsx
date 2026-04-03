import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Bell, ChevronDown } from "lucide-react";

interface DashboardTopbarProps {
  userName?: string;
  userEmail?: string;
  userAvatarUrl?: string;
}

export function DashboardTopbar({
  userName = "User",
  userEmail,
}: DashboardTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-surface-200 bg-surface-0/80 px-6 backdrop-blur-xl dark:border-surface-800 dark:bg-surface-950/80">
      {/* Left — breadcrumb area */}
      <div className="flex items-center gap-2 text-sm text-surface-400">
        <span className="font-medium text-surface-900 dark:text-surface-50">
          Dashboard
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button
          className="relative rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:hover:bg-surface-800 dark:hover:text-surface-50"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500" />
        </button>
        <ThemeToggle />
        <div className="h-6 w-px bg-surface-200 dark:bg-surface-800" />
        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-100 dark:hover:bg-surface-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-sm font-semibold text-white">
            {userName[0]?.toUpperCase()}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-surface-900 dark:text-surface-50">
              {userName}
            </p>
            {userEmail && (
              <p className="text-xs text-surface-400">{userEmail}</p>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-surface-400" />
        </button>
      </div>
    </header>
  );
}
