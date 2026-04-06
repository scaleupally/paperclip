# Firebench — Product Requirements Document
# Internal Architecture Codename: OPPA (Operating Partner & Proactive Ally)

## One-Line Description

A visual priority tool for solo founders that secretly gives them an AI operating team.

---

## The Problem

Solo founders of early-stage tech companies (0–1M USD ARR) are drowning. They juggle ten or more priorities in their head. They can't afford to hire. They know AI can help but don't know how to organize it. They've tried using LLMs for advice, but advice isn't execution. What they need is someone who can look at their business, identify the one thing that matters most right now, and actually go do it.

Meanwhile, the traditional coaching and consulting market is shrinking. Fewer startups are getting funded outside AI. Founders who do get funded are using AI for day-to-day decision-making and hiring fewer humans, reducing the alignment problems that coaches traditionally solve. The opportunity is not in coaching — it's in execution.

## The Insight

Every startup has a flywheel with five segments: Product, Demand Generation, Sales, Customer Success, and Finance/Resourcing. At any given moment, one segment is the bottleneck — the constraint holding everything else back. Fix that constraint and the whole flywheel accelerates. Then a new constraint surfaces. Fix that one. Repeat.

Solo founders intuitively know this but can't see it clearly because everything feels urgent. They jump to solutions without diagnosing the real problem. They spread their attention across too many priorities instead of focusing energy on the one that matters.

Firebench makes the constraint visible, then removes it.

## The Product

Firebench looks like a visual priority management tool. Founders come in thinking "finally, a way to get priorities out of my head." What they actually get is an AI operating team that identifies their biggest constraint and executes on removing it.

### The Trojan Horse

The entry point is simple and low-commitment: "Put your startup on the Firebench. Stop juggling priorities in your head."

The founder sees a clean visual interface — their five-segment flywheel. Through a chat conversation with the Operating Partner (OP), the flywheel fills itself in. The founder watches their messy thoughts become a structured picture of their business. The OP highlights the constraint. Then the OP says: "I'm going to assign an agent to work on this."

Actual work starts happening.

The founder came for a priority tool. They got an operating team.

### The Trust Ramp

This design solves the trust problem naturally:

1. **Low commitment**: Founder just organizes priorities — no risk, no delegation required
2. **Trust builds**: The OP asks good questions, mirrors back the real problem, the founder feels understood
3. **First delegation**: One agent starts doing real work on the identified constraint — founder sees output
4. **Trust deepens**: The agent produces results, the founder relaxes, authority levels shift
5. **Full operating team**: Over time, more agents activate as more constraints are identified and resolved

The founder never has to make a big leap of faith. Trust accumulates through repeated small demonstrations of competence.

---

## Target User

Solo founders of a tech business, 0–1M USD ARR, without a team of humans, who want to avoid building a team of humans and are all-in on AI instead.

They are typically:
- Technical enough to set up and use the product
- Doing everything themselves — product, marketing, sales, support, bookkeeping
- Drowning in execution, not strategy
- Unable or unwilling to hire humans at this stage
- Have tried using LLMs for advice but are frustrated that advice isn't execution
- Looking for leverage, not just another tool

Over time, the system will add features to manage human team members alongside AI agents. This is NOT in the MVP.

---

## Terminology

**Agent**: A persistent entity with identity, memory, initiative, and a range of skills. Agents have roles (e.g., "DemandGen Lead"), take proactive action on a heartbeat cycle, maintain context across sessions, and can be coached and trusted over time. Analogous to an employee with a job description and a range of competencies.

**Skill**: A capability an agent can invoke. Reusable across agents. Examples: "constraint identification," "content writing," "outreach sequence design," "competitor research." Analogous to competencies on a job description.

**Command**: A one-shot action triggered by a human or agent. Atomic and verifiable. Examples: "create a Fizzy card," "send this email," "post to Slack." Building blocks that skills orchestrate.

**Tool**: An external system agents interact with via commands. Examples: Fizzy API, email (SMTP/IMAP), Slack API, OpenRouter API.

**Heartbeat**: The periodic cycle at which an agent wakes up, reviews state, and decides whether to act. Default: hourly. Also triggered by events (new Fizzy card, email received, Slack mention).

**Brief**: A structured document the OP creates when delegating work to a domain lead. Contains: objective, context, constraints, authority level, acceptance criteria.

**Constraint**: The one segment of the flywheel that is currently the biggest bottleneck. Derived from Theory of Constraints — there is always exactly one constraint that, if resolved, would make the most difference.

**Firebench**: The product name. What founders see and buy.

**OPPA**: Internal architecture codename. The operating partner pattern that powers Firebench.

---

## System Architecture

### The Flywheel

The five-segment flywheel is the core mental model of Firebench:

```
┌─────────────┐
│   PRODUCT    │ ← Build something people want
└──────┬───────┘
       │
       ▼
┌─────────────┐
│  DEMAND GEN  │ ← Make people aware it exists
└──────┬───────┘
       │
       ▼
┌─────────────┐
│    SALES     │ ← Convert interest into revenue
└──────┬───────┘
       │
       ▼
┌─────────────┐
│   SUCCESS    │ ← Keep customers, grow accounts
└──────┬───────┘
       │
       ▼
┌─────────────┐
│   FINANCE    │ ← Manage resources, fund growth
└──────┬───────┘
       │
       └──────────► back to PRODUCT
```

