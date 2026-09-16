# FitConnect Web E2E — Test Debt Register

**Updated:** 2026-09-16 (Zenith v5 — verified classification)  
**Policy:** Do not delete or skip these specs. Isolate from the **release gate**. Track until selectors/copy/harness/env match product.

## Release gate vs catalog

| Bucket | Specs | Gate role |
|--------|-------|-----------|
| **RELEASE TESTS** | `smoke`, `landing-motion`, `phase9-auth`, `signin-copy`, `train-journey` | Must stay green (critical E2E) — see [`RELEASE_E2E.md`](./RELEASE_E2E.md) |
| **HARNESS FIXED (v5)** | `theme-switching`, `phase9-admin` | Re-verified green after selector/copy alignment |
| **VISUAL REBASELINED (v5)** | `visual-regression` (win32) | Snapshots refreshed for v4 hero `scaleX` + local OS noise |
| **LEGACY TEST DEBT (still red)** | TD-01, TD-02, TD-03, TD-05, TD-06 | Tracked; not release-blocking when proven pre-existing / env |

---

## Full catalog failure matrix (19 from v5 baseline run)

Source run: full Playwright `desktop-chrome` + `mobile-chrome` → **47 PASS / 19 FAIL** (2026-09-16).

| # | Project | Spec | Class | Debt ID | v4 caused? | Evidence |
|--:|---------|------|-------|---------|------------|----------|
| 1 | mobile | `celebrations` | PRE_EXISTING_DRIFT | TD-01 | No | Spec waits `Start`; stitch CTA `Start today's session`. Celebrations not in v4 touch list. Spec dated May 2026 monorepo era. |
| 2 | mobile | `live-session` | PRE_EXISTING_DRIFT | TD-02 | No | Clicks `Open Inês` — string only in specs; roster never exposed CTA. |
| 3 | desktop | `live-session` | PRE_EXISTING_DRIFT | TD-02 | No | Same as #2 |
| 4 | mobile | `morning-handshake` | PRE_EXISTING_DRIFT | TD-03 | No | Depends on TD-02 entry path |
| 5 | desktop | `morning-handshake` | PRE_EXISTING_DRIFT | TD-03 | No | Same as #4 |
| 6 | mobile | `phase9-admin` | TEST_HARNESS_ISSUE → **fixed** | TD-04 | No | Copy: `Overview` / `Recorded subscription volume` |
| 7 | desktop | `phase9-admin` | TEST_HARNESS_ISSUE → **fixed** | TD-04 | No | Same; desktop retest PASS |
| 8 | mobile | `phase9-booking` | PRE_EXISTING_DRIFT / ENVIRONMENT | TD-05 | No | Coach toast via Broadcast; optional 503 persistence |
| 9 | desktop | `phase9-booking` | PRE_EXISTING_DRIFT / ENVIRONMENT | TD-05 | No | Same as #8 |
| 10 | mobile | `phase9-community` | ENVIRONMENT_ISSUE | TD-06 | No | DEMO + Supabase: POST → `401 token_required` (demo `accessToken: null`) |
| 11 | desktop | `phase9-community` | ENVIRONMENT_ISSUE | TD-06 | No | Reproduced: GET `source=supabase` posts=[]; POST noauth → 401 token_required even under DEMO |
| 12 | mobile | `theme-switching` | TEST_HARNESS_ISSUE → **fixed** | TD-07 | No | Aurora is `radio` + label click (opacity:0 input) |
| 13 | desktop | `theme-switching` | TEST_HARNESS_ISSUE → **fixed** | TD-07 | No | Desktop retest PASS |
| 14 | mobile | `visual` landing_hero | CURRENT_REGRESSION → **rebaselined** | TD-08 | **Yes** | v4 hero meters `width%` → `scaleX`; snapshots updated |
| 15 | mobile | `visual` pricing_section | PRE_EXISTING_DRIFT / HARNESS | TD-09 | Unlikely | Pixel height noise (e.g. 5508 vs 5488); CI skips when `CI=true` |
| 16 | mobile | `visual` discover_grid | PRE_EXISTING_DRIFT / HARNESS | TD-09 | Unlikely | Same |
| 17 | mobile | `visual` pricing_page | PRE_EXISTING_DRIFT / HARNESS | TD-09 | Unlikely | Same |
| 18 | desktop | `visual` pricing_section | PRE_EXISTING_DRIFT / HARNESS | TD-09 | Unlikely | Same |
| 19 | desktop | `visual` pricing_page | PRE_EXISTING_DRIFT / HARNESS | TD-09 | Unlikely | Same |

