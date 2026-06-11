"use client";

import { Acta } from "@/types";
import { Calendar, MapPin, FileText } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface Props { actas: Acta[] }

const modalityConfig = {
  zoom:      { label: "Zoom",       color: "bg-blue-100 text-blue-700 border-blue-200" },
  presencial:{ label: "Presencial", color: "bg-green-100 text-green-700 border-green-200" },
  hibrida:   { label: "Híbrida",    color: "bg-purple-100 text-purple-700 border-purple-200" },
};

export function RecentActas({ actas }: Props) {
  return (
    <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
          <span className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
            <FileText className="w-4 h-4 text-blue-600" />
          </span>
          Asambleas Recientes
        </h3>
      </div>
      <div className="divide-y divide-slate-50">
        {actas.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-sm">
            <p className="mb-1">Sin actas cargadas</p>
            <code className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-500">data/actas/</code>
          </div>
        ) : (
          actas.map((acta) => (
            <div key={acta.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug flex-1">{acta.name}</p>
                <Badge className={modalityConfig[acta.modality].color}>
                  {modalityConfig[acta.modality].label}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{acta.date}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{acta.location}</span>
                <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{acta.motions.length} mociones</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
