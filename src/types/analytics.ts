export interface AnalyticsDataPoint {
  timestamp: string;
  value: number;
}

export interface TimeSeriesData {
  label: string;
  data: AnalyticsDataPoint[];
  color?: string;
}

export interface UsageMetrics {
  totalApiCalls: number;
  totalDownloads: number;
  activePackages: number;
  teamMembers: number;
}

export interface UsageTrend {
  current: number;
  previous: number;
  changePercent: number;
  direction: "up" | "down" | "flat";
}

export interface DashboardAnalytics {
  apiCalls: {
    timeSeries: AnalyticsDataPoint[];
    trend: UsageTrend;
  };
  downloads: {
    timeSeries: AnalyticsDataPoint[];
    trend: UsageTrend;
  };
  topPackages: {
    namespace: string;
    name: string;
    downloads: number;
    changePercent: number;
  }[];
  period: "7d" | "30d" | "90d";
}
