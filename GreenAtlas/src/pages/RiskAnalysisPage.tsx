import { useMemo } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ModuleLayout } from "@/components/layout/ModuleLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { MapPlaceholder } from "@/components/dashboard/MapPlaceholder";
import { AlertPanel } from "@/components/dashboard/AlertPanel";
import { InsightBot } from "@/components/dashboard/InsightBot";
import { DataTable } from "@/components/dashboard/DataTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Routes, Route } from "react-router-dom";
import {
  calculateEnvironmentalRiskScore,
  generateEnvironmentalAlerts,
  generateEnvironmentalInsights,
  mapRiskScoreToCategory,
  type EnvironmentalData,
} from "@/lib/analysisEngine";
import { useDashboard } from "@/context/DashboardContext";
import { selectByTimeRange, type TimeRange } from "@/lib/timeRange";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import {
  LayoutDashboard,
  Waves,
  CloudSun,
  Thermometer,
  Droplets,
  GitCompare,
} from "lucide-react";

const tabs = [
  { label: "Overview", path: "/risk", icon: LayoutDashboard },
  { label: "Flood Risk", path: "/risk/flood", icon: Waves },
  { label: "Drought Risk", path: "/risk/drought", icon: CloudSun },
  { label: "Heatwave", path: "/risk/heatwave", icon: Thermometer },
  { label: "Water Stress", path: "/risk/water-stress", icon: Droplets },
  { label: "Comparison", path: "/risk/comparison", icon: GitCompare },
];

const floodData1y = Array.from({ length: 12 }, (_, i) => ({
  month: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][i],
  index: [42, 48, 55, 62, 68, 72, 78, 74, 65, 58, 50, 44][i],
  threshold: 60,
}));

const droughtData1y = Array.from({ length: 12 }, (_, i) => ({
  month: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][i],
  severity: [32, 35, 40, 48, 55, 62, 68, 65, 55, 45, 38, 34][i],
  moisture: [72, 68, 62, 55, 48, 40, 35, 38, 48, 58, 65, 70][i],
}));

const heatData1y = Array.from({ length: 12 }, (_, i) => ({
  month: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][i],
  frequency: [2, 3, 5, 8, 14, 22, 28, 25, 18, 10, 4, 2][i],
  intensity: [1.2, 1.5, 2.1, 2.8, 3.5, 4.2, 4.8, 4.5, 3.2, 2.4, 1.6, 1.3][i],
}));

const waterData1y = Array.from({ length: 12 }, (_, i) => ({
  month: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][i],
  stress: [35, 38, 42, 50, 58, 65, 72, 70, 60, 50, 40, 36][i],
  supply: [85, 82, 78, 70, 62, 55, 48, 50, 60, 70, 78, 84][i],
}));

const radarData1y = [
  { factor: "Flood", A: 72, B: 45 },
  { factor: "Drought", A: 45, B: 82 },
  { factor: "Heatwave", A: 88, B: 65 },
  { factor: "Water", A: 64, B: 55 },
  { factor: "Pollution", A: 38, B: 72 },
];

const floodDataByRange: Record<TimeRange, typeof floodData1y> = {
  "7d": floodData1y.slice(4, 11).map((item, i) => ({ ...item, month: `D${i + 1}` })),
  "30d": floodData1y.slice(2, 10).map((item, i) => ({ ...item, month: `W${i + 1}` })),
  "1y": floodData1y,
};

const droughtDataByRange: Record<TimeRange, typeof droughtData1y> = {
  "7d": droughtData1y.slice(4, 11).map((item, i) => ({ ...item, month: `D${i + 1}` })),
  "30d": droughtData1y.slice(2, 10).map((item, i) => ({ ...item, month: `W${i + 1}` })),
  "1y": droughtData1y,
};

const heatDataByRange: Record<TimeRange, typeof heatData1y> = {
  "7d": heatData1y.slice(4, 11).map((item, i) => ({ ...item, month: `D${i + 1}` })),
  "30d": heatData1y.slice(2, 10).map((item, i) => ({ ...item, month: `W${i + 1}` })),
  "1y": heatData1y,
};

