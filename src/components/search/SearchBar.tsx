"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Fuse, { type FuseResult } from "fuse.js";
import { Motion, MotionCategory } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { CATEGORY_COLORS, CATEGORY_LABELS, RESULT_COLORS, RESULT_LABELS, cn } from "@/lib/utils";
import { Search, X, AlertTriangle, SlidersHorizontal } from "lucide-react";

interface SearchBarProps {
  motions: Motion[];
  onSelect?: (motion: Motion) => void;
}

const CATEGORY_OPTIONS: MotionCategory[] = [
  "financial", "sanction", "administrative", "normative",
  "election", "approval", "appeal", "other",
];

export function SearchBar({ motions, onSelect }: SearchBarProps) {
  const [query, setQuery]             = useState("");
  const [results, setResults]         = useState<FuseResult<Motion>[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selected, setSelected]       = useState<Motion | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters]         = useState({ year: "", result: "", category: "" });
  const inputRef     = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getFuse = useCallback(() => {
    let data = motions;
    if (filters.year)     data = data.filter((m) => m.actaYear === parseInt(filters.year));
    if (filters.result)   data = data.filter((m) => m.result === filters.result);
    if (filters.category) data = data.filter((m) => m.category === filters.category);
    return new Fuse(data, {
      keys: [
        { name: "text",         weight: 0.6 },
        { name: "proposer",     weight: 0.2 },
        { name: "observations", weight: 0.1 },
        { name: "actaName",     weight: 0.1 },
      ],
      threshold: 0.45, includeScore: true, minMatchCharLength: 2,
    });
  }, [motions, filters]);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    setResults(getFuse().search(query, { limit: 8 }));
    setShowResults(true);
  }, [query, getFuse]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setShowResults(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const years = Array.from(new Set(motions.map((m) => m.actaYear))).sort((a, b) => b - a);

  function pick(motion: Motion) {
    setSelected(motion);
    setShowResults(false);
    setQuery(motion.text.slice(0, 70));
    onSelect?.(motion);
  }

  function clear() {
    setQuery(""); setResults([]); setSelected(null); setShowResults(false);
    inputRef.current?.focus();
  }

  const similarCount = selected
    ? motions.filter((m) => m.id !== selected.id &&
        m.text.toLowerCase().includes(selected.text.slice(0, 30).toLowerCase())).length
    : 0;

  const hasActiveFilter = filters.year || filters.result || filters.category;

  return (
    <div ref={containerRef} className="w-full">
      {/* Input row */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            placeholder="Buscar moción, proponente o tema..."
            className="w-full pl-11 pr-10 py-3.5 text-sm rounded-xl border border-slate-700 bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 transition-all"
          />
          {query && (
            <button
              onClick={clear}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            "flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center transition-all",
            showFilters || hasActiveFilter
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "bg-slate-800 border border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mt-2 p-3 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/60 flex flex-wrap gap-2">
          {[
            {
              value: filters.year,
              setter: (v: string) => setFilters((f) => ({ ...f, year: v })),
              options: [["", "Todos los años"], ...years.map((y) => [String(y), String(y)])],
            },
            {
              value: filters.result,
              setter: (v: string) => setFilters((f) => ({ ...f, result: v })),
              options: [["", "Cualquier resultado"], ["approved", "✓ Aprobadas"], ["rejected", "✗ Rechazadas"]],
            },
            {
              value: filters.category,
              setter: (v: string) => setFilters((f) => ({ ...f, category: v })),
              options: [["", "Todas las categorías"], ...CATEGORY_OPTIONS.map((c) => [c, CATEGORY_LABELS[c]])],
            },
          ].map(({ value, setter, options }, i) => (
            <select
              key={i}
              value={value}
              onChange={(e) => setter(e.target.value)}
              className="text-xs rounded-lg px-3 py-2 bg-slate-900 border border-slate-700 text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500/40 flex-1 min-w-28"
            >
              {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
        </div>
      )}

      {/* Dropdown results */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 mt-2 left-0 right-0 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 overflow-hidden max-h-96 overflow-y-auto">
          <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{results.length} resultado(s)</span>
            <span className="text-xs text-slate-600">↵ para seleccionar</span>
          </div>
          {results.map(({ item: m, score }) => (
            <button
              key={m.id}
              onClick={() => pick(m)}
              className="w-full text-left px-4 py-3 hover:bg-slate-800 border-b border-slate-800/60 last:border-0 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-slate-200 line-clamp-2 flex-1 leading-snug">{m.text}</p>
                <span className="text-xs text-slate-600 whitespace-nowrap font-mono">{Math.round((1 - (score ?? 0)) * 100)}%</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                <Badge className={RESULT_COLORS[m.result]}>{RESULT_LABELS[m.result]}</Badge>
                <Badge className={CATEGORY_COLORS[m.category]}>{CATEGORY_LABELS[m.category]}</Badge>
                <span className="text-xs text-slate-600">{m.actaYear} · {m.proposer}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      {showResults && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 mt-2 left-0 right-0 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 px-4 py-8 text-center text-slate-500 text-sm">
          Sin resultados para &quot;{query}&quot;
        </div>
      )}

      {/* Selected detail card */}
      {selected && (
        <div className="mt-3 bg-slate-900 rounded-xl shadow-xl border border-slate-800 overflow-hidden">
          {similarCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-xs text-amber-300">
                <strong>Moción similar encontrada</strong> — {similarCount} moción(es) relacionada(s) en el historial. Revisa antes de proponer.
              </span>
            </div>
          )}
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex gap-2">
              <Badge className={RESULT_COLORS[selected.result]}>{RESULT_LABELS[selected.result]}</Badge>
              <Badge className={CATEGORY_COLORS[selected.category]}>{CATEGORY_LABELS[selected.category]}</Badge>
              <Badge className="bg-slate-700/50 text-slate-400 border-slate-600/50">#{selected.number}</Badge>
            </div>
            <button onClick={clear} className="w-6 h-6 rounded-full hover:bg-slate-700 flex items-center justify-center transition-colors">
              <X className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-slate-200 leading-relaxed">{selected.text}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                ["Acta",        selected.actaName],
                ["Fecha",       selected.actaDate],
                ["Proponente",  selected.proposer],
                ["Secundantes", selected.seconders.join(", ") || "—"],
              ].map(([l, v]) => (
                <div key={l} className="bg-slate-800 rounded-lg p-2.5 border border-slate-700/60">
                  <span className="text-slate-500 block mb-0.5">{l}</span>
                  <span className="font-semibold text-slate-200 break-words">{v}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { l: "A Favor",      v: selected.votesFor,     c: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                { l: "En Contra",    v: selected.votesAgainst, c: "text-rose-400 bg-rose-500/10 border-rose-500/20"          },
                { l: "En Blanco",    v: selected.votesBlank,   c: "text-slate-400 bg-slate-700/50 border-slate-600/50"       },
                { l: "Abstenciones", v: selected.abstentions,  c: "text-amber-400 bg-amber-500/10 border-amber-500/20"       },
              ].map(({ l, v, c }) => (
                <div key={l} className={cn("rounded-lg p-2 border text-center", c)}>
                  <div className="text-xl font-bold font-mono">{v}</div>
                  <div className="text-xs font-medium opacity-80 mt-0.5 leading-tight">{l}</div>
                </div>
              ))}
            </div>
            {selected.observations && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-300">
                <strong className="text-amber-400">Observación:</strong> {selected.observations}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
