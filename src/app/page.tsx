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
import { FileText, CheckCircle, XCircle, BarChart2 } from "lucide-react";

export const dynamic = "force-static";
export const revalidate = false;

export default function HomePage() {
  const actas = loadAllActas();
  const stats = computeDashboardStats(actas);
  const allMotions = getAllMotions(actas);
  const duplicates = detectDuplicates(allMotions);

  const approvalRate = stats.totalMotions > 0
    ? Math.round((stats.approvedMotions / stats.totalMotions) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">ANEIAP · Actas</h1>
              <p className="text-xs text-gray-500">Sistema de Gestión de Asambleas</p>
            </div>
          </div>
          <div className="text-right text-xs text-gray-400">
            <div>{stats.totalActas} actas cargadas</div>
            <div>{stats.totalMotions} mociones indexadas</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Search hero */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl px-6 py-8 text-white">
          <h2 className="text-xl font-bold mb-1">Búsqueda de Mociones</h2>
          <p className="text-blue-200 text-sm mb-5">
            Escribe para buscar en el historial de asambleas y detectar mociones similares
          </p>
          <div className="relative">
            <SearchBar motions={allMotions} />
          </div>
        </section>

        {/* Stats overview */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Actas"
            value={stats.totalActas}
            subtitle="asambleas registradas"
            icon={<FileText className="w-5 h-5" />}
            color="blue"
          />
          <StatsCard
            title="Total Mociones"
            value={stats.totalMotions}
            subtitle="decisiones históricas"
            icon={<BarChart2 className="w-5 h-5" />}
            color="purple"
          />
          <StatsCard
            title="Aprobadas"
            value={`${approvalRate}%`}
            subtitle={`${stats.approvedMotions} de ${stats.totalMotions}`}
            icon={<CheckCircle className="w-5 h-5" />}
            color="green"
          />
          <StatsCard
            title="Rechazadas"
            value={stats.rejectedMotions}
            subtitle="mociones no aprobadas"
            icon={<XCircle className="w-5 h-5" />}
            color="red"
          />
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Mociones por Año</h3>
            <MotionsByYearChart stats={stats} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Tasa de Aprobación por Año</h3>
            <ApprovalRateChart stats={stats} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Mociones por Categoría</h3>
            <CategoryPieChart stats={stats} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Top Proponentes</h3>
            <ProposerBarChart stats={stats} />
          </div>
        </section>

        {/* Bottom panels */}
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

        {/* Empty state guide */}
        {stats.totalActas === 0 && (
          <section className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <FileText className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <h3 className="font-semibold text-blue-800 mb-2">Sin actas cargadas</h3>
            <p className="text-blue-600 text-sm mb-3">
              Copia tus archivos markdown de actas en la carpeta:
            </p>
            <code className="bg-white border border-blue-200 rounded px-3 py-1.5 text-sm text-blue-700 block max-w-xs mx-auto">
              data/actas/
            </code>
            <p className="text-blue-500 text-xs mt-3">
              Acepta archivos con el formato: <em>GC-F-01 ACTA 122° ANGE...</em>
            </p>
          </section>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-6 mt-4 text-center text-xs text-gray-400 border-t border-gray-200">
        ANEIAP · Sistema de Gestión de Actas · Todos los datos históricos son de solo lectura
      </footer>
    </div>
  );
}