At any moment, one segment is RED — the constraint. The others are YELLOW or GREEN. All energy focuses on turning the RED segment to at least YELLOW. Then the next constraint reveals itself.

### Agent Hierarchy

```
Founder (human)
    ↕  Firebench UI (visual flywheel + chat)
Operating Partner Agent (OP)
    │
    │  Skills: constraint identification, problem extraction,
    │  idea triage (Integrator), founder briefing, coaching,
    │  weekly planning, flywheel analysis
    │
    ↕  Briefs + work items (via Fizzy)
    ↕  Conversations (via email / Slack)
    │
    └──► ONE active domain lead at a time (based on constraint)
         ┌──────────┐
         │ [Active]  │  e.g., DemandGen Lead
         │ Domain    │  Executes on removing the current constraint
         │ Lead      │  Reports to OP via Fizzy/Slack/Email
         └──────────┘

    Inactive domain leads exist as defined roles but are not
    activated until their segment becomes the constraint.

    Future: sub-agents under each domain lead
    (SEO writer, BDR, backend engineer, etc.)
```

### Key Architectural Principle: One Constraint, One Active Agent

The MVP does NOT spin up five domain lead agents simultaneously. The OP identifies the constraint, activates the one domain lead agent for that segment, and focuses all execution capacity on removing the constraint.

When the constraint shifts (demand gen is no longer the bottleneck, but sales conversion is), the OP activates the Sales Lead and deprioritizes the DemandGen Lead. The DemandGen Lead doesn't disappear — it moves to a maintenance heartbeat (less frequent, monitoring only).

This mirrors how effective solo founders actually work: all energy on the one thing that matters most, then shift.

### Layer Descriptions

**Founder (Human)**
- Interacts through the Firebench UI: visual flywheel dashboard + chat with OP
- Sees priorities visualized, constraint highlighted, agent work in progress
- CAN comment, ask clarifying questions, and forward issues to the OP
- SHOULD NOT directly manage domain lead agents — works through the OP
- Principle: "Listen low in the organization, act high in the organization"

**Operating Partner Agent (OP)**
- The founder's single point of contact
- Has multiple skills (not single-purpose):
  - **Problem extraction**: Mirrors back the PROBLEM behind the founder's proposed solution. Waits for confirmation before proceeding. Never accepts a solution as input.
  - **Constraint identification**: Maps the founder's situation onto the flywheel, identifies the bottleneck. Uses normalizing language ("Most startups in your growth phase experience this") rather than hard benchmarks.
  - **Idea triage (Integrator Protocol)**: Filters new ideas from founder AND agents against current constraint focus. Says "yes" to 10%, "not yet" to 90%. Never says "no" — says "not yet" with a reason and a path to revisit.
  - **Weekly planning**: Facilitates a lightweight weekly check-in. Did the constraint shift? Is the current focus still right? Any new information that changes the picture?
  - **Founder briefing**: Daily summary of progress on constraint removal, bad news surfaced proactively with action plans.
  - **Coaching**: Provides feedback to domain leads on subpar work. Reopens Fizzy cards with explanations.
- Acts as the Integrator (per Rocket Fuel): protects constraint focus from founder's constant flow of new ideas
- Surfaces bad news early, always with a proposed action plan

**Domain Lead Agent (one active at a time in MVP)**
- Full agent with identity, memory, skills, and initiative
- Executes on removing the current constraint within its domain
- Creates, updates, and closes work items in Fizzy
- Reports status via structured standups (every 4 hours)
- Escalates to OP when decisions exceed authority level
- CAN propose new ideas — goes through same Integrator Protocol as founder ideas
- Has domain-specific skills depending on role:
  - **Product Lead**: user research, feature scoping, technical specification, bug triage
  - **DemandGen Lead**: content strategy, SEO, social media, email marketing, community
  - **Sales Lead**: prospecting, outreach sequences, pipeline management, demo prep
  - **Success Lead**: onboarding, support, retention analysis, upsell identification
  - **Finance Lead**: bookkeeping, cash flow tracking, pricing analysis, resource allocation

**Personal Operating Partner (ships with MVP)**
- Every founder gets TWO Operating Partners from day one:
  1. **Business OP**: Runs the company (everything above)
  2. **Personal OP**: Manages the founder's personal life — fitness, relationships/family, dreams, personal development, habits
- The Personal OP uses a different flywheel (health, relationships, growth, finances, purpose) but the same constraint-first approach
- The two OPs are aware of each other and can flag conflicts (e.g., "you're scheduling a product launch the same week as your partner's birthday")

---

## The Founder Experience

### Day 1: Onboarding (chat-based, 15-20 minutes)

The founder opens Firebench and sees an empty flywheel. The OP starts a conversation:

> "Hey, welcome to Firebench. I'm your operating partner. Instead of filling out a bunch of forms, let's just talk. What's going on with your business right now? What's keeping you up at night?"

