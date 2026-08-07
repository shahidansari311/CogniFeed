# PRD: Autonomous AI & Technology Persona Agent

**Codename:** *Signal* — an autonomous editorial agent that discovers, judges, writes, and publishes tech commentary without human input after initialization.

**Owner:** [you]
**Status:** Draft v1.0
**Evaluation window:** ~48 hours post-`init`

---

## 1. Problem Statement

Most "AI content agents" today are really human-in-the-loop writing assistants: a person picks the topic, the model writes the paragraph. The challenge is to invert that — build an agent with **editorial agency**: it decides *what* is worth talking about, *when*, and *why*, and it remembers what it already said so it doesn't repeat itself. The output isn't just fluent text; it's a coherent stream of judgment calls a reader could follow like a real analyst's feed.

## 2. Goals

| Goal | Description |
|---|---|
| G1 | Fully autonomous operation for 48h after a single `init` call — zero further prompts. |
| G2 | Visible, non-generic editorial judgment (rejections are as important as acceptances). |
| G3 | A persona that reads as one consistent person, not a rotating template. |
| G4 | Memory that actually changes behavior (dedup, callbacks, evolving stance). |
| G5 | Time-distributed publishing that looks like a human cadence, not a batch dump. |
| G6 | Full rationale + sourcing transparency on every post. |
| G7 (stretch) | Ship one feature no other submission is likely to have. See §7. |

## 3. Non-Goals

- Real posting to LinkedIn/X/etc.
- Multi-platform formatting.
- Images, video, or rich media generation.
- Multi-agent orchestration (single persona, single voice).
- Engagement metrics (likes/shares) — nothing to optimize against.
- Human approval queue of any kind after init.

---

## 4. Persona Definition (example instantiation)

The system must support arbitrary personas from `init`, but here's a concrete worked example used throughout this PRD:

```json
{
  "name": "Ada Renner",
  "domain": "AI Security",
  "role": "Independent AI Security Researcher",
  "voice": {
    "tone": "precise, skeptical, dry humor, no hype",
    "sentence_style": "short declarative sentences, occasional rhetorical question",
    "signature_moves": [
      "opens with the concrete risk before the abstraction",
      "names the specific attack surface, not just 'AI safety' vaguely",
      "closes many posts with a falsifiable claim or a question to future-self"
    ]
  },
  "stable_interests": [
    "prompt injection & agentic tool misuse",
    "model supply chain / weight provenance",
    "red-teaming methodology",
    "open-weight model governance"
  ],
  "editorial_standards": {
    "reject_if": [
      "topic is pure marketing/product announcement with no technical substance",
      "topic is already covered by this persona in the last 14 days without new information",
      "claim cannot be traced to at least one primary or reputable source",
      "topic is off-domain (not AI/security/technology)"
    ],
    "prefer_if": [
      "novel attack vector or defense technique",
      "primary source (paper, CVE, vendor postmortem, repo) available",
      "contradicts or updates something the persona said before (self-correction is high value)"
    ]
  }
}
```

`domain` from the `init` payload maps to a **persona template** (AI Security, ML Engineering, Product Analysis, Robotics, Dev Advocacy, AI Ethics, Open Source, or "custom") which seeds stable interests, rejection rules, and voice parameters. Custom domains get a generated template via one LLM call at init time, then frozen for the run.

---

## 5. System Architecture

```
                         ┌────────────────────────┐
        POST /init  ───► │   Init Service         │
                         │   - persona compile     │
                         │   - agent record create │
                         └───────────┬─────────────┘
                                     │
                                     ▼
                         ┌────────────────────────┐
                         │  Scheduler (per agent)  │
                         │  cron-style tick every  │
                         │  N minutes, jittered    │
                         └───────────┬─────────────┘
                                     ▼
        ┌───────────────────────────────────────────────────────┐
        │                     Publish Cycle                      │
        │                                                         │
        │  1. Topic Discovery  → candidate topics + sources       │
        │  2. Dedup vs Memory  → drop near-duplicates              │
        │  3. Editorial Scoring→ accept / reject each candidate    │
        │  4. Draft Generation → persona-voiced post               │
        │  5. Self-Consistency Check → voice + fact check vs memory│
        │  6. Commit to Store  → post + rationale + sources        │
        │  7. (Bonus) Thread Engine → follow-ups / retractions     │
        └───────────────────────────────────────────────────────┘
                                     │
                                     ▼
                         ┌────────────────────────┐
        GET /feed  ◄──── │   Feed Store (append-   │
                         │   only, per agentId)    │
                         └────────────────────────┘
```

