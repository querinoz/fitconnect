# Zenith V8.5 — Final Evidence Freeze

**Date:** 2026-09-17 (re-verified 23:10–23:55 UTC+1)  
**Branch:** `feat/zenith-v8-5-sport-intelligence`  
**Tip:** `5208d9f` (product tip `9fcbe08` + verification commit)  
**Frozen baseline (untouched):** `c78c2fd`  
**Status:** **V8.5 COMPLETE — EXTERNAL VERIFICATION PENDING**

## Git integrity

| Check | Result |
|-------|--------|
| HEAD on feature branch | PASS — `feat/zenith-v8-5-sport-intelligence` @ `5208d9f` |
| Expected product commits present | PASS — `70db106`, `c9ae447`, `9f305bc`, `9fcbe08` |
| `c78c2fd` is ancestor | PASS |
| Baseline rewrite | NONE — no reset / force-push |

## Migration 036

File: `supabase/migrations/036_sport_intelligence_nutrition.sql`

| Concern | Result |
|---------|--------|
| Additive only (001–035 untouched) | PASS |
| Tables | `athlete_sports_profiles`, `nutrition_profiles`, `nutrition_food_logs`, `sport_training_completions` |
| Indexes | sport, user+date, user+completed_at |
| RLS + FORCE RLS | PASS — all four tables |
| Ownership | `user_id = public.firebase_uid()` |
| Anon grants | REVOKED |
| Food log write honesty | `source` constrained to `user_confirm` |
| Sync states | explicit enum on completions |

## Connected product journey (code)

```
PROFILE → /api/v1/sports/identity
→ DASHBOARD TODAY
→ TRAIN / completions (confirm:true)
→ NUTRITION profile / targets / meal / grocery
→ FOOD adapters (PortFIR / USDA / OFF) + confirm log
→ MCP tools (athlete-gated)
→ COACH athlete-today (nutrition ACL via share_with_coach)
```

Android: sports identity remote + Wear companion hooks.  
WearOS: assembleDebug PASS; device smoke NOT VERIFIED (`adb devices` empty).

## Gate matrix (re-run evidence)

| Gate | Status | Evidence |
|------|--------|----------|
| Git | PASS | ancestor `c78c2fd`; tip `5208d9f` |
| Migration 036 | PASS | audit above |
| Typecheck | PASS | `pnpm --filter @fitconnect/web typecheck` exit 0 |
| Lint | PASS | exit 0 (img warnings only) |
| Unit (V8.5 domain) | PASS | **65/65** sport + nutrition + adapters + MCP gateway/security |
| Build | PASS | `next build` exit 0 |
| Smoke | PASS | **14/14** `@ http://localhost:3001` |
| Critical E2E | PASS | **27/27** `v85-sport-nutrition.spec.ts` (3 projects) |
| Full E2E | PARTIAL | **37/42** mobile-chrome; 5 failures = PRE-EXISTING debt (see TEST_DEBT) |
| Preview E2E | NOT VERIFIED | `VERCEL_TOKEN` missing; `gh` logged out; `vercel whoami` loggedIn:false |
| Sport Identity | PASS | journey unit + API contracts |
| Training | PASS | TodaySportEngine + TRAIN bridge + train-journey E2E |
| Progression | PASS | unit |
| Active Workout | PASS | TRAIN machine |
| Offline / Crash | PASS (unit/machine) | device offline E2E NOT VERIFIED |
| Nutrition | PASS | profile/targets/diary/safety unit |
| Meal Plan / Recipes / Grocery | PASS | unit |
| Food APIs | PASS | adapters unit |
| PortFIR / USDA / OFF | PASS | honesty + no env key echo |
| Nutrition Safety | PASS | LEA/combat guards |
| Dashboard | PASS | wiring + route smoke |
| Coach ACL | PASS | `coach-acl.test.ts` |
| AI / MCP | PASS | gateway **25** + v85-security **3** |
| MCP Security | PASS | anonymous 403; no food write tools; no sql/shell |
| Android | PASS | `:sports:testDebugUnitTest` + Wear assemble |
| WearOS Build | PASS | `:wear:assembleDebug` |
| WearOS Device | NOT VERIFIED | empty `adb devices` |
| Accessibility | PASS (LH a11y 94) | contrast debt pre-existing |
| Reduced Motion | PASS (suite) | landing-motion reduced cases green in full E2E |
| Lighthouse (local prod) | PASS gate | **90 / 94 / 100 / 100** vs freeze **94 / 94 / 100 / 100** (perf ≥84) |
| MotionScore | SKIP | motion unchanged |
| Security scan | PASS | no secrets in V8.5 libs |
| Production Preview | NOT VERIFIED | deploy credentials unavailable |

## Full E2E failure classification (mobile-chrome)

| Spec | Class |
|------|-------|
| `celebrations.spec.ts` | PRE-EXISTING TEST_DEBT (demo auth / Start button) |
| `live-session.spec.ts` | PRE-EXISTING TEST_DEBT (demo auth harness) |
| `morning-handshake.spec.ts` | PRE-EXISTING TEST_DEBT (demo auth harness) |
| `phase9-booking.spec.ts` | PRE-EXISTING TEST_DEBT (demo auth harness) |
| `phase9-community.spec.ts` | PRE-EXISTING TEST_DEBT (feed post selector) |

No V8.5 CURRENT REGRESSION identified. Log: `docs/qa/v85-full-playwright.log`.

## Independent audit

| Question | Answer |
|----------|--------|
| Would I ship as RC? | Yes — preview + Wear device still external |
| Does TRAIN / nutrition / sport differentiation work? | Yes (unit + critical E2E + build) |
| Does MCP enforce authz? | Yes |
| Can nutrition leak to coach? | No — ACL |
| Wear without device? | Build only — NOT VERIFIED on hardware |

## Non-goals honored

No new features, no architecture rewrite, no frozen baseline mutation, no fake PASS for preview/Wear device.
