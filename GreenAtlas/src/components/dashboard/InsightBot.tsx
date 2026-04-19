import { Bot, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsightBotProps {
  message: string;
  className?: string;
  delay?: number;
}

export function InsightBot({ message, className, delay = 0 }: InsightBotProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-4 shadow-sm opacity-0 animate-fade-in",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900 mb-1">Insights Bot</p>
          <p className="text-sm text-slate-500 leading-relaxed italic">"{message}"</p>
          <button className="flex items-center gap-1 text-xs font-medium text-primary mt-2 hover:underline">
            Full Analysis <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
