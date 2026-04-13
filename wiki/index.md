# Wiki Index

_Mode C — Decision Graph | Last updated: 2026-04-12 | Sources: 21 files | Decisions: 24_

## Decision Files

| File | Topic | Summary |
|------|-------|---------|
| [deployment-ci-cd.md](decisions/deployment-ci-cd.md) | CI/CD Pipeline | Change fly-deploy.yml to watch `master` (not `main`); do not rename branch |
| [database.md](decisions/database.md) | Database Infrastructure | Use existing `middling-db` cluster; remove PGLite [[mounts]]; no data migration |
| [health-checks.md](decisions/health-checks.md) | Health Check Config | [[http_service.checks]] pointing to `/api/health` (not `/health`) in fly.toml |
| [custom-domain.md](decisions/custom-domain.md) | Custom Domain | agents.midstage.ac → CNAME → fly.dev; update PAPERCLIP_ALLOWED_HOSTNAMES |
| [workspace-setup.md](decisions/workspace-setup.md) | Workspace Bootstrap | auth-bootstrap-ceo CLI → browser → web UI for 3 workspaces; not seed script |
| [role-context.md](decisions/role-context.md) | Role Context System | mission/job_description/role_goals columns; env var injection; AI-generated defaults |
| [project-scope.md](decisions/project-scope.md) | Project Scope | One shared Fly.io instance; AI agents only; 5 out-of-scope items |
| [phase-strategy.md](decisions/phase-strategy.md) | Phase Strategy | Order: 1→1.5→2→3→4; Phase 4 depends on Phase 2 (not 3) |
