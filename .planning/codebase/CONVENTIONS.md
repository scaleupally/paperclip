# Coding Conventions

**Analysis Date:** 2026-04-12

## Naming Patterns

**Files:**
- React components: PascalCase (e.g., `CommentThread.tsx`, `ToastContext.tsx`, `OnboardingWizard.tsx`)
- Services and utilities: camelCase (e.g., `companies.ts`, `agents.ts`, `error-handler.ts`)
- Test files: `[filename].test.ts` or `[filename].spec.ts` (e.g., `monthly-spend-service.test.ts`)
- Config files: kebab-case (e.g., `vitest.config.ts`, `tsconfig.json`)

**Functions:**
- camelCase for all functions, including React hooks (e.g., `useToast()`, `useQuery()`, `pushToast()`, `dismissToast()`)
- Exported helper functions: camelCase (e.g., `companyService()`, `errorHandler()`, `normalizeTtl()`)
- Higher-order functions or factory functions return lowercase: `vi.hoisted()`, `vi.fn()`

**Variables:**
- camelCase for all variables and constants: `const defaultTtl = 4000`, `const dedupeRef = useRef()`
- Uppercase for module-level constants: `const DEFAULT_TTL_BY_TONE`, `const MAX_TOASTS`, `const SKIP_LLM`
- Private/internal variables/functions prefixed with underscore rarely used; prefer descriptive names

**Types:**
- Interface names: PascalCase with `Interface` suffix optional (e.g., `ToastInput`, `ToastContextValue`, `CommentThreadProps`)
- Type/record names: PascalCase (e.g., `ToastTone`, `CommentWithRunMeta`, `LinkedRunItem`)
- Discriminated union types use `type` declarations (e.g., `type ToastTone = "info" | "success" | "warn" | "error"`)

**React Components:**
- Named exports only, never default exports for components
- Component names: PascalCase (e.g., `function CloudAccessGate()`, `export function App()`)
- Props interfaces: `[ComponentName]Props` (e.g., `CommentThreadProps`, `BootstrapPendingPageProps`)

## Code Style

**Formatting:**
- No explicit linter/prettier config detected; code follows standard TypeScript/React style
- Two-space indentation observed throughout
- Semicolons used throughout
- Line length: no strict limit, ranges from 60-120+ characters depending on context

**Linting:**
- No `.eslintrc*` or `biome.json` found; project uses TypeScript `strict: true` for type safety
- TypeScript compiler flags: `strict: true`, `skipLibCheck: true`, `forceConsistentCasingInFileNames: true`
- No ESLint or Prettier configurations detected; code style appears self-enforced

## Import Organization

**Order:**
1. Node.js built-in modules (`import fs from "node:fs"`, `import path from "path"`)
2. Third-party packages (`import express from "express"`, `import { useQuery } from "@tanstack/react-query"`)
3. Internal workspace packages (`import type { Db } from "@paperclipai/db"`)
4. Relative imports from same workspace (`import { companyService } from "../services/companies.js"`)
5. Local relative imports (`./*` paths)

**Path Aliases:**
- UI: `@/*` resolves to `./src/*` (e.g., `@/components/ui/button`)
- Server: No path alias (use relative imports)
- React/Lexical special alias: `lexical` path alias in `ui/vitest.config.ts`

**Import style:**
- Use `.js` extensions in import paths in all modules (e.g., `from "../services/companies.js"`)
- Use `type` keyword for type-only imports: `import type { Request } from "express"`
- Named imports preferred over default imports except for modules with single default export

## Error Handling

**Patterns:**
- Custom `HttpError` class extending `Error` with `status` and optional `details` properties
- Helper functions for common HTTP errors: `badRequest()`, `unauthorized()`, `forbidden()`, `notFound()`, `conflict()`, `unprocessable()`
- All helpers return `HttpError` instance with appropriate status code
- Error handler middleware (`errorHandler`) distinguishes between `HttpError`, `ZodError`, and generic `Error`
- Server attaches error context to response object for telemetry: `(res as any).__errorContext`

