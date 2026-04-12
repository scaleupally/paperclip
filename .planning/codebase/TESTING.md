# Testing Patterns

**Analysis Date:** 2026-04-12

## Test Framework

**Runner:**
- Vitest 3.0.5
- Config: Root `vitest.config.ts` delegates to workspace projects
- Individual configs: `server/vitest.config.ts`, `ui/vitest.config.ts`, `cli/vitest.config.ts`, `packages/db/vitest.config.ts`, `packages/mcp-server/vitest.config.ts`

**Assertion Library:**
- Vitest built-in `expect()` from `"vitest"`

**Run Commands:**
```bash
pnpm run test                  # Watch mode for all workspaces
pnpm run test:run              # Run all tests once (CI mode)
npm run typecheck              # Run TypeScript type checking
pnpm test:e2e                  # Run Playwright E2E tests
pnpm test:e2e:headed          # Run Playwright tests with UI
```

## Test File Organization

**Location:**
- Server: co-located in `src/__tests__/` directory (parallel to implementation)
- UI: co-located in same directory as implementation (e.g., `src/context/LiveUpdatesProvider.test.ts`)
- Database: co-located in `packages/db/src/` with test files
- E2E: Separate directory `tests/e2e/` for Playwright tests

**Naming:**
- Suffix pattern: `[module-name].test.ts` (never `.spec.ts`)
- Example: `monthly-spend-service.test.ts`, `LiveUpdatesProvider.test.ts`, `runtime-config.test.ts`

**Structure:**
```
server/
├── src/
│   ├── services/
│   │   └── companies.ts
│   └── __tests__/
│       └── monthly-spend-service.test.ts
ui/
├── src/
│   ├── context/
│   │   ├── LiveUpdatesProvider.tsx
│   │   └── LiveUpdatesProvider.test.ts
tests/
├── e2e/
│   ├── onboarding.spec.ts
│   └── signoff-policy.spec.ts
```

## Test Structure

**Suite Organization:**

Server unit tests use `describe()` and `it()` blocks:

```typescript
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { companyService } from "../services/companies.ts";

describe("monthly spend hydration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("recomputes company spentMonthlyCents from the current utc month", async () => {
    const dbStub = createSelectSequenceDb([...]);
    const companies = companyService(dbStub.db as any);
    const [company] = await companies.list();
    expect(company.spentMonthlyCents).toBe(420);
  });
});
```

**Patterns:**
- `beforeEach()`: Clear mocks, reset state
- `afterEach()`: Cleanup (file system, environment variables)
- `vi.resetModules()`: Reset module cache between tests (required for module mocking)
- `vi.clearAllMocks()`: Clear all mock function calls and return values

## Mocking

**Framework:** Vitest `vi` module

**Module Mocking Pattern:**

Use `vi.hoisted()` + `vi.doMock()` for module-level mocking:

```typescript
import { describe, expect, it, vi } from "vitest";

const mockActivityService = vi.hoisted(() => ({
  list: vi.fn(),
  forIssue: vi.fn(),
  create: vi.fn(),
}));

const mockHeartbeatService = vi.hoisted(() => ({
  getRun: vi.fn(),
}));

vi.doMock("../services/activity.js", () => ({
  activityService: mockActivityService,
}));

vi.doMock("../services/index.js", () => ({
  services: { activityService: mockActivityService, heartbeatService: mockHeartbeatService },
}));

describe("activity routes", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns activity list", async () => {
    mockActivityService.list.mockResolvedValue([...]);
    // Test code
  });
});
```

**Function Mocking Pattern:**

Use `vi.fn()` for function mocks and `vi.spyOn()` for spying on existing functions:

```typescript
const mockFn = vi.fn();
const mockFn2 = vi.fn().mockReturnValue(defaultValue);
const mockAsyncFn = vi.fn().mockResolvedValue(result);
const mockErrorFn = vi.fn().mockRejectedValue(error);

vi.spyOn(module, "functionName").mockReturnValue(value);
vi.spyOn(module, "functionName").mockImplementation((arg) => {
  // Custom implementation
});
```

**What to Mock:**
- External services (database, APIs, file system)
- Module imports when testing in isolation
- Time functions (dates, timers) in tests with time-dependent logic
- Configuration functions like `readPersistedDevServerStatus()`

**What NOT to Mock:**
- Utility functions within the same module
- Pure data structures or constants
- Internal helper functions in context providers
- Type imports (imports marked with `type` keyword)

**Mock Assertion Patterns:**
```typescript
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).not.toHaveBeenCalled();
```

## Fixtures and Factories

**Test Data:**

Inline factories create database-like objects:

```typescript
function createSelectSequenceDb(results: unknown[]) {
  const pending = [...results];
  const chain = {
    from: vi.fn(() => chain),
    where: vi.fn(() => chain),
    leftJoin: vi.fn(() => chain),
    groupBy: vi.fn(() => chain),
    then: vi.fn((resolve: (value: unknown[]) => unknown) =>
      Promise.resolve(resolve(pending.shift() ?? []))
    ),
  };
  return { db: { select: vi.fn(() => chain) } };
}
```

