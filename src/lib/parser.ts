import { Acta, Motion, MotionCategory } from "@/types";

/** Strip markdown bold/italic markers for cleaner text matching */
function stripMd(text: string): string {
  return text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/~~[^~]+~~/g, "").trim();
}

function detectCategory(text: string, observations: string): MotionCategory {
  const c = (text + " " + observations).toLowerCase();
  if (/apelaci[oó]n|apelar|refutar|impugn/.test(c)) return "appeal";
  if (/sanci[oó]n|sancion|multa|penali[zs]|snc\s+\d|caso\s+snc/.test(c)) return "sanction";
  if (/financier|presupuest|econ[oó]mic|pago|cobro|cuota|dinero|aporte|tarifa/.test(c)) return "financial";
  if (/reglamento|estatuto|norma|pol[ií]tica|modific|actualiz/.test(c)) return "normative";
  if (/secretari[oa]|moderador[a]?|president[ea]|nombr[ae].*como/.test(c)) return "election";
  if (/imagen\s+corporativa|mic\b|portafolio|manual/.test(c)) return "administrative";
  if (/orden\s+del\s+d[ií]a|apertura|cierre|procedimiento/.test(c)) return "approval";
  if (/apruebe|aprobar|presentar|presentaci[oó]n/.test(c)) return "approval";
  return "other";
}

function detectResult(
  vf: number, vc: number, decisionPower: number, isProcedural: boolean
): Motion["result"] {
  if (isProcedural) return "procedural";
  return vf >= decisionPower ? "approved" : "rejected";
}

function parseVoteValue(text: string, label: string): number {
  // Handles: "VF: 16", "VF:16", "|VF: 16|", "**VF: 16**", inline "VF: 16 VC: 0..."
  // Uses both stripped text and attempts on raw patterns
  const m = text.match(new RegExp(`(?:^|[|\\s*])${label}\\s*[:\\s]\\s*([\\d]+)`, "im"))
           ?? text.match(new RegExp(`\\b${label}[:\\s]+([\\d]+)`, "i"));
  return m ? parseInt(m[1], 10) : 0;
}

function extractMotions(
  raw: string,
  actaId: string,
  actaName: string,
  actaDate: string,
  actaYear: number
): Motion[] {
  const motions: Motion[] = [];
  // Strip bold markers globally for easier parsing
  const content = raw.replace(/\*\*/g, "").replace(/\*/g, "");

  // Match each "Moción No: N" block until the next one or document end.
  // NO multiline flag — `$` must match end-of-string only (not end-of-line).
  const motionPattern = /Moci[oó]n\s+No[:\s.]*(\d+)([\s\S]*?)(?=Moci[oó]n\s+No[:\s.]*\d+|Elabor[oó]:|$)/gi;

  let match: RegExpExecArray | null;
  while ((match = motionPattern.exec(content)) !== null) {
    const motionNum = parseInt(match[1], 10);
    const block = match[2] || "";

    if (block.trim().length < 10) continue;

    // ── Proposer ──────────────────────────────────────────────
    const proposerRaw = block.match(/Proponente[:\s]+([^\n]+)/i)?.[1] ?? "";
    // Proposer is the first token before "Secundantes" or newline
    const proposer = stripMd(proposerRaw.split(/Secundantes/i)[0]).trim() || "N/A";

    // ── Seconders ─────────────────────────────────────────────
    const secondersRaw = block.match(/Secundantes[:\s]+([^\n]+)/i)?.[1] ?? "";
    const seconders = stripMd(secondersRaw)
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length < 40);

    // ── Motion text ───────────────────────────────────────────
    // Grab everything after "Texto:" until vote line (VF:/VC:/VB:/ABS:)
    const textRaw = block.match(/Texto[:\s]+([\s\S]+?)(?=\n*\s*(?:VF|VC|VB|ABS)\s*[:\|]|\n*\s*\|?\s*VF)/i)?.[1] ?? "";
    const motionText = stripMd(textRaw).replace(/\s+/g, " ").trim().slice(0, 500) || stripMd(block).slice(0, 200);

    // ── Votes ─────────────────────────────────────────────────
    const vf  = parseVoteValue(block, "VF");
    const vc  = parseVoteValue(block, "VC");
    const vb  = parseVoteValue(block, "VB");
    const abs = parseVoteValue(block, "ABS");

    // ── Voting / decision power ────────────────────────────────
    const vpMatch = block.match(/[Pp]oder\s+[Vv]otante\s*:?\s*(\d+)/im);
    const dpMatch = block.match(/[Pp]oder\s+[Dd]ecisorio\s*:?\s*(\d+)/im);
    const votingPower   = vpMatch ? parseInt(vpMatch[1], 10) : vf + vc + vb + abs;
    const decisionPower = dpMatch ? parseInt(dpMatch[1], 10) : Math.ceil((votingPower - abs) / 2) + 1;

    // ── Observations ──────────────────────────────────────────
    const observations = stripMd(
      block.match(/Observaci[oó]n[:\s]+([\s\S]*?)(?=\n\n|Elabor|$)/i)?.[1] ?? ""
    ).replace(/\s+/g, " ").trim();

    const isProcedural = /procedimiento|no se vota|N\/A/i.test(observations + " " + block.slice(0, 80));
    const category = detectCategory(motionText, observations);
    const result = detectResult(vf, vc, decisionPower, isProcedural);

    motions.push({
      id: `${actaId}-m${motionNum}-${motions.length}`,
      number: motionNum,
      proposer,
      seconders,
      text: motionText || `Moción #${motionNum}`,
      votesFor: vf,
      votesAgainst: vc,
      votesBlank: vb,
      abstentions: abs,
      votingPower,
      decisionPower,
      observations,
      result,
      category,
      actaId,
      actaName,
      actaDate,
      actaYear,
    });
  }

  return motions;
}

