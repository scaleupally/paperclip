# PrioPilot — Differential Requirements
**Date:** 2026-04-04  
**Basis:** Paperclip (forked) vs. Priobench/Execution OS PRD + existing codebase  
**Purpose:** Define what must be built on top of Paperclip to deliver the PrioPilot vision  

---

## Executive Summary

Paperclip is a solid agent control plane for a **single human operator** managing a fleet of AI agents. PrioPilot extends this into a **leadership team execution platform** where multiple humans check in, own priorities, and are held accountable — with agents facilitating the rhythm rather than replacing it.

The differential falls into five categories:
1. **Multi-human team model** — Paperclip assumes one operator; PrioPilot needs a full team
2. **Human check-in loop** — Paperclip has no outbound human-facing communication; Priobench built this
3. **Goals/priorities/OKR data model** — Paperclip has issues; PrioPilot needs a hierarchy of strategic nodes
4. **Outbound notification channels** — Slack and email touchpoints for humans, not agents
5. **Methodology content layer** — Pre-loaded frameworks (5 Gears, 4A System, etc.) that make agents smart out of the box

---

## What Paperclip Already Has (No Build Needed)

| Capability | Paperclip feature |
|---|---|
| Company scoping | `companies` table, all entities scoped to company |
| Agent orchestration | `agents`, heartbeat runs, adapter system |
| Issue/task tracking | `issues` with full lifecycle, priorities, assignments |
| Recurring routines | `routines` — scheduled agent wake-ups |
| Activity logging | `activity_log` — full audit trail |
| User accounts & auth | `user`, `session`, invite system |
| Multi-user membership | `company_members` with roles |
| Budget management | `budgets`, spend tracking per agent |
| Goals (basic) | `goals` table linked to issues |
| Agent API keys | Agents can call back into the system |
| Board UI | Full React UI for issue management |

---

## Differential Requirements

### R1. Multi-Human Team Profiles
**Priority: High**  
**Gap:** Paperclip's `company_members` gives users access to a company but stores no team context — no role title, no Rocks ownership, no reporting structure beyond agents.  
**Need:**
- `team_members` profile per user per company: role title, team, reports-to, check-in preferences
- Each member owns a set of Rocks (priorities) for the current quarter
- Members are addressable individually by agents and routines

**Priobench equivalent:** `Priobench.Accounts.User` with company/role context + `nodes` with `owner_id`

---

### R2. Strategic Node Hierarchy (Rocks / OKRs / KPIs)
**Priority: High**  
**Gap:** Paperclip's `goals` table is shallow — just a title and description linked to issues. No hierarchy, no time horizons, no status tracking, no ownership model.  
**Need:**
- Hierarchical goal structure: 3-Year Vision → Annual Goals → Quarterly Rocks → Weekly Commitments
- Each node has: type, horizon, owner, status (Green/Yellow/Red), parent
- Measurements over time (weekly status snapshots)
- Queryable by company, owner, horizon, status

**Priobench equivalent:** `Priobench.Nodes.Node` + `NodeMeasurement` — this is production-ready and should be ported directly.

---

### R3. Human Check-In Sessions
**Priority: High**  
**Gap:** Paperclip has no concept of reaching out to a human on a schedule. Routines wake agents; nothing reaches humans.  
**Need:**
- `check_in_sessions` — scheduled sessions per user per company, with type (daily_focus, weekly_update), status, and response data
- Dispatch workers that create sessions for all active team members on a cadence
- Session state machine: pending → in_progress → completed / deferred
- Link sessions to specific Rocks being reviewed

**Priobench equivalent:** `CheckInSession` + workers (`daily_check_in_dispatch_worker`, `weekly_meeting_worker`, etc.) — directly portable.

---

### R4. Outbound Slack Integration
**Priority: High**  
**Gap:** Paperclip has no Slack integration. Agents communicate through the board UI only.  
**Need:**
- Slack workspace linking per company (`slack_team_id`)
- Per-user Slack ID mapping
- Outbound message sending (check-in prompts, nudges, weekly summaries)
- Inbound message handling (user replies to check-ins captured as session data)
- Conversation state machine (message threading, quick replies, deferral)

**Priobench equivalent:** `Priobench.Integrations.Slack` + `MessageHandler` + `ConversationMessage` — fully built, needs adaptation not rewrite.

---

### R5. Stale Entry Nudges & Accountability Workers
**Priority: Medium**  
**Gap:** Paperclip has no proactive outreach when things go stale.  
**Need:**
- Worker that detects Rocks/OKRs not updated in N days
- Sends nudge to owner via Slack (or email fallback)
- Configurable per company (nudge threshold, channels)

**Priobench equivalent:** `stale_entry_nudge_worker.ex` — directly portable.

---

