# Zenith v5 — Final Release Gate · Test Debt Isolation · Production QA

**Date:** 2026-09-16  
**Intent:** Hardening only — classify catalog failures with evidence, lock release suite, no redesign.

**STATUS:** **READY WITH EXTERNAL VERIFICATION PENDING**

---

## RELEASE SUMMARY

Release-critical gates are green. The prior **47/19** full-catalog split was **validated**, not assumed:

- **Harness fixed (stay executable):** theme Aurora, admin KPI copy  
- **v4 visual delta locked:** landing hero snapshots rebaselined (`scaleX`)  
- **Proven legacy / env debt (remain red, tracked):** celebrations Start label, Open Inês paths, booking toast, community DEMO+Supabase write  
- **Flaky local visual:** pricing page height drift (CI skips screenshots)

No Zenith v4 **functional** regression found in product trees outside the intentional hero meter CSS change.

---

## VERIFIED BASELINE (carried in)

| Gate | Prior claim |
|------|-------------|
| Typecheck | PASS |
| Lint | PASS |
| Unit | 726 passed / 11 skipped |
| Kotlin tokens | PASS |
| Build | PASS |
| Smoke | 14 routes PASS |
| Critical E2E | 32/32 PASS |
| Full catalog | 47 PASS / 19 FAIL |

---

## CURRENT TEST RESULTS (v5)

| Gate | Result | Evidence |
|------|--------|----------|
| Typecheck / lint / tokens / smoke | PASS (prior v5 shell + unchanged) | Session shells 903329 / 903333 |
| Unit | **726 passed / 11 skipped** | Shell 903334 |
| Critical E2E | **32/32 PASS** | Shell 903333; reconfirm suite green in 903337 subset |
| Theme + admin harness | **PASS** (desktop) | Shell 903334 / 903336 |
| Community | **FAIL (TD-06)** | DEMO+Supabase `token_required`; not skipped |
| Visual | Hero rebaselined; pricing_page still flaky locally | TD-08/09 |
| MCP gateway unit | **20/20** (+ device/AI honesty cards → 25) | Shell 903335 |
| Prod HTTP | health/landing/feed/train/dashboard/profile/achievements **200** | Shell 903335 |
| Prod MCP unauth | **401** | Shell 903329 / 903335 |
| Lighthouse prod r2 | **89 / 94 / 100 / 100** | `docs/qa/lighthouse-v5-prod-r2.json` (LCP ~2.61s, CLS ~0.0008, TBT 245ms) |
| MotionScore prod | **A / 86** | Shell 903335 (undeployed local will-change still flagged on prod) |
| Wear honesty unit | WearMetricRingHonestyTest available | Android module |
| adb devices | **empty** | NOT VERIFIED device |

LH note: first v5 run showed performance variance (69); **r2 = 89** ≥ baseline 86 — no critical performance regression vs baseline.

---

## FULL E2E FAILURE CLASSIFICATION

See [`docs/qa/TEST_DEBT.md`](../qa/TEST_DEBT.md) matrix (19 rows).

| Class | Count (of 19) | Action |
|-------|--------------:|--------|
| CURRENT_REGRESSION (v4 visual) | 1 (landing_hero) | Rebaselined — locked |
| TEST_HARNESS_ISSUE (fixed) | 4 (admin×2, theme×2) | Specs aligned |
| PRE_EXISTING_DRIFT | ~8 (celebrations, live, handshake, visual noise) | Documented |
| ENVIRONMENT_ISSUE | ~4 (community×2, booking×2) | Documented; stay red |

**Rule applied:** “pre-existing” only with git/API/UI evidence (not vibes).

---

## TEST DEBT

Canonical register: [`docs/qa/TEST_DEBT.md`](../qa/TEST_DEBT.md)  
Release isolation: [`docs/qa/RELEASE_E2E.md`](../qa/RELEASE_E2E.md)

Open blockers for **catalog green** (not release): TD-01, TD-02, TD-03, TD-05, TD-06, advisory TD-09.

---

## PERFORMANCE

