export interface EnvironmentalData {
  aqi: number;
  temperature: number;
  rainfall: number;
  droughtIndex: number;
  soilMoisture: number;
  ndvi: number;
}

export interface RiskAlert {
  type: "info" | "warning" | "critical";
  message: string;
}

export type RiskCategory = "Low" | "Moderate" | "High" | "Critical";

type MetricKey = keyof EnvironmentalData;

type MetricRange = {
  min: number;
  max: number;
};

export type AnalysisRanges = Record<MetricKey, MetricRange>;
export type RiskWeights = Record<MetricKey, number>;

export interface RiskScoreOptions {
  weights?: Partial<RiskWeights>;
  ranges?: Partial<AnalysisRanges>;
}

export const defaultRiskWeights: RiskWeights = {
  aqi: 0.22,
  temperature: 0.18,
  rainfall: 0.15,
  droughtIndex: 0.2,
  soilMoisture: 0.15,
  ndvi: 0.1,
};

export const defaultRanges: AnalysisRanges = {
  aqi: { min: 0, max: 300 },
  temperature: { min: -10, max: 50 },
  rainfall: { min: 0, max: 300 },
  droughtIndex: { min: 0, max: 100 },
  soilMoisture: { min: 0, max: 100 },
  ndvi: { min: 0, max: 1 },
};

const riskRaisingMetrics: MetricKey[] = ["aqi", "temperature", "droughtIndex"];
const riskReducingMetrics: MetricKey[] = ["rainfall", "soilMoisture", "ndvi"];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalize(value: number, range: MetricRange): number {
  if (range.max <= range.min) return 0;
  return clamp((value - range.min) / (range.max - range.min), 0, 1);
}

function buildMergedRanges(overrides?: Partial<AnalysisRanges>): AnalysisRanges {
  return {
    ...defaultRanges,
    ...(overrides ?? {}),
  };
}

function buildMergedWeights(overrides?: Partial<RiskWeights>): RiskWeights {
  return {
    ...defaultRiskWeights,
    ...(overrides ?? {}),
  };
}

export function calculateEnvironmentalRiskScore(
  data: EnvironmentalData,
  options: RiskScoreOptions = {},
): number {
  const ranges = buildMergedRanges(options.ranges);
  const weights = buildMergedWeights(options.weights);

  let weightedRisk = 0;
  let totalWeight = 0;

  for (const metric of riskRaisingMetrics) {
    const normalized = normalize(data[metric], ranges[metric]);
    weightedRisk += normalized * weights[metric];
    totalWeight += weights[metric];
  }

  for (const metric of riskReducingMetrics) {
    const normalized = normalize(data[metric], ranges[metric]);
    const inverseRisk = 1 - normalized;
    weightedRisk += inverseRisk * weights[metric];
    totalWeight += weights[metric];
  }

  if (totalWeight <= 0) return 0;
  return Math.round(clamp((weightedRisk / totalWeight) * 100, 0, 100));
}

export function mapRiskScoreToCategory(score: number): RiskCategory {
  if (score >= 75) return "Critical";
  if (score >= 55) return "High";
  if (score >= 30) return "Moderate";
  return "Low";
}

export function generateEnvironmentalInsights(data: EnvironmentalData): string[] {
  const insights: string[] = [];

  if (data.aqi >= 100) {
    insights.push("Air quality is deteriorating");
  } else if (data.aqi <= 50) {
    insights.push("Air quality remains in a safe range");
  }

  if (data.rainfall < 40 && data.droughtIndex > 55) {
    insights.push("Low rainfall is increasing drought risk");
  }

  if (data.ndvi >= 0.5 && data.soilMoisture >= 35) {
    insights.push("Vegetation health is stable");
  } else if (data.ndvi < 0.35) {
    insights.push("Vegetation stress is rising in monitored zones");
  }

  if (data.temperature > 34) {
    insights.push("Higher temperatures may amplify heatwave risk");
  }

  if (insights.length === 0) {
    insights.push("Environmental indicators are stable with no major anomalies");
  }

  return insights;
}

export function generateEnvironmentalAlerts(data: EnvironmentalData): RiskAlert[] {
  const alerts: RiskAlert[] = [];

  if (data.aqi >= 150) {
    alerts.push({ type: "critical", message: "Extreme AQI detected in active monitoring zones" });
  } else if (data.aqi >= 90) {
    alerts.push({ type: "warning", message: "AQI has reached elevated levels" });
  } else {
    alerts.push({ type: "info", message: "AQI levels are currently stable" });
  }

  if (data.droughtIndex >= 75) {
    alerts.push({ type: "critical", message: "Severe drought risk requires immediate mitigation" });
  } else if (data.droughtIndex >= 55) {
    alerts.push({ type: "warning", message: "Drought pressure is building across key regions" });
  }

  if (data.soilMoisture < 25) {
    alerts.push({ type: "warning", message: "Soil moisture is below healthy operating thresholds" });
  }

  if (data.ndvi < 0.3) {
    alerts.push({ type: "warning", message: "Vegetation vigor is weakening in sensitive areas" });
  }

  return alerts;
}