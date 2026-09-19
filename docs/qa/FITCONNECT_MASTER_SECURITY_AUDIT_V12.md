# FitConnect V12 — Master Security Audit

**Date:** 2026-09-19  
**Branch:** `feat/fitconnect-roadmap-v10-v11`  
**Scope:** Defects found and fixed during V12 hardening (post `4982fb2`)

## Verdict

**Internal security gates for V10–V11 surfaces: PASS after fixes.**  
**External OAuth / preview / Wear: NOT VERIFIED.**

## CRITICAL defects fixed

| ID | Defect | Fix |
| --- | --- | --- |
| SEC-01 | Global device registry Map leaked connection state across users | Per-user key `${userId}:${providerId}` in `lib/devices/platform.ts`; MCP/API pass actor id |
| SEC-02 | Coach HTTP `action=link` allowed unilateral coach grant | Removed; only athlete `action=consent` creates links; requires `athleteConsentAt` |
| SEC-03 | `joinEvent` allowed joining private/secret events | Visibility gate; private/secret → owner only (403 otherwise) |
| SEC-04 | MCP `get_training_load` stamped caller `strainScore` onto every history session | History uses payload.strain only; provided score only when no history |

## HIGH defects fixed

| ID | Defect | Fix |
| --- | --- | --- |
| SEC-05 | Client/MANUAL HR marked `provenance: REAL` | Device-backed sources → REAL; MANUAL/TRAIN/MCP → ESTIMATED |
| SEC-06 | Device POST could assert CONNECTED without adapter session | Only NOT_CONNECTED / DISCONNECTED / PERMISSION_REQUIRED / ERROR allowed via client |
| SEC-07 | Coach roster GET used role string only | `requireCoachCapability` for GET/check |

## Tests

- `lib/devices/platform.test.ts` — cross-user isolation
- `lib/roadmap/v10-v11.test.ts` — consent_missing + private join deny
- `lib/mcp/gateway.test.ts` — strainScore does not inflate history; device honesty
- `lib/sports-intelligence/context-engine.test.ts` — MANUAL ≠ REAL

## Still NOT VERIFIED (external)

- Live Garmin / WHOOP OAuth token exchange
- Production RLS against live Supabase for new in-memory prototypes (events/network/roster still in-process stores)
- WearOS adb smoke (no device attached)

## Residual risk

In-memory stores (events, roster, network, device registry) are **honest prototypes** — not durable multi-instance production stores. They enforce correct ACL semantics in-process; durable RLS must land before multi-node production.
