---
type: meta
title: Hot Cache
updated: 2026-04-12
---

# Wiki Hot Cache

## Project Summary

Paperclip is Roland's AI agent orchestration platform (TypeScript monorepo on Fly.io) where AI agents pick up issues and execute work across three ventures: Midstage Institute, Scale-up Allies, and the podcast. The current milestone enriches agents with deep role context (mission, job description, goals) so they act like informed team members rather than task-runners. Phase 1 is in execution: fixing the deployment pipeline and connecting managed Postgres so production is stable before feature work begins.

## Key Decisions (by recency/importance)

- **CI branch trigger**: Change `fly-deploy.yml` to watch `master` (not `main`). Do NOT rename the branch. — `01-CONTEXT.md`
- **Database**: Attach existing `middling-db` managed Postgres cluster. Do NOT provision a new one. DATABASE_URL secret already deployed. — `01-CONTEXT.md`, `01-RESEARCH.md`
- **PGLite removal**: Remove `[[mounts]]` block from `fly.toml`. No data migration — no meaningful production data to preserve. — `01-CONTEXT.md`
- **Health check path**: Use `/api/health` (not `/health`) in `[[http_service.checks]]` — it's mounted under `/api` prefix. — `01-RESEARCH.md`
- **Custom domain**: `agents.midstage.ac` → CNAME → `paperclip-icy-fog-8513.fly.dev`; update `PAPERCLIP_ALLOWED_HOSTNAMES` secret. — `01-CONTEXT.md`
- **Admin bootstrap**: Use `auth-bootstrap-ceo` CLI (not manual DB script). Requires DATABASE_URL. Prints invite URL → visit in browser. — `01-RESEARCH.md`
- **Workspace seeding**: Use the web UI after bootstrap (not seed script). UI handles membership + activity log correctly. — `01-RESEARCH.md`
- **Phase 1.5 inserted**: Weekly Planning Agent (Midstage Institute) inserted between Phase 1 and Phase 2. — `ROADMAP.md`
- **Phase 4 dependency**: UI (Phase 4) depends on Role Schema API (Phase 2), not on Context Injection (Phase 3). — `STATE.md`
- **Shared instance**: One Fly.io app for all three ventures, separated by workspace. No per-venture deployments. — `PROJECT.md`
- **Role context fields**: `mission`, `job_description`, `role_goals` — nullable columns added to `agents` table. Zero breaking changes. — `REQUIREMENTS.md`
- **AI-generated role defaults**: When a role is created, AI proposes mission + job description + goals (editable). — `PROJECT.md`

## Open Questions

- What is the current value of `PAPERCLIP_ALLOWED_HOSTNAMES`? (Redacted in fly secrets list — may already include fly.dev hostname)
- Does `FLY_API_TOKEN` GitHub secret exist? (App previously deployed, likely yes — but unverified)
- Does `renderTemplate` in adapter code support Mustache conditionals for null role field handling? (Phase 3 concern)
- Exact `[[http_service.checks]]` syntax in flyctl v0.4.33 — flagged ASSUMED in research

## Recent Changes

- 2026-04-13: **Phase 01 complete** — Slack notifications verified working (defaultChannelId C099G1364SZ in #agentic-accelerator)
- 2026-04-13: Slack plugin `defaultChannelId` must be set to the channel ID (e.g. C099G1364SZ), not the channel name
- 2026-04-12: Phase 1.5 (Weekly Planning Agent) inserted into roadmap between Phase 1 and Phase 2
- 2026-04-12: Phase 1 execution started — CI/CD, Postgres, health checks, custom domain, Slack plugin all complete
