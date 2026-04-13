# Slack Plugin Handover — April 12 2026

## What was done this session

### 1. Restored /paperclip volume mount
- `fly.toml` was missing `[[mounts]]` after PGLite removal in Phase 1
- Re-added: `source = "paperclip" → destination = "/paperclip"`
- This is the standard Paperclip deployment pattern (confirmed from upstream docker-compose.yml)
- PAPERCLIP_HOME=/paperclip stores plugin installs, instance config, agent state
- Deployed and verified healthy at https://agents.midstage.ac/api/health
- Side effect: company logos were wiped (were in ephemeral storage) — Roland re-uploaded them

### 2. Installed paperclip-plugin-slack
- Plugin: https://github.com/mvanhorn/paperclip-plugin-slack (v2.0.6)
- Installed via Paperclip UI (Settings → Plugins)
- Created Slack app "Paperclip" (App ID: A0ASBG4070V) from manifest
- Created two Paperclip secrets via browser console:
  - Slack Bot Token → secret UUID: 55ac1779-61d4-4dc3-8ddd-e4995dad9950
  - Slack Signing Secret → secret UUID: 8ef30f7a-6247-43b7-b3b3-224ecd44acbb
- Plugin config saved with Paperclip Base URL = https://agents.midstage.ac
- Configuration test passed

### 3. Known issues

**Notifications not arriving in Slack (unresolved at session end)**
- Plugin shows config test passed but no notifications received yet
- Most likely cause: Paperclip bot not invited to the channel → run `/invite @Paperclip` in the channel
- Second possibility: plugin not in "Ready" state — check plugin page in Paperclip UI

**Event Subscriptions not configured (deferred to Tue)**
- Slack URL verification fails because Paperclip's webhook route always returns `{deliveryId, status}`
  instead of echoing the Slack challenge value
- The plugin worker also returns nothing for url_verification (just `return;`)
- Fix needed: server/src/routes/plugins.ts webhook route needs to support pass-through
  synchronous responses from the plugin worker
- Without this: users cannot type free-text replies to the bot
- Workaround in use: structured approval buttons (Approve/Reject) work fine via interactivity webhook

## What works right now
- Bot can send notifications to Slack (once channel invite issue resolved)
- Approve/Reject buttons on approval notifications
- /clip slash commands
- Plugin config: https://agents.midstage.ac → Settings → Plugins → Slack Chat OS

## What to do next session

### Immediate (verify notifications working)
1. In Slack: `/invite @Paperclip` in the default notification channel
2. Trigger a test: complete an issue or request an approval in Paperclip
3. Confirm notification appears in Slack

### Tuesday: Fix Event Subscriptions (bidirectional chat)
Fix in `server/src/routes/plugins.ts` webhook route (line ~2000):
- After `workerManager.call(...)`, check if result contains a `syncResponse` field
- If yes, use worker's response body/status instead of default `{deliveryId, status}`
- Also fix plugin worker (`src/worker.ts` in mvanhorn/paperclip-plugin-slack):
  - `url_verification` handler should return `{syncResponse: {status: 200, body: {challenge: body.challenge}}}`
  - But plugin is external — may need to fork or submit PR
- Once fixed, add Event Subscriptions in Slack app settings:
  - URL: https://agents.midstage.ac/api/plugins/paperclip-plugin-slack/webhooks/slack-events
  - Bot events: file_shared, app_mention

### Phase 1.5: Weekly Planning Agent
- Next major milestone per roadmap
- Will use Paperclip approval flow with Slack buttons for structured check-ins
- Bidirectional chat (Event Subscriptions) nice-to-have but not required for button-based flow

## Key references
- Production: https://agents.midstage.ac
- Fly app: paperclip-icy-fog-8513
- Slack app: https://api.slack.com/apps/A0ASBG4070V
- Company ID (Midstage Accelerator): e46b1e19-1ad7-4019-a8a6-fb7e9d3c295b
- Plugin webhook base: https://agents.midstage.ac/api/plugins/paperclip-plugin-slack/webhooks/
- Slack interactivity URL (already configured): .../webhooks/slack-interactivity
- Slack events URL (not yet verified): .../webhooks/slack-events
- Slack slash command URL (already configured): .../webhooks/slash-command
