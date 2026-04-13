---
type: decision
topic: Database Infrastructure
updated: 2026-04-12
related: [[decisions/deployment-ci-cd]], [[decisions/health-checks]]
source_files: [".planning/phases/01-production-infrastructure/01-CONTEXT.md", ".planning/phases/01-production-infrastructure/01-RESEARCH.md", ".planning/REQUIREMENTS.md"]
---

# Database Infrastructure

## Current decision

Use the existing `middling-db` managed Postgres cluster on Fly.io. Do NOT provision a new cluster. The `DATABASE_URL` secret is already deployed to the app. Remove the `[[mounts]]` PGLite volume block from `fly.toml` — there is no meaningful production data to migrate.

## Rationale

- `middling-db` (cluster ID `vmkq6097nlno35ln`, plan basic) is already attached to `paperclip-icy-fog-8513`
- DB migrations have already run (confirmed in fly logs)
- `DATABASE_URL` secret is already set — no provisioning or secrets work needed
- PGLite was only for local/embedded storage; no data worth migrating to managed Postgres
- Explicit out-of-scope: "Data migration from embedded PGLite — No meaningful production data in embedded DB to migrate"

## DB Selection Logic

`packages/db/src/runtime-config.ts` lines 220-229: if `DATABASE_URL` env var is set → uses external Postgres. Falls back to embedded-postgres (PGLite) only if `DATABASE_URL` is absent. Since the secret is deployed, production always uses managed Postgres.

## PGLite Volume Removal

Remove the entire `[[mounts]]` block from `fly.toml`:

```toml
# REMOVE THIS:
[[mounts]]
  source = 'paperclip'
  destination = '/paperclip'
```

Note: The physical Fly.io volume still exists after removing the TOML stanza. It can be destroyed separately with `fly volumes destroy <id>` — not strictly required for app function, but the volume may cause a warning on redeploy.

## History

- 2026-04-12: Research confirmed middling-db already attached (DEPLOY-02 satisfied by existing state)
- 2026-04-12: PGLite volume removal locked as a decision alongside managed Postgres confirmation

## Open threads

- [ ] Destroy orphaned `paperclip` Fly.io volume after deploy succeeds (optional cleanup)
