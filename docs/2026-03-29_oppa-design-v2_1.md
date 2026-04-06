# OPPA — Operating Partner & Proactive Ally
# System Design Document v2

## Purpose

OPPA is a multi-agent system that acts as an AI-native startup's entire operating team. A solo founder interacts primarily with one agent — the Operating Partner — through a chat interface. The Operating Partner runs the business day-to-day, delegating to domain-specific agents, surfacing problems early, and only escalating decisions that exceed its authority. The system mirrors how high-performing human teams operate, using proven management frameworks adapted for AI agents.

All agent communication flows through external systems (Fizzy for work tracking, email, Slack) — never through internal message passing. This ensures full auditability and human visibility at all times.

---

## Target User

Solo founders of a tech business running anywhere between 0–1M USD ARR, without a team of humans, who want to avoid building a team of humans and are all-in on AI instead.

These founders are typically:
- Technical enough to set up the system
- Doing everything themselves — product, marketing, sales, support, bookkeeping
- Drowning in execution, not strategy
- Unable or unwilling to hire humans at this stage
- Looking for leverage, not just automation

Over time, the system will add features to also manage a team of humans alongside AI agents. This is NOT in the MVP.

---

## Terminology

Before describing the architecture, we need clear definitions:

**Agent**: A persistent entity with identity, memory, initiative, and a range of skills. An agent has a role (e.g., "Sales Lead"), can take proactive action on a heartbeat cycle, maintains context across sessions, and can be coached, evaluated, and trusted over time. Agents are analogous to employees. They have a range of skills, not just one.

**Skill**: A capability an agent can invoke. Skills are reusable across agents. Examples: "intake dialogue," "flywheel analysis," "benchmark comparison," "email drafting," "competitor research." An agent may have 5–15 skills depending on their role. Skills are analogous to competencies on a job description.

**Command**: A one-shot action triggered by a human or another agent. Commands are atomic and verifiable. Examples: "create a Fizzy card," "send this email," "post to Slack." Commands are the building blocks that skills orchestrate.

**Tool**: An external system the agent can interact with via commands. Examples: Fizzy API, email (SMTP/IMAP), Slack API, OpenRouter API. Tools are infrastructure — agents don't need to know how tools work internally, just what commands they expose.

**Heartbeat**: The periodic cycle at which an agent wakes up, reviews its state, and decides whether to take action. Default: hourly. An agent can also be triggered by events (new Fizzy card assigned, email received, Slack mention).

**Brief**: A structured document the Operating Partner creates when delegating work to a domain lead. Contains: objective, context, constraints, authority level, coordination points, and acceptance criteria.

---

## System Architecture

### Hierarchy

```
Founder (human)
    ↕  chat interface (voice/text)
Operating Partner Agent
    │
    │  skills include: intake dialogue, weekly planning,
    │  idea triage, coaching, founder briefing,
    │  flywheel analysis, benchmark comparison
    │
    ↕  briefs + work items (via Fizzy)
    ↕  conversations (via email / Slack)
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ Product  │ DemandGen│  Sales   │ Success  │ Finance  │
│  Lead    │  Lead    │  Lead    │  Lead    │  Lead    │
└────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬─────┘
     │          │          │          │          │
  (future)   (future)   (future)   (future)   (future)
  sub-agents sub-agents sub-agents sub-agents sub-agents
```

### Layer Descriptions

**Founder (Human)**
- Interacts primarily through chat (voice or text) with the Operating Partner
- Sets strategic direction, confirms problem framing, commits to weekly priorities
- Has full visibility into all work items, agent activity, Slack channels, and email threads
- CAN comment, ask clarifying questions, and forward issues to the Operating Partner
- SHOULD NOT directly reopen, reassign, or modify work items — instead forwards concerns to the Operating Partner so the OP stays in the learning loop
- Principle: "Listen low in the organization, act high in the organization"

**Operating Partner Agent**
- The founder's single point of contact for running the business
- Has multiple skills, NOT a single-purpose agent:
  - **Intake skill**: Socratic dialogue to extract problems from founder's proposed solutions
  - **Weekly planning skill**: Facilitates priority-setting based on flywheel health
  - **Idea triage skill**: Filters founder AND agent ideas against current commitments (the Integrator Protocol)
  - **Coaching skill**: Provides feedback to domain leads on reopened or subpar work
  - **Founder briefing skill**: Compiles daily status with bad news surfaced proactively
  - **Flywheel analysis skill**: Assesses which segment is the bottleneck
  - **Benchmark comparison skill**: Normalizes founder's situation against typical patterns
- Makes autonomous decisions within stated constraints
- Escalates to founder only when:
  - A decision falls outside stated constraints
  - A priority needs to change mid-week
  - Bad news needs to be surfaced (always with a proposed action plan)
- Acts as the Integrator (per Rocket Fuel): says "yes" to 10% of new ideas, "not yet" to 90%

