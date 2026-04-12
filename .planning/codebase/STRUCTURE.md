# Codebase Structure

**Analysis Date:** 2026-04-12

## Directory Layout

```
paperclip/
├── .agents/                  # Agent skill definitions
├── .claude/                  # Claude IDE configuration and skills
├── .gstack/                  # GSD workflow state and plans
├── .planning/                # Codebase documentation (this directory)
├── .windsurf/                # Windsurf IDE configuration and skills
├── cli/                      # CLI application (Node.js, TypeScript)
├── doc/                      # Specification and planning documents
├── docker/                   # Docker Compose and container configs
├── docs/                     # User-facing documentation (Mintlify)
├── evals/                    # Model evaluation harnesses
├── packages/                 # Shared workspace packages
├── patches/                  # Dependency patches (pnpm)
├── releases/                 # Release artifacts and manifests
├── scripts/                  # Shared build/deploy scripts
├── server/                   # Express backend application
├── skills/                   # Claude-consumable skills
├── tests/                    # E2E and smoke test suites
├── ui/                       # React frontend application (Vite)
├── package.json              # Root workspace manifest
├── pnpm-lock.yaml            # Dependency lock file (pnpm)
└── tsconfig.base.json        # Shared TypeScript configuration
```

## Directory Purposes

**server/**
- Purpose: Node.js/Express backend for API and core logic
- Contains: Routes, services, middleware, adapters, auth, storage, database access
- Key files: `src/index.ts` (entry), `src/app.ts` (Express setup), `src/routes/*` (endpoints)

**ui/**
- Purpose: React 19 frontend application built with Vite
- Contains: Pages, components, hooks, context, API clients, styles
- Key files: `src/App.tsx` (main), `src/pages/*` (page components), `src/api/*` (fetch clients)

**cli/**
- Purpose: Command-line interface for setup, diagnostics, administration
- Contains: Commands, client connectors, configuration, prompts
- Key files: `src/index.ts` (command registration), `src/commands/*` (command implementations)

**packages/db**
- Purpose: Database schema, migrations, and ORM client
- Contains: Drizzle ORM setup, 64 table schemas, migrations, backup utilities
- Key files: `src/schema/*` (table definitions), `src/client.ts` (DB interface)

**packages/shared**
- Purpose: Type definitions and constants shared across all packages
- Contains: TypeScript interfaces, Zod validators, config schemas, constants
- Key files: `src/index.ts` (exports), `src/config-schema.ts` (config validation)

**packages/adapter-utils**
- Purpose: Common utilities for AI model adapters
- Contains: Helper functions for adapter development
- Key files: `src/server-utils.ts` (server-side adapter helpers)

**packages/adapters/\***
- Purpose: Integrations with specific AI models
- Locations: `claude-local/`, `codex-local/`, `cursor-local/`, `gemini-local/`, `openclaw-gateway/`, `opencode-local/`, `pi-local/`
- Each contains: Adapter implementation, model list, parameter mappings

**packages/mcp-server**
- Purpose: Model Context Protocol server implementation
- Contains: Protocol handlers and integrations

**packages/plugins**
- Purpose: Example/built-in plugins
- Contains: Plugin manifests, plugin code examples

**server/src/routes**
- Purpose: RESTful endpoint definitions
- Contains: 27 route files (agents.ts, issues.ts, projects.ts, etc.)
- Pattern: Each resource has GET (list), GET/:id (detail), POST (create), PUT/:id (update), DELETE/:id endpoints

**server/src/services**
- Purpose: Business logic and domain operations
- Contains: 60+ service modules (agents.ts, issues.ts, heartbeat.ts, plugin-*.ts, etc.)
- Pattern: Services encapsulate database queries, validation, and side effects

**server/src/middleware**
- Purpose: Request processing pipeline
- Contains: auth.ts (actor identification), error-handler.ts, logger.ts, validate.ts

**server/src/adapters**
- Purpose: Adapter registry and execution
- Contains: registry.ts (adapter loader), types.ts, HTTP/process adapter wrappers

**server/src/storage**
- Purpose: File and object storage abstraction
- Contains: S3 integration, file upload handling

**server/src/auth**
- Purpose: Authentication and session management
- Contains: Better Auth integration, session handling

**server/src/realtime**
- Purpose: WebSocket and live event broadcasting
- Contains: `live-events-ws.ts` (WebSocket server), event subscription

**server/src/types**
- Purpose: TypeScript type augmentations
- Contains: Express request/response type extensions

**server/src/secrets**
- Purpose: Secrets management
- Contains: Secret encryption, decryption, migration utilities

**ui/src/pages**
- Purpose: Top-level page components (45 files)
- Pattern: Each page corresponds to main route (Dashboard, Agents, Issues, Projects, etc.)
- Naming: PascalCase (AgentDetail.tsx), matches route structure

**ui/src/components**
- Purpose: Reusable UI components
- Contains: 150+ component files, organized by domain
- Subdirectories: `ui/` (base components), `transcript/` (run transcripts)

**ui/src/api**
- Purpose: Fetch clients for backend endpoints
- Contains: 27 API client files
- Pattern: Each file exports functions (get, post, put, delete) for resource
- Usage: `import { agentsApi } from './api/agents'; await agentsApi.list(companyId)`

**ui/src/context**
- Purpose: React context providers for shared state
- Contains: CompanyContext (current company), DialogContext (modal state), LiveUpdatesProvider (WebSocket)
- Pattern: Export hook (useCompany, useDialog) for consuming components

**ui/src/hooks**
- Purpose: Custom React hooks
- Contains: `useCompanyPageMemory`, `useKeyboardShortcuts`, `useLiveRunTranscripts`, etc.
- Pattern: Encapsulate stateful logic or API interaction

**ui/src/lib**
- Purpose: Utility functions
- Contains: Router setup, query key definitions, formatting, parsing
- Key files: `router.ts` (React Router wrapper), `queryKeys.ts` (TanStack React Query keys)

**packages/db/src/schema**
- Purpose: Drizzle ORM table definitions (64 files)
- Pattern: One file per table, exports Drizzle table schema
- Naming: snake_case (agents.ts, issues.ts, company_memberships.ts)
- Example structure:
  ```typescript
  export const agents = pgTable("agents", {
    id: text().primaryKey(),
    companyId: text().notNull(),
    name: text().notNull(),
    // ... additional columns
  });
  ```

**cli/src/commands**
- Purpose: Command implementations
- Contains: 25+ command files (onboard.ts, doctor.ts, run.ts, etc.)
- Subdirectories: `client/` (board API commands), command groups

**scripts/**
- Purpose: Build, release, and deployment automation
- Contains: Bash/Node.js scripts for CI/CD, releases, backups
- Key files: `dev-runner.ts` (development server manager), `release.sh` (packaging)

**doc/**
- Purpose: Specification and design documentation
- Contains: Plugin spec, execution workspace spec, planning documents
- Subdirectories: `spec/` (technical specs), `plans/` (design docs)

**tests/**
- Purpose: E2E and release-smoke test suites
- Contains: Playwright tests
- Subdirectories: `e2e/` (full application tests), `release-smoke/` (post-release verification)

**docs/**
- Purpose: User documentation (published via Mintlify)
- Contains: API docs, CLI docs, deployment guides, company guides
- Subdirectories: `api/`, `cli/`, `deploy/`, `guides/`, `start/`

## Key File Locations

**Entry Points:**
- `server/src/index.ts`: Server startup, database setup, app creation
- `ui/src/App.tsx`: React root, routing, layout, auth gates
- `cli/src/index.ts`: Command registration, argument parsing
- `ui/src/main.tsx`: React DOM render entry point

**Configuration:**
- `server/src/config.ts`: Server configuration loading (env, file-based)
- `packages/shared/src/config-schema.ts`: Zod schemas for all config
- `ui/tsconfig.json`: TypeScript config with `@/*` alias for imports
- `tsconfig.base.json`: Shared base TypeScript settings

**Core Logic:**
- `server/src/services/heartbeat.ts`: Agent heartbeat execution (160KB, main execution engine)
- `server/src/services/plugin-lifecycle.ts`: Plugin load, init, error handling
- `server/src/services/plugin-job-scheduler.ts`: Plugin job queueing and scheduling
- `server/src/routes/issues.ts`: Issue CRUD and work execution (90KB)
- `server/src/routes/agents.ts`: Agent CRUD and configuration (82KB)

**Database:**
- `packages/db/src/client.ts`: Drizzle ORM client initialization
- `packages/db/src/migrations/`: SQL migration files numbered sequentially
- `packages/db/src/schema/index.ts`: Exports all 64 table schemas

**Testing:**
- `ui/src/**/*.test.tsx`: Co-located unit tests (Vitest)
- `server/src/__tests__/`: Server test helper utilities
- `tests/e2e/playwright.config.ts`: E2E test configuration

**Authentication:**
- `server/src/middleware/auth.ts`: Actor identification (bearer token, session, JWT)
- `server/src/auth/`: Better Auth setup for web sessions
- `server/src/agent-auth-jwt.ts`: JWT verification for agent self-auth

**Utilities:**
- `packages/adapter-utils/`: Helper functions for adapter implementations
- `server/src/redaction.ts`: Sensitive data masking for logs and events
- `ui/src/lib/router.ts`: Custom React Router wrapper with type safety

## Naming Conventions

**Files:**
- Services: camelCase (agentService, issueService, heartbeatService)
- Routes: kebab-case (agents.ts, company-skills.ts, sidebar-badges.ts)
- Schemas: snake_case (agents.ts, company_memberships.ts, heartbeat_runs.ts)
- Pages: PascalCase (AgentDetail.tsx, IssueDetail.tsx)
- Components: PascalCase (ApprovalCard.tsx, CommandPalette.tsx)
- Utilities: camelCase or PascalCase based on type (queryKeys.ts, ApiError.ts)

**Directories:**
- Service domains: kebab-case (agent-auth, plugin-lifecycle, issue-approval)
- Components: lowercase (ui/, transcript/, adapters/)
- API endpoints: plural noun (agents.ts, issues.ts, projects.ts)

**Variables/Functions:**
- camelCase for functions and variables (startServer, createAgent, resolveSession)
- PascalCase for types and classes (StartedServer, BetterAuthSessionResult, ApiError)
- UPPER_SNAKE_CASE for constants (DEFAULT_INSTRUCTIONS_PATH_KEYS, TOAST_COOLDOWN_WINDOW_MS)

**React:**
- Component files named same as export (Button in button.tsx)
- Hooks use `use` prefix (useCompany, useDialog, useLiveRunTranscripts)
- Context providers end with `Provider` (LiveUpdatesProvider, DialogContext)

## Where to Add New Code

**New Feature (Agents, Issues, etc.):**
- API endpoint: Create `server/src/routes/{resource}.ts` with router function
- Service layer: Create `server/src/services/{resource}.ts` with business logic
- Database schema: Add table definition to `packages/db/src/schema/{table}.ts`
- Database migration: Create numbered migration file in `packages/db/src/migrations/`
- Frontend API client: Create `ui/src/api/{resource}.ts` with fetch functions
- Frontend pages: Create `ui/src/pages/{Resource}.tsx` and `{ResourceDetail}.tsx`
- Tests: Co-locate `*.test.ts` or `*.test.tsx` with source files

**New Component/Module:**
- Reusable component: `ui/src/components/{ComponentName}.tsx`
- Domain-specific component: `ui/src/components/{domain}/{ComponentName}.tsx`
- Test file: `ui/src/components/{ComponentName}.test.tsx` (co-located)
- Styles: Use Tailwind classes in JSX or `index.css` for global styles

**Utilities/Helpers:**
- Server helpers: `server/src/services/{util-name}.ts`
- Client helpers: `ui/src/lib/{util-name}.ts`
- Shared types: `packages/shared/src/{util-name}.ts`
- Adapter utilities: `packages/adapter-utils/src/{util-name}.ts`

**New Service:**
- Core operation: `server/src/services/{service-name}.ts`
- Service exports function or instance: `export const serviceNameService = { ... }`
- Register in `server/src/services/index.ts` for export from package
- Import and use in routes: `import { serviceNameService } from '../services/index.js'`

**Plugin Feature:**
- Plugin capability: Add to plugin manifest (`capabilities` array)
- Plugin handler: Implement handler function in plugin code
- Host service wrapper: If needs database access, wrap in `server/src/services/plugin-host-services.ts`

**Adapter Integration:**
- New AI model: Create `packages/adapters/{model-name}-{deployment}/`
- Required files: `package.json`, `src/index.ts` (adapter export), `src/types.ts` (types)
- Register in `server/src/adapters/registry.ts` for model discovery
- Add to adapter lists in `ui/src/adapters/` if UI needs to display

## Special Directories

**node_modules:**
- Purpose: Installed dependencies (pnpm managed)
- Generated: Yes
- Committed: No

**.planning/codebase/**
- Purpose: Architecture and structure documentation (this directory)
- Generated: No (manually maintained by `gsd-map-codebase`)
- Committed: Yes
- Contents: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, STACK.md, INTEGRATIONS.md, CONCERNS.md

**.gstack/**
- Purpose: GSD workflow state and planning
- Generated: Yes (by gsd commands)
- Committed: Partially (configs yes, state no)
- Contains: Phase plans, requirements, task lists

**dist/ (in packages):**
- Purpose: Compiled JavaScript output
- Generated: Yes (tsc, vite build)
- Committed: No

**migrations/ (packages/db/src):**
- Purpose: Database schema migration history
- Generated: No (manually created)
- Committed: Yes
- Pattern: Numbered files (001-initial.sql, 002-add-column.sql)

**onboarding-assets/ (server/src):**
- Purpose: Default onboarding content
- Generated: No
- Committed: Yes
- Contains: CEO and default company setup templates

**ui-dist/ (server):**
- Purpose: Built UI bundled for server deployment
- Generated: Yes (build script)
- Committed: No

---

*Structure analysis: 2026-04-12*
