import path from "path";
import fs from "fs";
import { loadAllActas, computeDashboardStats, getAllMotions, detectDuplicates } from "../src/lib/dataLoader";

console.log("Building actas data...");

const actas = loadAllActas();
console.log(`✓ Parsed ${actas.length} actas`);

const stats = computeDashboardStats(actas);
const allMotions = getAllMotions(actas);
const recentMotions = actas.slice(0, 10).flatMap((a) => a.motions);
const duplicates = detectDuplicates(recentMotions);

// Strip rawContent — not needed in the UI and bloats the JSON
const stripRaw = ({ rawContent: _r, ...rest }: ReturnType<typeof loadAllActas>[number]) => rest;
const cleanStats = { ...stats, recentActas: stats.recentActas.map(stripRaw) };

const output = { stats: cleanStats, allMotions, duplicates };
const json = JSON.stringify(output);

const dir = path.join(process.cwd(), "src", "generated");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "data.json"), json);

console.log(
  `✓ data.json written — ${(json.length / 1024).toFixed(0)} KB, ` +
  `${allMotions.length} motions, ${duplicates.length} duplicate alerts`
);
