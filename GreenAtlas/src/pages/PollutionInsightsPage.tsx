import { useMemo } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ModuleLayout } from "@/components/layout/ModuleLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { MapPlaceholder } from "@/components/dashboard/MapPlaceholder";
import { AlertPanel } from "@/components/dashboard/AlertPanel";
import { DataTable } from "@/components/dashboard/DataTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useDashboard } from "@/context/DashboardContext";
import { selectByTimeRange, type TimeRange } from "@/lib/timeRange";
import { Routes, Route } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar } from "recharts";
import { LayoutDashboard, Gauge, Layers, Clock, Globe, Radio, Bell } from "lucide-react";

const tabs = [
  { label: "Overview", path: "/pollution", icon: LayoutDashboard },
  { label: "AQI Analysis", path: "/pollution/aqi", icon: Gauge },
  { label: "Pollutant Breakdown", path: "/pollution/pollutants", icon: Layers },
  { label: "Temporal Trends", path: "/pollution/temporal", icon: Clock },
  { label: "Regional", path: "/pollution/regional", icon: Globe },
  { label: "Sensor Network", path: "/pollution/sensors", icon: Radio },
  { label: "Alerts & Forecast", path: "/pollution/alerts", icon: Bell },
];

const weeklyAQI1y = [
  { day: "Mon", aqi: 38, pm25: 11.2 },
  { day: "Tue", aqi: 42, pm25: 12.8 },
  { day: "Wed", aqi: 35, pm25: 10.1 },
  { day: "Thu", aqi: 48, pm25: 14.5 },
  { day: "Fri", aqi: 52, pm25: 16.2 },
  { day: "Sat", aqi: 44, pm25: 13.1 },
  { day: "Sun", aqi: 40, pm25: 11.8 },
];

const weeklyAQIByRange: Record<TimeRange, typeof weeklyAQI1y> = {
  "7d": weeklyAQI1y,
  "30d": [
    { day: "W1", aqi: 44, pm25: 12.5 },
    { day: "W2", aqi: 48, pm25: 13.7 },
    { day: "W3", aqi: 42, pm25: 12.1 },
    { day: "W4", aqi: 39, pm25: 11.6 },
    { day: "W5", aqi: 45, pm25: 12.9 },
    { day: "W6", aqi: 52, pm25: 14.8 },
    { day: "W7", aqi: 49, pm25: 14.1 },
    { day: "W8", aqi: 43, pm25: 12.3 },
  ],
  "1y": [
    { day: "Jan", aqi: 46, pm25: 13.1 },
    { day: "Feb", aqi: 44, pm25: 12.7 },
    { day: "Mar", aqi: 48, pm25: 13.5 },
    { day: "Apr", aqi: 52, pm25: 14.8 },
    { day: "May", aqi: 57, pm25: 16.1 },
    { day: "Jun", aqi: 61, pm25: 17.4 },
    { day: "Jul", aqi: 64, pm25: 18.2 },
    { day: "Aug", aqi: 59, pm25: 16.9 },
    { day: "Sep", aqi: 54, pm25: 15.5 },
    { day: "Oct", aqi: 50, pm25: 14.2 },
    { day: "Nov", aqi: 47, pm25: 13.4 },
    { day: "Dec", aqi: 45, pm25: 12.8 },
  ],
};

const pollutantData = [
  { name: "PM2.5", value: 12.4, unit: "µg/m³", limit: 25, pct: 49.6 },
  { name: "PM10", value: 28.6, unit: "µg/m³", limit: 50, pct: 57.2 },
  { name: "NO₂", value: 18.6, unit: "ppb", limit: 40, pct: 46.5 },
  { name: "SO₂", value: 5.2, unit: "ppb", limit: 20, pct: 26 },
  { name: "O₃", value: 38.1, unit: "ppb", limit: 70, pct: 54.4 },
  { name: "CO", value: 0.8, unit: "ppm", limit: 4, pct: 20 },
];

