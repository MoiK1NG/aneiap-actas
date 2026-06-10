"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Fuse, { type FuseResult } from "fuse.js";
import { Motion, MotionCategory } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { CATEGORY_COLORS, CATEGORY_LABELS, RESULT_COLORS, RESULT_LABELS, cn } from "@/lib/utils";
import { Search, X, AlertTriangle, ChevronDown } from "lucide-react";

interface SearchBarProps {
  motions: Motion[];
  onSelect?: (motion: Motion) => void;
}

const CATEGORY_OPTIONS: MotionCategory[] = [
  "financial", "sanction", "administrative", "normative",
  "election", "approval", "appeal", "other",
];

export function SearchBar({ motions, onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FuseResult<Motion>[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedResult, setSelectedResult] = useState<Motion | null>(null);
  const [filters, setFilters] = useState({
    year: "" as string,
    result: "" as string,
    category: "" as string,
  });
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fuse = useCallback(() => {
    let filtered = motions;
    if (filters.year) filtered = filtered.filter((m) => m.actaYear === parseInt(filters.year));
    if (filters.result) filtered = filtered.filter((m) => m.result === filters.result);
    if (filters.category) filtered = filtered.filter((m) => m.category === filters.category);

    return new Fuse(filtered, {
      keys: [
        { name: "text", weight: 0.6 },
        { name: "proposer", weight: 0.2 },
        { name: "observations", weight: 0.1 },
        { name: "actaName", weight: 0.1 },
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2,
    });
  }, [motions, filters]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const f = fuse();
    const r = f.search(query, { limit: 8 });
    setResults(r);
    setShowResults(true);
  }, [query, fuse]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const years = Array.from(new Set(motions.map((m) => m.actaYear))).sort((a, b) => b - a);

  function handleSelect(motion: Motion) {
    setSelectedResult(motion);
    setShowResults(false);
    setQuery(motion.text.slice(0, 60) + "...");
    onSelect?.(motion);
  }

  function clearSearch() {
    setQuery("");
    setResults([]);
    setSelectedResult(null);
    setShowResults(false);
    inputRef.current?.focus();
  }

  const similarCount = selectedResult
    ? motions.filter((m) => m.id !== selectedResult.id && m.text.toLowerCase().includes(selectedResult.text.slice(0, 30).toLowerCase())).length
    : 0;

  return (
    <div ref={containerRef} className="w-full max-w-3xl mx-auto">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder="Buscar moción, tema o institución..."
          className="w-full pl-12 pr-10 py-4 text-base rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        {query && (
          <button onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter toggle */}
      <div className="flex justify-end mt-2">
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"
        >
          <ChevronDown className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
          Filtros
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <select
            value={filters.year}
            onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))}
            className="text-sm border border-gray-200 rounded px-2 py-1 bg-white"
          >
            <option value="">Todos los años</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            value={filters.result}
            onChange={(e) => setFilters((f) => ({ ...f, result: e.target.value }))}
            className="text-sm border border-gray-200 rounded px-2 py-1 bg-white"
          >
            <option value="">Todos los resultados</option>
            <option value="approved">Aprobadas</option>
            <option value="rejected">Rechazadas</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            className="text-sm border border-gray-200 rounded px-2 py-1 bg-white"
          >
            <option value="">Todas las categorías</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>
      )}

      {/* Results dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-w-3xl bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
          {results.map(({ item: motion, score }) => {
            const sim = score !== undefined ? Math.round((1 - score) * 100) : 100;
            return (
              <button
                key={motion.id}
                onClick={() => handleSelect(motion)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-50 last:border-0 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-gray-800 line-clamp-2 flex-1">{motion.text}</p>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{sim}% relevancia</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <Badge className={RESULT_COLORS[motion.result]}>{RESULT_LABELS[motion.result]}</Badge>
                  <Badge className={CATEGORY_COLORS[motion.category]}>{CATEGORY_LABELS[motion.category]}</Badge>
                  <span className="text-xs text-gray-500">{motion.actaName} · {motion.actaYear}</span>
                  <span className="text-xs text-gray-400">Proponente: {motion.proposer}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {showResults && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 mt-1 w-full max-w-3xl bg-white rounded-xl shadow-xl border border-gray-100 px-4 py-6 text-center text-gray-500 text-sm">
          No se encontraron mociones para "{query}"
        </div>
      )}

      {/* Selected result detail */}
      {selectedResult && (
        <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          {similarCount > 0 && (
            <div className="flex items-center gap-2 mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>Moción similar encontrada:</strong> Existen {similarCount} mocione(s) relacionada(s) en el historial.
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={RESULT_COLORS[selectedResult.result]}>{RESULT_LABELS[selectedResult.result]}</Badge>
            <Badge className={CATEGORY_COLORS[selectedResult.category]}>{CATEGORY_LABELS[selectedResult.category]}</Badge>
            <Badge className="bg-gray-100 text-gray-600 border-gray-200">Moción #{selectedResult.number}</Badge>
          </div>

          <p className="text-sm text-gray-800 mb-3">{selectedResult.text}</p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Acta:</span>{" "}
              <span className="font-medium">{selectedResult.actaName}</span>
            </div>
            <div>
              <span className="text-gray-500">Fecha:</span>{" "}
              <span className="font-medium">{selectedResult.actaDate}</span>
            </div>
            <div>
              <span className="text-gray-500">Proponente:</span>{" "}
              <span className="font-medium">{selectedResult.proposer}</span>
            </div>
            <div>
              <span className="text-gray-500">Secundantes:</span>{" "}
              <span className="font-medium">{selectedResult.seconders.join(", ") || "N/A"}</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-3 text-center">
            {[
              { label: "A Favor", value: selectedResult.votesFor, color: "text-green-600" },
              { label: "En Contra", value: selectedResult.votesAgainst, color: "text-red-600" },
              { label: "En Blanco", value: selectedResult.votesBlank, color: "text-gray-500" },
              { label: "Abstenciones", value: selectedResult.abstentions, color: "text-yellow-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-2">
                <div className={cn("text-xl font-bold", color)}>{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>

          {selectedResult.observations && (
            <p className="mt-3 text-xs text-gray-600 bg-gray-50 rounded p-2">
              <strong>Observación:</strong> {selectedResult.observations}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
