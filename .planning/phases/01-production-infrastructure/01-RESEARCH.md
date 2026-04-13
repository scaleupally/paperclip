# Phase 1: Production Infrastructure - Research

**Researched:** 2026-04-12
**Domain:** Fly.io deployment, GitHub Actions CI/CD, Postgres attachment, custom domains, workspace seeding
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Branch Fix (DEPLOY-01)**
- Update `fly-deploy.yml` to watch `master` instead of `main`
- Change `branches: - main` to `branches: - master` in the `on.push` trigger
- Do NOT rename the git branch — leave `master` as-is

**Postgres Provisioning (DEPLOY-02)**
- A managed Postgres cluster already exists on Fly.io. Do not create a new one.
- Attach the existing cluster to `paperclip-icy-fog-8513` and set the `DATABASE_URL` secret
- Verify the app is configured to use `DATABASE_URL` (not hardcoded PGLite path) at runtime

**PGLite Volume Removal**
- Remove the `[[mounts]]` section from `fly.toml`
- The volume exists only for PGLite data persistence — no meaningful production data to keep

**Custom Domain**
- Configure `agents.midstage.ac` as a custom domain on the Fly.io app
- Roland controls DNS for midstage.ac
- Add CNAME record pointing to Fly.io, configure certificate via `fly certs add agents.midstage.ac`
- Both `agents.midstage.ac` and `paperclip-icy-fog-8513.fly.dev` should work

### Claude's Discretion

**Health Check (DEPLOY-03)**
- Claude's Discretion — planner determines whether a `/health` route already exists or needs adding, then adds a `[checks]` section to `fly.toml`

**Workspace Seeding (DEPLOY-05)**
- Claude's Discretion — planner determines the right seeding mechanism (seed script, CLI, or UI steps) based on how the app manages workspace creation
- Three workspaces required: Midstage Institute, Scale-up Allies, podcast

### Deferred Ideas (OUT OF SCOPE)

- **Weekly planning agent (Midstage Institute)** → Phase 1.5 (INSERTED)
  - 4-step workflow: reads quarterly plan → chats with team members for status → pulls together Tuesday meeting report → suggests agenda order for 45-minute meeting
  - Full first run must complete successfully before Phase 1.5 is done
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DEPLOY-01 | GitHub Actions workflow deploys from `master` (not `main`) | fly-deploy.yml line 7 confirms `branches: - main` must change to `master` |
| DEPLOY-02 | Fly.io managed Postgres cluster created and `DATABASE_URL` secret set on the app | DATABASE_URL secret already deployed; `middling-db` cluster already attached |
| DEPLOY-03 | Health check configured in `fly.toml` so Fly.io can detect and roll back bad deploys | `/api/health` route exists and checks DB; `[checks]` section needed in fly.toml |
| DEPLOY-04 | Production app verified working (boots, DB connected, auth functional, no runtime errors) | App currently boots (logs confirmed), DB connected, bootstrap_pending (no admin yet) |
| DEPLOY-05 | Three ventures configured as workspaces on the shared instance | API POST /api/companies exists; requires bootstrap admin account first |
</phase_requirements>

---

## Summary

The production infrastructure is further along than the phase starting state suggests. The Fly.io app `paperclip-icy-fog-8513` is already deployed, the managed Postgres cluster `middling-db` is already attached, migrations have already run, and `DATABASE_URL` is already set as a secret. The app boots and responds at `https://paperclip-icy-fog-8513.fly.dev/api/health` with `{"status":"ok","bootstrapStatus":"bootstrap_pending"}`.

The remaining gaps are: (1) the CI workflow still watches `main` so pushes to `master` don't trigger deploys; (2) `fly.toml` still has the `[[mounts]]` section pointing to the PGLite volume, which should be removed; (3) no `[checks]` block in `fly.toml` for health-check-based rollback detection; (4) no admin account exists yet (`bootstrapStatus: bootstrap_pending`), blocking workspace creation via the UI or API; and (5) the three workspaces have not been seeded. The custom domain `agents.midstage.ac` has no cert yet.

