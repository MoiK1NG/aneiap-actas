"use client";

import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: "blue" | "green" | "red" | "yellow" | "purple";
  className?: string;
}

const colorMap = {
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  green: "bg-green-50 border-green-200 text-green-700",
  red: "bg-red-50 border-red-200 text-red-700",
  yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
  purple: "bg-purple-50 border-purple-200 text-purple-700",
};

export function StatsCard({ title, value, subtitle, icon, color = "blue", className }: StatsCardProps) {
  return (
    <div className={cn("rounded-xl border p-4 flex items-start gap-3", colorMap[color], className)}>
      {icon && <div className="mt-0.5 opacity-80">{icon}</div>}
      <div className="min-w-0">
        <p className="text-sm font-medium opacity-75">{title}</p>
        <p className="text-3xl font-bold mt-0.5">{value}</p>
        {subtitle && <p className="text-xs opacity-60 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
