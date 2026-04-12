# Codebase Concerns

**Analysis Date:** 2026-04-12

## Tech Debt

**Heartbeat Service Complexity:**
- Issue: `server/src/services/heartbeat.ts` is 4,654 lines - massive monolithic service handling agent execution, process management, workspace setup, session compaction, and result aggregation all in one file
- Files: `server/src/services/heartbeat.ts`
- Impact: Extremely difficult to test in isolation, test files are equally large (`server/src/__tests__/workspace-runtime.test.ts` 2,385 lines), high risk for regression when making changes
- Fix approach: Split into focused services by responsibility (execution lifecycle, process management, session handling, results aggregation). Introduce clear interfaces between them.

**Company Portability Service Complexity:**
- Issue: `server/src/services/company-portability.ts` is 4,415 lines with numerous validation and transformation functions mixed with business logic
- Files: `server/src/services/company-portability.ts`
- Impact: Difficult to understand import/export behavior, high likelihood of edge cases in data transformation being missed, validation logic is scattered
- Fix approach: Extract validation into a separate module, separate import preview logic from actual import execution, create focused classes for different entity types

**Extensive Use of `as any` Type Assertions:**
- Issue: Multiple critical services use `as any` to suppress TypeScript checks in plugin handling, company portability, and auth flows
- Files: `server/src/services/company-portability.ts` (lines 1215, 1218, 1223, 1238, 4190, 4316, 4319+), `server/src/services/plugin-host-services.ts` (multiple occurrences), `server/src/services/plugin-config-validator.ts`
- Impact: Loss of type safety in data validation paths, harder to catch invalid state, potential runtime errors with invalid enum values
- Fix approach: Create proper union types for validated enum values, use discriminated unions instead of `as any` casts, add runtime validation schemas

**Adapter Plugin Fallback in CLI:**
- Issue: TODO comment in `cli/src/commands/client/company.ts:383` - temporary `claude_local` fallback instead of proper adapter selection UI
- Files: `cli/src/commands/client/company.ts`
- Impact: Users may default to wrong adapter, may have incorrect runtime configuration
- Fix approach: Implement proper adapter selection in import TUI before shipping

**Adapter Utils Export Gaps:**
- Issue: TODO in `server/src/adapters/utils.ts:41` - temporary fallback for missing export in `@paperclipai/adapter-utils`
- Files: `server/src/adapters/utils.ts`
- Impact: Temporary workaround increases maintenance burden, may be forgotten and cause issues if adapter-utils is refactored
- Fix approach: Export `buildInvocationEnvForLogs` from adapter-utils package consistently

**Worktree Runtime JSON Fields Disabled:**
- Issue: TODO in `ui/src/adapters/runtime-json-fields.tsx:5` - UI for worktree support disabled pending workflow completion
- Files: `ui/src/adapters/runtime-json-fields.tsx`
- Impact: Partial feature implementation left in code, may confuse developers, UI state inconsistent
- Fix approach: Either complete worktree support workflow or remove disabled code entirely

**Large UI Components with Complex State:**
- Issue: Multiple mega-components managing too much state and logic: AgentDetail (4,120 lines), Inbox (2,344 lines), IssueDetail (2,299 lines)
- Files: `ui/src/pages/AgentDetail.tsx`, `ui/src/pages/Inbox.tsx`, `ui/src/pages/IssueDetail.tsx`
- Impact: Difficult to refactor, high defect density, hard to test individual features, difficult onboarding
- Fix approach: Extract feature areas into custom hooks, separate presentation from data management, create focused sub-components

---

## Known Bugs

**Detached Process Handling Edge Case:**
- Symptoms: Process may be lost in-memory but continue running (heartbeat run shows "Lost in-memory process handle")
- Files: `server/src/services/heartbeat.ts` (line 2425, error code `process_detached`)
- Trigger: Server crash/restart while agent running locally, or process lifecycle tracking race condition
- Workaround: Manual process cleanup required; consider implementing periodic process reconciliation on startup

