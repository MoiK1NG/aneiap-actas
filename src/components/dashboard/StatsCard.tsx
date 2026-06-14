"use client";

import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: "blue" | "green" | "red" | "amber";
  className?: string;
}

const colorMap = {
  blue:  { icon: "bg-blue-500/10 text-blue-400 border border-blue-500/20",    val: "text-blue-400"    },
  green: { icon: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", val: "text-emerald-400" },
  red:   { icon: "bg-rose-500/10 text-rose-400 border border-rose-500/20",     val: "text-rose-400"    },
  amber: { icon: "bg-amber-500/10 text-amber-400 border border-amber-500/20",  val: "text-amber-400"   },
};

export function StatsCard({ title, value, subtitle, icon, color = "blue", className }: StatsCardProps) {
  const c = colorMap[color];
  return (
    <div className={cn(
      "rounded-xl border border-slate-800 bg-slate-900 p-4 flex items-center gap-4",
      "hover:border-slate-700 hover:bg-slate-800/60 transition-all duration-200",
      className
    )}>
      {icon && (
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", c.icon)}>
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">{title}</p>
        <p className={cn("text-2xl font-bold leading-none font-mono", c.val)}>{value}</p>
        {subtitle && <p className="text-xs text-slate-600 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
