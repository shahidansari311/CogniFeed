/**
 * API abstraction layer for CogniFeed.
 * Connects to the NestJS backend at /api/v1
 */

import type { Agent, Post, RejectedCandidate, Claim, LogEntry, Persona } from "./types";

const API_BASE = "/api";

// Helper to get current agent ID
function getCurrentAgentId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cognifeed_agent_id");
}

// Helper to set current agent ID
function setCurrentAgentId(id: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("cognifeed_agent_id", id);
  }
}

/* ────────────────────────────────────────────
   Agent Initialization
   ──────────────────────────────────────────── */

export async function initAgent(persona: Persona): Promise<Agent> {
  const res = await fetch(`${API_BASE}/agent/init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ persona }),
  });
  if (!res.ok) throw new Error("Failed to initialize agent");
  const agent = await res.json();
  setCurrentAgentId(agent.id);
  return agent;
}

/* ────────────────────────────────────────────
   Feed
   ──────────────────────────────────────────── */

export async function getFeed(): Promise<Post[]> {
  const agentId = getCurrentAgentId();
  if (!agentId) return [];
  const res = await fetch(`${API_BASE}/agent/feed?agentId=${agentId}`);
  if (!res.ok) throw new Error("Failed to fetch feed");
  const data = await res.json();
  return data.posts || [];
}

/* ────────────────────────────────────────────
   Rejection Log
   ──────────────────────────────────────────── */

export async function getRejections(): Promise<RejectedCandidate[]> {
  const agentId = getCurrentAgentId();
  if (!agentId) return [];
  const res = await fetch(`${API_BASE}/agent/rejections?agentId=${agentId}`);
  if (!res.ok) throw new Error("Failed to fetch rejections");
  return res.json();
}

/* ────────────────────────────────────────────
   Claims Ledger
   ──────────────────────────────────────────── */

export async function getLedger(): Promise<Claim[]> {
  const agentId = getCurrentAgentId();
  if (!agentId) return [];
  const res = await fetch(`${API_BASE}/agent/ledger?agentId=${agentId}`);
  if (!res.ok) throw new Error("Failed to fetch ledger");
  return res.json();
}

/* ────────────────────────────────────────────
   Console Logs
   ──────────────────────────────────────────── */

export async function getConsoleLogs(): Promise<LogEntry[]> {
  const agentId = getCurrentAgentId();
  if (!agentId) return [];
  const res = await fetch(`${API_BASE}/agent/logs?agentId=${agentId}`);
  if (!res.ok) throw new Error("Failed to fetch console logs");
  return res.json();
}

export async function triggerAgent(): Promise<void> {
  const agentId = getCurrentAgentId();
  if (!agentId) return;
  const res = await fetch(`${API_BASE}/agent/${agentId}/trigger`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to trigger agent");
}

/* ────────────────────────────────────────────
   Agent State
   ──────────────────────────────────────────── */

export async function getAgent(): Promise<Agent | null> {
  const agentId = getCurrentAgentId();
  if (!agentId) return null;
  const res = await fetch(`${API_BASE}/agent/${agentId}`);
  if (!res.ok) {
    if (res.status === 404) {
      // Agent not found on backend, clear local storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("cognifeed_agent_id");
      }
    }
    return null;
  }
  return res.json();
}

/* ────────────────────────────────────────────
   Reset
   ──────────────────────────────────────────── */

export function resetAll() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("cognifeed_agent_id");
  }
}