const waterDataByRange: Record<TimeRange, typeof waterData1y> = {
  "7d": waterData1y.slice(4, 11).map((item, i) => ({ ...item, month: `D${i + 1}` })),
  "30d": waterData1y.slice(2, 10).map((item, i) => ({ ...item, month: `W${i + 1}` })),
  "1y": waterData1y,
};

const radarDataByRange: Record<TimeRange, typeof radarData1y> = {
  "7d": radarData1y.map((item) => ({ ...item, A: Math.max(item.A - 10, 5), B: Math.max(item.B - 8, 5) })),
  "30d": radarData1y.map((item) => ({ ...item, A: Math.max(item.A - 4, 5), B: Math.max(item.B - 3, 5) })),
  "1y": radarData1y,
};

const snapshotByRange: Record<TimeRange, EnvironmentalData> = {
  "7d": {
    aqi: 84,
    temperature: 33,
    rainfall: 46,
    droughtIndex: 54,
    soilMoisture: 38,
    ndvi: 0.5,
  },
  "30d": {
    aqi: 96,
    temperature: 35,
    rainfall: 34,
    droughtIndex: 67,
    soilMoisture: 30,
    ndvi: 0.44,
  },
  "1y": {
    aqi: 112,
    temperature: 37,
    rainfall: 28,
    droughtIndex: 74,
    soilMoisture: 24,
    ndvi: 0.36,
  },
};

