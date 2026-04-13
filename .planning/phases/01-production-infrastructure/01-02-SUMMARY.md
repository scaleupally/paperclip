---
phase: 01-production-infrastructure
plan: 02
subsystem: infrastructure/onboarding
tags: [bootstrap, workspaces, custom-domain, tls]
decisions:
  - "Bootstrap invite created on production machine via SSH (CLI requires config file)"
  - "Workspaces: Midstage Accelerator, Middling, Rainbow Startup Mafia (actual venture names)"
  - "agents.midstage.ac cert issued via Let's Encrypt, DNS validated"
  - "PAPERCLIP_ALLOWED_HOSTNAMES set to agents.midstage.ac,paperclip-icy-fog-8513.fly.dev"
  - "PAPERCLIP_DEPLOYMENT_EXPOSURE=public (hostname guard disabled for Fly.io proxy compat)"
metrics:
  tasks_completed: 2
  completed_date: "2026-04-13"
---

# Phase 1 Plan 2: Bootstrap, Workspaces, Custom Domain Summary

**One-liner:** Admin bootstrapped, three workspaces created, agents.midstage.ac serving the app over HTTPS with valid Let's Encrypt cert.

## What Was Built

1. **Admin account bootstrapped** — invite URL generated on production machine (SSH), registration completed in browser. `bootstrapStatus` now `ready`.
2. **Three workspaces created** — Midstage Accelerator, Middling, Rainbow Startup Mafia (user's actual venture names, not the placeholder names in the plan).
3. **Custom domain** — `agents.midstage.ac` CNAME/A/AAAA records configured, Fly.io cert issued by Let's Encrypt, HTTPS working.
4. **Fly.io secrets updated** — `PAPERCLIP_ALLOWED_HOSTNAMES`, `PAPERCLIP_DEPLOYMENT_EXPOSURE=public`, `PAPERCLIP_AUTH_BASE_URL_MODE=explicit`, `PAPERCLIP_PUBLIC_URL`.

## Verification Results

| Smoke Scenario | Result |
|----------------|--------|
| 1: Push to master triggers CI deploy | PASS |
| 2: /api/health → 200 status:ok | PASS |
| 3: Clean startup, no PGLite errors | PASS |
| 4: Three workspaces visible (admin login) | PASS |
| 5: agents.midstage.ac cert Issued | PASS — Let's Encrypt ECDSA, expires ~2 months |

## Deviations from Plan

- **Workspace names differ from plan** — Plan specified "Midstage Institute, Scale-up Allies, Scaling Without Breaking". Actual: user's real venture names. Not a defect.
- **Bootstrap CLI required SSH workaround** — `pnpm paperclipai auth bootstrap-ceo` requires a local config file (not env-var-only). Ran the command on the production machine via `fly ssh console` after writing a temp config to `/tmp/pc.json`.
- **`fly proxy` tunnel didn't work for Managed Postgres** — pgbouncer endpoint is not accessible via fly proxy from local. Production machine SSH was the correct path.
