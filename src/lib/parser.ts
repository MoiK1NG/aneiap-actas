import { Acta, Motion, MotionCategory } from "@/types";

function detectCategory(text: string, observations: string): MotionCategory {
  const combined = (text + " " + observations).toLowerCase();
  if (/sanción|sancion|multa|penaliz/.test(combined)) return "sanction";
  if (/financier|presupuest|económic|econom|pago|cobro|cuota|dinero|aporte/.test(combined)) return "financial";
  if (/apelar|apelación|apelacion|refutar|impugn/.test(combined)) return "appeal";
  if (/reglamento|estatuto|norma|política|politica|modificar|cambiar|actualizar/.test(combined)) return "normative";
  if (/elegir|elección|eleccion|nombrar|designar|secretario|moderador|presidente/.test(combined)) return "election";
  if (/apertura|cierre|orden del día/.test(combined)) return "procedural" as MotionCategory;
  if (/apruebe|aprobar|presentar|presentación/.test(combined)) return "approval";
  if (/administrativ/.test(combined)) return "administrative";
  return "other";
}

function detectResult(votesFor: number, votesAgainst: number, decisionPower: number, isProcedural: boolean): Motion["result"] {
  if (isProcedural) return "procedural";
  if (votesFor >= decisionPower) return "approved";
  return "rejected";
}

function parseVoteValue(text: string, label: string): number {
  const patterns = [
    new RegExp(`${label}[:\\s]*([\\d]+)`, "i"),
    new RegExp(`\\*\\*${label}[:\\s]*([\\d]+)\\*\\*`, "i"),
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return parseInt(m[1], 10);
  }
  return 0;
}

