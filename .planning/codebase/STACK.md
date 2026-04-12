# Technology Stack

**Analysis Date:** 2026-04-12

## Languages

**Primary:**
- TypeScript 5.7.3 - Used throughout monorepo (server, UI, CLI, adapters, packages)
- JavaScript (ESM) - Module system used across all packages

**Secondary:**
- Bash - Build and deployment scripts (`scripts/`)
- Shell/sh - Docker entrypoint and utility scripts

## Runtime

**Environment:**
- Node.js >=20 (required by root `package.json`)
- Corepack enabled in Docker for pnpm management

**Package Manager:**
- pnpm 9.15.4 - Workspace monorepo manager (configured in root `package.json`)
- Lockfile: `pnpm-lock.yaml` (present)

## Frameworks

**Core Server:**
- Express 5.1.0 - HTTP server framework (`server/package.json`)
- Better Auth 1.4.18 - Authentication and session management (`server/package.json`)

**UI Frontend:**
- React 19.0.0 - Component framework (`ui/package.json`)
- Vite 6.1.0 - Build tool and dev server (`ui/package.json`)
- React Router 7.1.5 - Client-side routing (`ui/package.json`)
- TypeScript 5.7.3 - Type checking for UI (`ui/package.json`)

**CLI Tool:**
- Commander.js 13.1.0 - Command-line interface builder (`cli/package.json`)
- Clack 0.10.0 - Interactive prompts (`cli/package.json`)

**Testing:**
- Vitest 3.0.5 - Unit test runner (root and all workspaces)
- Playwright 1.58.2 - E2E testing framework (root `package.json`)
- Supertest 7.0.0 - HTTP assertion library (server dev deps)

**Build/Dev Tools:**
- esbuild 0.27.3 - JavaScript bundler (root dev deps)
- tsx 4.19.2 - TypeScript executor (CLI and server dev deps)
- tsc (TypeScript 5.7.3) - Compiler for all workspaces
- Tailwind CSS 4.0.7 - Utility-first CSS framework (`ui/package.json`)
- MDXEditor 3.52.4 - Markdown editor component (`ui/package.json`)

## Key Dependencies

**Critical - Database & ORM:**
- Drizzle ORM 0.38.4 - Type-safe database ORM (server, CLI, db packages)
- Drizzle Kit 0.31.9 - Schema generation and migrations (db package)
- Postgres 3.4.5 - PostgreSQL client (db package)
- Embedded Postgres 18.1.0-beta.16 - Embedded PostgreSQL for development/standalone (`server/package.json`, `cli/package.json`)
  - Patched via `patches/embedded-postgres@18.1.0-beta.16.patch`

**Critical - Storage & File Handling:**
- AWS SDK S3 Client 3.888.0 - Amazon S3 integration (`server/package.json`)
- Sharp 0.34.5 - Image processing (`server/package.json`)
- Multer 2.1.1 - File upload handling (`server/package.json`)
- DOMPurify 3.3.2 - HTML sanitization (`server/package.json`)

**API & Protocol:**
- Model Context Protocol SDK 1.29.0 - MCP server implementation (`packages/mcp-server/package.json`)
- ws 8.19.0 - WebSocket implementation (server, openclaw-gateway adapter)
- Hermes Paperclip Adapter 0.2.0 - Local adapter interface (`server/package.json`, `ui/package.json`)

**UI Components & State:**
- Assistant UI React 0.12.23 - AI assistant UI components (`ui/package.json`)
- Radix UI 1.4.3 - Headless UI component library (`ui/package.json`)
- Lexical 0.35.0 - Rich text editor (`ui/package.json`)
- TanStack React Query 5.90.21 - Server state management (`ui/package.json`)
- Mermaid 11.12.0 - Diagram rendering (`ui/package.json`)
- Lucide React 0.574.0 - Icon library (`ui/package.json`)

**Utilities & Validation:**
- Zod 3.24.2 - Runtime schema validation (shared, adapters, db, MCP server, plugin SDK)
- AJV 8.18.0 - JSON Schema validation (`server/package.json`)
- Pino 9.6.0 - Structured logging (`server/package.json`)
- Pino HTTP 10.4.0 - HTTP request logging (`server/package.json`)
- Pino Pretty 13.1.3 - Pretty-printed logs for development (`server/package.json`)
- Dotenv 17.0.1 - Environment variable loading (server, CLI)
- DND Kit - Drag and drop functionality (`ui/package.json`, sorted and core)
- Class Variance Authority 0.7.1 - CSS variant generation (`ui/package.json`)
- Tailwind Merge 3.4.1 - Tailwind class merging utility (`ui/package.json`)

**Infrastructure:**
- Chokidar 4.0.3 - File system monitoring for dev watching (`server/package.json`)
- Detect Port 2.1.0 - Port availability detection (`server/package.json`)
- Open 11.0.0 - Open URLs in browser (`server/package.json`)
- jsdom 28.1.0 - DOM implementation for testing (`server/package.json`)

## Configuration

**Environment:**
- Configuration loaded from multiple sources in priority order:
  1. Environment variables (PAPERCLIP_* prefixed)
  2. Config file at `$PAPERCLIP_HOME/instances/default/config.json`
  3. `.env` files (global and cwd-relative)
- Key env vars:
  - `DATABASE_URL` - PostgreSQL connection string (or uses embedded Postgres)
  - `PORT` - Server listen port (default 3100)
  - `SERVE_UI` - Whether to serve compiled UI assets
  - `BETTER_AUTH_SECRET` - Session encryption secret
  - `PAPERCLIP_STORAGE_PROVIDER` - Storage backend (local_disk or s3)
  - `PAPERCLIP_STORAGE_S3_*` - S3 configuration (bucket, region, endpoint, prefix)
  - `PAPERCLIP_SECRETS_PROVIDER` - Secret storage provider (local_encrypted or other)
  - `PAPERCLIP_DEPLOYMENT_MODE` - standalone or authenticated
  - See `server/src/config.ts` for complete configuration options

**Build:**
- TypeScript configuration: `tsconfig.base.json`, `tsconfig.json` (workspace roots)
- Compiler target: ES2023
- Module resolution: NodeNext (ESM)
- No special build config files (eslint, prettier, etc. not detected)

**Database Migrations:**
- Drizzle migrations stored in `packages/db/src/migrations/`
- Migration validation in place (`check:migrations` npm script)
- Auto-apply migrations in dev mode with `PAPERCLIP_MIGRATION_AUTO_APPLY=true`

## Platform Requirements

**Development:**
- Node.js >=20
- pnpm 9.15.4
- Disk space for embedded PostgreSQL data directory (default: `~/.paperclip/data/postgres`)
- Git (for gh CLI in Docker)

**Production:**
- Node.js >=20
- PostgreSQL database (external or embedded)
- Optional: AWS credentials for S3 storage (IAM or environment variables)
- Optional: Tailscale for network binding (detected via `tailscale ip` CLI)

**Deployment Target:**
- Fly.io (configured in `fly.toml`, region: sjc, 1GB memory, 1 CPU)
- Docker (Dockerfile includes multi-stage build, Node.js LTS Trixie, pnpm)
- Standalone HTTP server on configurable port (default 3100)

---

*Stack analysis: 2026-04-12*
