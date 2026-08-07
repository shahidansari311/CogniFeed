/**
 * Core domain types for the CogniFeed autonomous persona agent platform.
 * Mirrors the data model defined in PRD §8.
 */

/* ────────────────────────────────────────────
   Persona & Agent
   ──────────────────────────────────────────── */

export interface PersonaVoice {
  tone: string;
  sentenceStyle: string;
  signatureMoves: string[];
}

export interface EditorialStandards {
  rejectIf: string[];
  preferIf: string[];
}

export interface Persona {
  name: string;
  domain: string;
  role?: string;
  voice?: PersonaVoice;
  stableInterests?: string[];
  editorialStandards?: EditorialStandards;
}

export type SchedulerStatus = "idle" | "running" | "paused" | "completed";

export interface SchedulerState {
  nextTickAt: string;
  tickIntervalMinutesRange: [number, number];
  status: SchedulerStatus;
  totalTicks: number;
  lastTickAt: string | null;
}

export interface Agent {
  id: string;
  persona: Persona;
  createdAt: string;
  schedulerState: SchedulerState;
}

/* ────────────────────────────────────────────
   Editorial Judgment
   ──────────────────────────────────────────── */

export interface RejectedAlternative {
  title: string;
  reason: string;
}

export interface EditorialMeta {
  noveltyScore: number;
  substanceScore: number;
  credibilityScore: number;
  relevanceScore: number;
  timelinessScore: number;
  overallScore: number;
  candidatesConsidered: number;
  rejectedAlternatives: RejectedAlternative[];
}

/* ────────────────────────────────────────────
   Posts
   ──────────────────────────────────────────── */

export type FollowUpType = "confirmation" | "refinement" | "retraction";

export interface Post {
  id: string;
  agentId: string;
  createdAt: string;
  text: string;
  rationale: string;
  sources: string[];
  topicTags: string[];
  editorialMeta: EditorialMeta;
  /** Present only on follow-up posts (Claims Ledger thread engine) */
  inReplyToPostId?: string;
  followUpType?: FollowUpType;
  ledgerClaimId?: string;
}

/* ────────────────────────────────────────────
   Rejected Candidates
   ──────────────────────────────────────────── */

export interface RejectedCandidate {
  id: string;
  agentId: string;
  consideredAt: string;
  title: string;
  url: string;
  reason: string;
  score: number;
  sourceType: "rss" | "web-search" | "news-api" | "injected";
}

/* ────────────────────────────────────────────
   Claims Ledger (§7)
   ──────────────────────────────────────────── */

export type ClaimStatus = "open" | "confirmed" | "refined" | "retracted";

export interface Claim {
  id: string;
  agentId: string;
  postId: string;
  text: string;
  entities: string[];
  topicTags: string[];
  status: ClaimStatus;
  openedAt: string;
  resolvedAt?: string;
  resolutionPostId?: string;
}

/* ────────────────────────────────────────────
   Console / Observability Log
   ──────────────────────────────────────────── */

export type LogLevel = "info" | "discovery" | "editorial" | "publish" | "ledger" | "warn" | "error";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
}

/* ────────────────────────────────────────────
   Topic Discovery Candidate
   ──────────────────────────────────────────── */

export interface Candidate {
  title: string;
  snippet: string;
  url: string;
  publishedAt: string;
  sourceType: "rss" | "web-search" | "news-api" | "injected";
}

/* ────────────────────────────────────────────
   Persona Templates
   ──────────────────────────────────────────── */

export interface PersonaTemplate {
  id: string;
  label: string;
  description: string;
  icon: string;
  persona: Persona;
}
