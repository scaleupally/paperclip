---
type: decision
topic: Health Check Configuration
updated: 2026-04-12
related: [[decisions/deployment-ci-cd]], [[decisions/database]]
source_files: [".planning/phases/01-production-infrastructure/01-RESEARCH.md", ".planning/phases/01-production-infrastructure/01-01-PLAN.md"]
---

# Health Check Configuration

## Current decision

Add `[[http_service.checks]]` block to `fly.toml` pointing to `/api/health`. This enables Fly.io to detect bad deploys and trigger automatic rollback.

## Rationale

The health route exists at `server/src/routes/health.ts` and is mounted under the `/api` prefix (confirmed `app.ts` line 145: `api.use("/health", healthRoutes(...))`). The full path is therefore `/api/health` — NOT `/health`. Using the wrong path would cause 404s and Fly.io would mark every deploy as unhealthy.

The endpoint performs `SELECT 1` against the DB and returns:
- `{"status":"ok","bootstrapStatus":"..."}` with HTTP 200 on success
- `{"status":"unhealthy","error":"database_unreachable"}` with HTTP 503 on DB failure

## Implementation

```toml
[[http_service.checks]]
  grace_period = "10s"
  interval = "30s"
  method = "GET"
  path = "/api/health"
  timeout = "5s"
```

## Assumptions

- `[[http_service.checks]]` is the correct syntax (not top-level `[checks]`) for flyctl v0.4.33 — MEDIUM confidence, flagged as ASSUMED in research

## History

- 2026-04-12: Health route confirmed at /api/health via source code review
- 2026-04-12: [[http_service.checks]] syntax selected as Claude's Discretion per CONTEXT.md

## Open threads

- [ ] Verify exact [[http_service.checks]] syntax against Fly.io docs for flyctl v0.4.33 before committing fly.toml