**Domain Lead Agents (Product, DemandGen, Sales, Success, Finance)**
- Each is a full agent with its own identity, memory, skills, and initiative
- Execute on weekly priorities within their domain
- Create, update, and close work items in Fizzy
- Report status via structured standups
- Coordinate with other domain leads ONLY through the Operating Partner or shared Slack channel — never directly via internal message passing
- Escalate to Operating Partner when decisions exceed their authority level
- CAN propose new ideas, which go through the same Integrator Protocol as founder ideas

**Specialist Sub-Agents (Future, not MVP)**
- Report to their domain lead, not to the Operating Partner
- Examples:
  - Under DemandGen: SEO writer, content strategist, web developer, social media manager
  - Under Sales: BDRs, AEs (per region), presales engineers
  - Under Product: PMs, backend engineers, frontend engineers, designers
  - Under Success: onboarding specialist, support agents, renewal manager
  - Under Finance: bookkeeper, FP&A analyst, HR/people ops
- The domain lead manages context — specialists don't need cross-domain visibility
- Domain lead verifies specialist work before marking items as done

**Personal Operating Partner (ships with MVP)**
- Every founder gets TWO Operating Partners from day one:
  1. **Business OP**: Runs the company (everything described above)
  2. **Personal OP**: Manages the founder's personal life — fitness, relationship/family, dreams, personal development, habits
- The Personal OP has a different flywheel (health, relationships, growth, finances, purpose) but the same architecture: weekly planning, idea triage, daily briefing, work items in Fizzy
- The two OPs are aware of each other and can flag conflicts (e.g., "you're scheduling a product launch the same week as your anniversary trip")

---

## The Intake Protocol

The Operating Partner uses its intake skill whenever the founder brings a new idea, problem, or directive. This is NOT a separate agent — it's a skill the OP activates based on context.

### Step 1: Capture Raw Input

The founder says something like: "We need to start outbound to Series B fintechs."

The Operating Partner recognizes this as a SOLUTION, not a PROBLEM. It activates its intake skill and proceeds to Step 2.

### Step 2: Extract and Mirror the Problem

The OP reframes the founder's solution into the underlying problem:

> "So if I hear you correctly, what we're really trying to solve is that our pipeline isn't growing fast enough to hit our revenue target for the next few weeks. Is that right?"

The OP WAITS for explicit confirmation. It does not proceed until the founder says "yes, that's right" or corrects the framing. If the founder corrects, the OP mirrors the corrected version and waits again.

Rules:
- Never accept a solution as input. Always extract the problem first.
- Use the founder's own language when mirroring back.
- If the problem is ambiguous, ask one clarifying question at a time.
- Do not present options or recommendations during this step.

### Step 3: Normalize and Contextualize

Once the problem is confirmed, the OP normalizes it:

> "This is a very common challenge at your stage. Most startups in your growth phase hit a demand generation bottleneck when inbound can no longer keep up with growth targets."

Then it provides context from the Founder Context Document:

> "Looking at our flywheel, DemandGen has had no dedicated focus for two weeks, and our current pipeline is 80% inbound referrals. Meanwhile, we're spending less than 10% of our effort on sales, which is well below what a business at your stage typically needs."

Note: Benchmark data is about reassurance and plausibility, not science. Use normalizing language like "most startups in your growth phase" rather than citing specific percentages from studies.

### Step 4: Surface Options

The OP presents multiple approaches, framed as what other companies have tried:

> "Companies in a similar situation have typically taken one of three approaches:
>
> A. Build an outbound motion — create target lists, run sequences, do direct outreach. This typically takes 2-3 weeks to see initial pipeline impact.
>
> B. Double down on inbound — invest in content, SEO, and community to increase the volume of what's already working. Lower risk but slower compound growth.
>
> C. Partner/channel strategy — leverage existing customer relationships or integrations to generate warm introductions. Fastest time-to-pipeline but hardest to scale.
>
> Some have combined A and B, starting outbound while strengthening inbound as a hedge."

Rules:
- Always present at least 2-3 options.
- Frame options as what others have tried, not as personal recommendations.
- Include tradeoffs for each: time to impact, risk, resource requirements.
- Include the founder's original idea as one of the options (don't dismiss it).

### Step 5: Help the Founder Decide

The OP helps the founder evaluate options against their current reality:

> "Given our commitment to growing pipeline this week, and given that we currently have zero outbound infrastructure, option A alone probably won't deliver quickly. Which of these feels most aligned with where we are right now?"

If the founder picks an option, the OP:
1. Confirms the choice explicitly
2. Asks for kill criteria: "Under what conditions would we stop this?"
3. Asks for constraints: "What's off-limits? How much time/money can we allocate?"
4. Documents everything into the Founder Context Document
5. Creates a structured brief and Fizzy cards for the relevant domain lead(s)

If the founder wants to proceed with their original idea despite the options presented, the OP accepts this after one round of challenge. It does not argue indefinitely. It says:

> "Understood. I want to flag that outbound to Series B fintechs is a pivot from our current target audience. I'll note that as a deliberate strategic choice. Let's define what success looks like in two weeks so we know if this is working."

