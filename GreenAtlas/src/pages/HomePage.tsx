import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { MapPlaceholder } from "@/components/dashboard/MapPlaceholder";
import { AlertPanel } from "@/components/dashboard/AlertPanel";
import { InsightBot } from "@/components/dashboard/InsightBot";
import { InsightDiscoveryFeed } from "@/components/dashboard/InsightDiscoveryFeed";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useDashboard } from "@/context/DashboardContext";
import {
  selectByTimeRange,
  timeRangeOptions,
  type TimeRange,
} from "@/lib/timeRange";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Globe } from "lucide-react";

const trendData1y = [
  { month: "Jan", temp: 14.2, rainfall: 82, aqi: 38, zone: "Zone A-12" },
  { month: "Feb", temp: 14.5, rainfall: 74, aqi: 35, zone: "Zone B-04" },
  { month: "Mar", temp: 15.1, rainfall: 68, aqi: 40, zone: "Zone C-18" },
  { month: "Apr", temp: 15.8, rainfall: 55, aqi: 42, zone: "Zone D-07" },
  { month: "May", temp: 16.3, rainfall: 45, aqi: 48, zone: "Zone A-12" },
  { month: "Jun", temp: 16.9, rainfall: 38, aqi: 52, zone: "Zone B-04" },
  { month: "Jul", temp: 17.2, rainfall: 32, aqi: 55, zone: "Zone C-18" },
  { month: "Aug", temp: 17.0, rainfall: 35, aqi: 50, zone: "Zone D-07" },
];

const trendDataByRange: Record<TimeRange, typeof trendData1y> = {
  "7d": trendData1y.slice(1, 8).map((item, i) => ({ ...item, month: `D${i + 1}` })),
  "30d": trendData1y.map((item, i) => ({ ...item, month: `W${i + 1}` })),
  "1y": trendData1y,
};

const riskData = [
  { region: "South Asia", flood: 72, drought: 45, heat: 88, water: 64 },
  { region: "N. Africa", flood: 28, drought: 82, heat: 76, water: 91 },
  { region: "N. Europe", flood: 35, drought: 15, heat: 22, water: 18 },
  { region: "Oceania", flood: 42, drought: 38, heat: 55, water: 32 },
  { region: "S. America", flood: 58, drought: 52, heat: 48, water: 45 },
];

const seasonalAverage: Record<string, number> = {
  Jan: 15.8,
  Feb: 15.5,
  Mar: 15.1,
  Apr: 14.8,
  May: 14.5,
  Jun: 14.2,
  Jul: 14.0,
  Aug: 14.3,
};

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  const value = point?.value ?? point?.temp ?? point?.rainfall;
  const month = label;
  const baseline = seasonalAverage[month] ?? 0;
  const diff = baseline ? (((Number(value) - baseline) / baseline) * 100).toFixed(1) : "0.0";
  const direction = Number(value) > baseline ? "above" : "below";

  return (
    <div className="bg-slate-900/95 text-white rounded-lg border border-slate-700 p-2 text-xs">
      <div className="font-semibold">{month}</div>
      <div>{`${value} ${payload[0].unit ?? ""}`.trim()}</div>
      <div className="text-slate-300">{`${Math.abs(Number(diff))}% ${direction} seasonal average`}</div>
      <div className="mt-1 text-[11px] text-emerald-300">{payload[0].name ?? payload[0].dataKey}</div>
    </div>
  );
}

