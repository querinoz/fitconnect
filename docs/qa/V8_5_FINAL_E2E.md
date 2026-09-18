# V8.5 Final E2E Evidence (RC LOCK)

**Date:** 2026-09-18  
**Tip:** `cfcf55e`  
**Base URL local:** `http://localhost:3001`

## Critical

**27/27 PASS** — `tests/e2e/v85-sport-nutrition.spec.ts` (3 projects) — prior freeze; still authoritative.

## Full catalog (mobile-chrome)

**37/42 PASS** — prior freeze log `docs/qa/v85-full-playwright.log`.

## Debt reconfirm (2026-09-18)

Isolated re-run of the five failures:

```text
celebrations / live-session / morning-handshake / phase9-booking / phase9-community
→ 5 failed (auth harness / sign-in / coach heading / community post)
```

Log: `docs/qa/v85-debt-reconfirm.log`

Causal check: `git log c78c2fd..HEAD` on those specs + `helpers/auth.ts` + community routes → **empty** (no V8.5 touch).  
Last auth helper change predates V8.5 (`29ddfdf`).

Classification retained: **PRE-EXISTING TEST DEBT**.

## Preview E2E

**NOT VERIFIED — EXTERNAL AUTH UNAVAILABLE** (no Vercel token / gh login).

## Production-safe smoke

- `https://fitconnect-phi.vercel.app/` → 200  
- `/api/health` → JSON reachable (`status: degraded` for unset stripe/redis — expected, not V8.5)