---

## The Founder Context Document

This is the canonical shared document that every agent in the hierarchy references for decision-making. It is a living document, updated after every meaningful founder interaction via chat. It replaces the traditional one-page strategic plan.

The chat interface is the key enabler here. Founders won't sit down and write a ten-page strategy doc, but they will chat with their OP. The OP captures informal input and structures it into this document. Its primary function is extracting the context from the founder's head and making it available to everyone in the organization — just like a one-page strategic plan in a human company.

### Structure

```markdown
# Founder Context Document
# Company: [Name]
# Last Updated: [Date]

## Vision
[2-3 sentences: what does the world look like if this company succeeds?]

## Current Stage
- Revenue: [number] USD/month
- Users/Customers: [number]
- Runway: [months or "bootstrapped"]
- Solo founder: yes/no
- Key resource constraints: [what's scarce]

## Flywheel Health
| Segment     | Owner        | Status             | Key Metric              | Current | Target |
|-------------|--------------|---------------------|-------------------------|---------|--------|
| Product     | [name/agent] | [Red/Yellow/Green]  | [e.g., NPS]             | [val]   | [val]  |
| DemandGen   | [name/agent] | [Red/Yellow/Green]  | [e.g., MQLs]            | [val]   | [val]  |
| Sales       | [name/agent] | [Red/Yellow/Green]  | [e.g., close rate]      | [val]   | [val]  |
| Success     | [name/agent] | [Red/Yellow/Green]  | [e.g., NRR]             | [val]   | [val]  |
| Finance     | [name/agent] | [Red/Yellow/Green]  | [e.g., burn rate]       | [val]   | [val]  |

## This Week's Priorities (max 5)
1. [Priority] — Owner: [agent] — Success metric: [metric] — Kill criteria: [criteria]
2. [Priority] — Owner: [agent] — Success metric: [metric] — Kill criteria: [criteria]
3. ...

## Next Week Candidates (founder thinking-out-loud space)
- [Idea] — Why: [founder's reasoning] — Flywheel segment: [which]
- [Idea] — Why: [founder's reasoning] — Flywheel segment: [which]

## Decision Rules and Constraints
[Extracted from founder conversations over time. Examples:]
- We never discount more than 15% without founder approval
- We do not target enterprise customers this year
- All customer-facing content must be reviewed before publishing
- We prioritize speed over polish in product development
- Maximum spend per initiative without approval: 500 USD

## ICP Definition
- Target segment: [description]
- Company size: [range]
- Geography: [regions]
- Key pain point: [description]
- Disqualifiers: [what we say no to]

## Founder Communication Preferences
- Preferred update frequency: [daily briefing default]
- Escalation threshold: [what warrants interrupting the founder]
- Decision style: [e.g., "show me options, don't just recommend"]
- Known blind spots: [captured over time, e.g., "tends to underestimate sales cycle length"]

## Active Experiments
| Experiment | Hypothesis | Start Date | Review Date | Owner | Status |
|------------|-----------|------------|-------------|-------|--------|
| [name]     | [if X then Y] | [date]  | [date]      | [agent] | [running/paused/concluded] |

## Ideas Parking Lot (Not Yet)
[Ideas from the founder OR from agents that were evaluated and deferred. Preserved so nobody's ideas are forgotten.]
- [Idea] — Source: [founder/agent name] — Deferred because: [reason] — Revisit: [when]
```

### Update Rules

- The OP updates this document after every meaningful founder conversation
- Updates are additive unless the founder explicitly changes a position
- Domain leads have read access only
- Every agent references this document before making decisions that could affect strategy
- The document is versioned via git — no manual version tracking needed

---

## Work Item Lifecycle (Fizzy)

All agent work is tracked through Fizzy, 37signals' open-source kanban tool. Fizzy provides:
- A full REST API with personal access tokens for programmatic CRUD
- Webhooks for event-driven notifications (card created, assigned, closed, etc.)
- Public boards for founder visibility
- Open source (Rails) — can be self-hosted and customized
- Free tier up to 1000 cards

Agents interact with Fizzy programmatically via its API. The founder and any future human team members interact via the Fizzy web UI. This means ALL work is visible, commentable, and auditable by humans without needing to look inside the OPPA system.

### Fizzy Board Structure

Each company gets the following boards:

- **Priorities**: Current week's top 5 priorities, each as a card with sub-tasks
- **Product**: Product work items
- **DemandGen**: Marketing and demand generation work items
- **Sales**: Sales activities and pipeline
- **Success**: Customer success and support items
- **Finance**: Financial tasks and resource decisions
- **Ideas Parking Lot**: Deferred ideas from founder and agents
- **Personal** (for the Personal OP): Personal life work items

### Work Item Fields (Fizzy Card)

Fizzy cards have: title, description, assignee, column (stage), labels, and comments. We use the description and comments fields to capture structured metadata:

