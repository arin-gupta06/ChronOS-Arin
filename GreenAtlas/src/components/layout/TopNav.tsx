import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Globe, Search, Bell, Download, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/context/DashboardContext";
import { timeRangeOptions } from "@/lib/timeRange";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Map", path: "/map" },
  { label: "Risk Analysis", path: "/risk" },
  { label: "Environmental Trends", path: "/trends" },
  { label: "Pollution Insights", path: "/pollution" },
  { label: "Agricultural Stability", path: "/agriculture" },
  { label: "Reports", path: "/reports" },
];

export function TopNav() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { selectedLocation, timeRange, setTimeRange } = useDashboard();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/75 backdrop-blur-xl border-b border-white/30 shadow-sm">
      <div className="flex items-center justify-between h-14 px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-3">
          <button className="md:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setIsOpen((v) => !v)}>
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Globe className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold text-slate-900 text-base">GreenAtlas</span>
          </Link>
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-2.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition-all duration-200 border-b-2 border-transparent",
                  isActive(item.path)
                    ? "text-emerald-700 border-emerald-600"
                    : "text-slate-600 hover:text-slate-800 hover:border-slate-200"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center rounded-xl border border-slate-200 bg-white/80 p-1">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTimeRange(option.value)}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors",
                  timeRange === option.value
                    ? "bg-emerald-700 text-white"
                    : "text-slate-600 hover:bg-slate-100",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="hidden lg:flex max-w-[280px] items-center rounded-xl border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-900">
            <span className="truncate">{selectedLocation.label}</span>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-slate-500" />
            <input
              placeholder="Search data points..."
              className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none w-40"
            />
          </div>
          <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <Bell className="h-4 w-4 text-slate-700" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-600" />
          </button>
          <button className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-800 transition-colors active:scale-[0.97]">
            <Download className="h-3.5 w-3.5" />
            Export Report
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/60 px-4 py-3">
          <div className="mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
              Time Range
            </p>
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTimeRange(option.value)}
                  className={cn(
                    "flex-1 px-2 py-1.5 text-xs font-semibold rounded-md transition-colors",
                    timeRange === option.value
                      ? "bg-emerald-700 text-white"
                      : "text-slate-600 hover:bg-slate-100",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium",
                  isActive(item.path)
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-700 hover:bg-slate-100"
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
