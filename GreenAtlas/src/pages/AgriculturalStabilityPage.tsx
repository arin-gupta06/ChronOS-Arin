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
import { LayoutDashboard, Droplets, CloudSun, Leaf, Thermometer, Mountain, Radio } from "lucide-react";

const tabs = [
  { label: "Overview", path: "/agriculture", icon: LayoutDashboard },
  { label: "Soil Moisture", path: "/agriculture/moisture", icon: Droplets },
  { label: "Drought & Stress", path: "/agriculture/drought", icon: CloudSun },
  { label: "Vegetation (NDVI)", path: "/agriculture/ndvi", icon: Leaf },
  { label: "Temperature", path: "/agriculture/temperature", icon: Thermometer },
  { label: "Land & Topography", path: "/agriculture/land", icon: Mountain },
  { label: "Sensor Monitoring", path: "/agriculture/sensors", icon: Radio },
];

const moistureData1y = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  current: [45, 48, 44, 40, 36, 32, 28, 30, 35, 40, 44, 46][i],
  avg5yr: [42, 45, 42, 38, 35, 33, 30, 32, 36, 41, 43, 44][i],
}));

const ndviData1y = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  ndvi: [0.65, 0.68, 0.72, 0.78, 0.82, 0.80, 0.75, 0.72, 0.74, 0.76, 0.70, 0.66][i],
}));

const tempImpact1y = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  surface: [18, 19, 21, 24, 27, 30, 32, 31, 28, 25, 21, 19][i],
  optimal: [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22][i],
}));

const moistureDataByRange: Record<TimeRange, typeof moistureData1y> = {
  "7d": moistureData1y.slice(4, 11).map((item, i) => ({ ...item, month: `D${i + 1}` })),
  "30d": moistureData1y.slice(2, 10).map((item, i) => ({ ...item, month: `W${i + 1}` })),
  "1y": moistureData1y,
};

const ndviDataByRange: Record<TimeRange, typeof ndviData1y> = {
  "7d": ndviData1y.slice(4, 11).map((item, i) => ({ ...item, month: `D${i + 1}` })),
  "30d": ndviData1y.slice(2, 10).map((item, i) => ({ ...item, month: `W${i + 1}` })),
  "1y": ndviData1y,
};

const tempImpactByRange: Record<TimeRange, typeof tempImpact1y> = {
  "7d": tempImpact1y.slice(4, 11).map((item, i) => ({ ...item, month: `D${i + 1}` })),
  "30d": tempImpact1y.slice(2, 10).map((item, i) => ({ ...item, month: `W${i + 1}` })),
  "1y": tempImpact1y,
};

