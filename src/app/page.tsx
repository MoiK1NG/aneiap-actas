import { loadData } from "@/lib/generatedLoader";
import { SearchBar } from "@/components/search/SearchBar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CriticalAlerts } from "@/components/dashboard/CriticalAlerts";
import { DuplicateAlertsPanel } from "@/components/dashboard/DuplicateAlertsPanel";
import { RecentActas } from "@/components/dashboard/RecentActas";
import {
  MotionsByYearChart,
  ApprovalRateChart,
  CategoryPieChart,
  ProposerBarChart,
} from "@/components/charts/MotionsChart";
import { FileText, CheckCircle, XCircle, BarChart2, Layers } from "lucide-react";

export const dynamic = "force-static";
export const revalidate = false;

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="au d4 rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="block w-0.5 h-4 rounded-full bg-amber-400 flex-shrink-0" />
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function HomePage() {
  const { stats, allMotions, duplicates } = loadData();

  const approvalRate = stats.totalMotions > 0
    ? Math.round((stats.approvedMotions / stats.totalMotions) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0b0f18]">

      {/* ── Top bar ─────────────────────────────────────────── */}
      <header
        className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40"
        style={{ borderTop: "2px solid #f59e0b" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-none text-slate-100 tracking-tight">ANEIAP · Actas</h1>
              <p className="text-xs text-slate-500 mt-0.5">Sistema de Gestión de Asambleas</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <span>{stats.totalActas} actas · {stats.totalMotions} mociones</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-5 relative z-10">

        {/* ── Hero / Search ─────────────────────────────────── */}
        <section className="au d1 rounded-2xl border border-slate-800 bg-slate-900 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 0% 0%, rgba(245,158,11,0.08) 0%, transparent 55%)" }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 100% 100%, rgba(59,130,246,0.05) 0%, transparent 50%)" }}
          />
          <div className="relative px-6 sm:px-8 py-8">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                Búsqueda inteligente
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 leading-tight mb-1">
              Encuentra cualquier moción
            </h2>
            <p className="text-sm text-slate-400 mb-6 max-w-xl leading-relaxed">
              Búsqueda difusa en tiempo real sobre el historial completo. Detecta automáticamente mociones similares antes de proponerlas.
            </p>
            <SearchBar motions={allMotions} />
          </div>
        </section>

        {/* ── Stats ─────────────────────────────────────────── */}
        <section className="au d2 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatsCard title="Total Actas"    value={stats.totalActas}      subtitle="asambleas registradas"         icon={<FileText className="w-4 h-4" />}   color="blue"  />
          <StatsCard title="Mociones"       value={stats.totalMotions}    subtitle="decisiones históricas"         icon={<BarChart2 className="w-4 h-4" />}  color="amber" />
          <StatsCard title="Aprobación"     value={`${approvalRate}%`}    subtitle={`${stats.approvedMotions} aprobadas`} icon={<CheckCircle className="w-4 h-4" />} color="green" />
          <StatsCard title="Rechazadas"     value={stats.rejectedMotions} subtitle="mociones rechazadas"           icon={<XCircle className="w-4 h-4" />}    color="red"   />
        </section>

        {/* ── Charts ────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Mociones por Año"><MotionsByYearChart stats={stats} /></ChartCard>
          <ChartCard title="Tasa de Aprobación"><ApprovalRateChart stats={stats} /></ChartCard>
          <ChartCard title="Por Categoría"><CategoryPieChart stats={stats} /></ChartCard>
          <ChartCard title="Top Proponentes"><ProposerBarChart stats={stats} /></ChartCard>
        </section>

        {/* ── Bottom panels ─────────────────────────────────── */}
        <section className="au d5 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <CriticalAlerts
              sanctionMotions={stats.sanctionMotions}
              financialMotions={stats.financialMotions}
              appealMotions={stats.appealMotions}
            />
          </div>
          <div className="space-y-4">
            <RecentActas actas={stats.recentActas} />
            <DuplicateAlertsPanel duplicates={duplicates} />
          </div>
        </section>

        {/* ── Empty state ───────────────────────────────────── */}
        {stats.totalActas === 0 && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-amber-400" />
            </div>
            <h3 className="font-bold text-lg text-slate-100 mb-2">Sin actas cargadas</h3>
            <p className="text-sm text-slate-400 mb-4 max-w-sm mx-auto">
              Copia tus archivos markdown de actas en la carpeta del proyecto:
            </p>
            <code className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-amber-400 font-mono inline-block">
              data/actas/
            </code>
          </section>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-5 mt-2 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-600">
        <span className="font-semibold text-slate-500">ANEIAP · Sistema de Gestión de Actas</span>
        <span>Datos de solo lectura · {stats.totalActas} actas · {stats.totalMotions} mociones</span>
      </footer>
    </div>
  );
}