function Overview() {
  const { timeRange } = useDashboard();
  const weeklyAQI = useMemo(
    () => selectByTimeRange(timeRange, weeklyAQIByRange),
    [timeRange],
  );
  const latest = weeklyAQI[weeklyAQI.length - 1] ?? { aqi: 0, pm25: 0 };

  return (
    <>
      <PageHeader title="Pollution Insights" subtitle="Real-time air quality monitoring and environmental trends across your active regions." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Current AQI" value={`${latest.aqi}`} status="safe" subtitle="Good" change="-5%" trend="down" delay={0} />
        <MetricCard title="PM2.5 Level" value={`${latest.pm25.toFixed(1)}`} subtitle="µg/m³" change="-2%" trend="down" status="safe" delay={80} />
        <MetricCard title="Ozone (O₃)" value="38.1" subtitle="ppb" status="neutral" delay={160} />
        <MetricCard title="Humidity" value="58%" change="-1%" trend="down" delay={240} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartCard title="Pollution Trends" subtitle={`Active range: ${timeRange}`} className="lg:col-span-2" delay={100}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyAQI}>
                <defs>
                  <linearGradient id="aqiPGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(152,40%,42%)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(152,40%,42%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="aqi" stroke="hsl(152,40%,42%)" fill="url(#aqiPGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <MapPlaceholder title="Active Region" subtitle="North Metropolitan Hub" markers={[{ label: "Seattle", status: "safe" }]} delay={200} />
      </div>
      <DataTable
        columns={[
          { key: "name", label: "Station Name" },
          { key: "status", label: "Status", align: "center" },
          { key: "aqi", label: "AQI Level", align: "center" },
          { key: "pollutant", label: "Primary Pollutant", align: "center" },
          { key: "efficiency", label: "Efficiency", align: "right" },
        ]}
        data={[
          { name: "Central Park West", status: <StatusBadge status="online" />, aqi: "24", pollutant: "NO₂", efficiency: <StatusBadge status="safe" label="98%" /> },
          { name: "Industrial District E", status: <StatusBadge status="alert" />, aqi: "88", pollutant: "PM10", efficiency: <StatusBadge status="warning" label="72%" /> },
          { name: "Bayside Residential", status: <StatusBadge status="online" />, aqi: "15", pollutant: "SO₂", efficiency: <StatusBadge status="safe" label="96%" /> },
        ]}
        delay={300}
      />
    </>
  );
}

function AQIPage() {
  const { timeRange } = useDashboard();
  const weeklyAQI = useMemo(
    () => selectByTimeRange(timeRange, weeklyAQIByRange),
    [timeRange],
  );

  return (
    <>
      <PageHeader title="AQI Analysis" subtitle="Detailed Air Quality Index breakdown and historical comparison." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Current AQI" value="42" status="safe" subtitle="Good" delay={0} />
        <MetricCard title="24h Average" value="44" delay={80} />
        <MetricCard title="7-Day Average" value="43" delay={160} />
        <MetricCard title="30-Day Average" value="46" delay={240} />
      </div>
      <ChartCard title="AQI Trend — Weekly" delay={100}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyAQI}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="aqi" stroke="hsl(152,40%,42%)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </>
  );
}

