# Architecture

**Analysis Date:** 2026-04-12

## Pattern Overview

**Overall:** Distributed Node.js application with a three-tier architecture: Express.js REST API backend, PostgreSQL database layer (via Drizzle ORM), and React frontend.

**Key Characteristics:**
- Service-oriented backend with domain-specific services encapsulating business logic
- Multi-adapter pattern supporting various AI model integrations (Claude, Codex, Cursor, Gemini, etc.)
- Plugin system for extensibility with sandbox isolation
- WebSocket real-time event broadcasting
- Monorepo structure with workspace packages for shared code

## Layers

**Frontend (React/Vite):**
- Purpose: Web UI for board management and agent orchestration
- Location: `ui/src`
- Contains: Page components, hooks, context providers, API clients, UI components
- Depends on: TanStack React Query, React Router, shared types
- Used by: Browser clients accessing `/api` endpoints

**API Routes (Express):**
- Purpose: RESTful HTTP endpoints for resource management and actions
- Location: `server/src/routes`
- Contains: Endpoint handlers for agents, issues, projects, routines, plugins, adapters
- Depends on: Services, middleware, database
- Used by: Frontend, CLI, agents via bearer tokens

**Services (Business Logic):**
- Purpose: Domain-specific business operations and state management
- Location: `server/src/services`
- Contains: Agent management, issue processing, heartbeat execution, plugin coordination, feedback, budgets
- Depends on: Database, adapters, configuration
- Used by: Routes, other services

**Middleware (Request Processing):**
- Purpose: Cross-cutting concerns for HTTP requests
- Location: `server/src/middleware`
- Contains: Authentication (actor identification), authorization, error handling, logging, validation
- Depends on: Database, configuration
- Used by: Express app initialization

**Database Layer (Drizzle ORM):**
- Purpose: Data persistence and query execution
- Location: `packages/db`
- Contains: Schema definitions (64 tables), migrations, backup utilities
- Depends on: PostgreSQL or embedded Postgres
- Used by: Services, routes

**Adapters (AI Integration):**
- Purpose: Abstract AI model interfaces and execution
- Location: `server/src/adapters` and `packages/adapters/*`
- Contains: HTTP/process adapters, model registry, adapter utilities
- Depends on: AI SDKs (Claude, Codex, etc.)
- Used by: Services (heartbeat execution, skill sync)

**Plugins (Extensibility):**
- Purpose: Dynamic capability extension without core modification
- Location: `server/src/services/plugin-*`
- Contains: Plugin loader, lifecycle, worker threads, job scheduling, state management
- Depends on: Plugin SDK, database, host services
- Used by: Routes, tool dispatcher, event bus

**CLI (Command-line Interface):**
- Purpose: System administration and local orchestration
- Location: `cli/src`
- Contains: Commands for onboarding, configuration, diagnostics, entity management
- Depends on: Server, adapters, database
- Used by: System operators via `paperclipai` command

**Shared (Common Code):**
- Purpose: Type definitions and utilities shared across packages
- Location: `packages/shared`
- Contains: Type definitions, config schemas, validators, constants
- Depends on: Zod
- Used by: All packages

## Data Flow

**User Request (Web):**

1. Browser submits request to `/api/{resource}` endpoint
2. Express middleware pipeline processes request:
   - `httpLogger` logs request
   - `actorMiddleware` identifies actor (board user, agent, or anonymous)
   - `privateHostnameGuard` checks hostname access
   - `boardMutationGuard` prevents certain mutations
3. Route handler validates input via `validate` middleware
4. Authorization check via `assertCompanyAccess` or `assertInstanceAdmin`
5. Service layer executes business logic (query, mutation, side effects)
6. Database queries via Drizzle ORM return data
7. Response serialized and returned with proper error handling

**Agent Heartbeat Execution:**

1. External trigger (scheduled timer, assignment, on-demand) invokes heartbeat
2. CLI or API calls `heartbeatRun` command with agent ID
3. `heartbeatService` retrieves agent config from database
4. Agent adapter (Claude, Codex, etc.) is initialized with model/auth
5. Adapter executes with environment (skill sync, context, documents)
6. Execution yields work items (issues, approvals, documents)
7. Results persisted to database via services
8. Live events broadcast via WebSocket to connected clients

**Plugin Job Execution:**

1. Plugin registers tool or hook capability
2. When triggered, `pluginJobCoordinator` creates job record
3. `pluginWorkerManager` spawns worker thread with isolated context
4. Worker executes plugin code via RPC
5. Plugin makes calls to host services (database, LLM, storage)
6. Results persisted, job events published to event bus
7. UI updates via WebSocket from `pluginEventBus`

**Real-time Updates:**

1. WebSocket connection established at `setupLiveEventsWebSocketServer`
2. Client subscribes to events via `/live-events` endpoint
3. Services publish events to `pluginEventBus` or `liveEventsService`
4. Events broadcast to all connected clients matching subscription
5. Client UI updates via `LiveUpdatesProvider` and React Query

