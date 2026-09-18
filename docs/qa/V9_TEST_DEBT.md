# V9 Test Debt

Carry-forward from V8.5 / prior Playwright debt. **Do not delete, skip, weaken, or hide.**

## Pre-existing Playwright failures (documented, not introduced by V9)

Reconfirmed on V8.5 verification cycle against local `:3001`:

- celebrations
- live-session
- morning-handshake
- phase9-booking
- phase9-community

These remain **KNOWN DEBT**, not current V9 regressions, unless a V9 change touches their code paths.

## External verification pending

| Item | Reason |
| --- | --- |
| WearOS device smoke | `adb devices` empty |
| Preview deploy + preview E2E | No Vercel/gh preview credentials in agent environment |
| Preview Lighthouse | Depends on preview |

## V9 added coverage (not debt)

- `tests/e2e/v9-nutrition.spec.ts`
- `tests/e2e/v9-nutrition-meals-grocery.spec.ts`
- `lib/nutrition/nutrition.test.ts` meal-swap cases
- Wear honesty unit tests (wave 1)

## Policy

If a **new** failure appears on V9-touched paths → treat as **CURRENT REGRESSION** and fix before freeze claim.
