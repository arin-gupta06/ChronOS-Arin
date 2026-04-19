import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "safe" | "warning" | "critical" | "online" | "offline" | "alert";
  label?: string;
}

const config = {
  safe: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-600" },
  warning: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  critical: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-600" },
  online: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-600" },
  offline: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
  alert: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const c = config[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide", c.bg, c.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      {label || status}
    </span>
  );
}
