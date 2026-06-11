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
  blue:   { card: "bg-white border-blue-100",   icon: "bg-blue-600",   val: "text-blue-700",   sub: "text-blue-400"  },
  green:  { card: "bg-white border-green-100",  icon: "bg-green-600",  val: "text-green-700",  sub: "text-green-400" },
  red:    { card: "bg-white border-red-100",     icon: "bg-red-500",    val: "text-red-600",    sub: "text-red-400"   },
  yellow: { card: "bg-white border-yellow-100",  icon: "bg-yellow-500", val: "text-yellow-700", sub: "text-yellow-500"},
  purple: { card: "bg-white border-purple-100",  icon: "bg-purple-600", val: "text-purple-700", sub: "text-purple-400"},
};

export function StatsCard({ title, value, subtitle, icon, color = "blue", className }: StatsCardProps) {
  const c = colorMap[color];
  return (
    <div className={cn(
      "rounded-2xl border-2 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow",
      c.card, className
    )}>
      {icon && (
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0",
          c.icon
        )}>
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
        <p className={cn("text-3xl font-black mt-0.5 leading-none", c.val)}>{value}</p>
        {subtitle && <p className={cn("text-xs mt-1 font-medium", c.sub)}>{subtitle}</p>}
      </div>
    </div>
  );
}
