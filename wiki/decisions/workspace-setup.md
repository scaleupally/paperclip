---
type: decision
topic: Workspace Setup and Bootstrap
updated: 2026-04-12
related: [[decisions/custom-domain]], [[decisions/database]]
source_files: [".planning/phases/01-production-infrastructure/01-CONTEXT.md", ".planning/phases/01-production-infrastructure/01-RESEARCH.md", ".planning/phases/01-production-infrastructure/01-02-PLAN.md"]
---

# Workspace Setup and Bootstrap

## Current decision

Bootstrap admin account using the `auth-bootstrap-ceo` CLI command (not a custom DB script). Create three workspaces via the web UI after bootstrap (not via seed script). Three required workspaces: **Midstage Institute**, **Scale-up Allies**, **Scaling Without Breaking** (podcast).

## Rationale

- `auth-bootstrap-ceo` (`cli/src/commands/auth-bootstrap-ceo.ts`) is purpose-built for this: handles invite token hashing (SHA-256), expiry, and revocation. No custom work needed.
- The seed script (`packages/db/src/seed.ts`) bypasses auth, membership logic, and activity logs — not appropriate for production workspace creation.
- Web UI (`POST /api/companies`) handles all these correctly in one flow.
- `POST /api/companies` requires `isInstanceAdmin` auth — bootstrapping admin first is a prerequisite.

## Bootstrap Sequence

1. Retrieve production DATABASE_URL:
   ```bash
   fly ssh console --app paperclip-icy-fog-8513 -C "printenv DATABASE_URL"
   ```
2. Run bootstrap locally:
   ```bash
   DATABASE_URL="<retrieved-url>" pnpm paperclipai auth-bootstrap-ceo
   ```
   Or via tsx if `pnpm paperclipai` unavailable:
   ```bash
   DATABASE_URL="<retrieved-url>" npx tsx cli/src/index.ts auth-bootstrap-ceo
   ```
3. Visit the invite URL printed to stdout in a browser
4. Complete registration to create the admin account
5. Create three workspaces via the Paperclip web UI

## Current Production State (as of 2026-04-12)

- App status: `bootstrapStatus: bootstrap_pending` — no admin exists yet
- `POST /api/companies` guarded by `assertInstanceAdmin(req)` — requires bootstrap first
- `/api/health` returns 200 with `status:ok` — app is healthy, DB connected

## History

- 2026-04-12: Bootstrap sequence and workspace creation method determined via source code review
- 2026-04-12: Plan 02 defines this as Wave 2 with human checkpoint for browser registration

## Open threads

- [ ] Bootstrap command invocation inside Fly.io container uncertain — `pnpm` not available in production image, may need `node --import tsx` invocation
- [ ] Three workspace names confirmed: Midstage Institute, Scale-up Allies, Scaling Without Breaking
