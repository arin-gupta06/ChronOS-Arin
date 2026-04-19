import { useMemo } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ModuleLayout } from "@/components/layout/ModuleLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable } from "@/components/dashboard/DataTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useDashboard } from "@/context/DashboardContext";
import { selectByTimeRange, type TimeRange } from "@/lib/timeRange";
import { Routes, Route } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar } from "recharts";
import { LayoutDashboard, Thermometer, CloudRain, Factory, Wind, Globe, TrendingUp } from "lucide-react";

function CursorFollowerTooltip({ active, payload, label, coordinate }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0];
  const x = coordinate?.x ?? 0;
  const y = coordinate?.y ?? 0;
  return (
    <div style={{ position: "absolute", left: x + 12, top: y - 54, transform: "translateX(-50%)", pointerEvents: "none", zIndex: 9999 }}>
      <div className="rounded-xl border border-slate-200 bg-slate-900/95 p-2 text-left text-xs text-slate-50 shadow-xl min-w-[150px]">
        <div className="font-semibold text-emerald-200">{label}</div>
        <div className="mt-1 text-[11px] text-slate-300">{point.name || point.dataKey}: {point.value}</div>
      </div>
    </div>
  );
}

const tabs = [
  { label: "Overview", path: "/trends", icon: LayoutDashboard },
  { label: "Temperature", path: "/trends/temperature", icon: Thermometer },
  { label: "Rainfall", path: "/trends/rainfall", icon: CloudRain },
  { label: "Carbon & Emissions", path: "/trends/carbon", icon: Factory },
  { label: "Air Quality", path: "/trends/air-quality", icon: Wind },
  { label: "Regional", path: "/trends/regional", icon: Globe },
  { label: "Forecast", path: "/trends/forecast", icon: TrendingUp },
];

const monthlyData1y = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  temp: [14.2, 14.5, 15.1, 15.8, 16.3, 16.9, 17.2, 17.0, 16.4, 15.7, 15.0, 14.4][i],
  rainfall: [82, 74, 68, 55, 45, 38, 32, 35, 48, 62, 75, 80][i],
  carbon: [412, 412.5, 413, 413.8, 414, 414.5, 415, 415.2, 414.8, 414.2, 413.5, 413][i],
  aqi: [38, 35, 40, 42, 48, 52, 55, 50, 44, 40, 36, 34][i],
}));

const forecastData1y = Array.from({ length: 6 }, (_, i) => ({
  month: ["Jan","Feb","Mar","Apr","May","Jun"][i],
  actual: i < 3 ? [15.2, 15.5, 16.1][i] : undefined,
  predicted: [15.2, 15.5, 16.1, 16.8, 17.3, 17.8][i],
  lower: [15.2, 15.5, 16.1, 16.2, 16.5, 16.8][i],
  upper: [15.2, 15.5, 16.1, 17.4, 18.1, 18.8][i],
}));

const monthlyDataByRange: Record<TimeRange, typeof monthlyData1y> = {
  "7d": monthlyData1y.slice(4, 11).map((item, i) => ({ ...item, month: `D${i + 1}` })),
  "30d": monthlyData1y.slice(2, 10).map((item, i) => ({ ...item, month: `W${i + 1}` })),
  "1y": monthlyData1y,
};

const forecastDataByRange: Record<TimeRange, typeof forecastData1y> = {
  "7d": forecastData1y.slice(0, 4).map((item, i) => ({ ...item, month: `D${i + 1}` })),
  "30d": forecastData1y.slice(0, 5).map((item, i) => ({ ...item, month: `W${i + 1}` })),
  "1y": forecastData1y,
};

