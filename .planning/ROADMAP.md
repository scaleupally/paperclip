# Roadmap: Paperclip — Roland's Venture OS

## Overview

This milestone takes Paperclip from a working-but-undeployed agent orchestration platform to a production system where AI agents receive rich role context (mission, job description, goals) when executing work. The path is: fix deployment so changes reach production, extend the data model with role fields, wire those fields into agent prompts, then give the user a UI to manage it all.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Production Infrastructure** - Fix deployment pipeline, connect managed Postgres, custom domain, verify app boots in production
- [ ] **Phase 1.5: Weekly Planning Agent** (INSERTED) - First Midstage AI agent running end-to-end in production
- [ ] **Phase 2: Role Schema + API** - Add role context fields to agents table and expose via API
- [ ] **Phase 3: Agent Context Injection** - Wire role context into env vars and adapter prompt templates
- [ ] **Phase 4: UI + Polish** - Agent detail form for role context editing and AI-generated role suggestions

## Phase Details

### Phase 1: Production Infrastructure
**Goal**: Production deployment works end-to-end -- pushes to master reach Fly.io, the app boots with managed Postgres, custom domain agents.midstage.ac live, and three venture workspaces configured
**Depends on**: Nothing (first phase)
**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04, DEPLOY-05
**Success Criteria** (what must be TRUE):
  1. Pushing to `master` triggers a GitHub Actions deploy that reaches the Fly.io app (`paperclip-icy-fog-8513`)
  2. The production app connects to a Fly.io managed Postgres cluster (not embedded PGLite)
  3. The production app boots without runtime errors, auth works, and health check endpoint responds
  4. Three workspaces exist in production: Midstage Institute, Scale-up Allies, and the podcast
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Fix CI branch, remove PGLite mount, add health checks, deploy and verify
- [ ] 01-02-PLAN.md — Bootstrap admin, create workspaces, configure custom domain

### Phase 1.5: Weekly Planning Agent (INSERTED)
**Goal**: A weekly planning agent runs end-to-end in the Midstage Institute workspace — reads the quarterly plan, collects status from team members, produces a Tuesday meeting report, and suggests agenda order for the 45-minute meeting window
**Depends on**: Phase 1 (production infrastructure live)
**Requirements**: (new — to be defined in discuss-phase)
**Success Criteria** (what must be TRUE):
  1. A "Weekly Planning" agent exists in the Midstage Institute workspace with appropriate adapter configured
  2. Agent reads or requests the quarterly plan
  3. Agent contacts team members and collects status on their items
  4. Agent produces a status report formatted for the Tuesday weekly meeting
  5. Agent suggests a prioritized discussion order fitting a 45-minute agenda
  6. Full first run completes without error in production
**Plans**: TBD

Plans:
- [ ] 1.5-01: TBD

### Phase 2: Role Schema + API
**Goal**: Agents have mission, job description, and goals as first-class data -- queryable and editable via API
**Depends on**: Phase 1
**Requirements**: ROLE-01, ROLE-02, ROLE-03
**Success Criteria** (what must be TRUE):
  1. An agent record can store mission, job_description, and role_goals (nullable text columns, no breaking changes to existing agents)
  2. GET /agents/:id returns the new role context fields
  3. PUT /agents/:id accepts and persists mission, job_description, and role_goals values
**Plans**: TBD

Plans:
- [ ] 02-01: TBD

### Phase 3: Agent Context Injection
**Goal**: When an agent picks up work, it receives its full role context in the execution environment -- not just a role name
**Depends on**: Phase 2
**Requirements**: CTX-01, CTX-02, CTX-03
**Success Criteria** (what must be TRUE):
  1. Agent execution environment includes `PAPERCLIP_AGENT_MISSION`, `PAPERCLIP_AGENT_JOB_DESCRIPTION`, and `PAPERCLIP_AGENT_GOALS` env vars (available to all adapters)
  2. Claude adapter system prompt includes the agent's mission, job description, and goals when those fields are populated
  3. Agents with empty/null role context fields execute normally -- no broken prompts, no empty sections in system prompt
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

### Phase 4: UI + Polish
**Goal**: Users can view and edit agent role context through the web interface, with AI assistance for generating initial role definitions
**Depends on**: Phase 2
**Requirements**: UI-01, UI-02
**Success Criteria** (what must be TRUE):
  1. AgentDetail page has text area inputs for mission, job description, and goals that save via the existing agent PUT endpoint
  2. An "AI Suggest" button generates proposed mission, job description, and goals based on the agent's role name -- editable before saving
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 04-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 1.5 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Production Infrastructure | 0/2 | Planning complete | - |
| 1.5. Weekly Planning Agent (INSERTED) | 0/? | Not started | - |
| 2. Role Schema + API | 0/? | Not started | - |
| 3. Agent Context Injection | 0/? | Not started | - |
| 4. UI + Polish | 0/? | Not started | - |

## Backlog

### Phase 999.1: Company Issue Prefix Rename UI (BACKLOG)

**Goal:** Allow admins to rename a company's issue prefix (e.g. RAI → RSM) through the UI, with automatic cascade to all existing issue identifiers
**Requirements:** TBD
**Context:** Currently requires a direct DB update via `fly proxy` + psql. The data change is two SQL statements in a transaction: `UPDATE companies SET issue_prefix = $new` and `UPDATE issues SET identifier = REPLACE(identifier, $old||'-', $new||'-') WHERE company_id = $id`. The `updateCompanySchema` validator needs `issuePrefix` added (uppercase, 2–6 chars, unique constraint already exists on DB). The `update()` service method needs to cascade the rename to issues. UI: a text input in company settings.
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd-review-backlog when ready)
