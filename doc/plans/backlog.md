# Paperclip UI/UX Backlog

Running list of improvement requests. Move to a dated plan doc when ready to implement.

---

## UI Improvements

### 1. `issuePrefix` editable in Company Settings
**Where:** Company Settings → General  
**Request:** Add an editable field for the issue prefix (e.g. MSA, RSM). Currently only settable at company creation time; changes require direct DB access.  
**Additional:** When the prefix is changed, also update the `identifier` field on all existing issues for that company to reflect the new prefix.  
**Discovered:** 2026-04-04 during onboarding of Midstage Accelerator and Rainbow Startup Mafia.

### 3. AI-generated task descriptions that users can edit
**Where:** Onboarding wizard → Step 3 (Task) and New Issue dialog  
**Request:** When a user types a task title, the system should auto-generate a suggested description using the LLM. The user can accept, edit, or ignore it. Reduces friction for new users who aren't sure what to put in the description.  
**Additional:** Same pattern applies to the New Issue dialog throughout the app, not just onboarding.  
**Discovered:** 2026-04-04 during onboarding.

### 2. Agent capabilities/job description missing from onboarding wizard
**Where:** Onboarding wizard → Step 2 (Agent)  
**Request:** The wizard creates an agent but never sets the `capabilities` field. The agent has no standing role description. The "Description" field on Step 3 (Task) is ambiguous — it feels like it describes the agent but actually describes the first issue.  
**Additional:** Step 3 description label and placeholder text should clarify it is task-specific context, not a role definition. A "Role & responsibilities" field should be added to Step 2. Consider AI-generating the capabilities from the agent name.  
**Discovered:** 2026-04-04 during onboarding.