**Session Compaction Migration Path Unclear:**
- Symptoms: Session state may be incorrect after applying compaction policy, potential data loss
- Files: `server/src/services/heartbeat.ts` (lines 66-69), `server/src/services/workspace-runtime.ts`
- Trigger: Agents with long-running sessions transitioning to compacted state
- Workaround: None documented - needs explicit test coverage for edge cases

---

## Security Considerations

**Hardcoded Local Board Principal:**
- Risk: `LOCAL_BOARD_USER_ID = "local-board"` hardcoded in server startup code; if ever exposed externally, could allow auth bypass
- Files: `server/src/index.ts` (lines 195-197)
- Current mitigation: Only used in `local_trusted` deployment mode, which should not be exposed to internet
- Recommendations: Document deployment mode security guarantees, add warnings in logs if local_trusted is exposed, consider making even local-trusted IDs non-guessable

**JWT/Session Secret Rotation Risk:**
- Risk: `BETTER_AUTH_SECRET` rotation logs out all users; deployment must maintain stable secret across rereleases
- Files: `server/src/index.ts` (implicit in config loading), `server/src/auth/better-auth.ts`
- Current mitigation: None - secret must be stable, documented in REQUIREMENTS.md R-O05
- Recommendations: Implement secret versioning to support gradual rotation, add startup warning if secret changes, document proper backup/restore procedure

**Environment Variable Redaction Pattern:**
- Risk: `SECRET_ENV_KEY_RE` pattern may miss new secret types; JWT detection regex may false-positive
- Files: `ui/src/pages/AgentDetail.tsx` (lines 111-113), `server/src/services/secrets.ts` (lines 10-11)
- Current mitigation: Redaction applied client-side for display only, server-side validation for sensitive keys
- Recommendations: Maintain canonical list of secret patterns in shared package, add integration tests verifying no secrets leak in logs, expand JWT regex to handle variations

**Env Binding Canonicalization:**
- Risk: `secret_ref` type could bypass validation if binding type not normalized properly
- Files: `server/src/services/secrets.ts` (lines 27-39)
- Current mitigation: Type narrowing in `canonicalizeBinding`, validation in `assertSecretInCompany`
- Recommendations: Add explicit tests for malformed/mixed-type bindings, validate all code paths normalizing bindings

---

## Performance Bottlenecks

**Large File Analysis in Workspace Setup:**
- Problem: `ensureManagedProjectWorkspace` performs git clone with timeout of 10 minutes (`MANAGED_WORKSPACE_GIT_CLONE_TIMEOUT_MS` in heartbeat.ts:80)
- Files: `server/src/services/heartbeat.ts` (line 218), timeout at line 80
- Cause: Large repositories or slow networks can timeout; no retry or progressive fallback
- Improvement path: Implement shallow clones for large repos, add exponential backoff for retries, support incremental workspace updates

**Inline Wake Comment Limits Tight:**
- Problem: Max 8 inline wake comments with 4KB body each, 12KB total (lines 81-83) - may truncate legitimate multi-step workflows
- Files: `server/src/services/heartbeat.ts` (lines 81-83)
- Cause: Arbitrary limits set to prevent message bloat but no intelligent batching/continuation
- Improvement path: Implement comment threading, batch overflow into follow-up comments, provide warning when hitting limits

**Task Session Compaction May Block Writes:**
- Problem: Session compaction applied eagerly during heartbeat runs - may cause I/O stalls
- Files: `server/src/services/heartbeat.ts` (lines 66-69, 1128-1184)
- Cause: Compaction happens synchronously during result processing
- Improvement path: Move compaction to async post-run phase, implement background compaction policy, add metrics for compaction performance