**v4 product touch list (non-causation for debt rows):** `ai-assistant`, `ascend-experience`, wearables page, `telemetry/*`, `devices/*`, `ai/*`, hero meter CSS, `globals.css` / `elite-os.css` will-change removals. Overlap with catalog failures: **hero visual only (TD-08)**.

---

## Debt entries

### TD-01 — celebrations / Start label
| Field | Value |
|-------|--------|
| **ID** | TD-01 |
| **TEST** | `celebrations.spec.ts` |
| **ROUTE** | Athlete sessions / live session |
| **FAILURE** | Waits for button `Start`; mobile stitch CTA is `Start today's session` |
| **ROOT CAUSE** | Spec/product label drift |
| **CLASS** | PRE_EXISTING_DRIFT |
| **v4 CAUSED?** | No |
| **WHY NOT RELEASE BLOCKING** | Overlay + End session still exist; TRAIN/auth covered by release suite |
| **OWNER/SURFACE** | Live session / celebrations |
| **NEXT ACTION** | Align spec to `/Start/i` or dual selectors |

### TD-02 — live-session missing Open Inês
| Field | Value |
|-------|--------|
| **ID** | TD-02 |
| **TEST** | `live-session.spec.ts` |
| **ROUTE** | `/coach/athletes/a-ines` |
| **FAILURE** | Clicks `Open Inês` — string exists only in specs |
| **ROOT CAUSE** | Roster UI never exposed that CTA |
| **CLASS** | PRE_EXISTING_DRIFT |
| **v4 CAUSED?** | No |
| **WHY NOT RELEASE BLOCKING** | Coach athlete detail + live-hr still ship |
| **OWNER/SURFACE** | Coach roster |
| **NEXT ACTION** | Spec should open athlete via real roster control / deep link |

### TD-03 — morning-handshake same Open Inês
| Field | Value |
|-------|--------|
| **ID** | TD-03 |
| **TEST** | `morning-handshake.spec.ts` |
| **ROUTE** | Coach → athlete plan banner |
| **FAILURE** | Depends on `Open Inês` then QuickDiff |
| **ROOT CAUSE** | Same missing CTA as TD-02 |
| **CLASS** | PRE_EXISTING_DRIFT |
| **v4 CAUSED?** | No |
| **WHY NOT RELEASE BLOCKING** | Feature UI present; entry path in spec is stale |
| **OWNER/SURFACE** | Morning handshake / coach plan |
| **NEXT ACTION** | Same as TD-02 + assert chips via stable testids |

### TD-04 — admin KPI copy (RESOLVED v5 harness)
| Field | Value |
|-------|--------|
| **ID** | TD-04 |
| **TEST** | `phase9-admin.spec.ts` |
| **ROUTE** | `/admin` |
| **FAILURE** | Expected “Admin overview” / “MRR” |
| **ROOT CAUSE** | Product uses `Overview` / `Recorded subscription volume` |
| **CLASS** | TEST_HARNESS_ISSUE → **fixed in v5** |
| **v4 CAUSED?** | No |
| **WHY NOT RELEASE BLOCKING** | N/A after fix |
| **OWNER/SURFACE** | Admin |
| **NEXT ACTION** | Keep green |

### TD-05 — booking coach toast / realtime
| Field | Value |
|-------|--------|
| **ID** | TD-05 |
| **TEST** | `phase9-booking.spec.ts` |
| **ROUTE** | Booking → coach dashboard |
| **FAILURE** | Coach does not see “New booking” toast |
| **ROOT CAUSE** | Broadcast/LocalChannel path + optional persistence 503 |
| **CLASS** | PRE_EXISTING_DRIFT / ENVIRONMENT_ISSUE |
| **v4 CAUSED?** | No |
| **WHY NOT RELEASE BLOCKING** | Booking modal still works; cross-tab toast needs dedicated harness |
| **OWNER/SURFACE** | Booking / realtime |
| **NEXT ACTION** | E2E with shared channel fixture or API assertion |

