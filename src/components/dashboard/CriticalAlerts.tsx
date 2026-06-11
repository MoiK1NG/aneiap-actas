"use client";

import { Motion } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { AlertTriangle, DollarSign, Scale, ChevronRight, X } from "lucide-react";
import { RESULT_COLORS, RESULT_LABELS, cn } from "@/lib/utils";
import { useState } from "react";

interface Props {
  sanctionMotions: Motion[];
  financialMotions: Motion[];
  appealMotions: Motion[];
}

function MotionRow({ motion, onExpand }: { motion: Motion; onExpand: (m: Motion) => void }) {
  return (
    <button
      onClick={() => onExpand(motion)}
      className="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-all hover:border-slate-200 hover:shadow-sm group"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-800 line-clamp-2 leading-snug">{motion.text}</p>
        <p className="text-xs text-slate-400 mt-1 font-medium">{motion.actaName} · {motion.actaYear}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge className={RESULT_COLORS[motion.result]}>{RESULT_LABELS[motion.result]}</Badge>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
      </div>
    </button>
  );
}

const TABS = [
  { key: "sanction"  as const, label: "Sanciones",   icon: AlertTriangle, data: (p: Props) => p.sanctionMotions,  accent: "text-red-600",    activeBg: "bg-red-50 border-b-2 border-red-500"    },
  { key: "financial" as const, label: "Financiero",   icon: DollarSign,    data: (p: Props) => p.financialMotions, accent: "text-amber-600",  activeBg: "bg-amber-50 border-b-2 border-amber-500"  },
  { key: "appeal"    as const, label: "Apelaciones",  icon: Scale,         data: (p: Props) => p.appealMotions,    accent: "text-orange-600", activeBg: "bg-orange-50 border-b-2 border-orange-500" },
];

export function CriticalAlerts({ sanctionMotions, financialMotions, appealMotions }: Props) {
  const props = { sanctionMotions, financialMotions, appealMotions };
  const [activeTab, setActiveTab] = useState<"sanction" | "financial" | "appeal">("sanction");
  const [expanded, setExpanded] = useState<Motion | null>(null);

  const activeData = TABS.find((t) => t.key === activeTab)?.data(props) ?? [];

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
          <span className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </span>
          Información Crítica
        </h3>
        <p className="text-xs text-slate-400 mt-0.5 ml-9">Sanciones, temas financieros y apelaciones</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        {TABS.map(({ key, label, icon: Icon, data, accent, activeBg }) => {
          const count = data(props).length;
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setExpanded(null); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-2 py-3 text-xs font-semibold transition-all",
                isActive ? cn(accent, activeBg) : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
              <span className={cn(
                "text-xs rounded-full px-1.5 py-0.5 font-bold",
                count > 0 ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-400"
              )}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
        {activeData.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm">No hay registros en esta categoría</p>
          </div>
        ) : (
          activeData.slice(0, 20).map((m) => (
            <MotionRow key={m.id} motion={m} onExpand={setExpanded} />
          ))
        )}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t-2 border-slate-100 p-4 bg-slate-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-800">Detalle de Moción #{expanded.number}</h4>
            <button onClick={() => setExpanded(null)} className="w-6 h-6 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors">
              <X className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
          <p className="text-sm text-slate-700 mb-3 bg-white rounded-xl p-3 border border-slate-100 leading-relaxed">{expanded.text}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              ["Proponente", expanded.proposer],
              ["Acta", expanded.actaName],
              ["A favor", String(expanded.votesFor)],
              ["En contra", String(expanded.votesAgainst)],
            ].map(([label, val]) => (
              <div key={label} className="bg-white rounded-lg p-2 border border-slate-100">
                <span className="text-slate-400 block">{label}</span>
                <span className="font-semibold text-slate-700">{val}</span>
              </div>
            ))}
          </div>
          {expanded.observations && (
            <p className="mt-2 text-xs text-slate-500 bg-amber-50 rounded-lg p-2.5 border border-amber-100">
              <strong className="text-amber-700">Obs:</strong> {expanded.observations}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