**Primary recommendation:** Work in this sequence — fix CI branch, remove [[mounts]], add [checks], deploy, bootstrap admin account via the CLI `auth-bootstrap-ceo` command, create three workspaces via the UI or API, then configure the custom domain and update `PAPERCLIP_ALLOWED_HOSTNAMES`.

---

## Standard Stack

### Core — already in place

| Component | Version/Detail | Purpose | Source |
|-----------|---------------|---------|--------|
| Fly.io app | `paperclip-icy-fog-8513`, region `sjc` | Hosting | [VERIFIED: fly apps list] |
| Fly.io Managed Postgres | `middling-db`, cluster ID `vmkq6097nlno35ln`, plan basic | Database | [VERIFIED: fly mpg list] |
| GitHub Actions | `superfly/flyctl-actions/setup-flyctl@master` | CI/CD pipeline | [VERIFIED: .github/workflows/fly-deploy.yml] |
| flyctl | v0.4.33 darwin/arm64 | Local Fly CLI | [VERIFIED: fly version] |

### App internals

| Component | Detail | Source |
|-----------|--------|--------|
| Health route | `GET /api/health` — checks `SELECT 1` against DB, returns `bootstrapStatus` | [VERIFIED: server/src/routes/health.ts + app.ts line 145] |
| DB selection | `DATABASE_URL` env var → external postgres; falls back to embedded-postgres | [VERIFIED: packages/db/src/runtime-config.ts lines 220-229] |
| Seed script | `packages/db/src/seed.ts` — creates companies via direct DB insert using `DATABASE_URL` | [VERIFIED: file read] |
| Bootstrap | `cli/src/commands/auth-bootstrap-ceo.ts` — creates instance-admin invite via DB, works with `DATABASE_URL` env | [VERIFIED: file read] |
| Workspace API | `POST /api/companies` (line 267 companies route) — requires `isInstanceAdmin` | [VERIFIED: server/src/routes/companies.ts] |
| Allowed hostnames | `PAPERCLIP_ALLOWED_HOSTNAMES` env var — comma-separated list — controls which hostnames the app accepts | [VERIFIED: server/src/config.ts line 215] |

### Current secrets on `paperclip-icy-fog-8513`

| Secret | Status |
|--------|--------|
| `DATABASE_URL` | Deployed |
| `BETTER_AUTH_SECRET` | Deployed |
| `PAPERCLIP_ALLOWED_HOSTNAMES` | Deployed |
| `SENTRY_DSN` | Deployed |

[VERIFIED: fly secrets list --app paperclip-icy-fog-8513]

---

## Architecture Patterns

### Health Check in fly.toml

Fly.io uses a `[checks]` block (or `[[http_service.checks]]`) inside `fly.toml` to probe the app and roll back bad deploys.

**Correct path for this app:** `/api/health` (mounted at `/api/health` in `app.ts` line 145, under the API router). The health endpoint performs `SELECT 1` against the DB and returns `{"status":"ok"}` on success, `{"status":"unhealthy","error":"database_unreachable"}` with HTTP 503 on DB failure.

```toml
# [ASSUMED] exact fly.toml check syntax — verify against official Fly.io docs
[http_service]
  internal_port = 3100
  force_https = true
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 0
  processes = ['app']

  [[http_service.checks]]
    grace_period = "10s"
    interval = "30s"
    method = "GET"
    path = "/api/health"
    timeout = "5s"
```

**Note:** The `[[mounts]]` block must be removed first; keeping it with `auto_stop_machines` and a zero-machine-minimum causes volume conflicts when machines restart.

### Bootstrap Sequence (authenticated deployment mode)

The app runs in `PAPERCLIP_DEPLOYMENT_MODE=authenticated`. In this mode:

1. No admin exists → `bootstrapStatus: bootstrap_pending` in `/api/health`
2. Admin invite must be created using the CLI command `auth-bootstrap-ceo`
3. The invite URL is visited in-browser to register the first admin account
4. With an admin session, workspaces can be created via `POST /api/companies` or the UI

The CLI command connects directly to the DB using `DATABASE_URL` — it does NOT require the server to be running:

```bash
# Run locally while DATABASE_URL points to Fly.io Postgres
DATABASE_URL="<connection-string>" pnpm paperclipai auth-bootstrap-ceo
```

