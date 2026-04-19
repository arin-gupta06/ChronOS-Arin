import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { getTimeRangeLabel } from "@/lib/timeRange";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: PageHeaderProps) {
  const { selectedLocation, timeRange } = useDashboard();

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6",
        className,
      )}
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-[0.02em] uppercase leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">{subtitle}</p>
        )}
        <p className="mt-1 text-xs font-medium text-slate-500">
          Showing data for {getTimeRangeLabel(timeRange)}
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-900">
          <MapPin className="h-3.5 w-3.5" />
          <span className="max-w-[70vw] truncate sm:max-w-[48vw]">
            {selectedLocation.label}
          </span>
          <span className="text-emerald-700/80">
            ({selectedLocation.lat.toFixed(4)},{" "}
            {selectedLocation.lng.toFixed(4)})
          </span>
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 mt-3 sm:mt-0">{actions}</div>
      )}
    </div>
  );
}