function Overview() {
  const { timeRange } = useDashboard();
  const monthlyData = useMemo(
    () => selectByTimeRange(timeRange, monthlyDataByRange),
    [timeRange],
  );

  return (
    <>
      <PageHeader title="Environmental Trends" subtitle="Monitoring global climate patterns and regional anomalies with high-precision sensors." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Global Temp" value="+1.2°C" change="+0.05%" trend="up" status="warning" subtitle="vs last year" delay={0} />
        <MetricCard title="Annual Rainfall" value="840mm" change="-2.1%" trend="down" status="neutral" delay={80} />
        <MetricCard title="Carbon Index" value="415 ppm" change="+0.4%" trend="up" status="critical" delay={160} />
        <MetricCard title="Air Quality" value="42 AQI" status="safe" subtitle="Optimal Level" delay={240} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Temperature Variance" subtitle="Global average monthly changes" delay={100}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(152,40%,42%)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(152,40%,42%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[13, 18]} />
                <Tooltip content={<CursorFollowerTooltip />} cursor={false} />
                <Area type="monotone" dataKey="temp" stroke="hsl(152,40%,42%)" strokeWidth={2} fill="url(#tGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <ChartCard title="Precipitation Levels" subtitle="Monthly rainfall index (mm)" delay={200}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CursorFollowerTooltip />} cursor={false} />
                <Bar dataKey="rainfall" fill="hsl(200,25%,52%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
      <DataTable
        columns={[
          { key: "region", label: "Region" },
          { key: "status", label: "Status", align: "center" },
          { key: "risk", label: "Risk Level", align: "center" },
          { key: "variance", label: "Temp Variance", align: "right" },
        ]}
        data={[
          { region: "South Asia", status: <StatusBadge status="alert" label="High Variance" />, risk: <StatusBadge status="critical" />, variance: "+2.4°C" },
          { region: "Northern Africa", status: <StatusBadge status="warning" label="Moderate" />, risk: <StatusBadge status="warning" />, variance: "+1.8°C" },
          { region: "Northern Europe", status: <StatusBadge status="safe" label="Stable" />, risk: <StatusBadge status="safe" label="Low" />, variance: "+0.4°C" },
          { region: "Oceania", status: <StatusBadge status="safe" label="Stable" />, risk: <StatusBadge status="safe" label="Low" />, variance: "+0.6°C" },
        ]}
        delay={300}
      />
    </>
  );
}

function TemperaturePage() {
  const { timeRange } = useDashboard();
  const monthlyData = useMemo(
    () => selectByTimeRange(timeRange, monthlyDataByRange),
    [timeRange],
  );

  return (
    <>
      <PageHeader title="Temperature Analysis" subtitle="Detailed global and regional temperature trend monitoring." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Global Average" value="15.4°C" change="+0.05°C" trend="up" status="warning" delay={0} />
        <MetricCard title="Peak Anomaly" value="+2.4°C" subtitle="July, South Asia" status="critical" delay={80} />
        <MetricCard title="Min Recorded" value="12.1°C" subtitle="January, Arctic" delay={160} />
        <MetricCard title="5-Year Trend" value="+0.8°C" trend="up" status="warning" delay={240} />
      </div>
      <ChartCard title="Monthly Temperature — Global Average" delay={100}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[13, 18]} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="temp" stroke="hsl(0,45%,58%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(0,45%,58%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </>
  );
}

function RainfallPage() {
  const { timeRange } = useDashboard();
  const monthlyData = useMemo(
    () => selectByTimeRange(timeRange, monthlyDataByRange),
    [timeRange],
  );

  return (
    <>
      <PageHeader title="Rainfall Analysis" subtitle="Precipitation patterns, deficit tracking, and seasonal comparison." />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <MetricCard title="Annual Total" value="840mm" change="-2.1%" trend="down" delay={0} />
        <MetricCard title="Monthly Avg" value="72mm" change="-5.2%" trend="down" status="warning" delay={80} />
        <MetricCard title="Wettest Month" value="Jan (82mm)" delay={160} />
      </div>
      <ChartCard title="Monthly Precipitation" delay={100}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="rainfall" fill="hsl(200,25%,52%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </>
  );
}

function CarbonPage() {
  const { timeRange } = useDashboard();
  const monthlyData = useMemo(
    () => selectByTimeRange(timeRange, monthlyDataByRange),
    [timeRange],
  );

  return (
    <>
      <PageHeader title="Carbon & Emissions" subtitle="Tracking atmospheric CO₂ concentration and emission sources." />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <MetricCard title="CO₂ Level" value="415 ppm" change="+0.4%" trend="up" status="critical" delay={0} />
        <MetricCard title="Methane" value="1912 ppb" change="+0.3%" trend="up" status="warning" delay={80} />
        <MetricCard title="Net Emissions" value="36.8 Gt" subtitle="Annual CO₂" status="critical" delay={160} />
      </div>
      <ChartCard title="CO₂ Concentration Trend" delay={100}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[411, 416]} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="carbon" stroke="hsl(38,55%,55%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </>
  );
}

