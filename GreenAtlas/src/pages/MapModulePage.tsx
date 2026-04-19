import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Link } from "react-router-dom";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import {
  LocateFixed,
  MapPin,
  Navigation,
  AlertTriangle,
  Crosshair,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard, type SharedLocation } from "@/context/DashboardContext";

type RiskLayerKey = "flood" | "drought" | "heatwave" | "waterStress";
type EnvFilterKey = "temp" | "rainfall" | "carbon" | "aqi";

interface RiskPoint {
  id: string;
  label: string;
  layer: RiskLayerKey;
  lat: number;
  lng: number;
  severity: "safe" | "warning" | "critical";
}

type MapLocation = SharedLocation;

interface ModulePageOption {
  id: string;
  label: string;
  path: string;
}

const riskPoints: RiskPoint[] = [
  {
    id: "f1",
    label: "Flood: Delta-7",
    layer: "flood",
    lat: 22.57,
    lng: 88.36,
    severity: "critical",
  },
  {
    id: "f2",
    label: "Flood: Coast-3",
    layer: "flood",
    lat: 13.08,
    lng: 80.27,
    severity: "warning",
  },
  {
    id: "d1",
    label: "Drought: Parcel-3C",
    layer: "drought",
    lat: 24.58,
    lng: 73.71,
    severity: "warning",
  },
  {
    id: "h1",
    label: "Heatwave: Zone D-07",
    layer: "heatwave",
    lat: 27.02,
    lng: 77.68,
    severity: "critical",
  },
  {
    id: "w1",
    label: "Water Stress: Basin-2",
    layer: "waterStress",
    lat: 23.26,
    lng: 77.41,
    severity: "warning",
  },
];

const riskLayerLabels: Record<RiskLayerKey, string> = {
  flood: "Flood Risk",
  drought: "Drought Risk",
  heatwave: "Heatwave Risk",
  waterStress: "Water Stress",
};

const envFilterLabels: Record<EnvFilterKey, string> = {
  temp: "Temperature",
  rainfall: "Rainfall",
  carbon: "Carbon",
  aqi: "Air Quality",
};

const pollutionOptions: ModulePageOption[] = [
  { id: "pollution-aqi", label: "AQI Analysis", path: "/pollution/aqi" },
  {
    id: "pollution-pollutants",
    label: "Pollutant Breakdown",
    path: "/pollution/pollutants",
  },
  {
    id: "pollution-temporal",
    label: "Temporal Trends",
    path: "/pollution/temporal",
  },
  { id: "pollution-regional", label: "Regional", path: "/pollution/regional" },
  {
    id: "pollution-sensors",
    label: "Sensor Network",
    path: "/pollution/sensors",
  },
  {
    id: "pollution-alerts",
    label: "Alerts & Forecast",
    path: "/pollution/alerts",
  },
];

const agriculturalOptions: ModulePageOption[] = [
  {
    id: "agri-moisture",
    label: "Soil Moisture",
    path: "/agriculture/moisture",
  },
  {
    id: "agri-drought",
    label: "Drought & Stress",
    path: "/agriculture/drought",
  },
  { id: "agri-ndvi", label: "Vegetation (NDVI)", path: "/agriculture/ndvi" },
  { id: "agri-temp", label: "Temperature", path: "/agriculture/temperature" },
  { id: "agri-land", label: "Land & Topography", path: "/agriculture/land" },
  {
    id: "agri-sensors",
    label: "Sensor Monitoring",
    path: "/agriculture/sensors",
  },
];

function buildDefaultToggleState(options: ModulePageOption[]) {
  return options.reduce<Record<string, boolean>>((acc, option) => {
    acc[option.id] = true;
    return acc;
  }, {});
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error("Failed reverse geocode request");

    const data = (await response.json()) as {
      display_name?: string;
      address?: {
        city?: string;
        town?: string;
        village?: string;
        state?: string;
        country?: string;
      };
    };

    const city =
      data.address?.city ?? data.address?.town ?? data.address?.village;
    if (city && data.address?.state) return `${city}, ${data.address.state}`;
    if (city && data.address?.country)
      return `${city}, ${data.address.country}`;
    if (data.display_name)
      return data.display_name.split(",").slice(0, 3).join(",");
  } catch {
    // Fall through to coordinate label when geocoding is unavailable.
  }

  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