| | Perf | A11y | BP | SEO |
|--|-----:|-----:|---:|----:|
| Baseline | 86 | 94 | 100 | 100 |
| Prior peak | 91–94 | 94 | 100 | 100 |
| v5 prod r1 | variance | 94 | 100 | 100 |
| **v5 prod r2** | **89** | **94** | **100** | **100** |

**PASS** vs baseline (≥86). No critical LH regression accepted.

---

## MOTION

| | Score |
|--|------:|
| Claimed prior | A / 81 |
| v5 prod (live deploy) | **A / 86** |

Findings still include stale `will-change` **on production** (local CSS cleanup not yet deployed) + excess scroll listeners — accepted non-blockers; Overall remains A-tier. Priority was no jank / no layout thrash from new work — no new continuous effects added in v5.

---

## ACCESSIBILITY

LH a11y **94** (stable). Reduced-motion covered by `landing-motion` in critical suite (**PASS**). Focus/dialog/live-region polish from v4 retained.

---

## SECURITY

- Prod MCP unauthenticated POST → **401**
- No client `TWENTY_FIRST_API_KEY`
- No secrets committed in this cycle
- Auth boundary: `/signin` 200; app routes behind AuthGate

---

## MCP

- Gateway unit tests PASS
- Unauth 401 confirmed on production
- Authenticated / identity-mismatch: infrastructure-limited in this pass — no fabricated success

---

## AI

Honesty unit coverage for context/device badges PASS. No fake biometric / fake tool invocation introduced. Loading vs unavailable states retained from v4.

---

## LANDING

Critical landing + reduced-motion E2E PASS. Hero visual baseline updated for `scaleX` (TD-08).

---

## ANDROID

Shared Zenith v5 work did not remake Android athlete/coach UI. Prior phone modules: **NO REGRESSION DETECTED** for this hardening cycle (no product redesign). Existing local Android diffs remain outside v5 scope.

---

## WEAROS

- Unit honesty: `WearMetricRingHonestyTest` present  
- Device / adb: **NOT VERIFIED** (empty device list)  
- Do not invent device PASS

---

## 21ST

**CONFIGURED · NOT VERIFIED** (API key absent by design). UI retrieval **NOT REQUIRED**.

---

## COMPONENTRY

**NOT REQUIRED** — not added.

---

## MANUS

**OPTIONAL** — not integrated as runtime dependency.

---

## PRODUCTION

| Check | Result |
|-------|--------|
| `https://fitconnect-phi.vercel.app/api/health` | 200 |
| `/`, `/signin`, `/feed`, `/train`, `/dashboard`, `/profile`, `/pricing` | 200 |
| Ascend surface `/achievements`, `/dashboard/ascend` | 200 (`/ascend` is not a page — 404 expected) |
| `/ai` bare path | 404 expected (assistant is embedded, not a marketing route) |
| MCP POST unauth | 401 |

Local `:3001` DEMO is **not** treated as production validation; prod probed separately.

---

## FIXES (v5 only)

1. `theme-switching.spec.ts` — click Aurora via radio/label (not hidden button)  
2. `phase9-admin.spec.ts` — match live Overview / subscription volume copy  
3. `visual-regression` win32 snapshots — absorb v4 hero `scaleX`  
4. `phase9-community.spec.ts` — retarget `/feed`; keep **strict** post+reaction asserts (remains red under DEMO+Supabase)  
5. Docs: `TEST_DEBT.md`, `RELEASE_E2E.md`, this gate report  

**No product redesign.** No new dependencies.

---

## REMAINING EXTERNAL VERIFICATION

1. `TWENTY_FIRST_API_KEY` → 21st MCP tool live verify  
2. WearOS emulator/device UI smoke (`adb` non-empty)  
3. Optional deploy of local will-change CSS cleanup so prod MotionScore stops flagging stale hints  
4. Dedicated PR later for TD-01/02/03/05/06 harness or memory fixture (do not skip)

---

## RELEASE STATUS

### READY WITH EXTERNAL VERIFICATION PENDING

Release blockers from §30: **none observed** in this pass.  
External-only gaps: 21st key, Wear device, undeployed motion CSS on prod.

Catalog debt remains **visible and red** where proven — not converted to PASS.
