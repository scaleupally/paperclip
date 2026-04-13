---
type: decision
topic: Project Scope and Boundaries
updated: 2026-04-12
related: [[decisions/role-context]], [[decisions/phase-strategy]]
source_files: [".planning/PROJECT.md", ".planning/REQUIREMENTS.md"]
---

# Project Scope and Boundaries

## Current decision

One shared Fly.io app for all three ventures with workspace separation. Role hierarchy for AI agents only (not human team management). AI-generated role defaults that users can edit. No per-venture deployments, no separate human org management features.

## Explicitly Out of Scope

| Feature | Reason |
|---------|--------|
| Per-venture Fly.io deployments | One shared instance with workspace separation is sufficient; ops complexity not warranted |
| Human team member management | AI agents only — human org management is a separate product problem |
| Multi-region Fly.io deployment | Personal-use scale doesn't require it |
| Data migration from embedded PGLite | No meaningful production data in embedded DB to migrate |
| Backstory/personality fields for agents | Not substance — mission + goals + job description is sufficient context |

## Core Architecture Decision

Workspace isolation (not deployment isolation) for venture separation. The app supports multi-workspace natively with `isInstanceAdmin` for cross-workspace operations. All three ventures — Midstage Institute, Scale-up Allies, podcast — share one Fly.io app (`paperclip-icy-fog-8513`, `sjc` region).

## Tech Constraints

- TypeScript monorepo (pnpm workspaces) — all changes stay within this stack
- Database: managed Postgres on Fly.io for production; PGLite only for local dev
- Single Fly.io instance, no migration to other platforms
- AI context injected at agent pickup time (not stored per-run)

## History

- 2026-04-12: Scope boundaries established at project initialization
- 2026-04-12: PGLite data migration explicitly excluded from REQUIREMENTS.md
