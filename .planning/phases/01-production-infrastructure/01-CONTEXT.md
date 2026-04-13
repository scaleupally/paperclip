# Phase 1 Context: Production Infrastructure

**Phase:** 1 — Production Infrastructure
**Goal:** Production deployment works end-to-end — pushes to master reach Fly.io, the app boots with managed Postgres, and ventures are configured
**Created:** 2026-04-12

## Canonical Refs

- `.github/workflows/fly-deploy.yml` — CI/CD pipeline to fix
- `fly.toml` — Fly.io app config (branch, volume, health check, env)
- `.planning/REQUIREMENTS.md` — DEPLOY-01 through DEPLOY-05

No external ADRs or specs referenced for this phase.

## Decisions

### Branch Fix (DEPLOY-01)
**Decision:** Update `fly-deploy.yml` to watch `master` instead of `main`.
- Change `branches: - main` to `branches: - master` in the `on.push` trigger
- Do NOT rename the git branch — leave `master` as-is
- Rationale: Least-disruption fix; no git history or GitHub settings changes needed

### Postgres Provisioning (DEPLOY-02)
**Decision:** A managed Postgres cluster already exists on Fly.io. Do not create a new one.
- Attach the existing cluster to `paperclip-icy-fog-8513` and set the `DATABASE_URL` secret
- Verify the app is configured to use `DATABASE_URL` (not hardcoded PGLite path) at runtime

### PGLite Volume Removal
**Decision:** Remove the `[[mounts]]` section from `fly.toml`.
- The volume exists only for PGLite data persistence — no meaningful production data to keep
- Out of Scope (from REQUIREMENTS.md): "Data migration from embedded PGLite — No meaningful production data in embedded DB to migrate"

### Health Check (DEPLOY-03)
**Decision:** Claude's Discretion — planner determines whether a `/health` route already exists in the app or needs to be added, then adds a `[checks]` section to `fly.toml`.

### Workspace Seeding (DEPLOY-05)
**Decision:** Claude's Discretion — planner determines the right seeding mechanism (seed script, CLI, or UI steps) based on how the app manages workspace creation.
- Three workspaces required: **Midstage Institute**, **Scale-up Allies**, **podcast**

## What NOT to Do

- Do not run database migrations from embedded PGLite to managed Postgres (out of scope)
- Do not add role schema changes in this phase (Phase 2)
- Do not configure per-venture Fly.io deployments (explicitly out of scope)

## Deferred Ideas

None captured during discussion.
