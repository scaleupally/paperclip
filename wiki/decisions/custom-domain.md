---
type: decision
topic: Custom Domain
updated: 2026-04-12
related: [[decisions/workspace-setup]]
source_files: [".planning/phases/01-production-infrastructure/01-CONTEXT.md", ".planning/phases/01-production-infrastructure/01-02-PLAN.md", ".planning/phases/01-production-infrastructure/01-SMOKE-REQUIREMENTS.md"]
---

# Custom Domain

## Current decision

Configure `agents.midstage.ac` as a custom domain on `paperclip-icy-fog-8513`. Both the custom domain and the `.fly.dev` domain must work. Update `PAPERCLIP_ALLOWED_HOSTNAMES` secret to include the custom domain.

## Rationale

Roland controls DNS for midstage.ac. Fly.io issues TLS certificates via Let's Encrypt. `force_https = true` is already in `[http_service]` so both domains get HTTPS automatically.

`PAPERCLIP_ALLOWED_HOSTNAMES` (parsed at `server/src/config.ts` line 215) must include `agents.midstage.ac` — if it doesn't, the app returns 400/403 or redirect loops on custom domain requests.

## Implementation Steps

```bash
# 1. Request cert
fly certs add agents.midstage.ac --app paperclip-icy-fog-8513

# 2. Get CNAME validation target
fly certs show agents.midstage.ac --app paperclip-icy-fog-8513

# 3. Roland adds DNS: agents.midstage.ac CNAME paperclip-icy-fog-8513.fly.dev

# 4. Update allowed hostnames (set both to be safe)
fly secrets set PAPERCLIP_ALLOWED_HOSTNAMES="agents.midstage.ac,paperclip-icy-fog-8513.fly.dev" \
  --app paperclip-icy-fog-8513
```

## Common Pitfall

If `agents.midstage.ac` is not added to `PAPERCLIP_ALLOWED_HOSTNAMES`, browser shows CORS error or redirect loop despite DNS and cert being correct.

## History

- 2026-04-12: Custom domain requirement added to Phase 1 scope (Roland controls midstage.ac)
- 2026-04-12: Implementation steps defined in 01-02-PLAN.md (Wave 2, Task 1)

## Open threads

- [ ] Verify current value of `PAPERCLIP_ALLOWED_HOSTNAMES` (redacted in fly secrets list) before setting
- [ ] DNS CNAME record must be added by Roland manually — part of Plan 02 human checkpoint
