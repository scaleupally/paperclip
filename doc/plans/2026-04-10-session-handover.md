# Session Handover — 2026-04-10

## Context

Working in Roland's fork of `paperclipai/paperclip`, branded **PriorPilot** and deployed at `priopilot.fly.dev`. The fork exists to make philosophy-aligned changes for running an efficient startup — agents with clear missions, lean data model, tight control plane. Changes are made directly in this repo; push to `master` triggers auto-deploy via GitHub Actions → Fly.io.

## What Was Done This Session

### 1. Mission field on agent creation form (`c74f188d` — deployed)

The `NewAgent.tsx` wizard previously only asked for a title. It now includes a **Mission** textarea between the title and the role/reports-to fields, with help text:

> "What is the big gap you want the agent to fill? Think longer term (2–3 years)"

Maps to the existing `capabilities` column on the `agents` table — no schema or migration needed. Already live on `priopilot.fly.dev`.

### 2. ANTHROPIC_API_KEY set on Fly.io

Key was missing from Fly secrets. Set it this session via `flyctl secrets set`. Machine restarted cleanly at version 12. Claude adapter should now work end-to-end in production.

### 3. Goals model — investigated, no change needed yet

`goals` table is company-scoped only (no `projectId`). Roland confirmed this is fine for now. The gap (project-level OKRs / key results) is acknowledged but not prioritized.

### 4. Fly.io instance count — confirmed single machine

Only one machine (`6e826564b144d8`, region `sjc`, version 12, state `started`). No duplicate instances running.

## Current Production State

| Item | Value |
|---|---|
| App | `priopilot.fly.dev` |
| Machine version | 12 |
| Region | `sjc` |
| Image | `deployment-01KNW4EJCR9BVPGY7YKW3QGR9N` |
| DB | Fly Postgres cluster (external, `DATABASE_URL` in Fly secrets) |
| ANTHROPIC_API_KEY | ✅ Set |

## Open Items / Next Session

- **No immediate blockers.** The next feature conversation is likely: what other agent properties are missing from the creation flow? (e.g. assigned tools, budget cap, reporting relationships)
- Goals model expansion (project-level OKRs) is on the radar but explicitly deferred.
- Doppler is used for local dev secrets. `ANTHROPIC_API_KEY` is **not** in Doppler — it lives only in Fly secrets. If a new dev needs it locally, they'll need to set it manually or it needs to be added to Doppler.

## Key Files to Know

| File | What it does |
|---|---|
| `ui/src/pages/NewAgent.tsx` | Agent creation wizard — mission field added here |
| `packages/db/src/schema/agents.ts` | `capabilities` column = mission field |
| `server/src/routes/agents.ts` | API route for agent CRUD |
| `packages/shared/src/validators/agent.ts` | Zod schema including `capabilities` |
| `.github/workflows/fly-deploy.yml` | Auto-deploy trigger on push to master |
| `fly.toml` | Fly.io app config |
