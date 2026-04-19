import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  defaultTimeRange,
  isTimeRange,
  type TimeRange,
} from "@/lib/timeRange";

type Zone = "Zone A-12" | "Zone B-04" | "Zone C-18" | "Zone D-07" | "";

export interface SharedLocation {
  lat: number;
  lng: number;
  label: string;
}

const LOCATION_KEY = "greenatlas.map.selectedLocation.v1";
const TIME_RANGE_KEY = "greenatlas.analytics.timeRange.v1";

const defaultSelectedLocation: SharedLocation = {
  lat: 26.2313,
  lng: 78.2077,
  label: "Gird Tahsil, Madhya Pradesh, India",
};

function getStoredLocation(): SharedLocation {
  if (typeof window === "undefined") return defaultSelectedLocation;

  try {
    const raw = window.localStorage.getItem(LOCATION_KEY);
    if (!raw) return defaultSelectedLocation;
    const parsed = JSON.parse(raw) as Partial<SharedLocation>;
    if (typeof parsed.lat === "number" && typeof parsed.lng === "number") {
      return {
        lat: parsed.lat,
        lng: parsed.lng,
        label:
          typeof parsed.label === "string" && parsed.label.trim().length > 0
            ? parsed.label
            : `${parsed.lat.toFixed(4)}, ${parsed.lng.toFixed(4)}`,
      };
    }
  } catch {
    // Fall back to default location if persisted payload is malformed.
  }

  return defaultSelectedLocation;
}

function getStoredTimeRange(): TimeRange {
  if (typeof window === "undefined") return defaultTimeRange;

  const stored = window.localStorage.getItem(TIME_RANGE_KEY);
  if (!stored || !isTimeRange(stored)) return defaultTimeRange;

  return stored;
}

interface DashboardContextValue {
  selectedZone: Zone;
  setSelectedZone: (zone: Zone) => void;
  clearSelectedZone: () => void;
  selectedLocation: SharedLocation;
  setSelectedLocation: (location: SharedLocation) => void;
  clearSelectedLocation: () => void;
  timeRange: TimeRange;
  setTimeRange: (timeRange: TimeRange) => void;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(
  undefined,
);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [selectedZone, setSelectedZone] = useState<Zone>("");
  const [selectedLocation, setSelectedLocation] =
    useState<SharedLocation>(getStoredLocation);
  const [timeRange, setTimeRange] = useState<TimeRange>(getStoredTimeRange);

  const clearSelectedZone = () => setSelectedZone("");
  const clearSelectedLocation = () =>
    setSelectedLocation(defaultSelectedLocation);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LOCATION_KEY, JSON.stringify(selectedLocation));
  }, [selectedLocation]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TIME_RANGE_KEY, timeRange);
  }, [timeRange]);

  return (
    <DashboardContext.Provider
      value={{
        selectedZone,
        setSelectedZone,
        clearSelectedZone,
        selectedLocation,
        setSelectedLocation,
        clearSelectedLocation,
        timeRange,
        setTimeRange,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context)
    throw new Error("useDashboard must be used within DashboardProvider");
  return context;
}