Test objects built inline with realistic data:

```typescript
const dbStub = createSelectSequenceDb([
  [{
    id: "company-1",
    name: "Paperclip",
    issuePrefix: "PAP",
    spentMonthlyCents: 999999,
    createdAt: new Date(),
    updatedAt: new Date(),
  }],
  [{
    companyId: "company-1",
    spentMonthlyCents: 420,
  }],
]);
```

**Location:**
- Inline in test files (no separate fixtures directory)
- Helper functions at top of test file for repeated patterns
- No centralized fixture repository; fixtures are test-specific

## Coverage

**Requirements:** Not enforced; no coverage configuration detected

**View Coverage:**
- Use `vitest run --coverage` (if coverage reporter configured)
- Currently no coverage threshold visible in `vitest.config.ts` files

## Test Types

**Unit Tests:**
- Scope: Individual service methods or utility functions
- Approach: Mock external dependencies, test logic in isolation
- Examples:
  - `monthly-spend-service.test.ts`: Tests spending computation
  - `ui-branding.test.ts`: Tests branding logic with environment variables
  - `runtime-config.test.ts`: Tests database configuration resolution

**Integration Tests:**
- Scope: Multiple services or components working together
- Approach: Uses real or stubbed databases; tests workflows
- Not explicitly separated in naming; integration tests are marked with descriptive names
- E2E tests act as de facto integration tests for full workflows

**E2E Tests:**
- Framework: Playwright 1.58.2
- Config: `tests/e2e/playwright.config.ts` and `tests/release-smoke/playwright.config.ts`
- Approach: Browser automation, API calls from browser context
- Examples:
  - `onboarding.spec.ts`: Tests full onboarding flow with UI interaction and API verification
  - `signoff-policy.spec.ts`: Tests approval/signoff workflows

## Common Patterns

**Async Testing:**

Tests use `async/await` with `Promise` returns:

```typescript
it("recomputes agent spentMonthlyCents", async () => {
  const dbStub = createSelectSequenceDb([...]);
  const agents = agentService(dbStub.db as any);
  const agent = await agents.getById("agent-1");
  expect(agent?.spentMonthlyCents).toBe(175);
});
```

**Environment Variable Testing:**

Tests that verify behavior based on environment variables:

```typescript
it("uses DATABASE_URL from process env first", () => {
  process.env.DATABASE_URL = "postgres://...";
  const target = resolveDatabaseTarget();
  expect(target).toMatchObject({
    mode: "postgres",
    connectionString: "postgres://...",
    source: "DATABASE_URL",
  });
});
```

Cleanup in `afterEach()` to prevent test pollution:

```typescript
afterEach(() => {
  process.chdir(ORIGINAL_CWD);
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) delete process.env[key];
  }
});
```

**Error Testing:**

Verify error conditions:

```typescript
it("throws not found when company doesn't exist", async () => {
  const companies = companyService(mockDb);
  await expect(companies.getById("nonexistent")).rejects.toThrow("Company not found");
});
```

**E2E Testing Pattern:**

Use Playwright's page object and assertions:

```typescript
test("completes full wizard flow", async ({ page }) => {
  await page.goto("/onboarding");

  const wizardHeading = page.locator("h3", { hasText: "Name your company" });
  await expect(wizardHeading).toBeVisible({ timeout: 5_000 });

  const companyNameInput = page.locator('input[placeholder="Acme Corp"]');
  await companyNameInput.fill(COMPANY_NAME);

  const nextButton = page.getByRole("button", { name: "Next" });
  await nextButton.click();

  // Verify API calls
  const companiesRes = await page.request.get(`${baseUrl}/api/companies`);
  expect(companiesRes.ok()).toBe(true);
  const companies = await companiesRes.json();
  expect(companies.find(c => c.name === COMPANY_NAME)).toBeTruthy();
});
```

**Test Utilities in Source Code:**

Some components export test utilities for unit testing their logic:

```typescript
// In LiveUpdatesProvider.tsx
export const __liveUpdatesTestUtils = {
  invalidateActivityQueries: (queryClient, companyId, event, context) => { ... },
  shouldSuppressActivityToastForVisibleIssue: (...) => { ... },
};

// In test
import { __liveUpdatesTestUtils } from "./LiveUpdatesProvider";

__liveUpdatesTestUtils.invalidateActivityQueries(queryClient, "company-1", event, {});
```

## Test Organization Tips

**Running Tests:**
- All tests: `pnpm run test` (watch mode)
- Single test: `pnpm test -- monthly-spend` (filters by filename)
- Single file: `pnpm test -- /path/to/file.test.ts`

**Debugging:**
- Add `console.log()` statements; logs appear in test output
- Use `page.screenshot()` in E2E tests to debug UI state
- Set `timeout` on `expect()` for async operations: `await expect(...).toBeVisible({ timeout: 5_000 })`

---

*Testing analysis: 2026-04-12*
