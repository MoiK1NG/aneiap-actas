import fs from "fs";
import path from "path";
import type { DashboardStats, DuplicateAlert, Motion } from "@/types";
import { loadAllActas, computeDashboardStats, getAllMotions, detectDuplicates } from "./dataLoader";

interface GeneratedData {
  stats: DashboardStats;
  allMotions: Motion[];
  duplicates: DuplicateAlert[];
}

export function loadData(): GeneratedData {
  const cachePath = path.join(process.cwd(), "src", "generated", "data.json");

  if (fs.existsSync(cachePath)) {
    return JSON.parse(fs.readFileSync(cachePath, "utf-8")) as GeneratedData;
  }

  // Fallback: parse markdown files directly (used in local dev without prebuild)
  console.warn("⚠ src/generated/data.json not found — parsing markdown files (run npm run build to pre-generate)");
  const actas = loadAllActas();
  const stats = computeDashboardStats(actas);
  const allMotions = getAllMotions(actas);
  const recentMotions = actas.slice(0, 10).flatMap((a) => a.motions);
  const duplicates = detectDuplicates(recentMotions);
  return { stats, allMotions, duplicates };
}