**Key design decision:** the scheduler runs *independently of the feed endpoint*. `GET /feed` is a pure read — it must never trigger generation, or "autonomous" becomes fake (an evaluator polling the feed would be indistinguishable from a human prompting it).

---

## 6. Functional Requirements

### 6.1 Topic Discovery
- Pulls from ≥2 live source types: web search API, RSS/Atom feeds (arXiv cs.CR/cs.AI, vendor security blogs, HN front page, GitHub trending), and optionally a search-engine news API.
- Each discovery pass produces `Candidate { title, snippet, url, publishedAt, sourceType }`.
- Candidates are scoped to the persona's `stable_interests` via keyword + embedding similarity filter before they even reach editorial scoring, to keep discovery cheap and on-domain.

### 6.2 Editorial Judgment
- Deterministic pre-filters (age of source, off-domain keyword blocklist, duplicate URL) run before any LLM call — cheap rejection.
- LLM-based scorer rates each surviving candidate 0–100 on: *novelty*, *technical substance*, *source credibility*, *relevance to persona*, *timeliness*.
- Threshold (e.g. ≥70) gates publication. Everything below is logged as **rejected** with a one-line reason — this rejection log is itself a required artifact (see §7 bonus feed).
- Target rejection rate is enforced to stay in a believable band (roughly 60–85% rejected) so the agent doesn't look like it publishes everything it sees.

### 6.3 Persona Consistency
- A **voice contract** (from §4) is injected into every generation call.
- A post-generation **consistency check**: a second LLM pass scores the draft against the voice contract and against the last 10 published posts' embeddings; drafts that drift are regenerated once, then either fixed or discarded (counts as a rejection).
- Stable interests act as a soft prior on discovery *and* a hard constraint on publishing (domain lock).

### 6.4 Memory
- Persistent store keyed by `agentId`: all published posts (text, embedding, topic tags, entities, claims made, timestamp), all rejected candidates (for judgment transparency), and a rolling **claims ledger** (see §7).
- Dedup: cosine similarity on embeddings + entity overlap against last 14 days of posts; near-duplicate candidates are rejected with reason `"already covered"`.
- Continuity: new drafts may reference prior posts by id ("Following up on what I flagged last Tuesday about X...") when topically linked — this is why memory must be queryable by topic tag, not just chronology.

### 6.5 Autonomous Publishing Cadence
- Scheduler ticks on a jittered interval (e.g. every 45–90 minutes) for 48h, producing an expected **8–15 posts total** — enough to show judgment and continuity, not a spam dump.
- Cadence has mild diurnal shaping (fewer posts 02:00–07:00 persona-local time) to read as human-paced, not cron-obviously-uniform.
- Publishing must survive process restarts: scheduler state (next run time, last tick) is persisted, not in-memory only.

### 6.6 Publishing Rationale
Every post object includes:
```json
{
  "id": "p7",
  "createdAt": "2026-08-07T10:30:00Z",
  "text": "...",
  "rationale": "Selected because... relevant now because... chosen over candidate X because...",
  "sources": ["https://..."],
  "topicTags": ["prompt-injection", "supply-chain"],
  "editorialMeta": {
    "noveltyScore": 82,
    "candidatesConsidered": 4,
    "rejectedAlternatives": [
      {"title": "...", "reason": "marketing-only, no technical detail"}
    ]
  }
}
```
`rejectedAlternatives` is optional but strongly recommended — it directly demonstrates editorial judgment inside the required schema without needing a new endpoint.

---

## 7. Out-of-the-Box Feature: **The Claims Ledger & Self-Correction Thread Engine**

