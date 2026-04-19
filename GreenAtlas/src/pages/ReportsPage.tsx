import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { DataTable } from "@/components/dashboard/DataTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Download, FileText } from "lucide-react";

const reports = [
  { name: "Q4 2025 Climate Risk Report", type: "PDF", date: "Dec 15, 2025", module: "Risk Analysis", status: "ready" as const },
  { name: "Annual Environmental Trends", type: "PDF", date: "Jan 2, 2026", module: "Env. Trends", status: "ready" as const },
  { name: "Monthly Pollution Summary", type: "CSV", date: "Mar 1, 2026", module: "Pollution", status: "ready" as const },
  { name: "Agricultural Stability — Spring", type: "PDF", date: "Mar 15, 2026", module: "Agriculture", status: "ready" as const },
  { name: "Weekly AQI Digest", type: "PDF", date: "Mar 18, 2026", module: "Pollution", status: "ready" as const },
];

export default function ReportsPage() {
  return (
    <DashboardShell>
      <div className="p-6">
        <PageHeader
          title="Reports"
          subtitle="Export and review generated reports from all platform modules."
          actions={
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.97]">
              <FileText className="h-3.5 w-3.5" />
              Generate New Report
            </button>
          }
        />
        <DataTable
          columns={[
            { key: "name", label: "Report Name" },
            { key: "type", label: "Type", align: "center" },
            { key: "date", label: "Date", align: "center" },
            { key: "module", label: "Module", align: "center" },
            { key: "action", label: "", align: "right" },
          ]}
          data={reports.map((r) => ({
            name: (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{r.name}</span>
              </div>
            ),
            type: <StatusBadge status="safe" label={r.type} />,
            date: <span className="text-sm text-muted-foreground">{r.date}</span>,
            module: <span className="text-sm">{r.module}</span>,
            action: (
              <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <Download className="h-4 w-4 text-muted-foreground" />
              </button>
            ),
          }))}
          delay={100}
        />
      </div>
    </DashboardShell>
  );
}
