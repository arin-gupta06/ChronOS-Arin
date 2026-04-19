import { cn } from "@/lib/utils";

interface Column {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, React.ReactNode>[];
  className?: string;
  delay?: number;
}

export function DataTable({ columns, data, className, delay = 0 }: DataTableProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-2xl shadow-soft border border-border/60 overflow-hidden opacity-0 animate-fade-in",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-5 py-3 text-sm",
                      col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                    )}
                  >
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
