# 23 — GO / NO-GO

**Date:** 2026-08-20  
**Decision:** **NO-GO** for production, Play production, and real-user launch.

## Why NO-GO

P0 security themes remain open (Strava allowlist drift, webhook default/fallback, account deletion, legal hrefs, unproven live RLS, rate limit). Production Firebase/Supabase/signing are HUMAN. CI still trains E2E on demo mode.

Partial engineering (identity SQL, Firebase web/Android wiring, status auth, coach route 403) **does not** equal production PASS and **does not** skip P0-SEC.

## Score

**Release readiness ~42/100.** Target for GO: P0-SEC PASS + P1-DATA PASS + P1-AUTH CI contract + HUMAN infra for the launch slice + P11 QA.

## Allowed now

```
EXECUTE MASTER PLAN — PHASE P0-SEC
```

after this docs freeze is reviewed.

## Forbidden now

- Social OS / Squad OS / Stories / Reels
- Landing cinematic
- Skill bulk install
- Expo thaw
- Declaring PRODUCTION_AUTH or PRODUCTION_DATABASE PASS
- Asking the human to paste secrets into chat

## Sign-off

| Role | Status |
| --- | --- |
| Engineering freeze (docs) | This folder |
| Security | NO-GO until P0-SEC |
| Product v1 scope | Conservative social; GPS later |
| Human infra | PENDING |
| **GO for production** | **NO** |
