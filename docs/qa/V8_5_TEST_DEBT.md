# V8.5 Test Debt Register

**Date:** 2026-09-17 (re-run)  
**Policy:** Do not delete, skip, or weaken assertions to force green.

## Full Playwright — mobile-chrome (2026-09-17)

**37/42 PASS** · **5 FAIL** · classified PRE-EXISTING TEST_DEBT / HARNESS

| Spec | Failure mode | Class |
|------|--------------|-------|
| `celebrations.spec.ts` | demo sign-in; `Start` button timeout | PRE-EXISTING |
| `live-session.spec.ts` | demo auth / coach heading not visible | PRE-EXISTING |
| `morning-handshake.spec.ts` | `openDemoAthleteAndCoach` coach heading | PRE-EXISTING |
| `phase9-booking.spec.ts` | same demo auth harness | PRE-EXISTING |
| `phase9-community.spec.ts` | post body `p.leading-relaxed` not found | PRE-EXISTING |

Evidence log: `docs/qa/v85-full-playwright.log`

## Other known debt

| Area | Class |
|------|-------|
| Landing LH contrast / heading-order | PRE-EXISTING a11y |
| LH perf 90 vs freeze 94 | ENVIRONMENT variance (gate ≥84 PASS) |
| Smoke script omits `/train` | HARNESS GAP (covered by v85 E2E) |

## External NOT VERIFIED

| Item | Blocker |
|------|---------|
| Vercel preview + Preview E2E + Preview LH | No token / gh / vercel login |
| WearOS device smoke | `adb devices` empty |
| Instrumented offline/crash UI E2E | Needs device + harness |

## CURRENT REGRESSION (V8.5)

**None** after re-verification loop.
