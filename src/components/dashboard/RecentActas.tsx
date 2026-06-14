"use client";

import { Acta } from "@/types";
import { Calendar, MapPin, FileText } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface Props { actas: Acta[] }

const modalityConfig = {
  zoom:       { label: "Zoom",       color: "bg-blue-500/15 text-blue-300 border-blue-500/30"     },
  presencial: { label: "Presencial", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  hibrida:    { label: "Híbrida",    color: "bg-purple-500/15 text-purple-300 border-purple-500/30"   },
};

export function RecentActas({ actas }: Props) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
        <span className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
          <FileText className="w-3.5 h-3.5 text-blue-400" />
        </span>
        <h3 className="font-semibold text-slate-100 text-sm">Asambleas Recientes</h3>
      </div>
      <div className="divide-y divide-slate-800/60">
        {actas.length === 0 ? (
          <div className="p-6 text-center text-slate-600 text-sm">
            <p className="mb-1">Sin actas cargadas</p>
            <code className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-xs text-slate-500 font-mono">data/actas/</code>
          </div>
        ) : (
          actas.map((acta) => (
            <div key={acta.id} className="p-4 hover:bg-slate-800/40 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-medium text-slate-200 line-clamp-2 leading-snug flex-1">{acta.name}</p>
                <Badge className={modalityConfig[acta.modality].color}>
                  {modalityConfig[acta.modality].label}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{acta.date}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{acta.location}</span>
                <span className="flex items-center gap-1 font-mono"><FileText className="w-3 h-3" />{acta.motions.length} mociones</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
