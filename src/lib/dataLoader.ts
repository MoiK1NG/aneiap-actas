import fs from "fs";
import path from "path";
import { Acta, DashboardStats, DuplicateAlert, InstitutionStats, Motion, MotionCategory } from "@/types";
import { parseActa } from "./parser";

const DATA_DIR = path.join(process.cwd(), "data", "actas");

export function loadAllActas(): Acta[] {
  if (!fs.existsSync(DATA_DIR)) return [];

  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".md"));
  const actas: Acta[] = [];

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const acta = parseActa(content, file);
    if (acta) actas.push(acta);
  }

  return actas.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return a.name.localeCompare(b.name);
  });
}

export function getAllMotions(actas: Acta[]): Motion[] {
  return actas.flatMap((a) => a.motions);
}

export function computeDashboardStats(actas: Acta[]): DashboardStats {
  const allMotions = getAllMotions(actas);
  const realMotions = allMotions.filter((m) => m.result !== "procedural");

  const motionsByYear: Record<number, number> = {};
  const approvedByYear: Record<number, number> = {};
  const motionsByProposer: Record<string, number> = {};
  const motionsByCategory: Record<MotionCategory, number> = {} as Record<MotionCategory, number>;
  const institutionStats: Record<string, InstitutionStats> = {};

  for (const m of realMotions) {
    // By year
    motionsByYear[m.actaYear] = (motionsByYear[m.actaYear] || 0) + 1;
    if (m.result === "approved") {
      approvedByYear[m.actaYear] = (approvedByYear[m.actaYear] || 0) + 1;
    }

    // By proposer
    if (m.proposer && m.proposer !== "N/A") {
      motionsByProposer[m.proposer] = (motionsByProposer[m.proposer] || 0) + 1;
    }

    // By category
    motionsByCategory[m.category] = (motionsByCategory[m.category] || 0) + 1;
  }

  // Approval rate by year
  const approvalRateByYear: Record<number, number> = {};
  for (const year in motionsByYear) {
    const total = motionsByYear[parseInt(year)];
    const approved = approvedByYear[parseInt(year)] || 0;
    approvalRateByYear[parseInt(year)] = total > 0 ? Math.round((approved / total) * 100) : 0;
  }

  // Institution participation from actas
  for (const acta of actas) {
    for (const inst of acta.attendingInstitutions) {
      if (!institutionStats[inst]) {
        institutionStats[inst] = { votesFor: 0, votesAgainst: 0, abstentions: 0, motionsProposed: 0, timesSeconded: 0 };
      }
    }
    for (const m of acta.motions) {
      if (m.proposer && institutionStats[m.proposer]) {
        institutionStats[m.proposer].motionsProposed++;
      }
      for (const s of m.seconders) {
        if (institutionStats[s]) institutionStats[s].timesSeconded++;
      }
    }
  }

  const recentActas = actas.slice(0, 5);

  return {
    totalActas: actas.length,
    totalMotions: realMotions.length,
    approvedMotions: realMotions.filter((m) => m.result === "approved").length,
    rejectedMotions: realMotions.filter((m) => m.result === "rejected").length,
    motionsByYear,
    approvalRateByYear,
    motionsByProposer,
    motionsByCategory,
    sanctionMotions: allMotions.filter((m) => m.category === "sanction"),
    financialMotions: allMotions.filter((m) => m.category === "financial"),
    appealMotions: allMotions.filter((m) => m.category === "appeal"),
    institutionParticipation: institutionStats,
    recentActas,
  };
}

function levenshteinSimilarity(a: string, b: string): number {
  const al = a.toLowerCase().slice(0, 200);
  const bl = b.toLowerCase().slice(0, 200);
  if (al === bl) return 1;

  const matrix: number[][] = Array.from({ length: al.length + 1 }, (_, i) =>
    Array.from({ length: bl.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= al.length; i++) {
    for (let j = 1; j <= bl.length; j++) {
      matrix[i][j] = al[i - 1] === bl[j - 1]
        ? matrix[i - 1][j - 1]
        : 1 + Math.min(matrix[i - 1][j], matrix[i][j - 1], matrix[i - 1][j - 1]);
    }
  }

  const maxLen = Math.max(al.length, bl.length);
  return maxLen === 0 ? 1 : 1 - matrix[al.length][bl.length] / maxLen;
}

export function detectDuplicates(motions: Motion[]): DuplicateAlert[] {
  const alerts: DuplicateAlert[] = [];
  const checked = new Set<string>();

  for (let i = 0; i < motions.length; i++) {
    for (let j = i + 1; j < motions.length; j++) {
      const key = `${motions[i].id}-${motions[j].id}`;
      if (checked.has(key)) continue;
      checked.add(key);

      if (motions[i].actaId === motions[j].actaId) continue;

      const sim = levenshteinSimilarity(motions[i].text, motions[j].text);
      if (sim >= 0.95) {
        alerts.push({ motions: [motions[i], motions[j]], similarity: sim, type: "identical" });
      } else if (sim >= 0.80) {
        alerts.push({ motions: [motions[i], motions[j]], similarity: sim, type: "similar" });
      }
    }
  }

  return alerts.sort((a, b) => b.similarity - a.similarity).slice(0, 50);
}
