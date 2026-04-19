import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  subtitle?: string;
  status?: "safe" | "warning" | "critical" | "neutral";
  isCritical?: boolean;
  className?: string;
  delay?: number;
}

const statusColors = {
  safe: "text-emerald-600",
  warning: "text-amber-500",
  critical: "text-rose-600",
  neutral: "text-slate-600",
};

const trendColors = {
  up: "text-emerald-600",
  down: "text-rose-600",
  neutral: "text-slate-500",
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

export function MetricCard({ title, value, change, trend = "neutral", subtitle, status = "neutral", isCritical = false, className, delay = 0 }: MetricCardProps) {
  const TrendIcon = trendIcons[trend];
  const trendColor = trendColors[trend];

  const criticalVisuals = isCritical
    ? "bg-gradient-to-br from-rose-50 via-white to-rose-100 shadow-lg ring-1 ring-rose-200 animate-pulse-soft scale-[1.01]"
    : "bg-white"

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, scale: isCritical ? 1.02 : 1 }}
      transition={{ delay: delay / 1000, duration: 0.35 }}
      className={cn(
        `${criticalVisuals} border border-gray-200 rounded-lg p-4 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl hover:scale-[1.01]`,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
          <p className={cn("mt-2 text-2xl font-bold text-slate-900 font-display", statusColors[status])}>{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {change && (
          <div className={cn("flex items-center gap-1 text-xs font-semibold", trendColor)}>
            <TrendIcon className="h-4 w-4" />
            <span>{change}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
