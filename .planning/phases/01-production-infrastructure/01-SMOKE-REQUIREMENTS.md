---
status: approved
phase: 1
phase_name: Production Infrastructure
created: 2026-04-12
---

# Smoke Requirements — Phase 1: Production Infrastructure

## GSD's Understanding
Phase 1 gets the existing app fully operational in production: CI/CD reliably deploys from `master` to Fly.io, the app runs against managed Postgres (no PGLite), the custom domain `agents.midstage.ac` is live with HTTPS, and three venture workspaces exist in the production app.

## Scenarios

1. page: GitHub Actions tab (repo → Actions)
   Push a commit to `master` → "Fly Deploy" workflow triggers and completes green within ~3 minutes

2. page: https://agents.midstage.ac/health (or equivalent health route)
   GET the health endpoint → 200 OK response; Fly.io health check passes, no rollback triggered

3. page: `fly logs -a paperclip-icy-fog-8513`
   After deploy → clean startup with no DATABASE_URL errors, no PGLite references, no runtime crashes

4. page: https://agents.midstage.ac (production app)
   Log in → navigate to workspaces
   Expected: "Midstage Institute", "Scale-up Allies", and the podcast workspace all appear

5. page: Fly.io app dashboard → Certificates tab
   agents.midstage.ac shows status "Issued" — HTTPS working on custom domain

## Entry Point
https://agents.midstage.ac

## Auth / Setup
- Fly.io account access (paperclip-icy-fog-8513 app)
- DNS access for midstage.ac (to add CNAME pointing to Fly.io)
- FLY_API_TOKEN secret set on GitHub repo

## Verification Notes
_Fill in after delivery: which scenarios passed, which failed, what was found_
