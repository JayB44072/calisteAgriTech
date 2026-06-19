// src/components/ui/KpiCard.tsx

import { ReactNode } from "react";
import { cardHover } from "../../lib/animations";

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  trend?: { value: number; label: string };
  color?: "green" | "blue" | "amber" | "red" | "emerald";
  loading?: boolean;
  delay?: number;
}

const colorMap = {
  green: "bg-green-50 text-green-600 border-green-100",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  red: "bg-red-50 text-red-600 border-red-100",
};

const iconBg = {
  green: "bg-green-100 text-green-600",
  emerald: "bg-emerald-100 text-emerald-600",
  blue: "bg-blue-100 text-blue-600",
  amber: "bg-amber-100 text-amber-600",
  red: "bg-red-100 text-red-600",
};

export function KpiCard({
  title, value, unit, icon, trend, color = "green", loading = false, delay = 0
}: KpiCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 rounded bg-gray-100" />
          <div className="h-8 w-16 rounded bg-gray-100" />
          <div className="h-3 w-20 rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm ${cardHover} animate-fade-in-up ${colorMap[color]}`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </div>
          {trend && (
            <p
              className={`mt-1 text-xs font-medium ${
                trend.value >= 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={`rounded-xl p-3 ${iconBg[color]}`}>{icon}</div>
      </div>
    </div>
  );
}




















