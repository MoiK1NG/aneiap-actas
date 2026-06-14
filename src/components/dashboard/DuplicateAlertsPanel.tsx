"use client";

import { DuplicateAlert } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface Props { duplicates: DuplicateAlert[] }

const TYPE = {
  identical: { label: "Idéntica",   color: "bg-rose-500/15 text-rose-300 border-rose-500/30"       },
  similar:   { label: "Similar",    color: "bg-amber-500/15 text-amber-300 border-amber-500/30"    },
  redundant: { label: "Redundante", color: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
};

export function DuplicateAlertsPanel({ duplicates }: Props) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? duplicates : duplicates.slice(0, 4);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Copy className="w-3.5 h-3.5 text-amber-400" />
          </span>
          <h3 className="font-semibold text-slate-100 text-sm">Duplicados / Similares</h3>
        </div>
        <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
          duplicates.length > 0
            ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
            : "bg-slate-800 text-slate-600 border border-slate-700"
        }`}>
          {duplicates.length}
        </span>
      </div>

      <div className="divide-y divide-slate-800/60">
        {duplicates.length === 0 ? (
          <div className="p-6 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-400">Sin duplicados detectados</p>
            <p className="text-xs text-slate-600 mt-0.5">Todas las mociones son únicas</p>
          </div>
        ) : (
          displayed.map((alert, i) => (
            <div key={i} className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={TYPE[alert.type].color}>{TYPE[alert.type].label}</Badge>
                <span className="text-xs text-slate-600 font-mono">{Math.round(alert.similarity * 100)}% similitud</span>
              </div>
              {alert.motions.map((m, j) => (
                <div key={j} className="bg-slate-800 rounded-lg p-2.5 border border-slate-700/60">
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{m.text}</p>
                  <p className="text-xs text-slate-600 mt-1">{m.actaName} · {m.actaYear}</p>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {duplicates.length > 4 && (
        <div className="p-3 border-t border-slate-800 bg-slate-800/30">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="w-full text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            {showAll ? "Ver menos ↑" : `Ver ${duplicates.length - 4} más ↓`}
          </button>
        </div>
      )}
    </div>
  );
}