Alternatively, run it against production via `fly ssh console`:
```bash
fly ssh console --app paperclip-icy-fog-8513
# Then inside the machine:
DATABASE_URL="$DATABASE_URL" node --import ./server/node_modules/tsx/dist/loader.mjs \
  server/dist/index.js
```

Actually the simplest path is to use `fly console` with `tsx`:
```bash
# [ASSUMED] exact fly ssh console invocation
fly ssh console --app paperclip-icy-fog-8513 -C \
  "DATABASE_URL=\$DATABASE_URL node /app/server/node_modules/.bin/tsx /app/packages/db/src/... "
```

**Recommended approach:** Run bootstrap locally by temporarily setting `DATABASE_URL` to the production connection string (retrieved via `fly postgres connect` or from the secret). The `auth-bootstrap-ceo` command uses whichever `DATABASE_URL` is in the environment — no server config file needed.

### Workspace Seeding (DEPLOY-05)

**Three mechanisms exist — recommendation is the web UI:**

1. **Web UI (recommended):** After bootstrapping an admin account, use the Paperclip web UI at `https://paperclip-icy-fog-8513.fly.dev` to create companies (workspaces). The "New Company" flow calls `POST /api/companies` and creates membership in one step.

2. **API (scriptable):** `POST /api/companies` with `{"name":"Midstage Institute","status":"active"}` using an authenticated session cookie or bearer token. Requires an instance admin account.

3. **Seed script (`packages/db/src/seed.ts`):** Writes directly to DB via `DATABASE_URL`. Currently creates a demo "Paperclip Demo Co" — could be modified to create the three target workspaces, but this bypasses auth/activity-log and is better suited for test/local environments.

**Decision:** Use the web UI after bootstrapping the admin account. This is the intended production path and populates activity logs and memberships correctly.

### Custom Domain (DEPLOY-04 / DEPLOY-05 dependency)

```bash
# Step 1: Add the cert (Fly.io generates it via Let's Encrypt)
fly certs add agents.midstage.ac --app paperclip-icy-fog-8513

# Step 2: Get the validation target
fly certs show agents.midstage.ac --app paperclip-icy-fog-8513

# Step 3: Add DNS record (Roland controls midstage.ac)
# CNAME agents.midstage.ac -> paperclip-icy-fog-8513.fly.dev
```

**After DNS propagates:** Update the `PAPERCLIP_ALLOWED_HOSTNAMES` secret to include the custom domain:
```bash
fly secrets set PAPERCLIP_ALLOWED_HOSTNAMES="agents.midstage.ac" --app paperclip-icy-fog-8513
```

The current value of `PAPERCLIP_ALLOWED_HOSTNAMES` is deployed but the actual value is redacted in `fly secrets list`. The planner should verify/update it to include the new hostname.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Admin bootstrap | Custom DB script or migration | CLI `auth-bootstrap-ceo` command | Already implemented, handles invite token hashing, expiry, and revocation |
| Health check | Custom `/health` route | Existing `/api/health` — already does DB probe | Route exists, tested, checks DB with SELECT 1 |
| Workspace creation | Custom migration or seed script | Web UI `POST /api/companies` via browser | UI handles membership, activity log, budget policy — seed.ts bypasses all three |
| Managed Postgres | New cluster provisioning | `middling-db` — already attached | Cluster exists, DATABASE_URL secret already deployed, migrations already applied |

---

## Runtime State Inventory

This is a deployment/configuration phase, not a rename/refactor. No string replacement or data migration is involved.

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Stored data | DB migrations already applied (confirmed in logs) | None — schema is current |
| Live service config | `[[mounts]]` section in fly.toml references volume `paperclip` — still present on deployed config | Remove from fly.toml, redeploy |
| OS-registered state | None — Fly.io manages machine lifecycle | None |
| Secrets/env vars | `DATABASE_URL`, `BETTER_AUTH_SECRET`, `PAPERCLIP_ALLOWED_HOSTNAMES`, `SENTRY_DSN` — all deployed | `PAPERCLIP_ALLOWED_HOSTNAMES` may need updating when custom domain added |
| Build artifacts | None — Docker image built remotely by Fly (`--remote-only`) | None |