**Error Throwing:**
```typescript
throw badRequest("Invalid company name");
throw unauthorized("Session expired");
throw notFound("Company not found");
throw conflict("Company already exists", { conflictingId: "..." });
throw unprocessable("Invalid data", { validationErrors: [] });
```

**Error Response Format:**
- Success case: `{ error: string }` or `{ error: string, details: unknown }`
- Validation errors (ZodError): `{ error: "Validation error", details: ZodError[] }`
- Internal errors: `{ error: "Internal server error" }` (details not exposed)

## Logging

**Framework:** `pino` (server) + `pino-http` middleware; `console.*` in client code

**Patterns:**
- Server logging via `pino` instance (imported from `"./middleware/logger.js"`)
- HTTP request logging via `pino-http` middleware
- Telemetry tracking for error handler crashes via `trackErrorHandlerCrash()`
- Client-side: uses browser console for debugging (no dedicated logger)

## Comments

**When to Comment:**
- JSDoc comments for exported functions and React hooks
- Block comments for non-obvious logic or workarounds
- Inline comments for complex conditional branches
- TODO/FIXME comments to mark incomplete work (e.g., `// @vitest-environment node`)

**JSDoc/TSDoc:**
- Used sparingly; most code is self-documenting through types
- Example: E2E test file includes comment block describing test flow:
```typescript
/**
 * E2E: Onboarding wizard flow (skip_llm mode).
 *
 * Walks through the 4-step OnboardingWizard:
 *   Step 1 — Name your company
 *   Step 2 — Create your first agent
 *   ...
 */
```

## Function Design

**Size:**
- Functions range from 1-2 lines (helpers) to 50+ lines (service methods)
- Service factory functions return object with named methods (e.g., `companyService(db)` returns `{ list(), getById(), ... }`)

**Parameters:**
- Destructured parameters for objects (common in React)
- Named parameters object for functions with multiple params
- Optional properties in interfaces use `?:` (e.g., `dedupeKey?: string`)

**Return Values:**
- Explicit return type annotations on exported functions
- Nullable values use `| null` rather than `| undefined` (e.g., `string | null`)
- Factory functions return objects with methods: `{ pushToast, dismissToast, clearToasts }`
- Async service methods return Promises: `Promise<Company[]>`, `Promise<Agent | null>`

## Module Design

**Exports:**
- Named exports preferred: `export function companyService()`, `export class HttpError`
- Re-export patterns for service factories (called from routes)
- Context providers export Provider component and hook: `ToastProvider`, `useToast()`

**Barrel Files:**
- Middleware collected in `src/middleware/index.ts`: `export { httpLogger, errorHandler, actorMiddleware, ... }`
- Routes imported individually rather than through barrel file

## Type Safety

**Strict TypeScript:**
- `strict: true` enforced in `tsconfig.base.json`
- All public API parameters and return types explicitly typed
- Generic types used for flexible abstractions (e.g., `hydrateCompanySpend<T extends { id: string; ... }>()`)
- Type narrowing via instanceof checks: `if (err instanceof HttpError)`

**React Prop Types:**
- Props always typed as interface or type alias
- `React.ReactNode` for children props
- Callback prop types: `(param: Type) => Promise<void>` or `(param: Type) => void`

## Code Structure in Services

**Pattern - Factory Functions:**
Services are created as factory functions that accept a database connection and return an object with methods:

```typescript
export function companyService(db: Db) {
  // Private helper functions
  function currentUtcMonthWindow() { ... }
  function enrichCompany(company) { ... }

  // Public methods
  async function list() { ... }
  async function getById(id) { ... }

  // Return public API
  return { list, getById, ... };
}
```

**Pattern - Middleware:**
Express middleware exported as functions:

```typescript
export function errorHandler(err, req, res, next) { ... }
export function authMiddleware(req, res, next) { ... }
```

---

*Convention analysis: 2026-04-12*
