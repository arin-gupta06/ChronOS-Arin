import { useMemo, useState } from "react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronDown, ChevronUp } from "lucide-react";

interface InsightItem {
  id: string;
  when: string;
  headline: string;
  summary: string;
  detail: string;
  data: Array<{ name: string; value: number }>;
}

const insights: InsightItem[] = [
  {
    id: "sasia",
    when: "2m ago",
    headline: "Anomaly detected in South Asia's precipitation",
    summary: "Precipitation is 12% below expected seasonal baseline.",
    detail: "Our models indicate an emerging dry spell in South Asia, requiring immediate alerting for agriculture risk management.",
    data: [
      { name: "Mon", value: 78 },
      { name: "Tue", value: 72 },
      { name: "Wed", value: 68 },
      { name: "Thu", value: 60 },
      { name: "Fri", value: 55 },
      { name: "Sat", value: 52 },
      { name: "Sun", value: 49 },
    ],
  },
  {
    id: "ameco",
    when: "14h ago",
    headline: "Rapid carbon surge in Amazon corridor",
    summary: "CO₂ readings exceeded safe threshold by 4.8%.",
    detail: "Zone monitoring suggests vehicular emissions + forestry disturbance, further analysis recommended for regulatory compliance.",
    data: [
      { name: "Mon", value: 390 },
      { name: "Tue", value: 398 },
      { name: "Wed", value: 405 },
      { name: "Thu", value: 410 },
      { name: "Fri", value: 418 },
      { name: "Sat", value: 421 },
      { name: "Sun", value: 425 },
    ],
  },
  {
    id: "europe",
    when: "1d ago",
    headline: "Heat wave in Western Europe enters 5th day",
    summary: "Temp has increased 1.1°C above historical normal.",
    detail: "This trend may affect energy demand and crop health. Recommend moving to heat-mitigation mode in forecasting, and issuing community-level advisories.",
    data: [
      { name: "Mon", value: 18 },
      { name: "Tue", value: 19 },
      { name: "Wed", value: 21 },
      { name: "Thu", value: 23 },
      { name: "Fri", value: 24 },
      { name: "Sat", value: 25 },
      { name: "Sun", value: 25.5 },
    ],
  },
];

export function InsightDiscoveryFeed() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const toggled = (id: string) => setActiveId((current) => (current === id ? null : id));

  const cards = useMemo(() => insights, []);

  return (
    <section className="bg-white/70 border border-slate-200 shadow-sm rounded-2xl p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-slate-900">Insight Discovery Feed</h3>
        <span className="text-xs font-medium uppercase text-slate-500 tracking-[0.15em]">Gamified watchlist</span>
      </div>
      <div className="space-y-2">
        {cards.map((item) => {
          const isOpen = activeId === item.id;
          return (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-white/70 p-3 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">{item.when}</p>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{item.headline}</h4>
                  <p className="text-xs text-slate-500 mt-1">{item.summary}</p>
                </div>
                <button
                  onClick={() => toggled(item.id)}
                  className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  aria-expanded={isOpen}
                >
                  {isOpen ? "Hide" : "Reveal Data"} {isOpen ? <ChevronUp className="inline h-3.5 w-3.5" /> : <ChevronDown className="inline h-3.5 w-3.5" />}
                </button>
              </div>
              <div
                className={`overflow-hidden transition-all duration-500 ${isOpen ? "mt-3 max-h-96" : "mt-0 max-h-0"}`}
              >
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 mt-3">
                  <p className="text-xs font-medium text-slate-500 mb-2">Contextual trend summary:</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.detail}</p>
                  <div className="h-32 mt-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={item.data}>
                        <defs>
                          <linearGradient id={`insightGradient-${item.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.55} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(148,163,184,0.25)", borderRadius: 8, color: "#fff" }}
                          formatter={(value: number) => [`${value}`, "Value"]}
                        />
                        <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} fill={`url(#insightGradient-${item.id})`} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