**Live Log Chunking at 8KB:**
- Problem: `MAX_LIVE_LOG_CHUNK_BYTES = 8 * 1024` means frequent WebSocket emissions for verbose output
- Files: `server/src/services/heartbeat.ts` (line 71)
- Cause: Conservative chunk size to prevent buffer bloat, but results in chatty protocol
- Improvement path: Increase to 64KB with backpressure handling, implement adaptive chunking based on network conditions

---

## Fragile Areas

**Workspace Runtime Realization:**
- Files: `server/src/services/workspace-runtime.ts` (2,399 lines)
- Why fragile: Complex lifecycle with multiple interdependent steps (initialization, service setup, adapter config building, cleanup), many side effects. Any change risks breaking workspace readiness or proper cleanup.
- Safe modification: Add comprehensive integration tests for full lifecycle before refactoring, mock all external service calls, test error paths thoroughly, add logging at each lifecycle step
- Test coverage: Partial - `server/src/__tests__/workspace-runtime.test.ts` exists but is 2,385 lines itself, covering main paths but edge cases in service ordering and cleanup unclear

**Issue Execution Workspace Policy:**
- Files: `server/src/services/execution-workspace-policy.ts`, `server/src/services/heartbeat.ts`
- Why fragile: Policy resolution depends on cascading queries (issue settings → project policy → default), easy to miss edge cases where policies conflict or aren't set
- Safe modification: Add property-based tests for all policy combinations, explicitly test override precedence, add audit logging for policy decisions
- Test coverage: No dedicated test file visible, embedded in heartbeat tests

**Plugin Host Services RPC Bridge:**
- Files: `server/src/services/plugin-host-services.ts` (multiple `as any` assertions)
- Why fragile: Type erasure with `as any` means plugin API contract violations may not be caught until runtime, no validation of plugin return values
- Safe modification: Add strict runtime validation schema for all plugin method returns, implement plugin sandbox with timeout/resource limits, add detailed error reporting
- Test coverage: Limited - plugin communication tested but full contract coverage unclear

**Authentication Flow State Machine:**
- Files: `server/src/auth/better-auth.ts`, `server/src/index.ts` (bootstrap flow)
- Why fragile: Multiple interdependent initialization steps (Better Auth creation, board claim challenge, trusted user creation), no clear error recovery path if one step fails partway through
- Safe modification: Add comprehensive state recovery mechanism, log all state transitions, add smoke tests for each initialization scenario (fresh DB, migrated from local_trusted, etc.)
- Test coverage: Explicit test file `server/src/__tests__/cli-auth-routes.test.ts` exists, board claim flow has documented behavior in REQUIREMENTS.md R-F10

---

## Scaling Limits

**Heartbeat Run Concurrency Cap:**
- Current capacity: 1 concurrent run per agent by default (`HEARTBEAT_MAX_CONCURRENT_RUNS_DEFAULT = 1`), max 10 (`HEARTBEAT_MAX_CONCURRENT_RUNS_MAX = 10`)
- Limit: Beyond 10 concurrent runs per agent, heartbeat coordination breaks down, queue stalls, runs timeout
- Files: `server/src/services/heartbeat.ts` (lines 72-73)
- Scaling path: Refactor to use queue-based orchestration instead of in-memory Promise coordination, implement distributed locking if scaling beyond single instance

**Database Connection Pool:**
- Current capacity: Default Drizzle connection pool limits
- Limit: Each heartbeat + workspace setup + result processing creates DB connections; at high concurrency, pool exhaustion causes query timeouts
- Files: `packages/db/src/client.ts`
- Scaling path: Add connection pool monitoring, implement query batching, use prepared statements to reduce parse overhead, consider read replicas

**Live Event WebSocket Broadcast:**
- Current capacity: Single WebSocket for all company live updates
- Limit: At high update frequency (multiple agents running), message queue may backup or drop events
- Files: `server/src/realtime/live-events-ws.ts`
- Scaling path: Implement event deduplication, add priority queue for UI-critical events, support topic-based subscriptions

