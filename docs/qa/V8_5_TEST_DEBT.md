# V8.5 Test Debt Register

**Date:** 2026-09-17  
**Policy:** Do not delete, skip, or weaken assertions to force green. Classify only.

## PRE-EXISTING (not introduced by V8.5)

| Area | Symptom | Classification | Action |
|------|---------|----------------|--------|
| Community E2E | Auth form / demo selectors / visual baselines | PRE-EXISTING TEST_DEBT | Keep failing until dedicated auth harness |
| Full Playwright suite | Mix of CURRENT vs debt (~partial green historically) | PRE-EXISTING / HARNESS | Triage per failure; no blanket skip |
| Frozen LH 94 perf vs local 89 | Measurement variance + LCP on landing | ENVIRONMENT / BASELINE VARIANCE | Gate still PASS (≥84); re-measure on preview |
| LH contrast / heading-order | Failed audits on landing | PRE-EXISTING a11y debt | Track outside V8.5 feature scope |
| Smoke script | Does not hit `/train` or nutrition APIs | HARNESS GAP | Covered by `v85-sport-nutrition.spec.ts` |

## V8.5 EXTERNAL (honest NOT VERIFIED)

| Item | Status | Blocker |
|------|--------|---------|
| Vercel preview deploy | NOT VERIFIED | No agent Vercel token / `gh` auth |
| Preview Playwright | NOT VERIFIED | Depends on preview URL |
| Preview Lighthouse | NOT VERIFIED | Depends on preview URL |
| WearOS device smoke | NOT VERIFIED | `adb devices` empty |
| Instrumented offline/crash UI E2E | NOT VERIFIED | Needs device + harness |
| Authenticated full click journey in Playwright | PARTIAL | Domain unit + API contracts substitute; UI auth session not durable in CI |

## CURRENT REGRESSION (V8.5)

None open after verification loop:

- Critical V8.5 Playwright: **27/27 PASS**
- Domain V8.5 unit (scoped): **40/40 PASS**
- Smoke: **14/14 PASS**
- Wear/sports assembleDebug: **exit 0**

## Verification-only fixes recorded this freeze

| Fix | File | Why |
|-----|------|-----|
| Soften USDA not-configured note | `food-adapters.ts` | Avoid echoing env key name in client-visible note |
| Adapter honesty tests | `food-adapters.test.ts` | Guard source metadata + key hygiene |
| MCP security tests | `v85-security.test.ts` | Catalog + authz regression net |
| Critical E2E spec | `v85-sport-nutrition.spec.ts` | Primary acceptance surface contracts |

## Debt keepers (do not “fix” by deletion)

- Community visual / auth Playwright failures
- Landing contrast / heading-order LH audits
- MotionScore re-run (skipped — motion unchanged)
