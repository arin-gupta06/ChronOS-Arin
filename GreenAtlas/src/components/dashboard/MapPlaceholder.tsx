import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import { Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/context/DashboardContext";

interface MapPlaceholderProps {
  title?: string;
  subtitle?: string;
  className?: string;
  markers?: {
    label: string;
    status: "safe" | "warning" | "critical";
    lat?: number;
    lng?: number;
  }[];
  legend?: { label: string; color: string }[];
  onMarkerClick?: (zone: string) => void;
  delay?: number;
}

type MarkerStatus = "safe" | "warning" | "critical";

const statusColors: Record<MarkerStatus, string> = {
  safe: "#059669",
  warning: "#d97706",
  critical: "#dc2626",
};

const knownCoords: Record<string, [number, number]> = {
  Seattle: [47.6062, -122.3321],
  "Zone A-12": [-3.4653, -62.2159],
  "Zone B-04": [25.2048, 55.2708],
  "Zone C-18": [34.0479, 100.6197],
  "Zone D-07": [23.4162, 25.6628],
  "Delta-7": [30.0444, 31.2357],
  "Coast-3": [13.7563, 100.5018],
  "Parcel-4B": [41.9028, 12.4964],
  "East Ridge": [35.6895, 139.6917],
  "Valley Floor": [19.4326, -99.1332],
  "Parcel-1A": [40.4168, -3.7038],
  "Parcel-3C": [39.7392, -104.9903],
  "Ridge-East": [55.7558, 37.6176],
  "Hub-N1": [59.9139, 10.7522],
  "Hub-E2": [1.3521, 103.8198],
  "Hub-S3": [-33.8688, 151.2093],
  "Hub-W4": [37.7749, -122.4194],
  "Node-14": [52.52, 13.405],
  "Node-22": [48.8566, 2.3522],
  "Node-38": [45.4642, 9.19],
  "Node-12": [50.1109, 8.6821],
};

function hashToCoords(label: string): [number, number] {
  let hash = 0;
  for (let i = 0; i < label.length; i += 1) {
    hash = (hash << 5) - hash + label.charCodeAt(i);
    hash |= 0;
  }

  const normalized = Math.abs(hash);
  const lat = -55 + (normalized % 125);
  const lng = -170 + ((normalized * 7) % 340);
  return [Number(lat.toFixed(4)), Number(lng.toFixed(4))];
}

function MapViewportController({
  points,
  focusSignal,
  focusPoint,
}: {
  points: [number, number][];
  focusSignal: number;
  focusPoint?: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (focusPoint) {
      map.flyTo(focusPoint, Math.max(map.getZoom(), 7), { duration: 0.7 });
      return;
    }

    if (points.length === 0) {
      map.setView([20, 0], 2);
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 5);
      return;
    }

    map.fitBounds(points, { padding: [24, 24] });
  }, [map, points, focusSignal, focusPoint]);

  return null;
}

function MapResizeSync() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer().parentElement;
    if (!container || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  return null;
}

export function MapPlaceholder({
  title = "Interactive Risk Map",
  subtitle,
  className,
  markers = [],
  legend = [],
  onMarkerClick,
  delay = 0,
}: MapPlaceholderProps) {
  const [focusSignal, setFocusSignal] = useState(0);
  const { selectedLocation } = useDashboard();

  const markersWithSelection = useMemo(() => {
    if (!selectedLocation) return markers;
    const hasSelected = markers.some(
      (m) =>
        m.label === selectedLocation.label ||
        (typeof m.lat === "number" &&
          typeof m.lng === "number" &&
          m.lat === selectedLocation.lat &&
          m.lng === selectedLocation.lng),
    );
    if (hasSelected) return markers;

    const injected = {
      label: selectedLocation.label,
      status: "safe" as const,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
    };

    return [injected, ...markers];
  }, [markers, selectedLocation]);

  const resolvedMarkers = useMemo(
    () =>
      markersWithSelection.map((marker) => {
        const coords =
          typeof marker.lat === "number" && typeof marker.lng === "number"
            ? [marker.lat, marker.lng]
            : (knownCoords[marker.label] ?? hashToCoords(marker.label));

        return { ...marker, coords: coords as [number, number] };
      }),
    [markersWithSelection],
  );

  const points = useMemo(
    () => resolvedMarkers.map((marker) => marker.coords),
    [resolvedMarkers],
  );

  const focusPoint = useMemo(() => {
    if (!selectedLocation) return null;
    return [selectedLocation.lat, selectedLocation.lng] as [number, number];
  }, [selectedLocation]);

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden opacity-0 animate-fade-in",
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setFocusSignal((v) => v + 1)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          aria-label="Refocus map"
        >
          <Maximize2 className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      <div className="relative h-[320px] mx-5 mb-3 rounded-xl overflow-hidden border border-slate-200">
        <MapContainer
          className="h-full w-full z-0"
          center={focusPoint ?? [20, 0]}
          zoom={focusPoint ? 7 : 2}
          minZoom={2}
          maxZoom={12}
          scrollWheelZoom
          worldCopyJump
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapResizeSync />
          <MapViewportController
            points={points}
            focusSignal={focusSignal}
            focusPoint={focusPoint}
          />
          {resolvedMarkers.map((marker) => (
            <CircleMarker
              key={marker.label}
              center={marker.coords}
              radius={6}
              pathOptions={{
                color: "#ffffff",
                weight: 2,
                fillColor: statusColors[marker.status],
                fillOpacity: 0.95,
              }}
              eventHandlers={{ click: () => onMarkerClick?.(marker.label) }}
            >
              <Tooltip direction="top" offset={[0, -6]}>
                {marker.label}
              </Tooltip>
              <Popup>
                <div className="text-xs">
                  <div className="font-semibold text-slate-900">
                    {marker.label}
                  </div>
                  <div className="text-slate-600 capitalize">
                    Status: {marker.status}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {resolvedMarkers.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/65">
            <span className="text-xs font-medium text-slate-600">
              No regions selected yet
            </span>
          </div>
        )}
      </div>

      {legend.length > 0 && (
        <div className="px-5 pb-4 flex items-center gap-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Legend
          </span>
          {legend.map((l, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={cn("h-2.5 w-2.5 rounded-full", l.color)} />
              <span className="text-xs text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
