"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
} from "recharts";
import { DashboardStats, MotionCategory } from "@/types";
import { CATEGORY_LABELS, CHART_COLORS } from "@/lib/utils";

interface Props { stats: DashboardStats }

const DARK_GRID   = "#1e293b";
const DARK_TICK   = { fill: "#475569", fontSize: 11 };
const DARK_AXIS   = { stroke: "#1e293b" };
const DARK_TOOLTIP = {
  contentStyle: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    color: "#e2e8f0",
    fontSize: "12px",
    fontFamily: "'Sora', system-ui, sans-serif",
  },
  cursor: { fill: "rgba(255,255,255,0.04)" },
};

export function MotionsByYearChart({ stats }: Props) {
  const data = Object.entries(stats.motionsByYear)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([year, total]) => ({
      year,
      total,
      aprobadas:  Math.round((total * (stats.approvalRateByYear[parseInt(year)] || 0)) / 100),
      rechazadas: total - Math.round((total * (stats.approvalRateByYear[parseInt(year)] || 0)) / 100),
    }));

  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={DARK_GRID} vertical={false} />
        <XAxis dataKey="year" tick={DARK_TICK} axisLine={DARK_AXIS} tickLine={false} />
        <YAxis tick={DARK_TICK} axisLine={false} tickLine={false} />
        <Tooltip {...DARK_TOOLTIP} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
        <Bar dataKey="aprobadas"  name="Aprobadas"  fill="#10b981" radius={[3, 3, 0, 0]} />
        <Bar dataKey="rechazadas" name="Rechazadas" fill="#f43f5e" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ApprovalRateChart({ stats }: Props) {
  const data = Object.entries(stats.approvalRateByYear)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([year, rate]) => ({ year, tasa: rate }));

  return (
    <ResponsiveContainer width="100%" height={210}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={DARK_GRID} vertical={false} />
        <XAxis dataKey="year" tick={DARK_TICK} axisLine={DARK_AXIS} tickLine={false} />
        <YAxis tick={DARK_TICK} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
        <Tooltip {...DARK_TOOLTIP} formatter={(v) => `${v}%`} />
        <Line
          type="monotone"
          dataKey="tasa"
          name="Tasa de aprobación"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={{ r: 4, fill: "#f59e0b", strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#fbbf24" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CategoryPieChart({ stats }: Props) {
  const data = Object.entries(stats.motionsByCategory)
    .filter(([, v]) => v > 0)
    .map(([cat, value]) => ({
      name: CATEGORY_LABELS[cat as MotionCategory] || cat,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <ResponsiveContainer width="100%" height={210}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={78}
          innerRadius={28}
          dataKey="value"
          label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}
          labelLine={{ stroke: "#334155" }}
          fontSize={10}
          fill="#94a3b8"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip {...DARK_TOOLTIP} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ProposerBarChart({ stats }: Props) {
  const data = Object.entries(stats.motionsByProposer)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([proposer, count]) => ({ proposer, mociones: count }));

  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 65, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={DARK_GRID} horizontal={false} />
        <XAxis type="number" tick={DARK_TICK} axisLine={DARK_AXIS} tickLine={false} />
        <YAxis dataKey="proposer" type="category" tick={DARK_TICK} axisLine={false} tickLine={false} width={65} />
        <Tooltip {...DARK_TOOLTIP} />
        <Bar dataKey="mociones" name="Mociones" fill="#3b82f6" radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
