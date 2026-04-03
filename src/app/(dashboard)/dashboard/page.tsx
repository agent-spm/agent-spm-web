import { Activity, Download, Package, Users } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { UsageChart } from "@/components/dashboard/usage-chart";
import type { AnalyticsDataPoint, UsageTrend } from "@/types/analytics";

// Development placeholder data — replaced by registryApi.getDashboardAnalytics() in production
const mockApiData: AnalyticsDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
  timestamp: new Date(
    Date.now() - (29 - i) * 24 * 60 * 60 * 1000
  ).toISOString(),
  value: Math.floor(800 + Math.random() * 600 + i * 15),
}));

const mockDownloadData: AnalyticsDataPoint[] = Array.from(
  { length: 30 },
  (_, i) => ({
    timestamp: new Date(
      Date.now() - (29 - i) * 24 * 60 * 60 * 1000
    ).toISOString(),
    value: Math.floor(1200 + Math.random() * 800 + i * 25),
  })
);

const mockTrend: UsageTrend = {
  current: 28450,
  previous: 24200,
  changePercent: 17.6,
  direction: "up",
};

export default function DashboardPage() {
  // In production:
  // const supabase = await createSupabaseServerClient();
  // const { data: { session } } = await supabase.auth.getSession();
  // const analytics = await registryApi.getDashboardAnalytics(session.access_token);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
          Overview
        </h1>
        <p className="mt-1 text-sm text-surface-500">
          Your organization&apos;s usage over the last 30 days.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="API Calls"
          value={28450}
          trend={mockTrend}
          icon={Activity}
        />
        <StatsCard
          title="Downloads"
          value={42300}
          trend={{ ...mockTrend, changePercent: 12.3-0 }}
          icon={Download}
        />
        <StatsCard
          title="Active Packages"
          value={156}
          trend={{
            current: 156,
            previous: 148,
            changePercent: 5.4,
            direction: "up",
          }}
          icon={Package}
        />
        <StatsCard
          title="Team Members"
          value={8}
          trend={{
            current: 8,
            previous: 8,
            changePercent: 0,
            direction: "flat",
          }}
          icon={Users}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <UsageChart
          data={mockApiData}
          title="API Calls"
          color="#6366f1"
          gradientId="apiGradient"
        />
        <UsageChart
          data={mockDownloadData}
          title="Package Downloads"
          color="#06b6d4"
          gradientId="downloadGradient"
        />
      </div>
    </div>
  );
}
