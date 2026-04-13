---
type: decision
topic: Role Context System
updated: 2026-04-12
related: [[decisions/project-scope]], [[decisions/phase-strategy]]
source_files: [".planning/REQUIREMENTS.md", ".planning/PROJECT.md", ".planning/ROADMAP.md"]
---

# Role Context System

## Current decision

Extend the `agents` table with nullable `mission`, `job_description`, and `role_goals` text columns (Phase 2). Wire those into env vars injected at agent pickup time (Phase 3). Expose via UI with an AI "Suggest" button for generating initial values (Phase 4). AI-generated defaults are editable before saving.

## Rationale

Today agents receive only a role name when picking up issues. Roland's Midstage Institute domain expertise — mission-driven role design, OKR-style goals, clear job descriptions — is not yet encoded. The goal is agents that act with enough context to make the decisions a midstage startup operator would make.

## Data Model (Phase 2)

New nullable columns on `agents` table:
- `mission` — text, nullable
- `job_description` — text, nullable
- `role_goals` — text, nullable

Zero breaking changes: existing agents get null values, no data migration required.

Update `server/src/services/agents.ts:34` column whitelist to include new fields. Expose via `GET /agents/:id` and `PUT /agents/:id`.

## Context Injection (Phase 3)

Env vars injected at agent pickup in `workspace-runtime.ts`:
- `PAPERCLIP_AGENT_MISSION`
- `PAPERCLIP_AGENT_JOB_DESCRIPTION`
- `PAPERCLIP_AGENT_GOALS`

Claude adapter (`claude-local/execute.ts`) includes these in the system prompt when populated. Null/empty fields produce no broken prompts (graceful conditional rendering).

Open question: Does `renderTemplate` support Mustache conditionals for null field handling? (Phase 3 concern noted in STATE.md)

## UI (Phase 4)

- Text area inputs on AgentDetail form (save via existing PUT endpoint)
- "AI Suggest" button generates mission + job description + goals from the agent's role name — editable before saving

## v2 Roadmap (deferred)

- Shared roles table (multiple agents reuse one definition)
- Role template library for common midstage startup roles (CMO, Head of Sales, etc.)
- OKR-structured goals (separate fields per objective with key results)
- Role context logging in agent execution trace

## History

- 2026-04-12: Requirements defined (ROLE-01 through ROLE-03, CTX-01 through CTX-03, UI-01/UI-02)
- 2026-04-12: All 13 v1 requirements mapped to phases with zero unmapped

## Open threads

- [ ] Verify `renderTemplate` supports Mustache conditionals before Phase 3 planning
