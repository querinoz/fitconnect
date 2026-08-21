# ANDROID_INCIDENT_RESPONSE.md

**Status:** DRAFT — required for launch; **not sufficient alone** while Phase 13 incomplete.

## Severity levels

| Sev | Definition | Example |
|-----|------------|---------|
| SEV-1 | Data isolation / auth compromise / payments wrong | Cross-user telemetry leak |
| SEV-2 | Core journey down for many users | Login 100% fail |
| SEV-3 | Degraded non-critical feature | AI timeout spike |
| SEV-4 | Cosmetic / minor | Copy typo |

## Playbooks (detection → action)

### Critical crash / ANR spike
1. Detect: Play Vitals / crash sink (when wired) + support
2. Action: halt staged rollout; pull track if published
3. Rollback: previous production versionCode
4. Comm: status page / in-app banner if available
5. Postmortem: 48h

### Authentication outage
1. Detect: 401/503 spike on auth routes; Supabase status
2. Action: disable new signups if partial; keep read-only if safe
3. Rollback: server config / previous web deploy; app only if client bug
4. Comm: users cannot sign in — estimated ETA

### Realtime outage
1. Detect: WS error rate (when realtime exists)
2. Action: fall back to poll/refresh messaging; disable presence
3. Note: **currently NoOp** — treat product claim of realtime as false until wired

### Payment issue
1. Detect: Stripe webhook failures / charge mismatches
2. Action: stop checkout; reconcile webhooks; never trust client state
3. Human finance owner required for refunds

### Data isolation incident
1. **SEV-1** — take app offline / revoke tokens if needed
2. Preserve logs; notify affected users per policy
3. Root-cause before re-enable

### Push / map / telemetry / AI failure
1. Detect: feature error rates / empty states
2. Action: degrade gracefully; core train/coach flows remain
3. No fabricated metrics in UI

## Contacts

Fill before launch: Android owner, backend owner, on-call, legal/privacy.
