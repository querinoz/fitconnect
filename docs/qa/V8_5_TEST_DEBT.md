# V8.5 Test Debt Register (RC LOCK)

**Date:** 2026-09-18  
**Policy:** Do not skip, delete, or weaken assertions.

## Independently reconfirmed (2026-09-18)

| Spec | Failure | V8.5 touch? | Class |
|------|---------|-------------|-------|
| `celebrations.spec.ts` | demo auth / Start timeout | No | PRE-EXISTING TEST_DEBT |
| `live-session.spec.ts` | demo auth / coach UI | No | PRE-EXISTING TEST_DEBT |
| `morning-handshake.spec.ts` | `openDemoAthleteAndCoach` | No | PRE-EXISTING TEST_DEBT |
| `phase9-booking.spec.ts` | demo auth harness | No | PRE-EXISTING TEST_DEBT |
| `phase9-community.spec.ts` | sign-in / post selector | No | PRE-EXISTING TEST_DEBT |

Evidence: `docs/qa/v85-debt-reconfirm.log`  
Path audit: no files under these specs/community/auth helpers in `c78c2fd..HEAD`.

## CURRENT REGRESSION (V8.5)

**None.**

## External limitations (not debt)

| Item | Status |
|------|--------|
| Preview deploy / Preview E2E | NOT VERIFIED — EXTERNAL AUTH UNAVAILABLE |
| WearOS device smoke | NOT VERIFIED — adb empty |
| Offline device E2E | NOT VERIFIED |

## Lighthouse note

Local 87–90 vs freeze 94 = environment variance (see FINAL_EVIDENCE reconciliation). Not filed as V8.5 CURRENT REGRESSION.
