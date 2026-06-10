"use client";

import { Motion } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { AlertTriangle, DollarSign, Scale, ChevronRight } from "lucide-react";
import { RESULT_COLORS, RESULT_LABELS } from "@/lib/utils";
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
      className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 line-clamp-1">{motion.text}</p>
        <p className="text-xs text-gray-500 mt-0.5">{motion.actaName} · {motion.actaYear}</p>
      </div>
      <Badge className={RESULT_COLORS[motion.result]}>{RESULT_LABELS[motion.result]}</Badge>
      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </button>
  );
}

export function CriticalAlerts({ sanctionMotions, financialMotions, appealMotions }: Props) {
  const [activeTab, setActiveTab] = useState<"sanction" | "financial" | "appeal">("sanction");
  const [expanded, setExpanded] = useState<Motion | null>(null);

  const tabs = [
    { key: "sanction" as const, label: "Sanciones", icon: <AlertTriangle className="w-4 h-4" />, data: sanctionMotions, color: "text-red-600" },
    { key: "financial" as const, label: "Financiero", icon: <DollarSign className="w-4 h-4" />, data: financialMotions, color: "text-yellow-600" },
    { key: "appeal" as const, label: "Apelaciones", icon: <Scale className="w-4 h-4" />, data: appealMotions, color: "text-orange-600" },
  ];

  const activeData = tabs.find((t) => t.key === activeTab)?.data || [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          Información Crítica
        </h3>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setExpanded(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors
              ${activeTab === tab.key
                ? `border-b-2 border-blue-500 ${tab.color} bg-blue-50`
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab.icon}
            {tab.label}
            <span className="ml-0.5 text-xs bg-gray-200 text-gray-600 rounded-full px-1.5 py-0.5">
              {tab.data.length}
            </span>
          </button>
        ))}
      </div>

      <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
        {activeData.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-6">No hay registros en esta categoría</p>
        ) : (
          activeData.slice(0, 20).map((m) => (
            <MotionRow key={m.id} motion={m} onExpand={setExpanded} />
          ))
        )}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-800">Detalle de Moción</h4>
            <button onClick={() => setExpanded(null)} className="text-gray-400 hover:text-gray-600 text-xs">Cerrar</button>
          </div>
          <p className="text-sm text-gray-700 mb-2">{expanded.text}</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <span><strong>Proponente:</strong> {expanded.proposer}</span>
            <span><strong>Acta:</strong> {expanded.actaName}</span>
            <span><strong>A favor:</strong> {expanded.votesFor}</span>
            <span><strong>En contra:</strong> {expanded.votesAgainst}</span>
          </div>
          {expanded.observations && (
            <p className="mt-2 text-xs text-gray-500 bg-white rounded p-2 border border-gray-100">
              {expanded.observations}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
