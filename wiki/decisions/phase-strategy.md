---
type: decision
topic: Phase Strategy and Ordering
updated: 2026-04-12
related: [[decisions/role-context]], [[decisions/project-scope]]
source_files: [".planning/ROADMAP.md", ".planning/STATE.md"]
---

# Phase Strategy and Ordering

## Current decision

Execute phases in order: **1 → 1.5 → 2 → 3 → 4**. Phase 1.5 is an inserted phase (Weekly Planning Agent). Phase 4 (UI) depends on Phase 2 (API), not Phase 3 (Context Injection).

## Phase Overview

| Phase | Name | Status | Key Requirement |
|-------|------|--------|-----------------|
| 1 | Production Infrastructure | **Executing** | Fix CI, managed Postgres, custom domain, workspaces |
| 1.5 | Weekly Planning Agent (INSERTED) | Not started | First production AI agent for Midstage Institute |
| 2 | Role Schema + API | Not started | mission/job_description/role_goals on agents table |
| 3 | Agent Context Injection | Not started | Env vars + prompt template injection |
| 4 | UI + Polish | Not started | AgentDetail form + AI Suggest button |

## Phase Dependencies

- Phase 1: no dependencies (first phase)
- Phase 1.5: depends on Phase 1 (production infrastructure live)
- Phase 2: depends on Phase 1
- Phase 3: depends on Phase 2 (needs API to have data)
- Phase 4: depends on Phase 2 only (UI needs API, not prompt injection)

## Phase 1.5 Insertion Rationale

The Weekly Planning Agent delivers tangible AI agent functionality before the role context system is built. It runs in the Midstage Institute workspace and demonstrates end-to-end agent orchestration as a proof point. The four-step workflow:
1. Read the quarterly plan
2. Collect status from team members
3. Produce Tuesday meeting report
4. Suggest prioritized agenda for 45-minute meeting

## History

- 2026-04-12: 4-phase roadmap created from 13 requirements
- 2026-04-12: Phase 1.5 inserted between Phase 1 and Phase 2 (scope expansion)
- 2026-04-12: Phase 4 → Phase 2 dependency noted (not Phase 3) in STATE.md accumulated decisions

## Open threads

- [ ] Phase 1.5 requirements not yet defined — must run /gsd-discuss-phase after Phase 1 completes