### R6. Weekly Planning / Chief of Staff Routine
**Priority: High**  
**Gap:** Paperclip routines wake a single agent. No synthesis of team-wide state.  
**Need:**
- Weekly routine that: (1) collects check-ins from all team members, (2) synthesizes into a team status summary, (3) surfaces blockers and patterns to the CEO/founder, (4) proposes agenda for weekly leadership meeting
- This is the "Chief of Staff" agent's core playbook
- Output: a weekly briefing issue assigned to CEO with team status + recommended actions

**Priobench equivalent:** `weekly_meeting_worker` + `weekly_prep_worker` + `personal_op_briefing_worker` — logic exists, needs integration with Paperclip's issue/agent model.

---

### R7. Email Notification Channel
**Priority: Medium**  
**Gap:** Neither Paperclip nor Priobench (in current form) has a polished email notification layer for human-facing touchpoints.  
**Need:**
- Email fallback when Slack is not connected
- Weekly summary digest emails
- Onboarding / setup emails for new team members

**Priobench equivalent:** `mailer.ex` exists but is minimal — needs building out.

---

### R8. Agent Memory / Knowledge Files
**Priority: Medium**  
**Gap:** Paperclip agents have `capabilities` (a text field) but no structured memory system.  
**Need:**
- Per-agent memory files: persistent markdown documents the agent reads at session start
- Supports pre-loading methodology content (5 Gears, 4A System, coaching patterns)
- Updated by agents after sessions (learning accumulation)

**Priobench equivalent:** `AgentMemoryFile` — exists in Priobench, directly portable to PrioPilot.

---

### R9. Methodology Content Layer
**Priority: High (differentiator)**  
**Gap:** Paperclip ships with no pre-loaded agent knowledge. Agents start blank.  
**Need:**
- Pre-built agent capability templates for: CEO, Chief of Staff, Head of Sales, Head of Product
- Pre-loaded memory files containing: 5 Gears Framework, 4A System (Ambition/Alignment/Accountability/Acceleration), 3rd gear transition patterns, weekly planning playbook, accountability scorecard templates
- Company onboarding flow that pre-populates agents with the right methodology content based on company stage

**Priobench equivalent:** None — this is net new and is PrioPilot's core moat.

---

### R10. Google Sheets Sync
**Priority: Low (defer)**  
**Gap:** Paperclip has no Google Sheets integration.  
**Need:** Bidirectional sync between Rocks/OKR data and a structured Google Sheet (familiar surface for leadership teams).  
**Priobench equivalent:** `sheet_syncs` schema + Google Sheets API integration — designed but not fully implemented.  
**Recommendation:** Defer to post-MVP. The board UI in Paperclip is a better long-term surface than Google Sheets. Revisit only if clients explicitly demand it.

---

### R11. issuePrefix Editable in Company Settings
**Priority: Low**  
**Gap:** Already documented in backlog.md. Prefix is set at creation and can't be changed via UI.

---

## Build vs. Port Decision

| Requirement | Decision | Source |
|---|---|---|
| R1. Multi-human team profiles | **Build** (extend Paperclip members) | New |
| R2. Strategic node hierarchy | **Port** from Priobench | `nodes`, `node_measurements` |
| R3. Human check-in sessions | **Port** from Priobench | `check_in_sessions`, dispatch workers |
| R4. Outbound Slack integration | **Port** from Priobench | `integrations/slack`, `message_handler` |
| R5. Stale nudge workers | **Port** from Priobench | `stale_entry_nudge_worker` |
| R6. Weekly Chief of Staff routine | **Adapt** (Priobench logic + Paperclip issues) | `weekly_*_workers` |
| R7. Email notifications | **Build** (extend Priobench mailer) | `mailer.ex` |
| R8. Agent memory files | **Port** from Priobench | `agent_memory_file` |
| R9. Methodology content layer | **Build** — net new, core differentiator | Nothing exists |
| R10. Google Sheets sync | **Defer** | `sheet_syncs` (Priobench, incomplete) |
| R11. issuePrefix in UI | **Build** (small) | See backlog.md |

---

## Suggested Implementation Order

**Phase 1 — Team Foundation**
- R1: Multi-human team profiles
- R2: Strategic node hierarchy (port from Priobench)
- R8: Agent memory files (port from Priobench)

**Phase 2 — Check-in Loop**
- R3: Human check-in sessions (port)
- R4: Slack integration (port)
- R5: Stale nudge workers (port)

**Phase 3 — Chief of Staff**
- R6: Weekly planning routine (adapt)
- R7: Email notifications (build)

**Phase 4 — Differentiation**
- R9: Methodology content layer (build — this is the product)

---

*This document should be used as the basis for GSD milestone planning in ~/gits/priopilot.*
