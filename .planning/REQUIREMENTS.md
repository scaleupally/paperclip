# Requirements: Paperclip — Roland's Venture OS

**Defined:** 2026-04-12
**Core Value:** AI agents that act with enough role context to make the decisions a midstage startup operator would make — not just execute tasks, but understand the mission behind them.

## v1 Requirements

### Deployment

- [ ] **DEPLOY-01**: GitHub Actions workflow deploys from `master` (not `main`)
- [ ] **DEPLOY-02**: Fly.io managed Postgres cluster created and `DATABASE_URL` secret set on the app
- [ ] **DEPLOY-03**: Health check configured in `fly.toml` so Fly.io can detect and roll back bad deploys
- [ ] **DEPLOY-04**: Production app verified working (boots, DB connected, auth functional, no runtime errors)
- [ ] **DEPLOY-05**: Three ventures (Midstage Institute, Scale-up Allies, podcast) configured as workspaces on the shared instance

### Role Schema

- [ ] **ROLE-01**: `mission`, `job_description`, `role_goals` columns added to `agents` table via Drizzle migration (nullable, zero breaking changes to existing agents)
- [ ] **ROLE-02**: `agents` service column whitelist (`server/src/services/agents.ts:34`) updated to include new role context fields
- [ ] **ROLE-03**: Agent GET and PUT API endpoints expose and accept `mission`, `job_description`, `role_goals` fields

### Context Injection

- [ ] **CTX-01**: `PAPERCLIP_AGENT_MISSION`, `PAPERCLIP_AGENT_JOB_DESCRIPTION`, `PAPERCLIP_AGENT_GOALS` env vars injected in workspace runtime (`workspace-runtime.ts`) — available to all adapters
- [ ] **CTX-02**: Claude adapter prompt template (`claude-local/execute.ts`) includes mission, job description, and goals in system prompt when set
- [ ] **CTX-03**: Null/empty role context fields produce no broken prompts (graceful conditional rendering)

### UI

- [ ] **UI-01**: AgentDetail form has text area inputs for mission, job description, and goals (save via existing agent PUT endpoint)
- [ ] **UI-02**: AI "Suggest" button proposes mission, job description, and goals based on the agent's role name (editable before saving)

## v2 Requirements

### Role Architecture

- **ROLE-V2-01**: Shared roles table — multiple agents can reuse one role definition (avoids copy-paste across ventures)
- **ROLE-V2-02**: Role template library for common midstage startup roles (CMO, Head of Sales, etc.)

### Context Injection

- **CTX-V2-01**: Role context parity for non-Claude adapters (Codex, Gemini prompt templates)
- **CTX-V2-02**: OKR-structured goals (separate fields per objective, with key results)

### Observability

- **OPS-V2-01**: Role context logged in agent execution trace so it's auditable

## Out of Scope

| Feature | Reason |
|---------|--------|
| Separate Fly.io deployment per venture | One shared instance with workspace separation is sufficient |
| Human team member management | AI agents only — human org management is a separate product problem |
| Multi-region Fly.io deployment | Personal-use scale doesn't require it |
| Data migration from embedded PGLite | No meaningful production data in embedded DB to migrate |
| Backstory / personality fields for agents | Not substance — mission + goals + job description is sufficient context |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DEPLOY-01 | Phase 1 | Pending |
| DEPLOY-02 | Phase 1 | Pending |
| DEPLOY-03 | Phase 1 | Pending |
| DEPLOY-04 | Phase 1 | Pending |
| DEPLOY-05 | Phase 1 | Pending |
| ROLE-01 | Phase 2 | Pending |
| ROLE-02 | Phase 2 | Pending |
| ROLE-03 | Phase 2 | Pending |
| CTX-01 | Phase 3 | Pending |
| CTX-02 | Phase 3 | Pending |
| CTX-03 | Phase 3 | Pending |
| UI-01 | Phase 4 | Pending |
| UI-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-12*
*Last updated: 2026-04-12 after initial definition*