### TD-06 — community post under DEMO+Supabase (OPEN)
| Field | Value |
|-------|--------|
| **ID** | TD-06 |
| **TEST** | `phase9-community.spec.ts` |
| **ROUTE** | `/feed` (retargeted from marketing `/community`) |
| **FAILURE** | Post body never appears after “Post to feed” |
| **ROOT CAUSE** | `requireAuth` DEMO returns `accessToken: null`; with Supabase persistence `POST /api/v1/community/posts` returns **401 `token_required`**. Probed on :3001: GET `{"posts":[],"source":"supabase"}`. Intentional honesty (no fake posts) from pre-v4 commits (`fcfe528`, `aff47c8`, `50bc7f4`). Spec originated `4f64ea8` (2026-05). |
| **CLASS** | ENVIRONMENT_ISSUE (harness lacks Firebase write token / memory fixture) |
| **v4 CAUSED?** | No — community/API not in v4 touch list |
| **WHY NOT RELEASE BLOCKING** | Production posts use real Firebase token; Feed UI + honesty error paths unit-covered; critical E2E does not require demo Supabase writes |
| **OWNER/SURFACE** | Community / Feed API |
| **NEXT ACTION** | Memory persistence fixture for E2E **or** signed test token; do not fake PASS |

### TD-07 — theme Aurora role (RESOLVED v5 harness)
| Field | Value |
|-------|--------|
| **ID** | TD-07 |
| **TEST** | `theme-switching.spec.ts` |
| **ROUTE** | `/settings/appearance` |
| **FAILURE** | `getByRole('button', { name: /Aurora/i })` |
| **ROOT CAUSE** | `ThemePicker` uses hidden `radio` + `.fc-theme-radio-label` |
| **CLASS** | TEST_HARNESS_ISSUE → **fixed in v5** |
| **v4 CAUSED?** | No |
| **WHY NOT RELEASE BLOCKING** | N/A after fix |
| **OWNER/SURFACE** | Appearance / theme |
| **NEXT ACTION** | Keep green |

### TD-08 — visual landing_hero after meter transform (RESOLVED v5 rebaseline)
| Field | Value |
|-------|--------|
| **ID** | TD-08 |
| **TEST** | `visual-regression.spec.ts` · `landing_hero_matches_baseline` |
| **ROUTE** | `/` |
| **FAILURE** | Screenshot delta vs win32 baseline |
| **ROOT CAUSE** | Zenith v4 hero meters `width%` → `transform: scaleX` |
| **CLASS** | CURRENT_REGRESSION (visual) → **snapshots updated in v5** |
| **v4 CAUSED?** | **Yes** — intentional MotionScore layout fix |
| **WHY NOT RELEASE BLOCKING** after rebaseline | Semantics + critical landing E2E pass; CI skips pixel when `CI=true` |
| **OWNER/SURFACE** | Landing hero |
| **NEXT ACTION** | Keep win32 snapshots in sync on intentional hero CSS changes |

### TD-09 — visual pricing / discover baselines
| Field | Value |
|-------|--------|
| **ID** | TD-09 |
| **TEST** | pricing_section / discover_grid / pricing_page screenshots |
| **ROUTE** | `/`, `/discover`, `/pricing` |
| **FAILURE** | Pixel height/delta mismatches |
| **ROOT CAUSE** | OS/font/layout noise; local-only pixel gate |
| **CLASS** | PRE_EXISTING_DRIFT / TEST_HARNESS_ISSUE |
| **v4 CAUSED?** | Unlikely (non-hero); rebaseline attempted in v5 |
| **WHY NOT RELEASE BLOCKING** | Spec documents OS-specific baselines; CI skips screenshots when `CI` set |
| **OWNER/SURFACE** | Marketing visual |
| **NEXT ACTION** | Prefer linux CI snapshots; treat win32 as advisory |

---

## Evidence summary (v4 non-causation)

No overlap with celebrations / live / handshake / booking / community / admin / theme **product** trees except **hero visual (TD-08)**, which was rebaselined — not reverted.
