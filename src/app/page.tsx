import { loadAllActas, computeDashboardStats, detectDuplicates, getAllMotions } from "@/lib/dataLoader";
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
    <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm p-5">
      <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function HomePage() {
  const actas      = loadAllActas();
  const stats      = computeDashboardStats(actas);
  const allMotions = getAllMotions(actas);
  // Limit duplicate detection to the 10 most recent actas to avoid O(n²) build timeout
  const recentMotions = actas.slice(0, 10).flatMap((a) => a.motions);
  const duplicates = detectDuplicates(recentMotions);

  const approvalRate = stats.totalMotions > 0
    ? Math.round((stats.approvedMotions / stats.totalMotions) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="bg-white border-b-2 border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md shadow-blue-200">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 leading-none">ANEIAP · Actas</h1>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Sistema de Gestión de Asambleas</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              {stats.totalActas} actas · {stats.totalMotions} mociones
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Hero / Search ─────────────────────────────────── */}
        <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 rounded-3xl px-6 py-8 text-white overflow-hidden shadow-xl shadow-blue-200">
          {/* decorative blobs */}
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-6 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-blue-300" />
              <span className="text-blue-300 text-xs font-semibold uppercase tracking-widest">Búsqueda inteligente</span>
            </div>
            <h2 className="text-2xl font-black leading-tight mb-1">Encuentra cualquier moción</h2>
            <p className="text-blue-200 text-sm mb-6 max-w-xl">
              Búsqueda difusa en tiempo real sobre el historial completo. Detecta automáticamente mociones similares antes de proponerlas.
            </p>
            <SearchBar motions={allMotions} />
          </div>
        </section>

        {/* ── Stats ─────────────────────────────────────────── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatsCard title="Total Actas"    value={stats.totalActas}    subtitle="asambleas registradas"  icon={<FileText className="w-5 h-5" />}   color="blue"   />
          <StatsCard title="Mociones"       value={stats.totalMotions}  subtitle="decisiones históricas"  icon={<BarChart2 className="w-5 h-5" />}  color="purple" />
          <StatsCard title="Tasa de Aprobación" value={`${approvalRate}%`} subtitle={`${stats.approvedMotions} aprobadas`} icon={<CheckCircle className="w-5 h-5" />} color="green" />
          <StatsCard title="Rechazadas"     value={stats.rejectedMotions} subtitle="mociones no aprobadas" icon={<XCircle className="w-5 h-5" />}   color="red"    />
        </section>

        {/* ── Charts ────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Mociones por Año"><MotionsByYearChart stats={stats} /></ChartCard>
          <ChartCard title="Tasa de Aprobación"><ApprovalRateChart stats={stats} /></ChartCard>
          <ChartCard title="Por Categoría"><CategoryPieChart stats={stats} /></ChartCard>
          <ChartCard title="Top Proponentes"><ProposerBarChart stats={stats} /></ChartCard>
        </section>

        {/* ── Bottom panels ─────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="font-black text-blue-900 text-lg mb-2">Sin actas cargadas</h3>
            <p className="text-blue-600 text-sm mb-4 max-w-sm mx-auto">
              Copia tus archivos markdown de actas en la carpeta del proyecto:
            </p>
            <code className="bg-white border border-blue-200 rounded-xl px-4 py-2 text-sm text-blue-700 font-mono shadow-sm inline-block">
              data/actas/
            </code>
            <p className="text-blue-400 text-xs mt-3">
              Formato: <em>GC-F-01 ACTA 122° ANGE ZOOM MAYO 2026.md</em>
            </p>
          </section>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-6 mt-2 border-t-2 border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-400">
        <span className="font-semibold">ANEIAP · Sistema de Gestión de Actas</span>
        <span>Datos de solo lectura · {stats.totalActas} actas · {stats.totalMotions} mociones</span>
      </footer>
    </div>
  );
}