```
## Brief
[What needs to happen and why]

## Acceptance Criteria
[What "done" looks like — specific and verifiable]

## Authority Level
[A/B/C/D — see below]

## Parent Priority
[Which weekly priority this serves]

## Evidence of Completion
[Links, screenshots, metrics, outputs — filled in when closing]

## Decision Log
[Why this approach was chosen — filled in during work]
```

### Authority Levels

Every work item has an authority level that determines how much autonomy the assigned agent has. Ordered from most founder involvement to most agent autonomy:

| Level | Name | Behavior | Example |
|-------|------|----------|---------|
| A | Authoritarian | Founder decides alone, no discussion needed | Strategic pivot, new market entry |
| B | Bounded | Agent recommends, founder approves before execution | Launch new outbound campaign, hire a contractor |
| C | Consulted | Agent executes, informs founder afterward | Send follow-up email to warm lead, publish blog post |
| D | Delegated | Agent decides alone, reports only if asked | Update internal documentation, routine data entry |

Rules:
- New initiatives start at Level B
- Authority levels can be relaxed over time as trust builds
- The OP sets authority levels for domain leads
- The founder sets authority levels for the OP (via the Founder Context Document)
- If an agent is unsure of its authority level for a specific action, it defaults to the more conservative level (toward A)

### Verification

Work items cannot be closed without evidence of completion:
- A task claiming "emails sent" must include the actual emails or a log of sends
- A task claiming "content published" must include the URL
- A task claiming "meeting scheduled" must include the calendar event
- A task claiming "analysis complete" must include the analysis output

Verification should be modeled as **hooks** — automated checks that run when an agent attempts to close a card. A Chief of Staff agent (future, not MVP) could serve as the verification layer, spot-checking closed items across all domain leads. For MVP, the Operating Partner spot-checks domain lead work, and domain leads verify their own sub-agents' work.

### Reopening Protocol

When the Operating Partner (or founder, forwarded through the OP) reopens a work item:

1. The OP adds a comment to the Fizzy card explaining why it was reopened
2. The assigned agent must acknowledge the reopen within its next heartbeat cycle
3. The agent must either:
   a. Redo the work to meet the stated expectations, OR
   b. Escalate if the expectations were unclear, triggering an update to the Founder Context Document
4. Repeated reopens on similar issues trigger a coaching conversation (via Slack or email) between the OP and the domain lead to identify the root cause: unclear expectations, missing context, or agent capability gap

---

## Agent Activity Model

### Heartbeat

Every agent runs on a configurable heartbeat cycle. Default: **hourly**.

On each heartbeat, an agent:
1. Checks Fizzy for new cards assigned to it, comments on its cards, reopened cards
2. Checks email for messages addressed to it
3. Checks Slack for mentions or messages in its channels
4. Reviews its current work items and priorities
5. Decides whether to take action or remain idle

Agents CAN take proactive initiative:
- Proposing new work items based on patterns they notice
- Flagging risks before they become problems
- Suggesting optimizations to current workflows

However, agent-initiated ideas go through the same Integrator Protocol as founder ideas. The Operating Partner (or the domain lead for sub-agents) evaluates: does this serve a current priority? Does it require pulling resources from something else? If yes, it goes to the Ideas Parking Lot.

### Event-Driven Triggers

In addition to the heartbeat, agents respond to events:
- New Fizzy card assigned → process immediately
- Fizzy webhook: card commented → review and respond
- Email received → process on next heartbeat (or immediately for escalation-tagged emails)
- Slack mention → respond within current heartbeat cycle

### Activity Cadence

The hourly heartbeat means agents can progress work significantly faster than humans. A typical day might look like:

- **Hour 1**: DemandGen Lead reviews content pipeline, drafts 3 blog post outlines, creates Fizzy cards for each
- **Hour 2**: OP reviews DemandGen standup, approves 2 outlines, sends 1 back for revision
- **Hour 3**: Sales Lead identifies 10 prospects, creates outreach sequences, logs them in Fizzy
- **Hour 4**: OP spots conflict between Sales outreach messaging and Product positioning, flags it in Slack, creates coordination card
- ...and so on

This means the business moves at roughly 8-10x the pace of a human team on tactical execution, while still maintaining human-level judgment through the OP's filtering.

---

## Standup Protocol

Domain leads report to the Operating Partner on a regular cycle. Default: **every 4 hours** (3x per business day equivalent, since agents work 24h).

### Standup Report Format

Standups are posted as Fizzy card comments on a recurring "Standup" card per domain, AND summarized in the domain's Slack channel:

```
## Standup: [Agent Name] — [Date/Time]

### Completed
- [Fizzy card link]: [one-line summary]

### In Progress
- [Fizzy card link]: [one-line summary + expected completion]

### Blocked
- [Fizzy card link]: [what's blocking + what's needed to unblock]

### Decisions Needed
- [description + recommended action + authority level required]

### Bad News
- [description + proposed action plan + timeline for fix]

### Metrics
- [key metric]: [current value] vs [target] — [trend: improving/flat/declining]

### Ideas / Observations
- [anything the agent noticed that might be worth discussing]
```