function extractMotions(content: string, actaId: string, actaName: string, actaDate: string, actaYear: number): Motion[] {
  const motions: Motion[] = [];

  // Match motion blocks - various formats found in the documents
  const motionPattern = /Moción\s+No[:\s.]*(\d+)[^\n]*([\s\S]*?)(?=Moción\s+No[:\s.]*\d+|\*\*Elaboró|##\s*\d+\.|$)/gi;
  let match;

  while ((match = motionPattern.exec(content)) !== null) {
    const motionNum = parseInt(match[1], 10);
    const block = match[2];

    if (!block || block.trim().length < 10) continue;

    // Proposer
    const proposerMatch = block.match(/Proponente[:\s*]*([^\n*|]+)/i);
    const proposer = proposerMatch ? proposerMatch[1].replace(/\*\*/g, "").trim() : "N/A";

    // Seconders
    const secondersMatch = block.match(/Secundantes[:\s*]*([^\n*|]+)/i);
    const seconders = secondersMatch
      ? secondersMatch[1].replace(/\*\*/g, "").split(/[,;]/).map((s) => s.trim()).filter(Boolean)
      : [];

    // Text
    const textMatch = block.match(/Texto[:\s*]*([^\n*VF:VC:VB:ABS:]+)/i);
    const motionText = textMatch ? textMatch[1].replace(/\*\*/g, "").trim() : block.slice(0, 200).trim();

    // Votes
    const vf = parseVoteValue(block, "VF");
    const vc = parseVoteValue(block, "VC");
    const vb = parseVoteValue(block, "VB");
    const abs = parseVoteValue(block, "ABS");

    // Voting power
    const vpMatch = block.match(/[Pp]oder\s+[Vv]otante[:\s]*(\d+)/);
    const dpMatch = block.match(/[Pp]oder\s+[Dd]ecisorio[:\s]*(\d+)/);
    const votingPower = vpMatch ? parseInt(vpMatch[1], 10) : vf + vc + vb;
    const decisionPower = dpMatch ? parseInt(dpMatch[1], 10) : Math.ceil(votingPower / 2) + 1;

    // Observations
    const obsMatch = block.match(/Observaci[oó]n[:\s*]*([^|*\n]+(?:\n[^|*\n]+)*)/i);
    const observations = obsMatch ? obsMatch[1].trim() : "";

    const isProcedural = /procedimiento|no se vota/i.test(observations + block);
    const category = detectCategory(motionText, observations);
    const result = detectResult(vf, vc, decisionPower, isProcedural);

    motions.push({
      id: `${actaId}-m${motionNum}`,
      number: motionNum,
      proposer,
      seconders,
      text: motionText,
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
  const agendaItems: string[] = [];
  const lines = content.split("\n");
  let inAgenda = false;

  for (const line of lines) {
    if (/ORDEN DEL DÍA|ORDEN DEL DIA/i.test(line)) {
      inAgenda = true;
      continue;
    }
    if (inAgenda) {
      const item = line.match(/^\s*\d+\.\s+(.+)/);
      if (item) {
        agendaItems.push(item[1].trim());
      } else if (agendaItems.length > 0 && /##|DESARROLLO/i.test(line)) {
        break;
      }
    }
  }
  return agendaItems;
}

function extractInstitutions(content: string): string[] {
  const institutions = new Set<string>();
  const patterns = [
    /Secundantes[:\s*]*([^\n*|]+)/gi,
    /Proponente[:\s*]*([^\n*|]+)/gi,
    /\b(UC[A-Z]{1,5}|U[A-Z]{3,8}|UN[A-Z]{2,6}|UTB|UTP|UFPS|ICESI|UAO|UDEA|EAFIT|UNINORTE|UNISIMÓN|UNIVALLE|UNIMAGDALENA)\b/g,
  ];
  for (const p of patterns) {
    let m;
    while ((m = p.exec(content)) !== null) {
      const raw = m[1] || m[0];
      raw.split(/[,;]/).forEach((s) => {
        const t = s.replace(/\*\*/g, "").trim();
        if (t.length > 1 && t.length < 30 && /^[A-Z]/.test(t)) institutions.add(t);
      });
    }
  }
  return Array.from(institutions);
}

export function parseActa(content: string, filePath: string): Acta | null {
  try {
    // Extract assembly name and number
    const nameMatch = content.match(/(\d+)[°º]\s*Asamblea\s+Nacional\s+General[^*\n]*/i) ||
      content.match(/ANGE\s*[–-]\s*(\d+)[°º]/i);
    const numberMatch = content.match(/Acta\s+No[.:\s]*(\d+[°º]?)/i) ||
      content.match(/(\d+)[°º]\s*ANGE/i);

    const number = numberMatch ? numberMatch[1] : "N/A";
    const assemblyName = nameMatch ? nameMatch[0].trim() : `Asamblea ${number}`;

    // Extract date
    const dateMatch = content.match(/Fecha[:\s*]*(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/i) ||
      content.match(/(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/i);
    const rawDate = dateMatch ? dateMatch[0].replace(/Fecha[:\s*]*/i, "").trim() : "";
    const yearMatch = rawDate.match(/\d{4}/) || content.match(/20\d{2}/);
    const year = yearMatch ? parseInt(yearMatch[0], 10) : new Date().getFullYear();

    // Extract location and modality
    const locationMatch = content.match(/Lugar[:\s*]*([^\n*|]+)/i);
    const location = locationMatch ? locationMatch[1].replace(/\*\*/g, "").trim() : "N/A";
    const modality = /zoom/i.test(location) ? "zoom" : /virtual|teams|meet/i.test(location) ? "zoom" : "presencial";

    // Extract times
    const startMatch = content.match(/Hora\s+de\s+inicio[:\s*]*([^\n*|]+)/i);
    const endMatch = content.match(/Hora\s+de\s+[Ff]inaliz[^\s:]*[:\s*]*([^\n*|]+)/i);
    const startTime = startMatch ? startMatch[1].replace(/\*\*/g, "").trim() : "";
    const endTime = endMatch ? endMatch[1].replace(/\*\*/g, "").trim() : "";

    // Extract secretary and moderator from motions
    const secretaryMatch = content.match(/nombr[ae]\s+a\s+([^*\n]+?)\s+como\s+secretario/i);
    const moderatorMatch = content.match(/nombr[ae]\s+a\s+([^*\n]+?)\s+como\s+moderador/i);
    const secretary = secretaryMatch ? secretaryMatch[1].trim() : "";
    const moderator = moderatorMatch ? moderatorMatch[1].trim() : "";

    const actaId = `acta-${number.replace(/[°º]/g, "")}-${year}`;
    const agenda = extractAgenda(content);
    const motions = extractMotions(content, actaId, assemblyName, rawDate || String(year), year);
    const attendingInstitutions = extractInstitutions(content);

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