---

## Common Pitfalls

### Pitfall 1: Volume conflict after removing [[mounts]]

**What goes wrong:** If the `paperclip` volume still exists on Fly.io after `[[mounts]]` is removed from `fly.toml`, Fly may warn or fail on redeploy.
**Why it happens:** Fly.io tracks volumes separately from `fly.toml`. Removing the config stanza doesn't automatically delete the volume.
**How to avoid:** After removing `[[mounts]]`, confirm the deploy succeeds. The old volume can be destroyed separately with `fly volumes destroy <id>` if desired — not strictly required for app function.
**Warning signs:** Deploy error mentioning volume or mount point conflicts.

### Pitfall 2: Health check path mismatch

**What goes wrong:** If `[checks]` in `fly.toml` points to `/health` instead of `/api/health`, health checks will return 404 and Fly.io will mark the machine unhealthy and roll back every deploy.
**Why it happens:** The health route is mounted under the `/api` prefix in `app.ts` line 145 — `api.use("/health", healthRoutes(...))` — and the API router is mounted at `/api` (confirmed in app logs: `health: http://localhost:3100/api/health`).
**How to avoid:** Use `path = "/api/health"` in the `[[http_service.checks]]` block.
**Warning signs:** Deploy shows machines failing health checks immediately after start.

### Pitfall 3: Bootstrap invite not working in authenticated mode

**What goes wrong:** Visiting the Paperclip UI at the deployed URL shows a "bootstrap pending" state, and there's no way to register without a bootstrap invite.
**Why it happens:** `PAPERCLIP_DEPLOYMENT_MODE=authenticated` requires an admin account before any workspaces can be created. This is intentional.
**How to avoid:** Run `auth-bootstrap-ceo` before expecting to log in or create workspaces. The CLI command must have access to `DATABASE_URL` — retrieve the connection string from Fly before running.
**Warning signs:** `/api/health` returns `"bootstrapStatus":"bootstrap_pending"` and `"bootstrapInviteActive":false`.

### Pitfall 4: PAPERCLIP_ALLOWED_HOSTNAMES not updated for custom domain

**What goes wrong:** The custom domain cert is issued and DNS resolves, but the app returns 400/403 or redirects in a loop.
**Why it happens:** `config.ts` line 215 reads `PAPERCLIP_ALLOWED_HOSTNAMES` and uses it to whitelist hostnames for auth/CORS. If `agents.midstage.ac` is not in the list, requests from that hostname are rejected.
**How to avoid:** After cert is issued, run `fly secrets set PAPERCLIP_ALLOWED_HOSTNAMES="agents.midstage.ac"` and redeploy or restart.
**Warning signs:** Browser shows CORS error or redirect loop when accessing via the custom domain.

### Pitfall 5: CI branch mismatch (DEPLOY-01)

**What goes wrong:** Pushes to `master` never trigger a deploy. The current `fly-deploy.yml` only watches `main`.
**Why it happens:** `branches: - main` at line 7 of the workflow. The repo uses `master` as its default branch.
**How to avoid:** Change to `branches: - master` in the workflow.
**Warning signs:** Pushes to `master` produce no GitHub Actions run in the Actions tab.

---

## Code Examples

### fly.toml after changes

```toml
# Source: verified against current fly.toml + Fly.io docs pattern [ASSUMED: exact [checks] syntax]
app = 'paperclip-icy-fog-8513'
primary_region = 'sjc'

[build]

[http_service]
  internal_port = 3100
  force_https = true
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 0
  processes = ['app']

  [[http_service.checks]]
    grace_period = "10s"
    interval = "30s"
    method = "GET"
    path = "/api/health"
    timeout = "5s"

[[vm]]
  memory = '1gb'
  cpus = 1
  memory_mb = 1024
```

### fly-deploy.yml after fix

```yaml
# Source: verified against .github/workflows/fly-deploy.yml [VERIFIED]
name: Fly Deploy
on:
  push:
    branches:
      - master
jobs:
  deploy:
    name: Deploy app
    runs-on: ubuntu-latest
    concurrency: deploy-group
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

### Bootstrap admin account

```bash
# Retrieve DATABASE_URL from Fly secrets before running
# Option A: fly proxy to run locally
fly proxy 5433:5432/vmkq6097nlno35ln.internal --app paperclip-icy-fog-8513 &
DATABASE_URL="postgres://fly-user:<password>@localhost:5433/paperclip" \
  pnpm paperclipai auth-bootstrap-ceo