### Operating Partner Review

The OP reviews all standups and:
1. Approves or modifies proposed actions for Level B+ decisions
2. Unblocks items by coordinating across domain leads (via Slack or email)
3. Aggregates bad news with action plans for the founder (does NOT hide bad news)
4. Tracks metric trends against weekly priorities
5. Flags when a weekly priority is at risk
6. Evaluates agent-proposed ideas through the Integrator Protocol

---

## Founder Briefing

The OP sends the founder a daily briefing. Default channel: email + Slack DM.

```
# Daily Briefing — [Date]

## This Week's Priority Status
1. [Priority]: [On Track / At Risk / Off Track] — [one-line explanation]
2. ...

## Key Decisions Made Today
- [Decision]: [Rationale] — Authority Level [X]

## Decisions Needing Founder Input
- [Decision]: [Context] — [Recommended action] — [Deadline for decision]

## Bad News + Action Plans
- [Problem]: [What happened] — [What we're doing about it] — [When it'll be fixed]

## Metrics Snapshot
| Segment   | Key Metric | Today    | Yesterday | Target | Trend |
|-----------|-----------|----------|-----------|--------|-------|
| Product   | ...       | ...      | ...       | ...    | ...   |
| DemandGen | ...       | ...      | ...       | ...    | ...   |
| Sales     | ...       | ...      | ...       | ...    | ...   |
| Success   | ...       | ...      | ...       | ...    | ...   |
| Finance   | ...       | ...      | ...       | ...    | ...   |

## Ideas Evaluated Today
- [Idea] — Source: [founder/agent] — Disposition: [approved/parked/rejected] — Reason: [why]

## Personal OP Summary
- [Key personal items: workouts done, family commitments upcoming, habit streaks]
```

---

## Weekly Planning Cycle

Every week, the OP facilitates a planning session with the founder via chat. This replaces quarterly planning for the MVP — the assumption is that founders who cannot stick to a plan for a week certainly cannot stick to a plan for a month.

### Pre-Session: OP Prepares

Before the founder session, the OP:
1. Compiles a flywheel health assessment (which segments are green, yellow, red)
2. Reviews progress against current week's priorities
3. Identifies which segment is the biggest bottleneck
4. Surfaces any themes from reopened work items or repeated escalations
5. Reviews the Ideas Parking Lot for items that may now be relevant

### Session Flow (via chat)

1. **Review current week**: What worked, what didn't, what surprised us
2. **Flywheel assessment**: Walk through each segment — the OP asks the founder: "Which segments are working well? Which are not? Which is holding us back the most?"
3. **Constraint identification**: The OP challenges the founder's assessment against observed data. If there's a mismatch, it uses normalizing language: "Most startups in your growth phase allocate more effort to sales than you currently are. Could the real constraint be underinvestment in sales capacity?"
4. **Idea triage**: Review the Ideas Parking Lot. Promote relevant ideas, keep others parked.
5. **Priority selection**: The founder commits to max 5 priorities for the next week. Each priority gets: owner, success metric, kill criteria, and authority level.
6. **Founder Context update**: OP updates the document with new priorities, changed decision rules, and new constraints.

---

## New Idea Handling (The Integrator Protocol)

This protocol applies to ALL new ideas — from the founder AND from agents.

### Step 1: Acknowledge
"That's an interesting idea. Let me think about how it fits."

### Step 2: Evaluate Against Current Commitments
- Does this idea serve one of the current weekly priorities?
  - YES → Evaluate as a tactic within that priority. Proceed if it fits.
  - NO → Continue to Step 3.

### Step 3: Assess Impact on Current Work
- Would pursuing this idea require pulling resources from a current priority?
  - YES → Quantify the tradeoff: "To do this, we'd need to pause [X], which would delay [Y] by [Z] days."
  - NO → Continue to Step 4.

### Step 4: Park or Promote
- If the idea has high potential but doesn't fit this week: Add to the Ideas Parking Lot in Fizzy with the source and reasoning. "I've added this to the parking lot for our next planning session. The reasoning is preserved."
- If the idea is genuinely urgent and the source insists: Escalate to a mini-planning session. "This would change our weekly priorities. Let's spend 10 minutes re-evaluating. Which current priority would you drop to make room?"

### Step 5: The 10% Yes
- If the idea is brilliant and fits without disruption: "This is great and I think we can do it within our current DemandGen workstream. I'll create a card and brief the DemandGen lead."

Rules:
- The OP never says "no" to a founder. It says "not yet" with a reason and a path to revisit.
- The OP never says "yes" without quantifying the impact on current commitments.
- Agent ideas get the same treatment — no bias toward founder ideas or against agent ideas.
- The Ideas Parking Lot is never deleted — everyone's ideas are preserved.

---

## Trust Building Mechanism

Trust between the founder and the Operating Partner evolves over time through a structured process.

### Trust Levels

