import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { SmartSuggestionCard } from "@/components/dashboard/SmartSuggestionCard";

interface SubNavItem {
  label: string;
  path: string;
  icon?: LucideIcon;
}

interface ModuleLayoutProps {
  children: React.ReactNode;
  tabs: SubNavItem[];
}

export function ModuleLayout({ children, tabs }: ModuleLayoutProps) {
  const location = useLocation();

  const suggestions: Record<string, { suggestion: string; linkText: string; href: string }> = {
    "/risk": { suggestion: "Review new hotspots and schedule follow-up alerts.", linkText: "Go to Alerts", href: "/risk" },
    "/trends": { suggestion: "Export trending insights for your sustainability report.", linkText: "Export a Report", href: "/reports" },
    "/pollution": { suggestion: "Compare pollutant sources and refine policy targets.", linkText: "Open Report Builder", href: "/reports" },
    "/agriculture": { suggestion: "Check sensor status and adjust irrigation recommendations.", linkText: "View Sensors", href: "/agriculture" },
  };

  const activeSuggestion = suggestions[location.pathname] ?? {
    suggestion: "Explore key metrics and share the dashboard snapshot.",
    linkText: "Share Snapshot",
    href: "/reports",
  };

  return (
    <div className="flex min-h-screen bg-transparent">
      <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-slate-200 bg-white/70 backdrop-blur-xl p-4">
        <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-3 font-semibold">Module Navigation</h3>
        <div className="space-y-2">
          {tabs.map((tab) => {
            const active = location.pathname === tab.path;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                  active
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                )}
              >
                {tab.icon && <tab.icon className="h-4 w-4" />}
                {tab.label}
              </Link>
            );
          })}
        </div>
      </aside>
      <div className="flex-1">
        <div className="lg:hidden border-b border-white/20 bg-white/70 backdrop-blur-xl">
          <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const active = location.pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={cn(
                    "px-3 py-2 text-xs font-semibold whitespace-nowrap rounded-lg transition-all duration-200",
                    active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              {children}
              <SmartSuggestionCard {...activeSuggestion} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