# Option B: fly ssh console to run on the machine
fly ssh console --app paperclip-icy-fog-8513 -C \
  "node --import /app/server/node_modules/tsx/dist/loader.mjs \
   /app/cli/src/index.ts auth-bootstrap-ceo \
   --base-url https://paperclip-icy-fog-8513.fly.dev"
```

### Create workspace via API (after admin bootstrap)

```bash
# Source: server/src/routes/companies.ts line 267 [VERIFIED]
curl -X POST https://paperclip-icy-fog-8513.fly.dev/api/companies \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{"name":"Midstage Institute","status":"active"}'
```

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `[[http_service.checks]]` is the correct fly.toml syntax for health checks (not `[checks]` top-level) | Code Examples, Pitfalls | Wrong syntax causes deploy failure; easy to verify with `fly docs` |
| A2 | Bootstrap can be run locally by pointing `DATABASE_URL` at the remote cluster | Bootstrap pattern | If DB is network-restricted, must use `fly ssh console` instead |
| A3 | The existing `PAPERCLIP_ALLOWED_HOSTNAMES` secret does not already include `agents.midstage.ac` | Custom domain | If it already includes it, the secrets update step is a no-op (harmless) |

---

## Open Questions

1. **Exact [[http_service.checks]] syntax in current flyctl version**
   - What we know: Fly.io supports health checks; app logs confirm `/api/health` path
   - What's unclear: Whether it's `[[http_service.checks]]` or `[checks]` in flyctl v0.4.33
   - Recommendation: Run `fly docs` or check https://fly.io/docs/reference/configuration/ before writing the fly.toml change

2. **Current PAPERCLIP_ALLOWED_HOSTNAMES value**
   - What we know: The secret exists and is deployed; value is redacted in `fly secrets list`
   - What's unclear: Whether it already contains the production hostname or needs updating
   - Recommendation: When adding custom domain, set the secret explicitly to include both `paperclip-icy-fog-8513.fly.dev` and `agents.midstage.ac`

3. **Bootstrap CLI invocation on Fly.io machine**
   - What we know: `auth-bootstrap-ceo` reads `DATABASE_URL` from env and writes directly to DB
   - What's unclear: Whether `pnpm paperclipai` works inside the container (no pnpm installed in production image) vs using `node ... cli/src/index.ts`
   - Recommendation: Use the `fly ssh console` approach with direct `node --import tsx` invocation, or run locally using `fly proxy` to tunnel the DB port

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| flyctl CLI | All Fly operations | ✓ | v0.4.33 | — |
| Fly.io app `paperclip-icy-fog-8513` | Deployment target | ✓ | Deployed, running | — |
| Managed Postgres `middling-db` | DEPLOY-02 | ✓ | Attached, DATABASE_URL secret deployed | — |
| `FLY_API_TOKEN` GitHub secret | DEPLOY-01 CI | Unknown — not visible from local | — | Must be set; deploy will fail silently without it |
| DNS control for midstage.ac | Custom domain | ✓ (Roland owns it) | — | — |

**Missing dependencies with no fallback:**
- `FLY_API_TOKEN` GitHub Actions secret — must be set for the CI workflow to authenticate flyctl. [ASSUMED] it exists since the app was previously deployed; verify in GitHub repo settings.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest (root `vitest.config.ts`) |
| Config file | `vitest.config.ts` at repo root; `server/vitest.config.ts` for server tests |
| Quick run command | `pnpm test:run -- --project server` |
| Full suite command | `pnpm test:run` |

### Phase Requirements → Test Map

This phase is primarily infrastructure/configuration changes (YAML, TOML, Fly secrets, DNS). None of the changes have automated unit test coverage — they are infrastructure ops tasks verified by observable runtime behavior.

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DEPLOY-01 | GitHub Actions runs on `master` push | manual-only | — | N/A — CI config change |
| DEPLOY-02 | `DATABASE_URL` resolves to managed Postgres | smoke | `curl https://paperclip-icy-fog-8513.fly.dev/api/health` | N/A — runtime check |
| DEPLOY-03 | `/api/health` returns 200 with `status:ok` | smoke | `curl https://paperclip-icy-fog-8513.fly.dev/api/health` | Existing: `server/src/__tests__/health.test.ts` |
| DEPLOY-04 | App boots, auth works, no runtime errors | smoke | `curl https://paperclip-icy-fog-8513.fly.dev/api/health` | Existing: `server/src/__tests__/health.test.ts` |
| DEPLOY-05 | Three workspaces visible in app UI | manual-only | — | N/A — data seeding |