function MapViewportSync({ location }: { location: MapLocation | null }) {
  const map = useMap();

  useEffect(() => {
    if (!location) return;
    map.flyTo([location.lat, location.lng], Math.max(map.getZoom(), 7), {
      duration: 0.8,
    });
  }, [location, map]);

  return null;
}

function LocationPicker({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (event) => {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

export default function MapModulePage() {
  const { selectedLocation, setSelectedLocation } = useDashboard();
  const [pointerSelect, setPointerSelect] = useState(true);
  const selected = selectedLocation;
  const [pending, setPending] = useState<MapLocation | null>(null);
  const [mapFocus, setMapFocus] = useState<MapLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string>("");
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [zoneCardOpen, setZoneCardOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    level: "Low" | "Moderate" | "High";
    reason: string;
    activeLayers: number;
  } | null>(null);

  const [riskLayers, setRiskLayers] = useState<Record<RiskLayerKey, boolean>>({
    flood: true,
    drought: true,
    heatwave: true,
    waterStress: true,
  });

  const [envFilters, setEnvFilters] = useState<Record<EnvFilterKey, boolean>>({
    temp: true,
    rainfall: true,
    carbon: true,
    aqi: true,
  });

  const [pollutionPageFilters, setPollutionPageFilters] = useState<
    Record<string, boolean>
  >(() => buildDefaultToggleState(pollutionOptions));
  const [agriPageFilters, setAgriPageFilters] = useState<
    Record<string, boolean>
  >(() => buildDefaultToggleState(agriculturalOptions));

  const toggleRiskLayer = (key: RiskLayerKey) => {
    setRiskLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleEnvFilter = (key: EnvFilterKey) => {
    setEnvFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderToggleSection = <T extends string>(
    title: string,
    options: Record<T, string>,
    state: Record<T, boolean>,
    onToggle: (key: T) => void,
  ) => (
    <section className="rounded-xl border border-slate-200 bg-white px-3 py-3">
      <h3 className="text-sm font-semibold text-slate-900 mb-2">{title}</h3>
      <div className="space-y-1">
        {(Object.keys(options) as T[]).map((key) => (
          <label
            key={key}
            className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-slate-50 cursor-pointer"
          >
            <span className="text-sm text-slate-700">{options[key]}</span>
            <Checkbox
              checked={state[key]}
              onCheckedChange={() => onToggle(key)}
            />
          </label>
        ))}
      </div>
    </section>
  );

  const visiblePoints = useMemo(
    () => riskPoints.filter((point) => riskLayers[point.layer]),
    [riskLayers],
  );

  const nearestPoint = useMemo(() => {
    if (!selected || visiblePoints.length === 0) return null;

    let nearest = visiblePoints[0];
    let nearestDistance = Number.POSITIVE_INFINITY;

    visiblePoints.forEach((point) => {
      const distance = Math.hypot(
        selected.lat - point.lat,
        selected.lng - point.lng,
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = point;
      }
    });

    return nearest;
  }, [selected, visiblePoints]);

  const severityColor = (severity: RiskPoint["severity"]) => {
    if (severity === "critical") return "#e11d48";
    if (severity === "warning") return "#d97706";
    return "#059669";
  };

  const handleAnalyzeRisk = () => {
    if (!selected) {
      setAnalysisResult({
        level: "Low",
        reason: "Select a location first to run risk analysis.",
        activeLayers: 0,
      });
      return;
    }

    const criticalCount = visiblePoints.filter(
      (point) => point.severity === "critical",
    ).length;
    const warningCount = visiblePoints.filter(
      (point) => point.severity === "warning",
    ).length;

    let level: "Low" | "Moderate" | "High" = "Low";
    if (criticalCount >= 2 || (criticalCount >= 1 && warningCount >= 2)) {
      level = "High";
    } else if (criticalCount >= 1 || warningCount >= 2) {
      level = "Moderate";
    }

    const nearestLabel = nearestPoint?.label ?? "No active nearby zone";
    setAnalysisResult({
      level,
      reason: `Nearest active zone: ${nearestLabel}`,
      activeLayers: visiblePoints.length,
    });
  };

  const onMapPick = async (lat: number, lng: number) => {
    if (!pointerSelect) return;
    const label = await reverseGeocode(lat, lng);
    setPending({ lat, lng, label });
    setMapFocus({ lat, lng, label });
    setLocationConfirmed(false);
    setLocationError("");
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.");
      return;
    }

    setIsLocating(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const label = await reverseGeocode(latitude, longitude);
        const location: MapLocation = { lat: latitude, lng: longitude, label };
        setPending(location);
        setMapFocus(location);
        setLocationConfirmed(false);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        setLocationError(error.message || "Unable to fetch current location.");
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const renderPageFilterSection = (
    title: string,
    options: ModulePageOption[],
    filterState: Record<string, boolean>,
    setFilterState: Dispatch<SetStateAction<Record<string, boolean>>>,
  ) => (
    <section className="rounded-xl border border-slate-200 bg-white px-3 py-3">
      <h3 className="text-sm font-semibold text-slate-900 mb-2">{title}</h3>
      <div className="space-y-1">
        {options.map((option) => (
          <div
            key={option.id}
            className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50"
          >
            <Link
              to={option.path}
              className="text-sm text-slate-700 hover:text-emerald-700 transition-colors"
            >
              {option.label}
            </Link>
            <Checkbox
              checked={filterState[option.id]}
              onCheckedChange={() =>
                setFilterState((prev) => ({
                  ...prev,
                  [option.id]: !prev[option.id],
                }))
              }
            />
          </div>
        ))}
      </div>
    </section>
  );

  useEffect(() => {
    if (!selected) return;
    setMapFocus(selected);
  }, [selected]);

  return (
    <DashboardShell>
      <div className="px-4 md:px-6 py-4">
        <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] min-h-[calc(100vh-190px)]">
            <aside className="border-r border-slate-200 bg-slate-50/70">
              <ScrollArea className="h-[calc(100vh-190px)] px-4 py-4">
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-8 w-8 rounded-full bg-emerald-700 text-white flex items-center justify-center">
                        <Navigation className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Project Workspace
                        </p>
                        <p className="text-xs text-slate-500">
                          Global Resilience v2.1
                        </p>
                      </div>
                    </div>
                  </div>

                  <section>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-700" />
                      Location
                    </h3>
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
                      {selected ? selected.label : "No location selected"}
                    </div>
                    {selected && (
                      <p className="text-xs text-slate-500 mt-1">
                        {selected.lat.toFixed(4)} N, {selected.lng.toFixed(4)} E
                      </p>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="mt-2 w-full justify-start"
                      disabled={isLocating}
                      onClick={handleUseMyLocation}
                    >
                      <Crosshair className="mr-1.5 h-4 w-4" />
                      {isLocating ? "Locating..." : "Use My Location"}
                    </Button>
                    {locationError && (
                      <p className="text-xs text-rose-600 mt-1">
                        {locationError}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-2">
                      Click on map while pointer select is on to set pending
                      coordinates.
                    </p>
                  </section>

                  {renderToggleSection<RiskLayerKey>(
                    "Risk Layers",
                    riskLayerLabels,
                    riskLayers,
                    toggleRiskLayer,
                  )}

                  {renderToggleSection<EnvFilterKey>(
                    "Environmental Filters",
                    envFilterLabels,
                    envFilters,
                    toggleEnvFilter,
                  )}

                  {renderPageFilterSection(
                    "Pollution Insights Options",
                    pollutionOptions,
                    pollutionPageFilters,
                    setPollutionPageFilters,
                  )}

                  {renderPageFilterSection(
                    "Agricultural Stability Options",
                    agriculturalOptions,
                    agriPageFilters,
                    setAgriPageFilters,
                  )}
                </div>
              </ScrollArea>
            </aside>

            <section className="relative bg-slate-100">
              <div className="absolute top-4 left-4 right-4 z-[500] flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  className={cn(
                    pointerSelect
                      ? "bg-emerald-700 hover:bg-emerald-800"
                      : "bg-slate-700 hover:bg-slate-800",
                  )}
                  onClick={() => setPointerSelect((v) => !v)}
                >
                  <LocateFixed className="mr-1.5 h-4 w-4" />
                  Pointer Select {pointerSelect ? "ON" : "OFF"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(
                    "border transition-colors",
                    locationConfirmed
                      ? "bg-emerald-700 !text-white border-emerald-700 hover:bg-emerald-800"
                      : "bg-white/90 border-slate-200 text-slate-900 hover:bg-white",
                  )}
                  onClick={() => {
                    if (!pending) return;
                    setSelectedLocation(pending);
                    setMapFocus(pending);
                    setPending(null);
                    setLocationConfirmed(true);
                  }}
                >
                  {locationConfirmed
                    ? "Location Confirmed!"
                    : "Confirm Location"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/90"
                  onClick={() => setPending(null)}
                >
                  Clear Pending
                </Button>

                <div className="ml-auto rounded-full bg-slate-900/40 text-white px-3 py-1.5 text-[11px] font-semibold tracking-wide">
                  LNG: {(pending?.lng ?? selected?.lng ?? 0).toFixed(4)} | LAT:{" "}
                  {(pending?.lat ?? selected?.lat ?? 0).toFixed(4)}
                </div>
              </div>

              <MapContainer
                center={[26.2313, 78.2077]}
                zoom={6}
                className="h-full w-full"
                minZoom={3}
                maxZoom={14}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapViewportSync location={mapFocus} />
                <LocationPicker onPick={onMapPick} />

                {visiblePoints.map((point) => (
                  <CircleMarker
                    key={point.id}
                    center={[point.lat, point.lng]}
                    radius={8}
                    pathOptions={{
                      color: "#ffffff",
                      weight: 2,
                      fillColor: severityColor(point.severity),
                      fillOpacity: 0.95,
                    }}
                  >
                    <Tooltip>{point.label}</Tooltip>
                  </CircleMarker>
                ))}

                {selected && (
                  <CircleMarker
                    center={[selected.lat, selected.lng]}
                    radius={9}
                    pathOptions={{
                      color: "#0f766e",
                      weight: 2,
                      fillColor: "#14b8a6",
                      fillOpacity: 0.85,
                    }}
                  >
                    <Tooltip>Confirmed location</Tooltip>
                  </CircleMarker>
                )}

                {pending && (
                  <CircleMarker
                    center={[pending.lat, pending.lng]}
                    radius={9}
                    pathOptions={{
                      color: "#065f46",
                      weight: 2,
                      fillColor: "#10b981",
                      fillOpacity: 0.6,
                    }}
                  >
                    <Tooltip>Pending location</Tooltip>
                  </CircleMarker>
                )}
              </MapContainer>

              <div className="absolute bottom-4 left-4 z-[500] rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 shadow-md p-4 w-[270px]">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Active Legend
                </p>
                <div className="mt-3 h-2 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500" />
                <div className="mt-1 flex justify-between text-[11px] text-slate-500">
                  <span>12°C</span>
                  <span>48°C</span>
                </div>
                <div className="mt-3 space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
                    Critical Risk Area
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm bg-emerald-700" />
                    Conservation Zone
                  </div>
                </div>
              </div>

              {pending && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[500] rounded-full bg-emerald-900 text-emerald-50 px-4 py-2 text-sm font-medium shadow-lg">
                  Pending location: {pending.label}. Click Confirm Location.
                </div>
              )}

              <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[500] space-y-2">
                <Button
                  type="button"
                  onClick={handleAnalyzeRisk}
                  className="rounded-full bg-emerald-800 hover:bg-emerald-900 px-5"
                >
                  Analyze Risk
                </Button>
                <Button
                  type="button"
                  onClick={() => setZoneCardOpen((value) => !value)}
                  variant="secondary"
                  className="rounded-full bg-white/90"
                >
                  {zoneCardOpen ? "Hide Zone Card" : "Show Zone Card"}
                </Button>
              </div>

              {analysisResult && (
                <div className="absolute top-20 right-4 z-[500] w-[280px] rounded-xl border border-slate-200 bg-white/90 backdrop-blur shadow-lg p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                    Risk Analysis
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    Risk Level: {analysisResult.level}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {analysisResult.reason}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Active risk points: {analysisResult.activeLayers}
                  </p>
                </div>
              )}

              {zoneCardOpen && (
                <div className="absolute bottom-4 right-4 z-[500] w-[300px] rounded-xl border border-slate-200 bg-white/90 backdrop-blur shadow-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                    Zone Card
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {selected?.label ?? "No location selected"}
                  </p>
                  {selected && (
                    <p className="mt-1 text-xs text-slate-600">
                      {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-600">
                    Nearest active zone: {nearestPoint?.label ?? "None"}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Pointer Select: {pointerSelect ? "ON" : "OFF"}
                  </p>
                </div>
              )}

              {visiblePoints.length === 0 && (
                <div className="absolute inset-0 z-[450] flex items-center justify-center pointer-events-none">
                  <div className="rounded-xl bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 shadow">
                    <AlertTriangle className="inline h-4 w-4 mr-1.5 text-amber-600" />
                    No risk layers selected.
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
