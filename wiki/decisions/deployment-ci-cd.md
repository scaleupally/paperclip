---
type: decision
topic: Deployment CI/CD Pipeline
updated: 2026-04-12
related: [[decisions/database]], [[decisions/health-checks]]
source_files: [".github/workflows/fly-deploy.yml", ".planning/phases/01-production-infrastructure/01-CONTEXT.md", ".planning/phases/01-production-infrastructure/01-01-PLAN.md"]
---

# Deployment CI/CD Pipeline

## Current decision

Update `.github/workflows/fly-deploy.yml` to trigger on `master` branch pushes (not `main`). The git branch itself stays named `master` — no branch rename.

## Rationale

The repo's default branch is `master` but the GitHub Actions workflow watched `main` (line 7: `branches: - main`). This caused pushes to `master` to produce no deploy runs. Fixing the workflow trigger is the least-disruption approach — no git history changes, no GitHub settings changes needed.

## Implementation

```yaml
on:
  push:
    branches:
      - master   # changed from: main
```

## History

- 2026-04-12: Decision locked in 01-CONTEXT.md (DEPLOY-01)
- 2026-04-12: Wave 1 executor editing fly-deploy.yml and pushing to trigger first correct deploy

## Open threads

- [ ] Confirm `FLY_API_TOKEN` GitHub secret exists (app previously deployed, likely yes — unverified)
