import { Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

interface SmartSuggestionCardProps {
  suggestion: string;
  linkText: string;
  href: string;
}

export function SmartSuggestionCard({ suggestion, linkText, href }: SmartSuggestionCardProps) {
  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-slate-50 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
          <Lightbulb className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Smart Suggestion</p>
          <p className="text-xs text-slate-600 mt-0.5">{suggestion}</p>
          <Link to={href} className="mt-1 inline-block text-xs font-semibold text-emerald-700 hover:text-emerald-900">
            {linkText} →
          </Link>
        </div>
      </div>
    </div>
  );
}
