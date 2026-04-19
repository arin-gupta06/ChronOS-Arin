import { AlertTriangle, Info, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  title: string;
  description: string;
  time: string;
  severity: "info" | "warning" | "critical" | "success";
}

interface AlertPanelProps {
  title?: string;
  alerts: Alert[];
  className?: string;
  delay?: number;
}

const severityConfig = {
  info: { icon: Info, bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500" },
  warning: { icon: AlertTriangle, bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  critical: { icon: AlertTriangle, bg: "bg-rose-100", text: "text-rose-700", dot: "bg-rose-600" },
  success: { icon: CheckCircle, bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-600" },
};

export function AlertPanel({ title = "Environmental Alerts", alerts, className, delay = 0 }: AlertPanelProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-4 shadow-sm opacity-0 animate-fade-in",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <h3 className="text-base font-semibold text-slate-900 mb-3">{title}</h3>
      <div className="space-y-2.5">
        {alerts.map((alert, i) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;
          return (
            <div key={i} className={cn("flex items-start gap-3 p-3 rounded-xl", config.bg)}>
              <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", config.text)} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">{alert.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{alert.description}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                <Clock className="h-3 w-3" />
                {alert.time}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
