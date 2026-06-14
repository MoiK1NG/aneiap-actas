import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MotionCategory } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CATEGORY_LABELS: Record<MotionCategory, string> = {
  financial:     "Financiero",
  sanction:      "Sanción",
  administrative:"Administrativo",
  normative:     "Normativo",
  election:      "Elección",
  approval:      "Aprobación",
  appeal:        "Apelación",
  other:         "Otro",
};

export const CATEGORY_COLORS: Record<MotionCategory, string> = {
  financial:     "bg-amber-500/15 text-amber-300 border-amber-500/30",
  sanction:      "bg-rose-500/15 text-rose-300 border-rose-500/30",
  administrative:"bg-blue-500/15 text-blue-300 border-blue-500/30",
  normative:     "bg-purple-500/15 text-purple-300 border-purple-500/30",
  election:      "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  approval:      "bg-teal-500/15 text-teal-300 border-teal-500/30",
  appeal:        "bg-orange-500/15 text-orange-300 border-orange-500/30",
  other:         "bg-slate-700/50 text-slate-400 border-slate-600/50",
};

export const RESULT_COLORS = {
  approved:   "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  rejected:   "bg-rose-500/15 text-rose-300 border-rose-500/30",
  procedural: "bg-slate-700/50 text-slate-400 border-slate-600/50",
};

export const RESULT_LABELS = {
  approved:   "Aprobada",
  rejected:   "Rechazada",
  procedural: "Procedimiento",
};

export const CHART_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#f43f5e",
  "#8b5cf6", "#06b6d4", "#f97316", "#84cc16",
];