### 7.1 The idea
Real analysts are credible because they're *accountable over time*: they make calls, and later they revisit them — confirm, refine, or retract. Almost no AI content bot does this; they generate isolated posts. **Signal** maintains a structured **claims ledger** extracted from its own published posts, and a background process periodically re-examines open claims against fresh discovery results. When warranted, it autonomously publishes one of three follow-up post types:

| Type | Trigger | Example |
|---|---|---|
| **Confirmation** | New source corroborates an earlier claim | *"Update on Tuesday's note about the npm supply-chain pattern: CISA's advisory today confirms the same injection vector. Ledger closed on this one — I was right to flag it early."* |
| **Refinement** | New info adds nuance without contradicting | *"Partial update to my prompt-injection post: turns out the mitigation I dismissed as 'theater' does work, just only for single-turn agents. Correcting the record."* |
| **Retraction** | New evidence contradicts the earlier claim | *"I was wrong on Thursday. I said the CVE was unpatched upstream — the maintainer shipped a fix same day, I missed it. Retracting the urgency framing, not the underlying risk."* |

### 7.2 Why this is "out of the box"
- It converts **memory** from a dedup mechanism into a *narrative and credibility engine* — the exact thing the eval rubric singles out ("effective use of memory").
- It gives the **editorial judgment** requirement a second dimension: judgment isn't just "should I publish this new thing" but "was I right about the old thing."
- It produces genuinely emergent, non-templated content — the agent is reasoning about *its own track record*, which is hard to fake with a shallow wrapper and hard to pre-script.
- It's a natural, low-risk extension of required fields: no new endpoint is strictly needed, though we expose one optional endpoint for it (§7.4).

### 7.3 Mechanics
1. **Claim extraction**: after each publish, an LLM pass extracts 0–2 atomic, falsifiable claims from the post (e.g. "Vendor X's patch does not address the root cause") and appends them to the ledger with status `open`.
2. **Ledger review pass**: runs once every ~6–8 hours (separate from the main publish cycle) — re-queries discovery sources scoped to open claims' entities/topics.
3. **Verdict scoring**: LLM compares new evidence to the claim → `confirmed | refined | retracted | still_open`. Only `confirmed | refined | retracted` with sufficient evidence strength trigger a follow-up post; `still_open` just stays in the ledger silently (no forced content).
4. **Follow-up post generation** reuses the standard voice contract, links back to the original post id (`inReplyToPostId`), and updates ledger status.
5. **Anti-spam guard**: max 1 follow-up post per ledger review pass, and a claim can only be revisited once per status change (no repeated flip-flopping) to keep it credible rather than noisy.

### 7.4 Optional bonus endpoint (non-required, additive)
```
GET /api/agent/ledger?agentId=abc-123
```
Returns the claims ledger (open/confirmed/refined/retracted) — purely for transparency/demo purposes; evaluators are not required to call it, but it makes the self-correction behavior auditable rather than a marketing claim.

### 7.5 Schema addition to post object
```json
{
  "inReplyToPostId": "p3",
  "followUpType": "retraction",
  "ledgerClaimId": "c14"
}
```
Present only on follow-up posts; absent on original posts. Fully backward compatible with the required feed schema.

---

## 8. Data Model

```
Agent
  id, persona (json), createdAt, schedulerState { nextTickAt, tickIntervalMinutesRange }

Post
  id, agentId, createdAt, text, rationale, sources[], topicTags[],
  embedding, editorialMeta { noveltyScore, candidatesConsidered, rejectedAlternatives[] },
  inReplyToPostId?, followUpType?, ledgerClaimId?

RejectedCandidate
  id, agentId, consideredAt, title, url, reason, score

Claim
  id, agentId, postId, text, entities[], topicTags[], status(open|confirmed|refined|retracted),
  openedAt, resolvedAt?, resolutionPostId?
```

## 9. API Specification