function AirQualityPage() {
  const { timeRange } = useDashboard();
  const monthlyData = useMemo(
    () => selectByTimeRange(timeRange, monthlyDataByRange),
    [timeRange],
  );

  return (
    <>
      <PageHeader title="Air Quality Trends" subtitle="Monitoring AQI and pollutant levels across sensor networks." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Current AQI" value="42" status="safe" subtitle="Good" delay={0} />
        <MetricCard title="PM2.5" value="12.4 µg/m³" change="-2%" trend="down" status="safe" delay={80} />
        <MetricCard title="Ozone" value="38.1 ppb" subtitle="Stable past 24h" delay={160} />
        <MetricCard title="NO₂" value="18.6 ppb" change="-4%" trend="down" status="safe" delay={240} />
      </div>
      <ChartCard title="AQI Trend — 12 Month" delay={100}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="aqiG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(152,40%,42%)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(152,40%,42%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="aqi" stroke="hsl(152,40%,42%)" fill="url(#aqiG)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </>
  );
}

function RegionalPage() {
  return (
    <>
      <PageHeader title="Regional Comparison" subtitle="Side-by-side environmental metrics across monitored regions." />
      <DataTable
        columns={[
          { key: "region", label: "Region" },
          { key: "temp", label: "Temp Δ", align: "center" },
          { key: "rainfall", label: "Rainfall", align: "center" },
          { key: "aqi", label: "AQI", align: "center" },
          { key: "risk", label: "Risk", align: "center" },
        ]}
        data={[
          { region: "South Asia", temp: "+2.4°C", rainfall: "620mm", aqi: "78", risk: <StatusBadge status="critical" /> },
          { region: "Northern Africa", temp: "+1.8°C", rainfall: "180mm", aqi: "65", risk: <StatusBadge status="warning" /> },
          { region: "Northern Europe", temp: "+0.4°C", rainfall: "920mm", aqi: "28", risk: <StatusBadge status="safe" label="Low" /> },
          { region: "Oceania", temp: "+0.6°C", rainfall: "780mm", aqi: "32", risk: <StatusBadge status="safe" label="Low" /> },
          { region: "South America", temp: "+1.1°C", rainfall: "1200mm", aqi: "45", risk: <StatusBadge status="warning" label="Moderate" /> },
        ]}
        delay={100}
      />
    </>
  );
}

function ForecastPage() {
  const { timeRange } = useDashboard();
  const forecastData = useMemo(
    () => selectByTimeRange(timeRange, forecastDataByRange),
    [timeRange],
  );

  return (
    <>
      <PageHeader title="Forecast & Predictions" subtitle="AI-powered climate projections with confidence intervals." />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <MetricCard title="Next Quarter" value="+0.3°C" subtitle="Temperature projection" status="warning" delay={0} />
        <MetricCard title="Confidence" value="82%" subtitle="Model accuracy" status="safe" delay={80} />
        <MetricCard title="Risk Trend" value="Increasing" status="warning" delay={160} />
      </div>
      <ChartCard title="Temperature Forecast — 6 Month" subtitle="Actual (solid) vs Predicted (dashed) with confidence band" delay={100}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData}>
              <defs>
                <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(152,40%,42%)" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="hsl(152,40%,42%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[15, 19]} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="upper" stroke="none" fill="url(#confGrad)" />
              <Area type="monotone" dataKey="lower" stroke="none" fill="hsl(0,0%,100%)" />
              <Line type="monotone" dataKey="predicted" stroke="hsl(152,40%,42%)" strokeWidth={2} strokeDasharray="6 3" dot={false} />
              <Line type="monotone" dataKey="actual" stroke="hsl(152,40%,42%)" strokeWidth={2} dot={{ r: 4, fill: "hsl(152,40%,42%)" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </>
  );
}

export default function EnvironmentalTrendsPage() {
  return (
    <DashboardShell>
      <ModuleLayout tabs={tabs}>
        <Routes>
          <Route index element={<Overview />} />
          <Route path="temperature" element={<TemperaturePage />} />
          <Route path="rainfall" element={<RainfallPage />} />
          <Route path="carbon" element={<CarbonPage />} />
          <Route path="air-quality" element={<AirQualityPage />} />
          <Route path="regional" element={<RegionalPage />} />
          <Route path="forecast" element={<ForecastPage />} />
        </Routes>
      </ModuleLayout>
    </DashboardShell>
  );
}