function PollutantsPage() {
  return (
    <>
      <PageHeader title="Pollutant Breakdown" subtitle="Individual pollutant levels compared against safe limits." />
      <ChartCard title="Pollutant Levels vs Safe Limits" delay={100}>
        <div className="space-y-4 mt-2">
          {pollutantData.map((p, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium">{p.name} <span className="text-muted-foreground">({p.value} {p.unit})</span></span>
                <span className="text-muted-foreground">Limit: {p.limit} {p.unit} ({Math.round(p.pct)}%)</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${p.pct > 70 ? "bg-rose-600" : p.pct > 50 ? "bg-amber-500" : "bg-emerald-600"}`}
                  style={{ width: `${Math.min(p.pct, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </>
  );
}

function TemporalPage() {
  const { timeRange } = useDashboard();
  const weeklyAQI = useMemo(
    () => selectByTimeRange(timeRange, weeklyAQIByRange),
    [timeRange],
  );

  return (
    <>
      <PageHeader title="Temporal Trends" subtitle="Time-series analysis of pollution patterns across different timeframes." />
      <ChartCard title="PM2.5 vs AQI — Weekly" delay={100}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyAQI}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Line yAxisId="left" type="monotone" dataKey="aqi" stroke="hsl(152,40%,42%)" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="pm25" stroke="hsl(38,55%,55%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </>
  );
}

function RegionalPage() {
  return (
    <>
      <PageHeader title="Regional Comparison" subtitle="Air quality metrics comparison across monitored regions." />
      <DataTable
        columns={[
          { key: "region", label: "Region" },
          { key: "aqi", label: "AQI", align: "center" },
          { key: "pm25", label: "PM2.5", align: "center" },
          { key: "status", label: "Status", align: "center" },
        ]}
        data={[
          { region: "Central Metro", aqi: "24", pm25: "8.2 µg/m³", status: <StatusBadge status="safe" label="Good" /> },
          { region: "Industrial Zone", aqi: "88", pm25: "35.4 µg/m³", status: <StatusBadge status="critical" label="Unhealthy" /> },
          { region: "Suburban East", aqi: "32", pm25: "10.1 µg/m³", status: <StatusBadge status="safe" label="Good" /> },
          { region: "Port District", aqi: "56", pm25: "18.8 µg/m³", status: <StatusBadge status="warning" label="Moderate" /> },
          { region: "Rural North", aqi: "15", pm25: "5.4 µg/m³", status: <StatusBadge status="safe" label="Excellent" /> },
        ]}
        delay={100}
      />
    </>
  );
}

function SensorPage() {
  return (
    <>
      <PageHeader title="Sensor Network" subtitle="Real-time health of the IoT sensor mesh distributed across monitoring regions." />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <MetricCard title="Active Sensors" value="128" status="safe" delay={0} />
        <MetricCard title="Maintenance" value="12" status="warning" delay={80} />
        <MetricCard title="Offline" value="3" status="critical" delay={160} />
      </div>
      <MapPlaceholder title="Sensor Distribution" subtitle="Real-time sensor mesh status" markers={[
        { label: "Hub-N1", status: "safe" },
        { label: "Hub-E2", status: "safe" },
        { label: "Hub-S3", status: "warning" },
        { label: "Hub-W4", status: "critical" },
      ]} legend={[
        { label: "Online", color: "bg-emerald-600" },
        { label: "Maintenance", color: "bg-amber-500" },
        { label: "Offline", color: "bg-rose-600" },
      ]} delay={100} />
    </>
  );
}

function AlertsForecastPage() {
  return (
    <>
      <PageHeader title="Alerts & Forecast" subtitle="Active pollution alerts and predictive air quality forecasts." />
      <AlertPanel
        alerts={[
          { title: "AQI Spike Detected", description: "Industrial District E — PM10 levels exceeding threshold", time: "15m ago", severity: "critical" },
          { title: "Ozone Warning", description: "Port District — O₃ approaching unhealthy levels", time: "2h ago", severity: "warning" },
          { title: "Sensor Maintenance", description: "Station Hub-W4 — scheduled recalibration complete", time: "4h ago", severity: "info" },
          { title: "Air Quality Improved", description: "Central Metro — AQI returned to Good range", time: "1d ago", severity: "success" },
        ]}
        delay={100}
      />
    </>
  );
}

export default function PollutionInsightsPage() {
  return (
    <DashboardShell>
      <ModuleLayout tabs={tabs}>
        <Routes>
          <Route index element={<Overview />} />
          <Route path="aqi" element={<AQIPage />} />
          <Route path="pollutants" element={<PollutantsPage />} />
          <Route path="temporal" element={<TemporalPage />} />
          <Route path="regional" element={<RegionalPage />} />
          <Route path="sensors" element={<SensorPage />} />
          <Route path="alerts" element={<AlertsForecastPage />} />
        </Routes>
      </ModuleLayout>
    </DashboardShell>
  );
}
