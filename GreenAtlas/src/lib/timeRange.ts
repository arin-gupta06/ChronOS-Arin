export type TimeRange = "7d" | "30d" | "1y";

export const defaultTimeRange: TimeRange = "30d";

export const timeRangeLabels: Record<TimeRange, string> = {
  "7d": "last 7 days",
  "30d": "last 30 days",
  "1y": "last 1 year",
};

export const timeRangeOptions: Array<{ value: TimeRange; label: string }> = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "1y", label: "1Y" },
];

export function isTimeRange(value: string | null): value is TimeRange {
  return value === "7d" || value === "30d" || value === "1y";
}

export function getTimeRangeLabel(timeRange: TimeRange): string {
  return timeRangeLabels[timeRange];
}

export function selectByTimeRange<T>(
  timeRange: TimeRange,
  datasets: Record<TimeRange, T>,
): T {
  return datasets[timeRange];
}