The founder vents. They talk about their product, their struggles, their ambitions. The OP listens, asks follow-up questions, and gradually fills in the flywheel visualization in real-time as the conversation progresses.

> "So it sounds like your product is solid — users who find it love it. But almost nobody is finding it. Your demand generation is basically word of mouth and it's not scaling. Meanwhile, you're spending most of your time on product improvements that your existing handful of users aren't even asking for. Does that sound right?"

Founder: "Yeah, that's exactly it."

The DemandGen segment turns RED. The OP says:

> "Alright. Demand generation is your constraint right now. Everything else is secondary until we fix this. I'm going to activate a DemandGen agent to start working on this. By tomorrow you'll see initial work in your task board. Sound good?"

That's it. No lengthy intake protocol. No filling out a context document. Just a conversation that turned into a diagnosis and an action.

The Founder Context Document gets populated in the background from this conversation. The founder never sees or manages it directly.

### Day 2-7: First Constraint Removal

The DemandGen Lead is active. Within the first few hours:
- Creates a Fizzy board with initial work items: content audit, competitor analysis, channel assessment
- Posts an initial plan in Slack: "Here's my assessment of where to focus demand gen efforts. I'm starting with [X] because [reason]. I'll have first outputs by end of day."
- Starts producing actual work: blog post drafts, social media content, outreach templates, SEO analysis

The OP sends a daily briefing:

