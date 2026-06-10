"use client";

import { Acta } from "@/types";
import { Calendar, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface Props {
  actas: Acta[];
}

const modalityConfig = {
  zoom: { label: "Zoom", color: "bg-blue-100 text-blue-700 border-blue-200" },
  presencial: { label: "Presencial", color: "bg-green-100 text-green-700 border-green-200" },
  hibrida: { label: "Híbrida", color: "bg-purple-100 text-purple-700 border-purple-200" },
};

export function RecentActas({ actas }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Asambleas Recientes</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {actas.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">
            Carga archivos markdown en <code className="bg-gray-100 px-1 rounded">data/actas/</code>
          </div>
        ) : (
          actas.map((acta) => (
            <div key={acta.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">{acta.name}</p>
                  <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {acta.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {acta.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {acta.motions.length} mociones
                    </span>
                  </div>
                </div>
                <Badge className={modalityConfig[acta.modality].color}>
                  {modalityConfig[acta.modality].label}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