### Sampling Rate

- **Per task commit:** `pnpm test:run -- --project server` (fast, server unit tests only)
- **Per wave merge:** `pnpm test:run` (full suite)
- **Phase gate:** Manual smoke check against production URL before `/gsd-verify-work`

### Wave 0 Gaps

None — this phase does not require new test files. Existing `health.test.ts` covers the health endpoint behavior. Infrastructure changes (YAML/TOML edits, Fly secrets, DNS) are not unit-testable.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Better Auth (already configured, `BETTER_AUTH_SECRET` set) |
| V3 Session Management | yes | Better Auth session cookies |
| V4 Access Control | yes | `assertInstanceAdmin` guard on `POST /api/companies` |
| V5 Input Validation | yes | `createCompanySchema` (zod) on company creation endpoint |
| V6 Cryptography | yes | Fly.io TLS (force_https=true), Let's Encrypt for custom domain |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthenticated workspace creation | Elevation of Privilege | `assertInstanceAdmin(req)` guard; bootstrap flow required |
| HTTP downgrade on custom domain | Spoofing | `force_https = true` in `[http_service]` covers both domains |
| Bootstrap invite token exposure | Information Disclosure | Token hashed with SHA-256 before DB storage (auth-bootstrap-ceo.ts line 11); invite URL transmitted only via CLI stdout |
| Stale PGLite volume data | Information Disclosure | Volume removal eliminates risk; no meaningful data present |

---

## Sources

### Primary (HIGH confidence — verified in this session)

- `fly apps list` output — app name, status confirmed
- `fly mpg list` output — `middling-db` cluster confirmed, attached apps listed
- `fly secrets list --app paperclip-icy-fog-8513` — secrets inventory
- `fly status --app paperclip-icy-fog-8513` — machine state, deploy version
- `fly logs --app paperclip-icy-fog-8513` — confirmed DB URL, migration status, deployment mode
- `curl https://paperclip-icy-fog-8513.fly.dev/api/health` — live health check response
- `server/src/routes/health.ts` — health route implementation
- `server/src/app.ts` line 145 — health route mount path
- `packages/db/src/runtime-config.ts` lines 220-229 — DATABASE_URL resolution logic
- `packages/db/src/seed.ts` — direct DB seed mechanism
- `cli/src/commands/auth-bootstrap-ceo.ts` — bootstrap admin invite flow
- `server/src/routes/companies.ts` line 267 — `POST /api/companies` endpoint and auth guard
- `server/src/config.ts` line 215 — `PAPERCLIP_ALLOWED_HOSTNAMES` parsing
- `.github/workflows/fly-deploy.yml` — confirms `branches: - main` (the bug)
- `fly.toml` — confirms `[[mounts]]` present, no `[checks]` present

### Secondary (MEDIUM confidence)

- Fly.io health check configuration pattern (standard `[[http_service.checks]]` block) — [ASSUMED based on Fly.io documentation pattern; exact syntax should be verified]

---

## Metadata

**Confidence breakdown:**
- Current infrastructure state: HIGH — verified via live Fly CLI and HTTP responses
- Standard stack: HIGH — all libraries verified in source
- Bootstrap/seeding flow: HIGH — source code fully read and traced
- fly.toml `[checks]` syntax: MEDIUM — standard pattern but exact syntax flagged as ASSUMED
- Custom domain flow: HIGH — standard Fly.io cert + DNS workflow

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (stable infrastructure; Fly.io CLI changes slowly)
