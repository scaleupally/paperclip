# Paperclip — Roland's Venture OS

## What This Is

Paperclip is an open-source AI agent orchestration platform that Roland runs as his personal operating system for his three ventures (Midstage Institute, Scale-up Allies, podcast). AI agents — powered by Claude, Codex, Gemini, and others — are assigned roles, pick up issues, and execute work in a structured workspace. Roland's goal is to enhance the platform with the depth of context that midstage startup operators actually need, so AI agents behave less like task-runners and more like informed team members.

## Core Value

AI agents that act with enough role context to make the decisions a midstage startup operator would make — not just execute tasks, but understand the mission behind them.

## Requirements

### Validated

- ✓ Multi-workspace support — existing; ventures separated by workspace
- ✓ AI agent orchestration with heartbeat + issue assignment — existing
- ✓ Multi-adapter AI model support (Claude, Codex, Gemini, Cursor, etc.) — existing
- ✓ Role-based task assignment (naive: role name only) — existing
- ✓ Plugin system with sandboxed worker execution — existing
- ✓ Better Auth authentication, multi-user sessions — existing
- ✓ WebSocket real-time event broadcasting — existing
- ✓ CLI tool for programmatic access — existing
- ✓ Fly.io deployment config present (fly.toml, GitHub Actions) — existing

### Active

- [ ] **Deployment verified**: app deployed to Fly.io (`paperclip-icy-fog-8513`), latest code confirmed, managed Postgres cluster connected (not embedded PGLite)
- [ ] **Branch alignment**: CI/CD deploys from `main`; repo's default is `master` — resolved so pushes reach production
- [ ] **Three ventures onboarded**: Midstage Institute, Scale-up Allies, podcast each configured as a workspace in the shared instance
- [ ] **Role hierarchy**: roles have mission, job description, goals, and tasks (not just a name)
- [ ] **AI-generated role content**: when a role is created, AI proposes mission + job description + goals based on the role name; owner can edit
- [ ] **Agents receive full role context**: when picking up a task, agent gets role name + mission + goals + job description as context, not just role name

### Out of Scope

- Separate Fly.io deployments per venture — decided: one shared instance with workspace separation
- Human team member management via role hierarchy — decided: AI agents only for now
- Multi-region Fly.io deployment — not needed at personal-use scale

## Context

**Deployment situation:** The `fly.toml` mounts a volume named `paperclip` (suggesting embedded PGLite data persistence) and has no `[env]` section pointing to a managed Postgres cluster. The GitHub Actions workflow deploys from `main` but the working branch is `master`. These two issues likely explain why deployment state is uncertain. Priority: diagnose what's actually running on Fly.io before building new features.

**Role model today:** The codebase has a naive role → tasks implementation. AI agents receive only a role name when picking up issues. The domain expertise Roland has from Midstage Institute — mission-driven role design, OKR-style goals, clear job descriptions — is not yet encoded.

**Three ventures:** Midstage Institute, Scale-up Allies, and Roland's podcast. All will share one Paperclip instance, separated by workspace. Each venture needs its own set of roles, agents, and projects.

**Codebase maturity:** The codebase is substantial and production-quality in many areas (64 DB tables, 60+ services, React 19 frontend). Key complexity lives in `heartbeat.ts` (4,654 lines) and `company-portability.ts` (4,415 lines). The codebase was mapped on 2026-04-12; see `.planning/codebase/` for full analysis.

## Constraints

- **Tech stack**: TypeScript monorepo (pnpm workspaces) — all changes stay within this stack
- **Database**: Must run managed Postgres on Fly.io (not embedded PGLite) for production stability; PGLite only for local dev
- **Deployment**: Fly.io (`paperclip-icy-fog-8513`, `sjc` region) — no migration to other platforms
- **Single instance**: One shared Fly.io app for all three ventures — no per-venture deployments
- **AI context**: Role context injected at agent pickup time, not stored per-run — changes to role definition affect future runs, not past

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| One shared Fly.io instance for all ventures | Simpler ops, workspace isolation is sufficient | — Pending |
| AI-generated role defaults (editable) | Reduces friction for setup while preserving human judgment | — Pending |
| Role hierarchy for AI agents only (not human mgmt) | Scope control; human org mgmt is a separate problem | — Pending |
| Resolve branch mismatch before feature work | Can't validate features if production is stale | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-12 after initialization*
