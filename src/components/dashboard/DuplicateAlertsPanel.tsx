"use client";

import { DuplicateAlert } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface Props { duplicates: DuplicateAlert[] }

const TYPE = {
  identical: { label: "Idéntica",   color: "bg-red-100 text-red-700 border-red-200"     },
  similar:   { label: "Similar",    color: "bg-amber-100 text-amber-700 border-amber-200"},
  redundant: { label: "Redundante", color: "bg-orange-100 text-orange-700 border-orange-200"},
};

export function DuplicateAlertsPanel({ duplicates }: Props) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? duplicates : duplicates.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
          <span className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
            <Copy className="w-4 h-4 text-amber-600" />
          </span>
          Duplicados / Similares
        </h3>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${duplicates.length > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-400"}`}>
          {duplicates.length}
        </span>
      </div>

      <div className="divide-y divide-slate-50">
        {duplicates.length === 0 ? (
          <div className="p-6 text-center">
            <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">Sin duplicados detectados</p>
            <p className="text-xs text-slate-400 mt-0.5">Todas las mociones son únicas</p>
          </div>
        ) : (
          displayed.map((alert, i) => (
            <div key={i} className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={TYPE[alert.type].color}>{TYPE[alert.type].label}</Badge>
                <span className="text-xs text-slate-400 font-medium">{Math.round(alert.similarity * 100)}% similitud</span>
              </div>
              {alert.motions.map((m, j) => (
                <div key={j} className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">{m.text}</p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{m.actaName} · {m.actaYear}</p>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {duplicates.length > 4 && (
        <div className="p-3 border-t border-slate-100 bg-slate-50">
          <button onClick={() => setShowAll((v) => !v)} className="w-full text-xs text-blue-600 hover:text-blue-800 font-semibold">
            {showAll ? "Ver menos ↑" : `Ver ${duplicates.length - 4} más ↓`}
          </button>
        </div>
      )}
    </div>
  );
}
