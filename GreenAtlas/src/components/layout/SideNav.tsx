import { Link, useLocation } from "react-router-dom";
import { BarChart3, Droplet, CloudRain, Sun, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

const mainModules = [
  { label: "Home", path: "/", icon: BarChart3 },
  { label: "Risk Analysis", path: "/risk", icon: Scale },
  { label: "Environmental Trends", path: "/trends", icon: CloudRain },
  { label: "Pollution Insights", path: "/pollution", icon: Droplet },
  { label: "Agricultural Stability", path: "/agriculture", icon: Sun },
  { label: "Reports", path: "/reports", icon: BarChart3 },
];

const riskSubmodules = [
  { label: "Flood Risks", path: "/risk/flood" },
  { label: "Drought Risks", path: "/risk/drought" },
  { label: "Heatwave", path: "/risk/heatwave" },
  { label: "Water Stress", path: "/risk/water" },
  { label: "Comparison", path: "/risk/comparison" },
];

export function SideNav() {
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const showingRiskSub = location.pathname.startsWith("/risk");

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col border-r border-slate-200 bg-white/70 backdrop-blur-xl px-3 py-4 sticky top-0 h-screen">
      <div className="mb-6 px-2">
        <h3 className="text-xs tracking-wider text-slate-500 uppercase font-semibold mb-2">Module Nav</h3>
        <p className="text-sm font-bold text-slate-800">Risk & Insights Workspace</p>
      </div>
      <nav className="flex flex-col gap-1">
        {mainModules.map((module) => {
          const Icon = module.icon;
          return (
            <Link
              key={module.path}
              to={module.path}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200",
                isActive(module.path)
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              )}
            >
              <Icon className="h-4 w-4" />
              {module.label}
            </Link>
          );
        })}
      </nav>

      {showingRiskSub && (
        <section className="mt-6 px-3">
          <h4 className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">Risk Detail</h4>
          <div className="flex flex-col gap-1">
            {riskSubmodules.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
                  location.pathname === item.path
                    ? "bg-emerald-100 text-emerald-800"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}