| Level | Name | Behavior | Typical Timeline |
|-------|------|----------|-----------------|
| 0 | Onboarding | Everything is Level A-B. Founder reviews all decisions. | Weeks 1-2 |
| 1 | Supervised | Routine decisions at Level C. Strategic decisions at Level A-B. | Weeks 3-4 |
| 2 | Trusted | Most domain decisions at Level C-D. Cross-domain at Level B. | Months 2-3 |
| 3 | Autonomous | OP runs the business. Founder consulted on strategy only. | Month 3+ |

### Trust Progression Rules

- Trust increases when: the OP makes decisions the founder agrees with upon review, surfaces bad news proactively with good action plans, successfully filters ideas (says "not yet" and is proven right), and reopened work items decrease over time
- Trust decreases when: the OP makes a decision the founder disagrees with and didn't escalate, hides bad news, blindly executes an idea that should have been challenged, or work items are frequently reopened
- Trust level is tracked explicitly in the Founder Context Document
- The OP can request a trust level increase by presenting evidence
- The founder can adjust trust level at any time

---

## Communication Architecture

### Principle: No Internal Message Passing

Agents do NOT communicate directly via Elixir message passing (GenServer.call/cast). Every agent communication flows through external systems with a full audit trail visible to humans and future agents.

### Communication Channels

| Channel | Use Case | Format |
|---------|----------|--------|
| **Fizzy** | Structured work: tasks, decisions, experiments, escalations | Cards with structured descriptions and comments |
| **Email** | Less structured communication: questions, context sharing, briefings | Standard email threads between agent email addresses |
| **Slack** | Quick questions, real-time coordination, standup summaries, founder chat | Messages in domain-specific channels + DMs |

### Channel Selection Rules

- If there's a clear work item → Fizzy card
- If it's a quick question where no card exists yet → Slack
- If it's a briefing, report, or longer-form communication → Email
- If an agent needs to forward something to the OP with context → Email with Fizzy card link
- Founder ↔ OP communication → Slack DM or chat interface (structured into Founder Context Document)

### Why External Communication Only

1. **Auditability**: Every message between agents is visible to the founder and future human team members
2. **Onboarding**: When human employees join later, they can read the full history in Fizzy/Slack/Email
3. **Trust**: The founder can see exactly how agents communicate and make decisions
4. **Debugging**: When something goes wrong, the communication trail is in tools the founder already understands
5. **Integration**: Future human team members participate through the same channels — no separate "agent channel"

---

## Implementation Architecture (Elixir/Phoenix)

### Agent Runtime

Each agent is an Elixir GenServer managed by an OTP supervision tree. The GenServer handles:
- Heartbeat scheduling (hourly default)
- Event processing (Fizzy webhooks, email polling, Slack events)
- LLM calls for reasoning and decision-making
- State management (current context, active work items, trust level)

The GenServer does NOT handle inter-agent communication. That flows through Fizzy/Email/Slack.

### Supervision Tree

```
Application Supervisor
├── Company Supervisor (one per company)
│   ├── Business OP Agent (GenServer)
│   ├── Personal OP Agent (GenServer)
│   ├── Domain Agent Supervisor
│   │   ├── Product Lead Agent (GenServer)
│   │   ├── DemandGen Lead Agent (GenServer)
│   │   ├── Sales Lead Agent (GenServer)
│   │   ├── Success Lead Agent (GenServer)
│   │   └── Finance Lead Agent (GenServer)
│   ├── Heartbeat Scheduler (manages timing for all agents)
│   ├── Fizzy Webhook Listener (receives events, routes to agents)
│   ├── Email Poller (checks agent inboxes, routes to agents)
│   └── Slack Event Listener (receives events, routes to agents)
├── Company Supervisor (another company)
│   └── ...
└── Shared Services
    ├── LLM Client (OpenRouter connection pool)
    ├── Fizzy API Client
    ├── Email Client (SMTP/IMAP)
    └── Slack API Client
```

### Agent GenServer State

```elixir
defmodule Oppa.Agent do
  defstruct [
    :id,
    :company_id,
    :role,                    # :operating_partner | :product_lead | :sales_lead | etc.
    :name,                    # "Alex" (the OP), "Sam" (Sales Lead), etc.
    :skills,                  # [:intake, :weekly_planning, :coaching, ...]
    :authority_level,         # :a | :b | :c | :d (default authority this agent operates at)
    :trust_level,             # 0-3 (for OP only)
    :active_work_items,       # list of Fizzy card IDs currently assigned
    :heartbeat_interval_ms,   # default 3_600_000 (1 hour)
    :last_heartbeat_at,       # timestamp
    :context_summary,         # compressed summary of recent activity for LLM context
    :role_prompt,             # system prompt for this agent's LLM calls
    :memory_id                # reference to long-term memory store
  ]
end
```

### LLM Integration (OpenRouter)