function Overview() {
  const { timeRange } = useDashboard();
  const moistureData = useMemo(
    () => selectByTimeRange(timeRange, moistureDataByRange),
    [timeRange],
  );
  const currentMoisture = moistureData[moistureData.length - 1]?.current ?? 0;

  return (
    <>
      <PageHeader title="Agricultural Stability Dashboard" subtitle="Real-time land condition and ecosystem health monitoring." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Soil Moisture" value={`${currentMoisture}%`} change="+2.4%" trend="up" status="safe" subtitle="Normal range" delay={0} />
        <MetricCard title="Drought Risk" value="Low" status="safe" subtitle="Stable" delay={80} />
        <MetricCard title="NDVI Index" value="0.78" change="+1.2%" trend="up" status="safe" subtitle="Satellite verified" delay={160} />
        <MetricCard title="Surface Temp" value="24°C" status="neutral" subtitle="Peak afternoon avg" delay={240} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <MapPlaceholder
          className="lg:col-span-2"
          title="Regional Stability Mapping"
          subtitle="Moisture and thermal overlays"
          markers={[
            { label: "Parcel-4B", status: "safe" },
            { label: "East Ridge", status: "warning" },
            { label: "Valley Floor", status: "safe" },
          ]}
          legend={[
            { label: "Optimal (70%+)", color: "bg-emerald-600" },
            { label: "Moderate (40-60%)", color: "bg-amber-500" },
            { label: "Critical (<30%)", color: "bg-rose-600" },
          ]}
          delay={100}
        />
        <div className="flex flex-col gap-4">
          <AlertPanel
            title="Environmental Alerts"
            alerts={[
              { title: "Moisture Peak Detected", description: "North Sector — Parcel 4B", time: "08:45 AM", severity: "info" },
              { title: "Elevated Temperature", description: "East Ridge Boundary", time: "Yesterday", severity: "warning" },
              { title: "Sensor Hub Maintenance", description: "Station 12 Offline", time: "Oct 12", severity: "critical" },
            ]}
            delay={200}
          />
          <ChartCard title="Local Forecast" delay={300}>
            <div className="flex items-center gap-3 mt-2">
              <div className="text-3xl font-display font-bold text-foreground">21°</div>
              <div className="text-xs text-muted-foreground">
                <p>Cloudy</p>
                <p>Precipitation 12%</p>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Historical Moisture Trends" subtitle="Current vs 5-year seasonal averages" delay={300}>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moistureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="current" stroke="hsl(152,40%,42%)" strokeWidth={2} />
                <Line type="monotone" dataKey="avg5yr" stroke="hsl(200,25%,52%)" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <ChartCard title="Topography Condition" subtitle="Erosion and sediment stability" delay={400}>
          <div className="space-y-3 mt-2">
            {[
                { label: "Slope Stability", value: "High", pct: 88, color: "bg-emerald-600" },
                { label: "Runoff Probability", value: "12%", pct: 12, color: "bg-emerald-600" },
                { label: "Fertility Retention", value: "88%", pct: 88, color: "bg-emerald-600" },
            ].map((f, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{f.label}</span>
                  <span className="font-semibold">{f.value}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${f.color}`} style={{ width: `${f.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
        <ChartCard title="Sensor Mesh Status" subtitle="IoT mesh across 1,200 acres" delay={500}>
          <div className="space-y-3 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Online</span>
              <StatusBadge status="online" label="94 nodes" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Maintenance</span>
              <StatusBadge status="alert" label="4 nodes" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Offline</span>
              <StatusBadge status="offline" label="2 nodes" />
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
              <div className="h-full flex">
                <div className="bg-emerald-600" style={{ width: "94%" }} />
                <div className="bg-amber-500" style={{ width: "4%" }} />
                <div className="bg-rose-600" style={{ width: "2%" }} />
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </>
  );
}

function MoisturePage() {
  const { timeRange } = useDashboard();
  const moistureData = useMemo(
    () => selectByTimeRange(timeRange, moistureDataByRange),
    [timeRange],
  );

  return (
    <>
      <PageHeader title="Soil Moisture Analysis" subtitle="Comparing current soil saturation levels against 5-year seasonal averages." />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <MetricCard title="Current Level" value="42%" change="+2.4%" trend="up" status="safe" delay={0} />
        <MetricCard title="5-Year Avg" value="38%" delay={80} />
        <MetricCard title="Deficit" value="+4%" status="safe" subtitle="Above average" delay={160} />
      </div>
      <ChartCard title="Soil Moisture — Current vs Historical" delay={100}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={moistureData}>
              <defs>
                <linearGradient id="moistGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(200,25%,52%)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(200,25%,52%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="current" stroke="hsl(200,25%,52%)" fill="url(#moistGrad)" strokeWidth={2} />
              <Line type="monotone" dataKey="avg5yr" stroke="hsl(152,40%,42%)" strokeDasharray="5 5" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </>
  );
}

function DroughtPage() {
  return (
    <>
      <PageHeader title="Drought & Stress Analysis" subtitle="Monitoring drought risk based on precipitation deficit and soil conditions." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Risk Level" value="Low" status="safe" delay={0} />
        <MetricCard title="Precip Deficit" value="-8mm" delay={80} />
        <MetricCard title="Stress Index" value="0.22" status="safe" delay={160} />
        <MetricCard title="Recovery" value="12 days" delay={240} />
      </div>
      <MapPlaceholder title="Drought Stress Zones" subtitle="Current stress distribution across parcels" markers={[
        { label: "Parcel-1A", status: "safe" },
        { label: "Parcel-3C", status: "warning" },
        { label: "Ridge-East", status: "safe" },
      ]} delay={100} />
    </>
  );
}

function NDVIPage() {
  const { timeRange } = useDashboard();
  const ndviData = useMemo(
    () => selectByTimeRange(timeRange, ndviDataByRange),
    [timeRange],
  );

  return (
    <>
      <PageHeader title="Vegetation Health (NDVI)" subtitle="Normalized Difference Vegetation Index from satellite verification." />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <MetricCard title="Current NDVI" value="0.78" change="+1.2%" trend="up" status="safe" delay={0} />
        <MetricCard title="Peak" value="0.82" subtitle="May" delay={80} />
        <MetricCard title="Min" value="0.65" subtitle="January" delay={160} />
      </div>
      <ChartCard title="NDVI Trend — 12 Month" delay={100}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ndviData}>
              <defs>
                <linearGradient id="ndviGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(152,40%,42%)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(152,40%,42%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0.5, 0.9]} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="ndvi" stroke="hsl(152,40%,42%)" fill="url(#ndviGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </>
  );
}

function TempImpactPage() {
  const { timeRange } = useDashboard();
  const tempImpact = useMemo(
    () => selectByTimeRange(timeRange, tempImpactByRange),
    [timeRange],
  );

  return (
    <>
      <PageHeader title="Temperature Impact" subtitle="Surface temperature effects on crop health and growth cycles." />
      <ChartCard title="Surface Temp vs Optimal Range" delay={100}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tempImpact}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[15, 35]} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="surface" stroke="hsl(0,45%,58%)" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="optimal" stroke="hsl(152,40%,42%)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </>
  );
}

function LandPage() {
  return (
    <>
      <PageHeader title="Land & Topography" subtitle="Assessing erosion risks and sediment stability in monitored corridors." />
      <DataTable
        columns={[
          { key: "metric", label: "Metric" },
          { key: "value", label: "Value", align: "center" },
          { key: "status", label: "Status", align: "center" },
        ]}
        data={[
          { metric: "Slope Stability", value: "High", status: <StatusBadge status="safe" /> },
          { metric: "Runoff Probability", value: "12%", status: <StatusBadge status="safe" label="Low" /> },
          { metric: "Fertility Retention", value: "88%", status: <StatusBadge status="safe" /> },
          { metric: "Erosion Risk", value: "Low", status: <StatusBadge status="safe" /> },
          { metric: "Sediment Stability", value: "Moderate", status: <StatusBadge status="warning" /> },
        ]}
        delay={100}
      />
    </>
  );
}

function SensorMonPage() {
  return (
    <>
      <PageHeader title="Sensor Monitoring" subtitle="Real-time health of the IoT mesh network distributed across 1,200 acres." />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <MetricCard title="Total Sensors" value="100" delay={0} />
        <MetricCard title="Online" value="94" status="safe" delay={80} />
        <MetricCard title="Offline" value="2" status="critical" delay={160} />
      </div>
      <MapPlaceholder
        title="Sensor Mesh Distribution"
        markers={[
          { label: "Node-14", status: "safe" },
          { label: "Node-22", status: "safe" },
          { label: "Node-38", status: "warning" },
          { label: "Node-12", status: "critical" },
        ]}
        legend={[
        { label: "Active", color: "bg-emerald-600" },
        { label: "Maintenance", color: "bg-amber-500" },
        { label: "Offline", color: "bg-rose-600" },
        ]}
        delay={100}
      />
    </>
  );
}

export default function AgriculturalStabilityPage() {
  return (
    <DashboardShell>
      <ModuleLayout tabs={tabs}>
        <Routes>
          <Route index element={<Overview />} />
          <Route path="moisture" element={<MoisturePage />} />
          <Route path="drought" element={<DroughtPage />} />
          <Route path="ndvi" element={<NDVIPage />} />
          <Route path="temperature" element={<TempImpactPage />} />
          <Route path="land" element={<LandPage />} />
          <Route path="sensors" element={<SensorMonPage />} />
        </Routes>
      </ModuleLayout>
    </DashboardShell>
  );
}