> "Daily Briefing — Day 2
>
> Constraint: Demand Generation (RED)
>
> Progress: DemandGen agent completed competitor content audit. Found that none of your competitors are producing content on [topic]. First blog post draft is ready for your review in Fizzy. Outreach sequence for [target audience] is in progress.
>
> Decision needed: Should we prioritize SEO-driven content (slower ramp, compounds over time) or direct outreach (faster pipeline, doesn't compound)?
>
> Bad news: None today.
>
> Personal OP: You skipped your workout yesterday. Rescheduled for this morning."

### Week 2+: Constraint Shifts

The DemandGen work starts producing results — traffic increases, leads come in. But now the founder notices they can't convert those leads. Sales is the new bottleneck.

The OP identifies the shift in the weekly planning chat:

> "Looking at this week: demand gen is working — we're seeing 3x more inbound than two weeks ago. But conversion is flat. It looks like the constraint has shifted from demand gen to sales. I'd like to activate the Sales agent to focus on conversion. The DemandGen agent will move to maintenance mode — keeping the content pipeline running but not expanding. Does that feel right?"

The flywheel visualization updates. Sales turns RED. DemandGen moves to YELLOW.

### Ongoing: The Integrator in Action

The founder has a new idea every day. The OP handles it:

Founder: "I just saw a competitor launch a mobile app. We should build a mobile app."

OP: "Interesting. So if I hear you correctly, the concern is that competitors are getting ahead on mobile and you might lose users. Is that right?"

Founder: "Well, yeah, and also I think our users would love it."

OP: "Got it. Right now our constraint is sales conversion. Building a mobile app would pull Product focus away from the conversion improvements we're working on. I'd like to park this idea for when the sales constraint is resolved — it might actually help with retention when we get to that stage. I've added it to the Ideas Parking Lot with your reasoning. Sound good?"

Founder: "Yeah, fine."

The OP just protected the constraint focus without saying "no."

---

## Communication Architecture

### Principle: No Internal Message Passing

All agent communication flows through external systems with a full audit trail. Agents NEVER communicate via internal Elixir message passing.

| Channel | Use Case |
|---------|----------|
| **Fizzy** | Structured work: tasks, briefs, evidence of completion, standup summaries |
| **Email** | Longer-form communication: briefings, reports, context sharing |
| **Slack** | Quick questions, real-time coordination, founder chat, standup highlights |
| **Firebench UI** | Founder ↔ OP chat, flywheel visualization, constraint status |

### Why External Only

1. **Auditability**: Every message is visible to the founder
2. **Future-proofing**: When human team members join, they use the same channels
3. **Trust**: The founder can see exactly how agents think and decide
4. **Debugging**: When something goes wrong, the trail is in tools humans understand

---

## Work Tracking (Fizzy)

All agent work is tracked in Fizzy. Fizzy provides a full REST API, webhooks, personal access tokens, and is open source (Rails). Free tier up to 1000 cards, 20 USD/month for unlimited.

### Board Structure

- **[Constraint Segment]**: Active work items for the current constraint (e.g., "DemandGen" board)
- **Maintenance**: Low-priority ongoing tasks for segments not currently the constraint
- **Ideas Parking Lot**: Deferred ideas from founder and agents
- **Personal**: Personal OP work items

Boards are created and archived dynamically as constraints shift. When DemandGen is the constraint, the DemandGen board is front and center. When it shifts to Sales, the Sales board takes over.

### Work Item Structure (Fizzy Card Description)

```
## Brief
[What needs to happen and why — linked to the current constraint]

## Acceptance Criteria
[What "done" looks like — specific and verifiable]

## Authority Level
[A/B/C/D]

## Evidence of Completion
[Filled in when closing — links, outputs, metrics]
```

### Authority Levels

| Level | Name | Behavior | Example |
|-------|------|----------|---------|
| A | Authoritarian | Founder decides alone | Strategic pivot, new market entry |
| B | Bounded | Agent recommends, founder approves first | New campaign launch, significant spend |
| C | Consulted | Agent executes, informs founder after | Send outreach email, publish blog post |
| D | Delegated | Agent decides alone, reports only if asked | Update docs, routine research |

New work starts at Level B. Authority relaxes as trust builds.

### Verification Hooks

Work items cannot be closed without evidence. Verification runs as automated hooks when an agent attempts to close a Fizzy card:

- "Emails sent" → must include send log or screenshots
- "Content published" → must include URL
- "Analysis complete" → must include the analysis output
- "Meeting scheduled" → must include calendar event

For MVP, the OP spot-checks domain lead closures. Future: a Chief of Staff agent handles systematic verification.

### Reopening Protocol

1. OP adds a comment to the Fizzy card explaining why it was reopened
2. Assigned agent acknowledges on next heartbeat
3. Agent either redoes the work or escalates if expectations were unclear
4. Repeated reopens trigger a coaching conversation between OP and domain lead
5. Unclear expectations trigger an update to the Founder Context Document

---

## Agent Activity Model

### Heartbeat: Hourly + Event-Driven

Every agent runs on an hourly heartbeat. On each cycle:
1. Check Fizzy for new/updated/reopened cards
2. Check email and Slack for messages
3. Review current work items against the constraint focus
4. Decide whether to act or remain idle
5. If acting: execute, log in Fizzy, report in Slack

Agents also respond to events between heartbeats:
- Fizzy webhook (card assigned, commented) → process on next heartbeat or immediately for escalations
- Slack mention → respond within current cycle
- Email received → process on next heartbeat

### Proactive Initiative

Agents CAN take initiative — propose new work items, flag risks, suggest optimizations. But all agent-initiated ideas go through the Integrator Protocol. The OP (or domain lead for sub-agents) evaluates: does this serve the current constraint? If not, it goes to the parking lot.

### Standup Cadence

Domain leads report to the OP every 4 hours via Fizzy card comments + Slack summary:

```
## Standup: [Agent] — [Time]

### Done
- [Fizzy link]: [summary]

### In Progress
- [Fizzy link]: [summary + ETA]

### Blocked
- [Fizzy link]: [blocker + what's needed]

### Decisions Needed
- [description + recommendation + authority level]

### Bad News
- [problem + action plan + timeline]

### Ideas
- [observations worth discussing]
```

---

## Founder Briefing (Daily)

Default: daily via email + Slack DM.

```
# Daily Briefing — [Date]

## Constraint: [Segment] (RED)
[One-line status on constraint removal progress]

## Work Completed Today
- [item]: [outcome]

## Decisions Needed
- [decision]: [context] — [recommendation] — [deadline]

## Bad News
- [problem]: [action plan] — [timeline]

## Flywheel Snapshot
| Segment   | Status | Key Metric | Trend |
|-----------|--------|-----------|-------|
| Product   | 🟢/🟡/🔴 | ...     | ↑/→/↓ |
| DemandGen | 🟢/🟡/🔴 | ...     | ↑/→/↓ |
| Sales     | 🟢/🟡/🔴 | ...     | ↑/→/↓ |
| Success   | 🟢/🟡/🔴 | ...     | ↑/→/↓ |
| Finance   | 🟢/🟡/🔴 | ...     | ↑/→/↓ |

## Ideas Evaluated Today
- [idea] — Source: [who] — Disposition: [approved/parked] — Reason: [why]

## Personal
- [workout/habits/family items from Personal OP]
```

---

## Weekly Planning (Chat-Based, 10-15 Minutes)

Every week, the OP facilitates a lightweight check-in via chat:

1. **Constraint check**: Is the current constraint still the right focus? Did it shift?
2. **Progress review**: What got done on the constraint this week? What didn't?
3. **Flywheel scan**: Quick pass across all five segments — anything new surfacing?
4. **Idea triage**: Review parking lot — any parked ideas now relevant given the constraint?
5. **Next week focus**: Confirm or shift the constraint. One focus. One agent.
6. **Founder Context update**: Anything new the OP should know? Decision rules changed? New constraints or off-limits items?

This is NOT quarterly planning. It's a weekly pulse check. The assumption: founders who can't stick to a plan for a week can't stick to a plan for a quarter. Weekly rhythm teaches the discipline first.

---

## New Idea Handling (Integrator Protocol)

Applies to ALL new ideas — from the founder AND from agents.

### Step 1: Acknowledge
"Interesting idea. Let me think about how it fits."

### Step 2: Evaluate Against Current Constraint
- Does this idea help remove the current constraint?
  - YES → Evaluate as a tactic. If it fits, create a Fizzy card and proceed.
  - NO → Continue to Step 3.

### Step 3: Assess Disruption
- Would this pull focus away from the current constraint?
  - YES → Quantify: "To do this, we'd need to pause [X], which delays constraint removal by [Y]."
  - NO → Continue to Step 4.

### Step 4: Park or Promote
- High potential but wrong timing → Ideas Parking Lot with reasoning preserved
- Urgent and founder insists → Mini re-planning: "Which current work would you drop?"

### Step 5: The 10% Yes
- Brilliant and fits without disruption → "This supports our current constraint work. I'll create a card."

Rules:
- Never say "no." Say "not yet" with a reason and a revisit path.
- Never say "yes" without quantifying impact on constraint focus.
- Agent ideas get same treatment as founder ideas.
- Parking Lot is never deleted.

---

## Trust Building

### Trust Levels

| Level | Name | Behavior | Timeline |
|-------|------|----------|----------|
| 0 | Onboarding | Everything Level A-B. Founder reviews all. | Week 1 |
| 1 | Supervised | Routine at Level C. Strategic at A-B. | Weeks 2-3 |
| 2 | Trusted | Most domain work at C-D. Cross-domain at B. | Months 2-3 |
| 3 | Autonomous | OP runs the business. Founder on strategy only. | Month 3+ |

### Trust Increases When
- OP makes decisions the founder agrees with
- Bad news surfaced proactively with good action plans
- Ideas filtered well (parked ideas that would have been distractions)
- Work items closed cleanly, few reopens

### Trust Decreases When
- OP makes a decision founder disagrees with and didn't escalate
- Bad news hidden or discovered late
- Ideas blindly executed that should have been challenged
- Frequent reopens on similar issues

---

## Founder Context Document

This is the canonical shared document every agent references. It is populated AUTOMATICALLY from founder conversations — the founder never fills it out manually. The chat is the interface; the document is the structured output.

```markdown
# Founder Context — [Company Name]
# Auto-generated from conversations. Last updated: [Date]

## Vision
[2-3 sentences, extracted from onboarding and ongoing chats]

## Current Stage
- Revenue: [X] USD/month
- Users/Customers: [X]
- Runway: [months or "bootstrapped"]
- Key resource constraints: [what's scarce]

## Flywheel State
| Segment   | Status | Constraint? | Key Metric | Current | Notes |
|-----------|--------|-------------|-----------|---------|-------|
| Product   | 🟢/🟡/🔴 | Yes/No   | ...       | ...     | ...   |
| DemandGen | 🟢/🟡/🔴 | Yes/No   | ...       | ...     | ...   |
| Sales     | 🟢/🟡/🔴 | Yes/No   | ...       | ...     | ...   |
| Success   | 🟢/🟡/🔴 | Yes/No   | ...       | ...     | ...   |
| Finance   | 🟢/🟡/🔴 | Yes/No   | ...       | ...     | ...   |

## Current Constraint
[Which segment, why, what's being done about it]

## Decision Rules
[Extracted over time from conversations. Examples:]
- Never discount more than 15% without founder approval
- Don't target enterprise this year
- Speed over polish in product
- Max spend without approval: 500 USD

## ICP
- Target: [who]
- Pain point: [what]
- Disqualifiers: [who we say no to]

## Communication Preferences
- Update frequency: daily briefing
- Escalation threshold: [what warrants interruption]
- Decision style: [e.g., "show me options"]
- Known blind spots: [captured over time]

## Ideas Parking Lot
- [Idea] — Source: [who] — Parked: [date] — Reason: [why] — Revisit: [when]

## Constraint History
| Week | Constraint | Resolution | Outcome |
|------|-----------|------------|---------|
| W1   | DemandGen | Content + outreach | Traffic 3x, moved to Yellow |
| W2   | Sales     | Conversion optimization | In progress |
```

---

## Implementation Architecture (Elixir/Phoenix)

### Why Elixir

- Each agent is a GenServer with its own state, supervised by OTP
- If an agent crashes, it restarts without affecting others
- Hourly heartbeats are trivial with Process.send_after
- Phoenix LiveView powers real-time flywheel dashboard
- The BEAM VM was designed for exactly this: many concurrent, long-lived, independent processes communicating asynchronously

### What Elixir Does NOT Do

- Inter-agent communication (that's Fizzy/Email/Slack)
- LLM inference (that's OpenRouter)
- Work tracking (that's Fizzy)
- The Elixir layer is orchestration, scheduling, and state management — not a messaging bus

### Supervision Tree

```
Application Supervisor
├── Founder Registry (maps founders to their companies)
├── Company Supervisor (one per company, dynamically started)
│   ├── OP Agent (GenServer — Business)
│   ├── OP Agent (GenServer — Personal)
│   ├── Active Domain Lead Agent (GenServer — whichever segment is the constraint)
│   ├── Heartbeat Scheduler
│   ├── Fizzy Webhook Listener
│   ├── Email Poller
│   └── Slack Event Listener
├── Company Supervisor (another company)
│   └── ...
└── Shared Services
    ├── LLM Client (OpenRouter connection pool)
    ├── Fizzy API Client
    ├── Email Client (SMTP/IMAP)
    └── Slack API Client
```

### LLM Integration (OpenRouter)

OpenRouter provides a unified API to 300+ models from 60+ providers. OpenAI-compatible. Auto-fallback. BYOK support.

```elixir
defmodule Firebench.LLM do
  @openrouter_url "https://openrouter.ai/api/v1/chat/completions"

  def complete(agent, messages, opts \\ []) do
    model = opts[:model] || model_for_role(agent.role)

    body = %{
      model: model,
      messages: build_messages(agent, messages),
      temperature: opts[:temperature] || 0.7,
      max_tokens: opts[:max_tokens] || 4096
    }

    # POST to OpenRouter, parse response, return structured result
  end

  # OP gets a frontier model for judgment calls
  defp model_for_role(:operating_partner), do: "anthropic/claude-sonnet-4-20250514"
  # Domain leads get a fast/cheap model for execution
  defp model_for_role(_), do: "anthropic/claude-haiku-4-5-20251001"
end
```

Different models for different roles: the OP gets a frontier model because its job is judgment and nuance. Domain leads get a fast, cheap model because their job is execution within clear briefs.

### Data Model (PostgreSQL)

```sql
CREATE TABLE founders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Each founder can have multiple companies (business + personal + more)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID REFERENCES founders(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('business', 'personal')),
  current_constraint_segment TEXT CHECK (current_constraint_segment IN (
    'product', 'demandgen', 'sales', 'success', 'finance',
    'health', 'relationships', 'growth', 'personal_finance', 'purpose'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- The Founder Context Document is stored as the OP's context.md memory file.
-- This table is kept as a convenience view / denormalized copy for quick access
-- by all agents without querying the OP's memory files.
CREATE TABLE founder_context_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) UNIQUE,
  content TEXT NOT NULL DEFAULT '',  -- raw markdown, same as agent memory files
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  skills TEXT[] NOT NULL DEFAULT '{}',
  authority_level CHAR(1) NOT NULL DEFAULT 'B'
    CHECK (authority_level IN ('A', 'B', 'C', 'D')),
  trust_level INTEGER DEFAULT 0 CHECK (trust_level BETWEEN 0 AND 3),
  role_prompt TEXT NOT NULL,
  model_id TEXT NOT NULL DEFAULT 'anthropic/claude-haiku-4-5-20251001',
  heartbeat_interval_ms INTEGER DEFAULT 3600000,
  active BOOLEAN DEFAULT false,  -- only the constraint agent is active
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flywheel segment health, updated by OP
CREATE TABLE flywheel_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  segment TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unknown'
    CHECK (status IN ('red', 'yellow', 'green', 'unknown')),
  is_constraint BOOLEAN DEFAULT false,
  key_metric_name TEXT,
  key_metric_value TEXT,
  key_metric_trend TEXT CHECK (key_metric_trend IN ('up', 'flat', 'down')),
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, segment)
);

-- Constraint history — tracks what was worked on and what happened
CREATE TABLE constraint_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  segment TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolution_summary TEXT,
  outcome TEXT
);

-- Agent memory: file-based mental model stored in PostgreSQL for cloud durability.
-- Each row represents a "memory file" — plain markdown text that gets loaded
-- directly into LLM context windows. No JSONB, no vector search, no structured
-- queries on content. All retrieval intelligence lives in the Elixir layer.
-- The database is just durable storage for what are effectively markdown files.
CREATE TABLE agent_memory_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  path TEXT NOT NULL,         -- e.g., 'context.md', 'decisions.md', 'patterns.md'
  content TEXT NOT NULL,      -- raw markdown, loaded directly into LLM context
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, path)
);

-- External system references (Fizzy cards, emails, Slack messages)
CREATE TABLE external_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  agent_id UUID REFERENCES agents(id),
  system TEXT NOT NULL CHECK (system IN ('fizzy', 'email', 'slack')),
  external_id TEXT NOT NULL,
  external_url TEXT,
  reference_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly plans
CREATE TABLE weekly_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  week_start DATE NOT NULL,
  constraint_segment TEXT NOT NULL,
  focus_description TEXT,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'abandoned')),
  retrospective JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ideas parking lot (also tracked in Fizzy, but canonical here)
CREATE TABLE parked_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  title TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('founder', 'agent')),
  source_agent_id UUID REFERENCES agents(id),
  reasoning TEXT,
  parked_reason TEXT NOT NULL,
  revisit_when TEXT,
  promoted_at TIMESTAMPTZ,  -- null if still parked
  fizzy_card_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trust_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  agent_id UUID REFERENCES agents(id),
  trust_level_from INTEGER,
  trust_level_to INTEGER,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Agent Memory Architecture

Inspired by Nanoclaw's per-group CLAUDE.md pattern and Claude Code's Auto-dream consolidation, but adapted for cloud deployment on Fly.io where filesystems are ephemeral.

**Core principle:** Memory is stored as plain markdown text in PostgreSQL rows that mimic files. The database is just durable storage. All retrieval intelligence — deciding what's relevant, what to include in context, what to summarize — lives in the Elixir layer before the LLM call.

#### Memory File Structure Per Agent

Each agent gets a set of "memory files" (rows in `agent_memory_files`):

| Path | Purpose | Updated By |
|------|---------|-----------|
| `context.md` | Role context, current constraint, authority level, key relationships | OP updates from founder chat; domain leads update from OP briefs |
| `decisions.md` | Key decisions made and why, with absolute dates | Agent updates after each significant decision |
| `patterns.md` | Learned patterns: "founder prefers X," "outreach converts at Y%" | Consolidation job extracts from daily activity |
| `current-work.md` | Active task state: what's in progress, blocked, recently completed | Agent updates on each heartbeat |

The OP's `context.md` IS the Founder Context Document. It's the canonical source. Every other agent gets a *summary* of the OP's context.md injected into their own context.md — not the full thing.

#### How Memory Gets Built

Memory is NOT populated through a structured intake. It accumulates naturally:

1. **From founder chat**: The OP extracts implicit constraints, decision rules, and preferences from conversation and writes them to its context.md and decisions.md
2. **From Fizzy activity**: When an agent closes a card, creates a card, or gets a card reopened, it updates current-work.md and optionally patterns.md
3. **From Slack/email**: Coordination messages between agents get summarized into relevant memory files
4. **From consolidation**: A daily job reviews the day's activity and distills learnings

#### Consolidation (Daily, Per Agent)

Once per day, a consolidation job runs for each active agent. This is a single Haiku-class LLM call (~0.001 USD) that:

1. Reads the agent's current memory files
2. Scans the day's Fizzy cards, Slack messages, and emails involving this agent
3. Extracts new learnings and updates memory files:
   - Converts relative references to absolute ("yesterday's outreach" → "2026-03-29 outreach")
   - Removes facts contradicted by newer information
   - Merges overlapping entries
   - Prunes stale items (e.g., debugging notes for resolved issues)
4. If any memory file exceeds ~200 lines, the consolidation job summarizes and compresses

This is analogous to Claude Code's Auto-dream feature — "REM sleep for agents."

#### Memory Loading at Each Heartbeat

When an agent wakes up on its hourly heartbeat, the Elixir layer:

1. Loads ALL memory files for this agent from PostgreSQL (should be well under token limits with consolidation running)
2. For the OP: also loads a summary of each active domain lead's current-work.md
3. Assembles the LLM context window: system prompt + memory files + current task context + conversation
4. Calls OpenRouter with the assembled context

No vector search, no embedding retrieval, no semantic ranking. Just load the files. If memory files grow too large despite consolidation (unlikely for MVP), add keyword-based retrieval as the first optimization.

#### Memory Flow Between Agents

```
Founder chat
    │
    ▼
OP context.md ──(summary)──► Domain Lead context.md
OP decisions.md              Domain Lead decisions.md
OP patterns.md               Domain Lead patterns.md
                             Domain Lead current-work.md ──(standup)──► OP reviews
```

The OP is the bridge. When the founder changes a decision rule, the OP updates its own context.md, then pushes a summary update to the active domain lead's context.md. When a domain lead learns something (e.g., "cold email subject lines with questions get 2x opens"), it writes to its own patterns.md. The OP sees this via standup reviews and can propagate it to other agents when relevant.

#### What Happens When a Domain Lead is Deactivated

When the constraint shifts and a domain lead goes inactive:
- Its memory files are preserved in PostgreSQL
- When reactivated (weeks or months later), all memory files are still there
- The consolidation job runs immediately on reactivation to update stale references
- The OP pushes an updated context.md summary reflecting what changed while the agent was inactive

#### Open Memory Questions (resolve during implementation)

- Exact consolidation prompt template — what instructions produce the best pruning/merging
- Token budget allocation — how much context window per memory file vs. task vs. conversation
- Contradiction handling — when today's founder input contradicts last week's, how aggressively to overwrite

### Phoenix LiveView: The Firebench UI

The founder-facing interface is a Phoenix LiveView application:

1. **Flywheel View**: Five segments arranged visually, color-coded (red/yellow/green). The constraint segment is prominent. Clicking a segment shows detail: key metric, agent status, recent work items.

2. **Chat Panel**: Persistent chat with the OP. This is where the founder talks, vents, asks questions, proposes ideas. The OP responds. The Founder Context Document updates silently in the background.

3. **Activity Feed**: Real-time stream of agent actions — cards created, work completed, decisions made. Pulled from Fizzy webhooks.

4. **Briefing View**: Today's daily briefing, rendered from the OP's output.

5. **Parking Lot**: Visual list of parked ideas with source, reason, and revisit timing.

The LiveView updates in real-time as agents work. The founder can watch the constraint get worked on without refreshing.

---

## MVP Scope (M001)

Based on the business panel analysis: build OPPA on Monstro/Comentum as base. Archive Troupe as reference only.

### Repository Migration Plan

**Step 1: Rename Monstro → Firebench**
- Rename the Monstro/Comentum GitHub repo to `firebench`
- Rename the Elixir application: `Monstro` → `Firebench` (mix.exs, module names, config)
- Rename the Phoenix endpoint: `MonstroWeb` → `FirebenchWeb`
- Rename the database: `monstro_dev` / `monstro_prod` → `firebench_dev` / `firebench_prod`
- Update all internal references: Comentum, Monstro, ExecutionOS → Firebench
- Update GSD project: retire Monstro milestones, create "Firebench M001 — Constraint Engine + OP Chat"
- Update Doppler project name and environment variables

**Step 2: Assess Monstro Assets to Keep**
Monstro already has (per Meadows' panel analysis):
- Multi-tenant company model → **keep and adapt** (rename schemas, adjust for solo founder focus)
- AI coaching/conversation layer → **keep and adapt** (becomes the OP's chat skill)
- Node/OPSP model (partial Founder Context extraction) → **keep and adapt** (becomes memory file architecture)

Monstro assets to drop or redesign:
- Team-oriented coaching flows (target user is solo founder, not leadership team)
- Any quarterly planning scaffolding (weekly rhythm only for MVP)
- OPSP as a static document (replaced by living memory files)

**Step 3: Import Troupe Patterns (Reference Only)**
Troupe repo is archived (read-only, not deleted). Specific patterns to reference during implementation:
- Agent heartbeat/scheduling patterns (Cal/Sally/Pree architecture) → adapt for Firebench's GenServer heartbeat model
- Jira integration patterns → reference when building Fizzy API client (similar REST API patterns)
- Agent personality/identity patterns → reference for OP and domain lead personality design

Do NOT import Troupe code directly. The domain models are too different. Build fresh on Firebench's schema, using Troupe as a design reference only.

**Step 4: Archive Troupe**
- Set Troupe repo to archived/read-only on GitHub
- Add a README note: "Archived. Agent patterns from this project have been incorporated into Firebench. See github.com/[org]/firebench"
- Close all open Troupe GSD milestones and issues

### In Scope (M001)
- Firebench UI: flywheel visualization + chat with OP (Phoenix LiveView)
- Operating Partner agent with skills: problem extraction, constraint identification, idea triage, daily briefing, weekly planning
- ONE domain lead agent (activated based on identified constraint)
- Personal OP (lightweight — fitness, habits, personal priorities)
- Agent memory: PostgreSQL-backed markdown files, daily consolidation
- Fizzy integration: API client, webhook listener, board/card CRUD
- Slack integration: channels per domain, standup posting, founder DM
- Email integration: agent email addresses, briefing delivery
- OpenRouter LLM integration (model-agnostic)
- Founder onboarding flow (conversational, 15-20 minutes)
- Hourly heartbeat + event-driven triggers
- Authority levels A-D
- Trust level tracking (manual for MVP)
- Founder Context Document (auto-populated from chat, stored as OP's context.md)
- Deploy to Fly.io

### Out of Scope (Phase 2+)
- Multiple simultaneous domain lead agents
- Sub-agents under domain leads
- Automated trust level progression
- Chief of Staff verification agent
- Vector search over memories (pgvector)
- Human team member management
- Quarterly planning
- Multiple constraint focus (more than one RED segment)
- Self-hosted Fizzy (use fizzy.do hosted for MVP)

### Build Target
- Rename Monstro repo to `firebench`, update all Elixir module names
- Archive Troupe repo (reference only, not deleted)
- New GSD milestone: Firebench M001
- Get one real solo founder using it within 2 weeks of development start

---

## Open Questions

1. **Firebench brand and domain**: Is firebench.com / firebench.io available? The name needs to work as a URL.

2. **Agent personality**: Should agents have names and light personalities? Recommendation: yes — it makes Slack conversations feel natural and builds founder attachment. But keep it subtle. Reference Troupe's Cal/Sally/Pree patterns for inspiration.

3. **Cost model**: Hourly heartbeats across 3 agents (2 OPs + 1 domain lead) = ~72 LLM calls/day. At Haiku pricing that's under 2 USD/day. OP calls on Sonnet add maybe 3-5 USD/day. Daily consolidation adds ~0.01 USD. Total: ~5-7 USD/day per founder. Need to price accordingly.

4. **Memory consolidation prompt**: The daily consolidation job needs a well-tuned prompt that reliably prunes, merges, and compresses without losing critical information. This will require iteration during development — start with a simple "review and summarize" prompt, refine based on output quality.

5. **Memory token budget**: Need to establish per-agent token allocation. Rough estimate: system prompt (~500 tokens) + memory files (~2000 tokens) + task context (~1000 tokens) + conversation (~1000 tokens) = ~4500 tokens input per call. Leaves plenty of room in even small context windows. Monitor and adjust.

6. **Fizzy card limits**: Free tier is 1000 cards. A busy founder could hit this in weeks. Budget for 20 USD/month Fizzy per founder, or self-host from the start.

7. **Founder availability**: If the founder goes silent for days, should the OP increase autonomy or pause non-urgent work? Default: continue at current authority level, increase briefing urgency.

8. **Constraint disagreement**: What if the OP identifies demand gen as the constraint but the founder insists it's product? The OP makes its case once, accepts the founder's decision, logs it, and revisits in the weekly planning if results don't improve. Never argue indefinitely.

9. **Cross-constraint dependencies**: Sometimes the constraint can't be resolved without touching another segment (e.g., "we can't do demand gen without product improvements"). The OP should flag this as a compound constraint and propose a sequenced approach.

10. **Monstro migration complexity**: How much of Monstro's current schema, tests, and config can be renamed in place vs. needs rebuilding? The M002 architecture reset was already in progress — assess how much of that work applies to Firebench's schema before starting fresh.