**Agent Start Lock Map:**
- Current capacity: Global `startLocksByAgent` Map (lines 78-79) holds Promise for each agent's concurrent start operation
- Limit: If agents never complete start (deadlock), Promise never resolves and Map grows unbounded
- Files: `server/src/services/heartbeat.ts` (line 78)
- Scaling path: Add Promise timeout wrapper, implement lock expiry, add metrics for lock wait times

---

## Dependencies at Risk

**Embedded Postgres Beta Version:**
- Risk: Using `embedded-postgres@18.1.0-beta.16` with custom patch applied (`patches/embedded-postgres@18.1.0-beta.16.patch`)
- Impact: Beta version may have undocumented behavior changes, patch may break on library updates, deployment target (PGlite) may diverge
- Files: `package.json` (lines 54), pnpm overrides
- Migration plan: Monitor for stable release, test patch against each new beta version, consider migrating to PGlite proper once stable

**TypeScript Type Compatibility Layer:**
- Risk: Multiple uses of `as any` and type coercion in plugin validation and enum handling suggest type system is fighting the domain model
- Impact: Maintenance burden as TypeScript versions upgrade, potential runtime errors not caught by type checker
- Files: `server/src/services/company-portability.ts`, `server/src/services/plugin-host-services.ts`, `server/src/services/plugin-config-validator.ts`
- Migration plan: Define strict TypeScript domains for plugin config, enum validation, and portability manifests, remove `as any` progressively

---

## Missing Critical Features

**Scheduled Task Timeout Enforcement:**
- Problem: No explicit timeout enforcement for long-running agent tasks; process may hang indefinitely
- Blocks: Production stability - runaway agents consume resources and prevent other work
- Files: `server/src/services/heartbeat.ts` (no explicit timeout wrapper visible), `server/src/services/routines.ts`
- Priority: High - affects availability and cost control

**Workspace Cleanup on Orphaned Runs:**
- Problem: If heartbeat process crashes, execution workspace may be left allocated but not cleaned up
- Blocks: Production scaling - orphaned workspaces accumulate and exhaust capacity
- Files: `server/src/services/workspace-runtime.ts` (cleanup logic exists but no auto-recovery for orphaned)
- Priority: High - affects production stability and resource leaks

**Event Log Retention Policy:**
- Problem: No documented retention policy for heartbeat run events, issue comments, or activity logs
- Blocks: Database growth unbounded - production deployment will eventually fill disk
- Files: `server/src/services/heartbeat.ts` (appends to `heartbeatRunEvents`), `server/src/services/issues.ts`
- Priority: Medium - affects long-term operations but not immediate

**Rate Limiting on API Endpoints:**
- Problem: No rate limiting on heartbeat endpoints or API routes
- Blocks: Runaway clients can DOS the server or exceed budget limits unexpectedly
- Files: `server/src/routes/` (no rate limiting middleware visible)
- Priority: Medium-High - needed before public deployment

**Agent Health Check / Liveness Probe:**
- Problem: No built-in health check for agents; if agent becomes unresponsive, no automatic remediation
- Blocks: Reliability - stalled agents block the heartbeat system from progressing
- Files: `server/src/services/heartbeat.ts` (uses heartbeat protocol but no health monitoring layer)
- Priority: Medium - improves resilience but not immediately blocking

---

## Test Coverage Gaps

**Heartbeat Run Edge Cases:**
- What's not tested: Process loss during run, session compaction with partial data, concurrent wake requests to same issue, detached process recovery
- Files: `server/src/__tests__/heartbeat-comment-wake-batching.test.ts` (batching tested), but full lifecycle gaps
- Risk: Undetected regressions when modifying heartbeat coordination logic, runaway agents in production
- Priority: High

**Workspace Policy Precedence:**
- What's not tested: Issue-level override defeats project policy, undefined policy values cascade correctly, empty arrays vs null values in policy objects
- Files: `server/src/services/execution-workspace-policy.ts` - no dedicated tests found
- Risk: Policies applied incorrectly, workspace setup fails unpredictably
- Priority: High