**State Management:**
- Database is primary source of truth (PostgreSQL)
- Transient state: Plugin logs, live events, WebSocket connections
- Client state: React Query cache (queryKeys defined per domain)
- Session state: Better Auth for user authentication

## Key Abstractions

**Agent:**
- Purpose: Autonomous entity that executes work (reads, writes, collaborates)
- Examples: `server/src/services/agents.ts`, `server/src/routes/agents.ts`
- Pattern: Agent has adapter type, instructions, API keys, runtime state
- Permissions: Company-scoped access, can impersonate if approved

**Issue:**
- Purpose: Work item that agents and humans collaborate on
- Examples: `server/src/services/issues.ts`, `server/src/routes/issues.ts`
- Pattern: Issue has title, content, comments, attachments, execution workspace
- Lifecycle: Created → assigned/approved → executed → archived

**Execution Workspace:**
- Purpose: Isolated context for agent execution (env vars, document space, state)
- Examples: `server/src/services/execution-workspaces.ts`
- Pattern: Nested workspaces allow hierarchical isolation
- Contains: Runtime services (LLM, storage, external APIs), policy enforcement

**Routine:**
- Purpose: Scheduled or conditional agent invocation (daily report, if condition)
- Examples: `server/src/services/heartbeat.ts`, `server/src/routes/routines.ts`
- Pattern: Routine has trigger (cron, event), variables, agent assignment
- Execution: Heartbeat run captures all outputs as work item

**Plugin:**
- Purpose: Extend capabilities without modifying core
- Examples: `server/src/services/plugin-lifecycle.ts`, `packages/plugins`
- Pattern: Plugin loads manifest, declares capabilities (tools, hooks), runs in worker thread
- Lifecycle: Load → validate → initialize → active/error → cleanup

**Adapter:**
- Purpose: Abstract AI model execution and parameter mapping
- Examples: `packages/adapters/claude-local`, `server/src/adapters/registry.ts`
- Pattern: Each adapter implements interface for chat completion, streaming, auth
- Registry: `adapterRegistry` resolves adapter type to implementation

**Approval:**
- Purpose: Gated execution requiring human sign-off
- Examples: `server/src/services/approvals.ts`, `server/src/routes/approvals.ts`
- Pattern: Issue execution can require approval before committing changes
- Policy: `issueApprovalService` evaluates if approval needed based on config

## Entry Points

**Web Application:**
- Location: `ui/src/App.tsx`
- Triggers: Browser navigates to URL
- Responsibilities: Route mounting, auth gating, company context loading, layout

**Server (HTTP):**
- Location: `server/src/index.ts` (`startServer` function)
- Triggers: `pnpm dev` or `npm start`
- Responsibilities: Database initialization, Express app setup, middleware, routes, WebSocket, telemetry

**CLI:**
- Location: `cli/src/index.ts`
- Triggers: `paperclipai` command execution
- Responsibilities: Command parsing, local server setup, configuration management, diagnostics

**Heartbeat Scheduler:**
- Location: `server/src/services/cron.ts`
- Triggers: System clock (cron expressions)
- Responsibilities: Load routines, invoke heartbeat for each agent assignment

**Plugin Worker:**
- Location: `server/src/services/plugin-worker-manager.ts`
- Triggers: Plugin job created or hook fires
- Responsibilities: Spawn isolated thread, execute plugin code, proxy host service calls

## Error Handling

**Strategy:** Layered error handling with consistent error response format.

**Patterns:**
- **Validation errors:** Input validation via `validate` middleware using Zod schemas
- **Authorization errors:** `forbidden` or `notFound` functions return 403/404
- **Business logic errors:** Services throw custom errors, caught by route handlers
- **Database errors:** Drizzle ORM throws errors, caught and wrapped by services
- **Plugin errors:** Plugin worker sends error event, persisted as job error
- **HTTP errors:** Express error handler returns JSON with error field and appropriate status

Example error path:
```
Request validation fails → 400 Bad Request
Actor lacks permission → 403 Forbidden
Resource not found → 404 Not Found
Internal server error → 500 Internal Server Error
```

## Cross-Cutting Concerns

**Logging:**
- Pino logger configured globally, HTTP requests logged via `pino-http`
- Log levels: debug, info, warn, error
- Sensitive data redacted via `log-redaction.ts`

**Validation:**
- Zod schemas define input contracts
- Middleware validates before reaching route handlers
- Database schema enforces at persistence layer

**Authentication:**
- Three actor types: board (user), agent, none (anonymous)
- Better Auth for web sessions, JWT for agent self-auth, API keys for board API
- Session resolution in `actorMiddleware` determines permissions

**Authorization:**
- Company-scoped access: actors can only access company resources
- Role-based: instance admin, company member, agent
- Resource checks in routes via helpers: `assertCompanyAccess`, `assertInstanceAdmin`

**Telemetry:**
- Opt-in telemetry via `initTelemetry` in server startup
- Client-side tracking via `trackAgentCreated` and similar
- Sent to telemetry backend if enabled

---

*Architecture analysis: 2026-04-12*