function Overview() {
  const { timeRange } = useDashboard();
  const snapshot = useMemo(
    () => selectByTimeRange(timeRange, snapshotByRange),
    [timeRange],
  );

  const riskScore = calculateEnvironmentalRiskScore(snapshot);
  const riskCategory = mapRiskScoreToCategory(riskScore);
  const insights = generateEnvironmentalInsights(snapshot);
  const alerts = generateEnvironmentalAlerts(snapshot);

  const riskStatus: "safe" | "warning" | "critical" =
    riskCategory === "Low"
      ? "safe"
      : riskCategory === "Moderate"
        ? "warning"
        : "critical";

  return (
    <>
      <PageHeader
        title="Risk Analysis Dashboard"
        subtitle="Real-time environmental risk assessment using modular monitoring and satellite telemetry."
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Flood Risk Index"
          value="Low"
          change="-2.4%"
          trend="down"
          status="safe"
          delay={0}
        />
        <MetricCard
          title="Drought Severity"
          value="Moderate"
          change="+5.1%"
          trend="up"
          status="warning"
          delay={80}
        />
        <MetricCard
          title="Heatwave Freq."
          value="High"
          change="+12.8%"
          trend="up"
          status="critical"
          delay={160}
        />
        <MetricCard
          title="Overall Risk Score"
          value={`${riskScore}/100`}
          subtitle={`Category: ${riskCategory}`}
          status={riskStatus}
          delay={240}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <MapPlaceholder
          className="lg:col-span-2"
          subtitle="Visualizing high-risk ecological zones"
          markers={[
            { label: "Zone A-12", status: "critical" },
            { label: "Zone B-04", status: "warning" },
            { label: "Zone C-18", status: "safe" },
          ]}
          legend={[
            { label: "High Risk", color: "bg-rose-600" },
            { label: "Moderate", color: "bg-amber-500" },
            { label: "Low Risk", color: "bg-emerald-600" },
          ]}
          delay={100}
        />
        <div className="flex flex-col gap-4">
          <ChartCard title="Modular Risk Factors" delay={200}>
            <div className="space-y-3 mt-2">
              {[
                {
                  label: "Soil Moisture Degradation",
                  pct: Math.max(0, 100 - snapshot.soilMoisture),
                  color: "bg-amber-500",
                },
                {
                  label: "Vegetation Density (NDVI)",
                  pct: Math.round(snapshot.ndvi * 100),
                  color: "bg-emerald-600",
                },
                {
                  label: "Groundwater Depletion",
                  pct: snapshot.droughtIndex,
                  color: "bg-rose-600",
                },
              ].map((f, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{f.label}</span>
                    <span className="font-semibold">{f.pct}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${f.color}`}
                      style={{ width: `${f.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
          <InsightBot
            message={insights.join(". ")}
            delay={300}
          />
        </div>
      </div>
      <AlertPanel
        title="Engine Alerts"
        alerts={alerts.map((alert, index) => ({
          title:
            alert.type === "critical"
              ? "Critical Alert"
              : alert.type === "warning"
                ? "Warning Alert"
                : "Info Alert",
          description: alert.message,
          time: `${index + 1}m ago`,
          severity: alert.type,
        }))}
        delay={400}
      />
    </>
  );
}

function FloodRisk() {
  const { timeRange } = useDashboard();
  const floodData = useMemo(
    () => selectByTimeRange(timeRange, floodDataByRange),
    [timeRange],
  );

  return (
    <>
      <PageHeader
        title="Flood Risk Analysis"
        subtitle="Monitoring flood probability indices across regions using hydrological models."
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Current Index"
          value="42"
          change="-2.4%"
          trend="down"
          status="safe"
          delay={0}
        />
        <MetricCard
          title="Peak (Jul)"
          value="78"
          status="critical"
          delay={80}
        />
        <MetricCard
          title="At-Risk Zones"
          value="14"
          change="+3"
          trend="up"
          status="warning"
          delay={160}
        />
        <MetricCard
          title="Stations Online"
          value="98%"
          status="safe"
          delay={240}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard
          title="Flood Risk Index — 12 Month"
          subtitle="Monthly trend with threshold line"
          delay={100}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={floodData}>
                <defs>
                  <linearGradient id="floodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="hsl(200,25%,52%)"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(200,25%,52%)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="index"
                  stroke="hsl(200,25%,52%)"
                  strokeWidth={2}
                  fill="url(#floodGrad)"
                />
                <Line
                  type="monotone"
                  dataKey="threshold"
                  stroke="hsl(0,50%,58%)"
                  strokeDasharray="5 5"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <MapPlaceholder
          title="Flood Zone Map"
          subtitle="Active flood warnings and historical zones"
          markers={[
            { label: "Delta-7", status: "critical" },
            { label: "Coast-3", status: "warning" },
          ]}
          legend={[
            { label: "Active Flood", color: "bg-rose-600" },
            { label: "Watch Zone", color: "bg-amber-500" },
          ]}
          delay={200}
        />
      </div>
    </>
  );
}

function DroughtRisk() {
  const { timeRange } = useDashboard();
  const droughtData = useMemo(
    () => selectByTimeRange(timeRange, droughtDataByRange),
    [timeRange],
  );

  return (
    <>
      <PageHeader
        title="Drought Risk Analysis"
        subtitle="Soil moisture and precipitation deficit analysis for drought monitoring."
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Drought Severity"
          value="Moderate"
          change="+5.1%"
          trend="up"
          status="warning"
          delay={0}
        />
        <MetricCard
          title="Soil Moisture"
          value="38%"
          change="-4.2%"
          trend="down"
          status="warning"
          delay={80}
        />
        <MetricCard
          title="Precipitation Deficit"
          value="-22mm"
          status="critical"
          delay={160}
        />
        <MetricCard
          title="Recovery Forecast"
          value="45 days"
          status="neutral"
          delay={240}
        />
      </div>
      <ChartCard
        title="Drought Severity vs Soil Moisture"
        subtitle="12-month correlation analysis"
        delay={100}
      >
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={droughtData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="severity"
                stroke="hsl(38,55%,55%)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="moisture"
                stroke="hsl(200,25%,52%)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </>
  );
}

function HeatwaveAnalysis() {
  const { timeRange } = useDashboard();
  const heatData = useMemo(
    () => selectByTimeRange(timeRange, heatDataByRange),
    [timeRange],
  );

  return (
    <>
      <PageHeader
        title="Heatwave Analysis"
        subtitle="Tracking heatwave frequency and intensity across monitored regions."
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Heatwave Events"
          value="28"
          change="+12.8%"
          trend="up"
          status="critical"
          subtitle="This quarter"
          delay={0}
        />
        <MetricCard
          title="Max Intensity"
          value="4.8°C"
          subtitle="Above regional avg"
          status="critical"
          delay={80}
        />
        <MetricCard
          title="Duration (avg)"
          value="5.2 days"
          change="+0.8d"
          trend="up"
          status="warning"
          delay={160}
        />
        <MetricCard
          title="Prediction"
          value="85%"
          subtitle="Secondary wave probability"
          status="critical"
          delay={240}
        />
      </div>
      <ChartCard title="Heatwave Frequency & Intensity" delay={100}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={heatData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar
                yAxisId="left"
                dataKey="frequency"
                fill="hsl(0,45%,58%)"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="intensity"
                stroke="hsl(38,55%,55%)"
                strokeWidth={2}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </>
  );
}

function WaterStress() {
  const { timeRange } = useDashboard();
  const waterData = useMemo(
    () => selectByTimeRange(timeRange, waterDataByRange),
    [timeRange],
  );

  return (
    <>
      <PageHeader
        title="Water Stress Analysis"
        subtitle="Monitoring water supply-demand balance and aquifer depletion rates."
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Stress Index"
          value="Critical"
          change="+8.2%"
          trend="up"
          status="critical"
          delay={0}
        />
        <MetricCard
          title="Supply Rate"
          value="48%"
          change="-12%"
          trend="down"
          status="critical"
          delay={80}
        />
        <MetricCard
          title="Groundwater"
          value="-3.2m"
          subtitle="Annual depletion"
          status="warning"
          delay={160}
        />
        <MetricCard
          title="Regions Critical"
          value="7"
          change="+2"
          trend="up"
          status="critical"
          delay={240}
        />
      </div>
      <ChartCard
        title="Water Stress vs Supply"
        subtitle="12-month inverse correlation"
        delay={100}
      >
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={waterData}>
              <defs>
                <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(0,45%,58%)"
                    stopOpacity={0.15}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(0,45%,58%)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="supplyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(200,25%,52%)"
                    stopOpacity={0.15}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(200,25%,52%)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="stress"
                stroke="hsl(0,45%,58%)"
                fill="url(#stressGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="supply"
                stroke="hsl(200,25%,52%)"
                fill="url(#supplyGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </>
  );
}

function Comparison() {
  const { timeRange } = useDashboard();
  const radarData = useMemo(
    () => selectByTimeRange(timeRange, radarDataByRange),
    [timeRange],
  );

  return (
    <>
      <PageHeader
        title="Comparative Risk View"
        subtitle="Side-by-side risk factor comparison across regions."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Risk Profile — Region A vs Region B" delay={100}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(140,10%,85%)" />
                <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11 }} />
                <Radar
                  name="Region A"
                  dataKey="A"
                  stroke="hsl(152,40%,42%)"
                  fill="hsl(152,40%,42%)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Radar
                  name="Region B"
                  dataKey="B"
                  stroke="hsl(38,55%,55%)"
                  fill="hsl(38,55%,55%)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <DataTable
          columns={[
            { key: "factor", label: "Risk Factor" },
            { key: "regionA", label: "Region A", align: "center" },
            { key: "regionB", label: "Region B", align: "center" },
            { key: "delta", label: "Delta", align: "right" },
          ]}
          data={radarData.map((d) => ({
            factor: d.factor,
            regionA: (
              <StatusBadge
                status={d.A > 70 ? "critical" : d.A > 50 ? "warning" : "safe"}
                label={`${d.A}%`}
              />
            ),
            regionB: (
              <StatusBadge
                status={d.B > 70 ? "critical" : d.B > 50 ? "warning" : "safe"}
                label={`${d.B}%`}
              />
            ),
            delta: (
              <span
                className={
                  d.A > d.B
                    ? "text-rose-600 text-sm"
                    : "text-emerald-600 text-sm"
                }
              >
                {d.A > d.B ? "+" : ""}
                {d.A - d.B}%
              </span>
            ),
          }))}
          delay={200}
        />
      </div>
    </>
  );
}

export default function RiskAnalysisPage() {
  return (
    <DashboardShell>
      <ModuleLayout tabs={tabs}>
        <Routes>
          <Route index element={<Overview />} />
          <Route path="flood" element={<FloodRisk />} />
          <Route path="drought" element={<DroughtRisk />} />
          <Route path="heatwave" element={<HeatwaveAnalysis />} />
          <Route path="water-stress" element={<WaterStress />} />
          <Route path="comparison" element={<Comparison />} />
        </Routes>
      </ModuleLayout>
    </DashboardShell>
  );
}