**Authentication Mode Transitions:**
- What's not tested: Switching deployment modes (local_trusted → authenticated), migrating users, secret rotation during active sessions, board claim flow with concurrent login attempts
- Files: `server/src/__tests__/` - no explicit transition tests
- Risk: Data loss or security bypass during operational mode changes
- Priority: High

**Large Company Import/Export:**
- What's not tested: Importing company with >1000 agents, >10000 issues, extremely large skill binaries, concurrent import/export operations
- Files: `server/src/services/company-portability.ts` test coverage unclear
- Risk: OOM on large datasets, missing data on import, timeout on export
- Priority: Medium

**Error Recovery in UI:**
- What's not tested: Network errors during agent runs, partial data loading, stale API responses after logout/session timeout
- Files: `ui/src/pages/AgentDetail.tsx` (extensive error handling but integration test coverage unknown)
- Risk: UI hangs, silent failures, inconsistent state display
- Priority: Medium

---

## Architecture Concerns

**Implicit Service Dependencies:**
- Issue: Services have complex interdependencies not explicitly documented (heartbeat → workspace-runtime → execution-workspace-policy → secrets → adapters)
- Impact: Circular initialization risks, dependency injection scattered across imports, hard to mock for testing
- Files: `server/src/services/index.ts` (exports all services), `server/src/index.ts` (bootstrap order)
- Recommendation: Create explicit dependency injection container, document initialization order, add smoke tests verifying clean startup

**Plugin RPC Protocol Without Type Safety:**
- Issue: Plugin communication uses JSON-RPC with runtime `as any` assertions, no schema validation
- Impact: Plugin errors may not be caught until runtime, incompatible plugin versions may fail unpredictably
- Files: `server/src/services/plugin-worker-manager.ts`, `server/src/services/plugin-host-services.ts`
- Recommendation: Add Zod/JSON Schema validation for all RPC calls, version the protocol, add detailed protocol change notes

**Company Portability Format Versioning:**
- Issue: No version field in export manifests, breaking changes may cause silent import failures
- Impact: Exports from new version may not import into old version, no migration path, difficult to support multiple formats
- Files: `server/src/services/company-portability.ts` (manifest building around line 4180+)
- Recommendation: Add `exportVersion` to manifest, implement migration functions for format changes, test forward/backward compatibility

---

## Operational Concerns

**Fly.io Configuration Constraints Not Enforced:**
- Problem: `fly.toml` constraints (min_machines_running, auto_stop_machines, persistent volumes) are not validated at startup
- Impact: Misconfiguration silently breaks production (per REQUIREMENTS.md R-O01, R-O02, R-O03)
- Files: `fly.toml`, `server/src/index.ts` (no startup validation)
- Recommendation: Add startup check validating critical Fly config, read Fly API to verify machine state, fail fast if misconfigured

**Database Migration Prompt in TTY Only:**
- Problem: Auto-migration skipped if not TTY (line 111 in index.ts), but fail-fast also skipped, leading to silent schema mismatches
- Impact: CI environments may deploy with stale schema if PAPERCLIP_MIGRATION_AUTO_APPLY not set
- Files: `server/src/index.ts` (lines 108-122)
- Recommendation: Add explicit CI mode that always applies, add schema validation endpoint to health check

**No Liveness/Readiness Probes:**
- Problem: Kubernetes/Fly.io health checks only verify port is open, not that DB, adapters, or plugins are ready
- Impact: Server accepts traffic before fully initialized, requests fail with unhelpful errors
- Files: `server/src/index.ts`, `server/src/app.ts` (no dedicated health endpoint)
- Recommendation: Implement `/health` (liveness) and `/ready` (readiness) endpoints, check critical dependencies

---

*Concerns audit: 2026-04-12*