export default function HomePage() {
  const { selectedZone, setSelectedZone, clearSelectedZone, timeRange, setTimeRange } = useDashboard();
  const [timeIndex, setTimeIndex] = useState(0);
  const activeTrendData = useMemo(
    () => selectByTimeRange(timeRange, trendDataByRange),
    [timeRange],
  );

  const filteredTrendData = useMemo(() => {
    if (!selectedZone) return activeTrendData;
    return activeTrendData.filter((d) => d.zone === selectedZone);
  }, [selectedZone, activeTrendData]);

  const alerts = [
    { title: "Satellite Data Synced", description: "Amazon Sector 4 — new Sentinel-2 data available", time: "2m ago", severity: "info", zone: "Zone A-12" },
    { title: "Temperature Threshold", description: "Saharan Belt exceeding 48°C for 3rd consecutive day", time: "14h ago", severity: "critical", zone: "Zone D-07" },
    { title: "Reforestation Target", description: "Amazon Basin reached 84% of quarterly goal", time: "1d ago", severity: "success", zone: "Zone B-04" },
  ];

  const displayedAlerts = selectedZone ? alerts.filter((a) => a.zone === selectedZone) : alerts;

  const metricDefinitions = [
    { id: "temp", title: "Global Temp Anomaly", value: selectedZone ? "+1.3°C" : "+1.2°C", change: "+0.05%", trend: "up", status: "warning", subtitle: "vs pre-industrial avg" },
    { id: "rain", title: "Annual Rainfall", value: selectedZone ? "412mm" : "840mm", change: "-2.1%", trend: "down", status: "neutral", subtitle: "Global average" },
    { id: "carbon", title: "Carbon Index", value: "415 ppm", change: "+0.4%", trend: "up", status: "critical", subtitle: "CO₂ concentration" },
    { id: "air", title: "Air Quality", value: "42 AQI", change: "-5%", trend: "down", status: "safe", subtitle: "Optimal level" },
  ];

  const criticalMetricId = useMemo(() => {
    let min = Infinity;
    let criticalId = null;
    metricDefinitions.forEach((item) => {
      const num = Number(item.change?.replace("%", ""));
      if (!Number.isNaN(num) && num < min) {
        min = num;
        criticalId = item.id;
      }
    });
    return criticalId;
  }, [selectedZone]);

  return (
    <DashboardShell>
      <div className="p-6">
        <PageHeader
          title="Global Overview"
          subtitle="Real-time environmental intelligence across monitored regions. Data synced 2 minutes ago."
          actions={
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="text-sm bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 outline-none"
            >
              {timeRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          }
        />

        {selectedZone && (
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-semibold">
              <Globe className="h-3.5 w-3.5" />
              Zone filter: {selectedZone}
            </span>
            <button
              onClick={clearSelectedZone}
              className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg"
            >
              Clear Filters
            </button>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Key Metrics</p>
                <p className="text-sm font-semibold text-slate-800">Core climate indicators</p>
              </div>
              <span className="text-slate-300">⋮⋮</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {metricDefinitions.map((item, index) => (
                <MetricCard
                  key={item.id}
                  title={item.title}
                  value={item.value}
                  change={item.change}
                  trend={item.trend as "up" | "down" | "neutral"}
                  status={item.status as "safe" | "warning" | "critical" | "neutral"}
                  subtitle={item.subtitle}
                  delay={index * 80}
                  isCritical={item.id === criticalMetricId}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 xl:col-span-8">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Interactive Risk Map</p>
                  <p className="text-sm font-semibold">High-risk zones and active alerts</p>
                </div>
                <span className="text-slate-300">⋮⋮</span>
              </div>
              <MapPlaceholder
                subtitle="Visualizing high-risk ecological zones worldwide"
                markers={[
                  { label: "Zone A-12", status: "critical" },
                  { label: "Zone B-04", status: "warning" },
                  { label: "Zone C-18", status: "safe" },
                  { label: "Zone D-07", status: "warning" },
                ]}
                legend={[
                  { label: "High Risk", color: "bg-rose-600" },
                  { label: "Moderate", color: "bg-amber-500" },
                  { label: "Low Risk", color: "bg-emerald-600" },
                ]}
                onMarkerClick={(zone) => setSelectedZone(zone as any)}
              />
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>Time Scrubber</span>
                  <span>{timeIndex * 3 + 1}h ago</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={8}
                  value={timeIndex}
                  onChange={(e) => setTimeIndex(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-full appearance-none accent-emerald-600"
                />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 xl:col-span-4">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Alerts Feed</p>
                  <p className="text-sm font-semibold">Latest activity and risk alerts</p>
                </div>
                <span className="text-slate-300">⋮⋮</span>
              </div>
              <AlertPanel alerts={displayedAlerts} delay={100} />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 xl:col-span-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Temperature Variance</p>
                <span className="text-slate-300">⋮⋮</span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredTrendData}>
                    <defs>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="none" />
                    <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area dataKey="temp" name="Temperature (°C)" stroke="#0ea5e9" strokeWidth={2.2} fill="url(#tempGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 xl:col-span-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Precipitation</p>
                <span className="text-slate-300">⋮⋮</span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredTrendData}>
                    <defs>
                      <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="none" />
                    <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="rainfall" name="Rainfall (mm)" fill="url(#rainGrad)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3">
            <InsightDiscoveryFeed />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
