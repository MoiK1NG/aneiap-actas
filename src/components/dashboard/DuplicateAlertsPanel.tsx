"use client";

import { DuplicateAlert } from "@/types";
import { Copy, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useState } from "react";

interface Props {
  duplicates: DuplicateAlert[];
}

const typeConfig = {
  identical: { label: "Idéntica", color: "bg-red-100 text-red-700 border-red-200" },
  similar: { label: "Similar", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  redundant: { label: "Redundante", color: "bg-orange-100 text-orange-700 border-orange-200" },
};

export function DuplicateAlertsPanel({ duplicates }: Props) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? duplicates : duplicates.slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Copy className="w-4 h-4 text-yellow-500" />
          Mociones Duplicadas / Similares
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
            {duplicates.length}
          </span>
        </h3>
      </div>

      <div className="divide-y divide-gray-50">
        {duplicates.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No se detectaron mociones duplicadas
          </div>
        ) : (
          displayed.map((alert, i) => (
            <div key={i} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={typeConfig[alert.type].color}>{typeConfig[alert.type].label}</Badge>
                <span className="text-xs text-gray-500">{Math.round(alert.similarity * 100)}% similitud</span>
              </div>
              <div className="space-y-2">
                {alert.motions.map((m, j) => (
                  <div key={j} className="bg-gray-50 rounded-lg p-2.5 text-xs">
                    <p className="text-gray-700 line-clamp-2">{m.text}</p>
                    <p className="text-gray-400 mt-1">{m.actaName} · {m.actaYear} · Moción #{m.number}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {duplicates.length > 5 && (
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showAll ? "Ver menos" : `Ver ${duplicates.length - 5} más`}
          </button>
        </div>
      )}
    </div>
  );
}