### `POST /api/agent/init`
- Validates persona payload, compiles voice contract + rejection rubric (via templated + one-shot LLM expansion for custom domains).
- Creates `Agent` row, starts scheduler, returns `{ "agentId": "..." }`.
- Idempotency: a second call with the same persona+client key returns the existing agent rather than creating a duplicate (defensive, since spec says "called exactly once" but re-init shouldn't corrupt state).

### `GET /api/agent/feed?agentId=...`
- Pure read. No generation side effects.
- Returns all posts, newest first, per the required schema plus the optional §7.5 fields.
- Must be idempotent and safe to call at high frequency (evaluator polling) — served from the persisted store, cached at the edge for a few seconds if needed.

### `GET /api/agent/ledger?agentId=...` *(optional, bonus)*
- Read-only view of the claims ledger for transparency/demo.

---

## 10. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Reliability | Scheduler must survive process restarts / redeploys (persisted next-tick time). |
| Idempotency | Re-calling init or feed must never duplicate posts or reset state. |
| Latency | `GET /feed` p95 < 300ms — it's a read against the store, not a generation call. |
| Cost control | Cap LLM calls per publish cycle (discovery filter → editorial scoring → draft → consistency check ≈ 4–6 calls); cap ledger review separately. |
| Observability | Log every discovery pass, every accept/reject decision with reason, every ledger verdict — needed both for debugging and because rejection reasoning is graded. |
| Isolation | Each `agentId` fully isolated; no cross-agent memory leakage. |
| Safety | Discovery/source fetching respects robots.txt and rate limits; no fabricated sources — every `sources[]` URL must be one actually returned by discovery, never invented. |

## 11. Suggested Tech Stack

- **Runtime/API:** Node.js (Fastify/Express) or Python (FastAPI) — either is fine; FastAPI pairs well with async scheduling.
- **Scheduler:** simple persisted cron table + worker process (e.g. `node-cron`/APScheduler backed by a DB row, not in-memory setInterval) so it survives restarts.
- **Store:** Postgres (or SQLite for a hackathon-scale demo) with a `pgvector`/simple cosine-in-app for embedding similarity dedup.
- **LLM:** Claude via Anthropic API for discovery filtering, editorial scoring, drafting, consistency checking, and claim extraction/verdicts — same model, different system prompts per stage, to keep the voice contract centrally enforced.
- **Discovery sources:** web search tool / news API + curated RSS list (arXiv, vendor security blogs, HN, GitHub trending) matched to persona domain.

## 12. Evaluation Mapping (self-check against rubric)

| Rubric item | Where it's addressed |
|---|---|
| Autonomous operation after init | §5 scheduler decoupled from feed reads; §9 idempotency |
| Quality of editorial decision-making | §6.2 scoring + rejection log; §7 claims ledger raises the bar further |
| Consistency of persona | §4 voice contract; §6.3 consistency check pass |
| Effective use of memory | §6.4 dedup/continuity; §7 ledger is memory with teeth |
| Transparency of rationale | §6.6 required fields + optional rejectedAlternatives |
| Overall coherence | Cadence shaping (§6.5), thread linking (§7.5) make the feed read like one person's timeline, not isolated posts |

## 13. Milestones (build order for the 48h+build window)

1. Data model + init/feed endpoints with static/mock posts (skeleton working end-to-end).
2. Discovery pipeline wired to 1 real source; manual trigger.
3. Editorial scoring + rejection logging.
4. Draft generation with voice contract; consistency check pass.
5. Scheduler with persisted state; remove manual trigger dependency.
6. Claims ledger + follow-up engine (bonus feature).
7. Cadence shaping, dedup tuning, load-test `GET /feed` under polling.
8. Dry run: init once, let it run untouched for several hours, verify feed grows correctly with no external calls.

## 14. Open Risks

- **LLM hallucinated sources** — mitigate by only allowing `sources[]` to be URLs actually returned by the discovery tool, never model-generated.
- **Repetition drift over 48h** with a narrow domain — mitigate with topic-tag diversity quota per day, not just similarity dedup.
- **Over-triggering follow-ups** making the feed feel gimmicky — mitigate with the anti-spam guard in §7.3.5.
- **Scheduler silently dying** — mitigate with a heartbeat row + restart-safe persisted next-tick time (§10 reliability).
