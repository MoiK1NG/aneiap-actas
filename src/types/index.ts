export interface Motion {
  id: string;
  number: number;
  proposer: string;
  seconders: string[];
  text: string;
  votesFor: number;
  votesAgainst: number;
  votesBlank: number;
  abstentions: number;
  votingPower: number;
  decisionPower: number;
  observations: string;
  result: "approved" | "rejected" | "procedural";
  category: MotionCategory;
  actaId: string;
  actaName: string;
  actaDate: string;
  actaYear: number;
}

export type MotionCategory =
  | "financial"
  | "sanction"
  | "administrative"
  | "normative"
  | "election"
  | "approval"
  | "appeal"
  | "other";

export interface Acta {
  id: string;
  name: string;
  number: string;
  date: string;
  year: number;
  location: string;
  modality: "zoom" | "presencial" | "hibrida";
  startTime: string;
  endTime: string;
  agenda: string[];
  motions: Motion[];
  secretary: string;
  moderator: string;
  attendingInstitutions: string[];
  rawContent: string;
  filePath: string;
}

export interface SearchResult {
  motion: Motion;
  score: number;
  similarMotions: SimilarMotion[];
}

export interface SimilarMotion {
  motion: Motion;
  similarity: number;
}

export interface DashboardStats {
  totalActas: number;
  totalMotions: number;
  approvedMotions: number;
  rejectedMotions: number;
  motionsByYear: Record<number, number>;
  approvalRateByYear: Record<number, number>;
  motionsByProposer: Record<string, number>;
  motionsByCategory: Record<MotionCategory, number>;
  sanctionMotions: Motion[];
  financialMotions: Motion[];
  appealMotions: Motion[];
  institutionParticipation: Record<string, InstitutionStats>;
  recentActas: Acta[];
}

export interface InstitutionStats {
  votesFor: number;
  votesAgainst: number;
  abstentions: number;
  motionsProposed: number;
  timesSeconded: number;
}

export interface DuplicateAlert {
  motions: Motion[];
  similarity: number;
  type: "identical" | "similar" | "redundant";
}
