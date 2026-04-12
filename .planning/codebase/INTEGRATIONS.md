# External Integrations

**Analysis Date:** 2026-04-12

## APIs & External Services

**AI Model Adapters (Local):**
- Claude (Anthropic) - Local adapter implementation
  - SDK/Client: `@paperclipai/adapter-claude-local` (workspace package)
  - Location: `packages/adapters/claude-local/`
  - Exports: server, ui, cli, skills modules

- Codex (OpenAI) - Local adapter implementation
  - SDK/Client: `@paperclipai/adapter-codex-local` (workspace package)
  - Location: `packages/adapters/codex-local/`
  - Exports: server, ui, cli, skills modules

- Cursor - Local adapter implementation
  - SDK/Client: `@paperclipai/adapter-cursor-local` (workspace package)
  - Location: `packages/adapters/cursor-local/`

- Gemini (Google) - Local adapter implementation
  - SDK/Client: `@paperclipai/adapter-gemini-local` (workspace package)
  - Location: `packages/adapters/gemini-local/`

- OpenCode - Local adapter implementation
  - SDK/Client: `@paperclipai/adapter-opencode-local` (workspace package)
  - Location: `packages/adapters/opencode-local/`

- Pi (Anthropic) - Local adapter implementation
  - SDK/Client: `@paperclipai/adapter-pi-local` (workspace package)
  - Location: `packages/adapters/pi-local/`

**Gateway Integration:**
- OpenClaw Gateway - WebSocket-based gateway integration
  - SDK/Client: `@paperclipai/adapter-openclaw-gateway` (workspace package)
  - Location: `packages/adapters/openclaw-gateway/`
  - Protocol: WebSocket (ws 8.19.0)
  - Exports: server, ui, cli modules

**AI CLI Tools (Global Install in Production):**
- @anthropic-ai/claude-code - Claude Code CLI (installed globally in Dockerfile)
- @openai/codex - OpenAI Codex CLI (installed globally in Dockerfile)
- opencode-ai - OpenCode AI CLI (installed globally in Dockerfile)

**Hermes Adapter:**
- hermes-paperclip-adapter 0.2.0 - Universal adapter interface
  - Used by: server and UI for unified adapter abstraction
  - Location: `node_modules/` (external package)

## Data Storage

**Databases:**
- PostgreSQL 12+ (via Postgres 3.4.5 client)
  - Connection: `DATABASE_URL` env var or file config
  - ORM: Drizzle ORM 0.38.4
  - Client: postgres npm package
  - Schemas: `packages/db/src/schema.ts`
  - Migrations: `packages/db/src/migrations/`
  - Features: Drizzle Kit for schema generation

- Embedded PostgreSQL (via embedded-postgres 18.1.0-beta.16)
  - Default for development and standalone deployments
  - Data directory: `~/.paperclip/data/postgres` (configurable)
  - Single-file patched version with specific fixes applied
  - Auto-initialized on first run

**File Storage:**
- Local Disk Storage (default)
  - Base directory: `~/.paperclip/data/storage` (configurable)
  - Provider: `StorageProvider` interface in `server/src/storage/local-disk-provider.ts`
  - Configuration: `PAPERCLIP_STORAGE_LOCAL_DIR` env var

- Amazon S3 (optional)
  - Bucket: configurable (default: "paperclip")
  - Region: configurable (default: "us-east-1")
  - Client: AWS SDK S3 Client 3.888.0
  - Credentials: AWS IAM or environment variables
  - Configuration env vars:
    - `PAPERCLIP_STORAGE_S3_BUCKET` - S3 bucket name
    - `PAPERCLIP_STORAGE_S3_REGION` - AWS region
    - `PAPERCLIP_STORAGE_S3_ENDPOINT` - Custom S3 endpoint (optional, for S3-compatible services)
    - `PAPERCLIP_STORAGE_S3_PREFIX` - Object key prefix
    - `PAPERCLIP_STORAGE_S3_FORCE_PATH_STYLE` - Force path-style URLs
  - Implementation: `server/src/storage/s3-provider.ts` (S3Client, DeleteObjectCommand, GetObjectCommand, PutObjectCommand, HeadObjectCommand)

**Caching:**
- No external caching service detected
- In-memory caching via service instances (e.g., `getStorageService()` in `server/src/storage/index.ts`)

## Authentication & Identity

**Auth Provider:**
- Better Auth 1.4.18 - Self-hosted authentication
  - Implementation: `server/src/auth/better-auth.ts`
  - Database: Uses Drizzle adapter for PostgreSQL
  - Tables: authUsers, authSessions, authAccounts, authVerifications
  - Secret: `BETTER_AUTH_SECRET` env var
  - Session storage: PostgreSQL via Drizzle
  - Supports: Email/password, OAuth flows (configurable per deployment)

**Authorization:**
- Custom RBAC implemented in application layer
  - Tables: `instanceUserRoles`, `companyMemberships`
  - Routes: `server/src/routes/authz.ts` for authorization utilities
  - Context: Company-scoped access control, actor typing (user/agent/system)

