import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MotionCategory } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CATEGORY_LABELS: Record<MotionCategory, string> = {
  financial: "Financiero",
  sanction: "Sanción",
  administrative: "Administrativo",
  normative: "Normativo",
  election: "Elección",
  approval: "Aprobación",
  appeal: "Apelación",
  other: "Otro",
};

export const CATEGORY_COLORS: Record<MotionCategory, string> = {
  financial: "bg-yellow-100 text-yellow-800 border-yellow-300",
  sanction: "bg-red-100 text-red-800 border-red-300",
  administrative: "bg-blue-100 text-blue-800 border-blue-300",
  normative: "bg-purple-100 text-purple-800 border-purple-300",
  election: "bg-green-100 text-green-800 border-green-300",
  approval: "bg-teal-100 text-teal-800 border-teal-300",
  appeal: "bg-orange-100 text-orange-800 border-orange-300",
  other: "bg-gray-100 text-gray-700 border-gray-300",
};

export const RESULT_COLORS = {
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  procedural: "bg-gray-100 text-gray-600",
};

export const RESULT_LABELS = {
  approved: "Aprobada",
  rejected: "Rechazada",
  procedural: "Procedimiento",
};

export const CHART_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#84cc16",
];
