"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
} from "recharts";
import { DashboardStats, MotionCategory } from "@/types";
import { CATEGORY_LABELS, CHART_COLORS } from "@/lib/utils";

interface Props {
  stats: DashboardStats;
}

export function MotionsByYearChart({ stats }: Props) {
  const data = Object.entries(stats.motionsByYear)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([year, total]) => ({
      year,
      total,
      aprobadas: Math.round((total * (stats.approvalRateByYear[parseInt(year)] || 0)) / 100),
      rechazadas: total - Math.round((total * (stats.approvalRateByYear[parseInt(year)] || 0)) / 100),
    }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="aprobadas" name="Aprobadas" fill="#10b981" radius={[3, 3, 0, 0]} />
        <Bar dataKey="rechazadas" name="Rechazadas" fill="#ef4444" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ApprovalRateChart({ stats }: Props) {
  const data = Object.entries(stats.approvalRateByYear)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([year, rate]) => ({ year, tasa: rate }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} unit="%" domain={[0, 100]} />
        <Tooltip formatter={(v) => `${v}%`} />
        <Line type="monotone" dataKey="tasa" name="Tasa de aprobación" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
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
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          dataKey="value"
          label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}
          labelLine={false}
          fontSize={11}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
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
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis dataKey="proposer" type="category" tick={{ fontSize: 11 }} width={60} />
        <Tooltip />
        <Bar dataKey="mociones" name="Mociones" fill="#3b82f6" radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