## Monitoring & Observability

**Error Tracking:**
- None detected in external integrations
- Local feedback export system available

**Telemetry:**
- Telemetry client in `@paperclipai/shared/telemetry`
- Configuration: `server/src/telemetry.ts`
- Opt-in via config file or env vars
- Periodic flush every 60 seconds
- State file tracking: `~/.paperclip/instances/default/telemetry/`

**Logs:**
- Pino 9.6.0 - Structured logging
- Pino HTTP 10.4.0 - HTTP request logging middleware
- Pino Pretty 13.1.3 - Pretty-printed output in development
- Configuration: Dependency-injected via middleware

**Feedback Export:**
- Default backend: `https://telemetry.paperclip.ing` (configurable)
- Client: `FeedbackTraceShareClient` in `server/src/services/feedback-share-client.ts`
- Protocol: HTTP POST with Bearer token authentication (optional)
- Payload: gzip+base64+json encoding
- Configuration env vars:
  - `PAPERCLIP_FEEDBACK_EXPORT_BACKEND_URL` - Backend URL
  - `PAPERCLIP_FEEDBACK_EXPORT_BACKEND_TOKEN` - Optional bearer token
- Implementation: `server/src/services/feedback.ts` handles trace collection and export

## CI/CD & Deployment

**Hosting:**
- Fly.io (primary)
  - Configuration: `fly.toml`
  - App: `paperclip-icy-fog-8513`
  - Region: sjc
  - VM: 1 CPU, 1GB memory
  - Volume: `/paperclip` mount for persistent data
  - HTTPS: Enabled (force_https: true)
  - Auto-scaling: min 0 machines, auto start/stop enabled

**CI Pipeline:**
- GitHub Actions (scripts in `.github/workflows/`)
- Deploy workflow: `fly-deploy.yml`
- Triggers: Push to main, manual dispatch
- Actions: Build Docker image, deploy to Fly.io

**Container Registry:**
- Docker image build in CI
- Dockerfile: Multi-stage build (deps, build, production)
- Base image: Node.js LTS Trixie slim
- Push: Via GitHub Actions to Fly.io

## Environment Configuration

**Required env vars for production:**
- `PAPERCLIP_DEPLOYMENT_MODE` - "authenticated" or "standalone"
- `BETTER_AUTH_SECRET` - Session encryption secret (at least 32 chars recommended)
- `DATABASE_URL` - PostgreSQL connection string (if not using embedded)
- `SERVE_UI` - "true" to serve compiled UI

**Optional env vars:**
- `PORT` - Listen port (default 3100)
- `PAPERCLIP_STORAGE_PROVIDER` - "local_disk" or "s3" (default local_disk)
- `PAPERCLIP_STORAGE_S3_BUCKET` - S3 bucket name
- `PAPERCLIP_STORAGE_S3_REGION` - AWS region
- `PAPERCLIP_STORAGE_S3_ENDPOINT` - Custom S3 endpoint
- `PAPERCLIP_SECRETS_PROVIDER` - Secret provider ("local_encrypted" default)
- `PAPERCLIP_FEEDBACK_EXPORT_BACKEND_URL` - Telemetry backend
- `PAPERCLIP_FEEDBACK_EXPORT_BACKEND_TOKEN` - Telemetry auth token
- `PAPERCLIP_TAILNET_BIND_HOST` - Tailscale network address

**Secrets location:**
- Environment variables (primary)
- Config file: `~/.paperclip/instances/default/config.json`
- Secrets master key file: `~/.paperclip/secrets-master-key` (configurable)
- Encrypted locally if using "local_encrypted" provider

## Webhooks & Callbacks

**Incoming:**
- Real-time events via WebSocket: `server/src/realtime/live-events-ws.ts`
- REST API endpoints for cost events, finance events, feedback
- Routes: `/companies/:companyId/cost-events`, `/feedback/*`, etc.

**Outgoing:**
- Feedback export: POST to `https://telemetry.paperclip.ing/feedback-traces`
- Model Context Protocol: stdio-based bidirectional communication (in MCP server)
- WebSocket connections to OpenClaw Gateway (adapter-specific)

## Plugin System

**Extension API:**
- Plugin SDK: `@paperclipai/plugin-sdk` (workspace package)
- Location: `packages/plugins/sdk/`
- Capabilities: Worker-side context, UI bridge hooks
- Versioning: Stable public API v1.0.0
- Transport: Message passing between plugin worker and main process

**Skills System:**
- Skills distributed with adapters (in `dist/skills/` directories)
- Loaded dynamically by plugin manager: `server/src/services/plugin-loader.ts`
- Scheduled execution via job scheduler: `server/src/services/plugin-job-scheduler.ts`
- Tool dispatch: `server/src/services/plugin-tool-dispatcher.ts`

---

*Integration audit: 2026-04-12*