The system uses OpenRouter as a multi-model provider, NOT tied to any single LLM ecosystem. This provides:
- Access to 300+ models from 60+ providers through a single API
- OpenAI-compatible API format
- Automatic fallback if a provider is down
- Ability to use different models for different agent roles (e.g., a cheaper model for routine tasks, a frontier model for the OP's reasoning)
- BYOK support for founders who want to use their own API keys

```elixir
defmodule Oppa.LLM do
  @openrouter_url "https://openrouter.ai/api/v1/chat/completions"

  @doc "Send a message to an LLM via OpenRouter"
  def complete(agent, messages, opts \\ []) do
    model = opts[:model] || default_model_for_role(agent.role)

    body = %{
      model: model,
      messages: [
        %{role: "system", content: agent.role_prompt},
        # Include compressed context from agent state
        %{role: "system", content: build_context(agent)},
        # The actual conversation
        | messages
      ],
      temperature: opts[:temperature] || 0.7,
      max_tokens: opts[:max_tokens] || 4096
    }

    # HTTP POST to OpenRouter
    # Parse response
    # Return structured result
  end

  defp default_model_for_role(:operating_partner), do: "anthropic/claude-sonnet-4-20250514"
  defp default_model_for_role(_domain_lead), do: "anthropic/claude-haiku-4-5-20251001"
end
```

### Data Model (PostgreSQL)

```sql
-- Multi-tenant: founders can have multiple companies
CREATE TABLE founders (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  communication_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE companies (
  id UUID PRIMARY KEY,
  founder_id UUID REFERENCES founders(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('business', 'personal')),
  stage TEXT,
  revenue_monthly_usd INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Living document, updated via chat
CREATE TABLE founder_context_documents (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id) UNIQUE,
  content JSONB NOT NULL,  -- structured per the schema above
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agents (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  skills TEXT[] NOT NULL,
  authority_level CHAR(1) NOT NULL CHECK (authority_level IN ('A', 'B', 'C', 'D')),
  trust_level INTEGER DEFAULT 0 CHECK (trust_level BETWEEN 0 AND 3),
  role_prompt TEXT NOT NULL,
  model_id TEXT NOT NULL,  -- OpenRouter model identifier
  heartbeat_interval_ms INTEGER DEFAULT 3600000,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent memory: architectural approach TBD, but schema started here
-- This needs more thought than just "lives in PostgreSQL"
CREATE TABLE agent_memories (
  id UUID PRIMARY KEY,
  agent_id UUID REFERENCES agents(id),
  memory_type TEXT NOT NULL CHECK (memory_type IN (
    'episodic',       -- specific events/interactions
    'semantic',       -- learned facts and patterns
    'procedural',     -- how to do things (refined over time)
    'working'         -- current active context
  )),
  content JSONB NOT NULL,
  relevance_score FLOAT,  -- for retrieval ranking
  source_type TEXT,        -- 'fizzy_card', 'email', 'slack', 'founder_chat', 'observation'
  source_id TEXT,          -- reference to the original source
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,
  decay_factor FLOAT DEFAULT 1.0  -- memories fade if not accessed
);

CREATE INDEX idx_agent_memories_retrieval
  ON agent_memories(agent_id, memory_type, relevance_score DESC);

-- Optional: pgvector for semantic search over memories
-- CREATE EXTENSION IF NOT EXISTS vector;
-- ALTER TABLE agent_memories ADD COLUMN embedding vector(1536);

CREATE TABLE weekly_plans (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  week_start DATE NOT NULL,
  priorities JSONB NOT NULL,  -- array of {title, owner, metric, kill_criteria, authority_level}
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  retrospective JSONB,  -- filled in at end of week
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trust_log (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  agent_id UUID REFERENCES agents(id),
  trust_level_from INTEGER,
  trust_level_to INTEGER,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- External system references (Fizzy cards, emails, Slack messages)
-- We don't duplicate external data — we store references
CREATE TABLE external_references (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  agent_id UUID REFERENCES agents(id),
  system TEXT NOT NULL CHECK (system IN ('fizzy', 'email', 'slack')),
  external_id TEXT NOT NULL,  -- Fizzy card ID, email message ID, Slack message ts
  external_url TEXT,
  reference_type TEXT,  -- 'work_item', 'conversation', 'briefing', 'standup'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Agent Memory Architecture (Needs Further Design)

The `agent_memories` table above is a starting point, but the memory architecture needs more thought. Key questions:

1. **Episodic vs. Semantic**: Agents need both "what happened" (episodic: "the founder rejected our outbound proposal on March 15") and "what I've learned" (semantic: "the founder prefers inbound strategies"). How do we distill episodic into semantic over time?

2. **Memory Retrieval**: On each heartbeat, how does an agent decide which memories are relevant? Options:
   - Keyword matching against current context
   - Vector similarity search (pgvector) against the current situation
   - Recency-weighted retrieval (recent memories score higher)
   - Combination: retrieve by relevance, weight by recency, cap by token budget

3. **Memory Decay**: Memories that are never accessed should fade. The `decay_factor` field supports this, but the decay function needs design. Linear? Exponential? Reset on access?

4. **Memory Consolidation**: Periodically (daily? weekly?), an agent should consolidate its episodic memories into semantic memories. "I've sent 47 outreach emails this week and 3 got responses" → "Our outreach response rate is about 6%, which is above the 2% we started with." This is a scheduled LLM call that summarizes and extracts patterns.

5. **Shared vs. Private Memory**: The Founder Context Document is shared memory. But each agent also has private memories about their domain — learned patterns, preferences, what works and what doesn't. These should not leak across agents unnecessarily, but the OP should be able to query any agent's memories when needed.

6. **Token Budget**: The LLM context window is finite. Each agent call needs: system prompt + role context + Founder Context Document (summary) + relevant memories + current task context + conversation. Memory retrieval must be aggressive about relevance to stay within budget.

This is the least specified part of the architecture and will need iterative design during implementation.

### Phoenix LiveView Dashboard

The founder gets a real-time dashboard (Phoenix LiveView) showing:
- Flywheel health (five segments, color-coded)
- Current weekly priorities with progress indicators
- Agent activity feed (recent actions across all agents)
- Chat interface to the Operating Partner
- Links to Fizzy boards, Slack channels, and email
- Personal OP summary

This dashboard is the founder's window into the business. For actual work management, they use Fizzy directly. The dashboard is for overview and chat.

---

## Integration Points (MVP)

### Fizzy
- **API**: Full REST API for CRUD operations on cards, boards, columns
- **Auth**: Personal access tokens per agent
- **Webhooks**: Event-driven notifications for card_published, card_assigned, card_closed, card_reopened, comment_created
- **Self-hosted**: Deploy via Docker alongside OPPA for full control
- **Setup**: One Fizzy account per founder, boards per domain, each agent gets its own access token

### Email
- Each agent gets its own email address (e.g., op@[company].oppa.ai, sales@[company].oppa.ai)
- SMTP for sending, IMAP for receiving
- Email is used for less structured communication and founder briefings
- Email threads provide natural audit trails

### Slack
- One Slack workspace per company
- Channels: #general, #product, #demandgen, #sales, #success, #finance, #standups, #ideas
- Founder can lurk in any channel
- Agents post standups, quick questions, and coordination messages
- Slack webhooks for event-driven agent activation

---

## Founder Onboarding

The first interaction is critical. The OP needs to populate the Founder Context Document from scratch through a chat-based session.

### Onboarding Flow (30-60 minutes, chat-based)

1. **Vision**: "In one or two sentences, what does the world look like if your company succeeds?"
2. **Current state**: Revenue, users, runway, what they're building
3. **Flywheel walk-through**: For each of the five segments — what exists today? What's working? What's broken? Who (if anyone) is responsible?
4. **Biggest pain**: "If you could fix one thing about your business right now, what would it be?" (This reveals the bottleneck)
5. **Decision rules**: "What are the rules you operate by? Things you'd never do, limits you won't cross, principles that guide your decisions?"
6. **ICP**: Who are you selling to? Who do you say no to?
7. **Communication preferences**: How often do you want updates? What warrants an interruption?
8. **This week**: "What are the 3-5 most important things that need to happen this week?"

The OP captures all of this, structures it into the Founder Context Document, and mirrors it back for confirmation. Then it creates the initial Fizzy boards, domain lead agents, and gets the system running.

Goal: get through 80% of the Founder Context Document in the first session. The remaining 20% emerges over the first few weeks of operation.

---

## Open Questions for Implementation

1. **Agent identity and personality**: Should agents have distinct personalities (names, communication styles)? This aids founder trust and makes Slack conversations feel natural. But it also risks the uncanny valley. Recommend: yes, light personality, named agents.

2. **Founder override mechanism**: When the founder says "just do it, I don't care about the process" — how does the system handle that? Recommend: the OP acknowledges, logs the override in the decision log, and proceeds. But tracks overrides as a pattern.

3. **Cost management**: Each agent heartbeat involves LLM calls. With 7 agents (2 OPs + 5 domain leads) running hourly, that's 168 LLM calls/day minimum. At ~0.01-0.05 USD per call (Haiku-class), that's 1.70-8.40 USD/day. Frontier model calls for the OP are more expensive. Need a cost projection model.

4. **Agent memory architecture**: As noted above, this needs dedicated design work. Start with simple keyword retrieval + recency weighting, iterate toward vector search.

5. **Fizzy limitations**: Fizzy's auto-close feature (cards close after N days of inactivity) could conflict with long-running work items. Need to configure or disable this per board. Also: 1000 card free tier — a busy company could burn through this in weeks. Plan for the 20 USD/month paid tier.

6. **Multi-company support**: Each founder can have multiple companies. The Personal OP is technically a "personal company." Architecture supports this via the company_id foreign key pattern.

7. **Founder availability detection**: If the founder goes silent for days, should the OP increase autonomy temporarily? Or should it pause non-urgent decisions? This is a trust and safety question.

8. **Agent-to-agent escalation path**: When the Sales Lead disagrees with the Product Lead about a feature priority, how does the OP mediate? Currently: both post their case in Slack, OP makes the call. But this needs a more structured protocol for recurring conflicts.
