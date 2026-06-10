import { NextResponse } from "next/server";
import { loadAllActas, computeDashboardStats, detectDuplicates, getAllMotions } from "@/lib/dataLoader";

export const dynamic = "force-static";
export const revalidate = false;

let cache: ReturnType<typeof buildData> | null = null;

function buildData() {
  const actas = loadAllActas();
  const stats = computeDashboardStats(actas);
  const allMotions = getAllMotions(actas);
  const duplicates = detectDuplicates(allMotions);
  return { actas, stats, duplicates };
}

export function GET() {
  if (!cache) cache = buildData();
  return NextResponse.json(cache);
}