function extractAgenda(content: string): string[] {
  const items: string[] = [];
  let capturing = false;
  for (const line of content.split("\n")) {
    if (/ORDEN DEL DÍA|ORDEN DEL DIA/i.test(line)) { capturing = true; continue; }
    if (capturing) {
      const m = line.match(/^\s*\d+\.\s+(.+)/);
      if (m) items.push(stripMd(m[1]));
      else if (items.length > 0 && /##|DESARROLLO/i.test(line)) break;
    }
  }
  return items;
}

function extractInstitutions(content: string): string[] {
  const set = new Set<string>();
  const clean = content.replace(/\*\*/g, "");
  const pattern = /(?:Secundantes|Proponente)[:\s]+([^\n]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(clean)) !== null) {
    m[1].split(/[,;]/).forEach((tok) => {
      const t = tok.trim();
      if (t.length >= 2 && t.length <= 30 && /^[A-ZÁÉÍÓÚ]/.test(t)) set.add(t);
    });
  }
  return Array.from(set);
}

export function parseActa(content: string, filePath: string): Acta | null {
  try {
    const clean = content.replace(/\*\*/g, "").replace(/\*/g, "");

    // Number
    const numberMatch = clean.match(/(\d+)[°º]\s*ANGE/i) || clean.match(/Acta\s+No[.:\s]*(\d+[°º]?)/i);
    const number = numberMatch ? numberMatch[1].replace(/[°º]/, "") : "N/A";

    // Name — stop at strikethrough ~~, "Acta No", or end of meaningful phrase
    const nameMatch = clean.match(/(\d+)[°º]\s*Asamblea\s+Nacional\s+General\s+\w+(?:\s+[-–]\s*\d+[°º]\s*ANGE[-–])?/i);
    const assemblyName = nameMatch
      ? stripMd(nameMatch[0]).replace(/~~[^~]+~~/g, "").trim()
      : `${number}° Asamblea Nacional General`;

    // Date
    const dateMatch = clean.match(/Fecha[:\s]+(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/i)
      || clean.match(/(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})/i);
    const rawDate = dateMatch ? dateMatch[0].replace(/Fecha[:\s]+/i, "").trim() : "";
    const yearMatch = rawDate.match(/\d{4}/) || clean.match(/20\d{2}/);
    const year = yearMatch ? parseInt(yearMatch[0], 10) : new Date().getFullYear();

    // Location / modality
    const locationMatch = clean.match(/Lugar[:\s]+([^\n]+)/i);
    const location = locationMatch ? stripMd(locationMatch[1]) : "N/A";
    const modality: Acta["modality"] = /zoom/i.test(location) ? "zoom"
      : /virtual|teams|meet/i.test(location) ? "zoom" : "presencial";

    // Times
    const startTime = stripMd(clean.match(/Hora\s+de\s+inicio[:\s]+([^\n]+)/i)?.[1] ?? "");
    const endTime   = stripMd(clean.match(/Hora\s+de\s+[Ff]inaliz\w*[:\s]+([^\n]+)/i)?.[1] ?? "");

    // Secretary / moderator
    const secretary = stripMd(clean.match(/nombr[ae]\s+a\s+([^\n]+?)\s+como\s+secretario/i)?.[1] ?? "");
    const moderator  = stripMd(clean.match(/nombr[ae]\s+a\s+([^\n]+?)\s+como\s+moderador/i)?.[1] ?? "");

    const actaId = `acta-${number}-${year}`;
    const agenda = extractAgenda(clean);
    const motions = extractMotions(content, actaId, assemblyName, rawDate || String(year), year);
    const attendingInstitutions = extractInstitutions(clean);

    return {
      id: actaId,
      name: assemblyName,
      number,
      date: rawDate || String(year),
      year,
      location,
      modality,
      startTime,
      endTime,
      agenda,
      motions,
      secretary,
      moderator,
      attendingInstitutions,
      rawContent: content,
      filePath,
    };
  } catch (e) {
    console.error("Error parsing acta:", filePath, e);
    return null;
  }
}
