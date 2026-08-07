# Phase 00 — Migration Plan

**Date:** 2026-08-07 · **No code changed**

Maps the Android-first rebuild onto small, reversible phases. Aligns with existing F0–F15 roadmap and ADRs 005–009. **Phase 00 (this document set) must be approved before Phase 01 starts.**

---

## Phase map

| Phase 00 name | Existing code name | Objective |
|---------------|--------------------|-----------|
| 00 Architecture reset | — | **THIS DOCUMENT SET** |
| 01 Domain core | **F1** Elite Core | FIT + metrics parity on 4 targets |
| 02 Data & sync | **F2** | Prisma unify, Room, outbox, guard |
| 03 Android shell | **F3** | Auth, Compose nav, tokens, permissions |
| 04 Capture | **F4–F6** | Recording engine + UI |
| 05 Sensors & health | **F5 + F8** | BLE + Health Connect (+ F8b archive import if legal) |
| 06 Web harden | **F12–F13 + P0 security** | Auth, dashboards WASM, PWA |
| 07 Coaching realtime | **F11** | Roster, chat, nudges |
| 08 Wear (optional) | **F14** | Designated cut |
| 09 Launch | **F15** | Store, beta, a11y, locales |

---

## Phase 01 — Elite Core (F1)

| Field | Detail |
|-------|--------|
| **Objective** | Same FIT → same metrics on JNI, WASM, napi; ≥15 golden files; <1% vs Golden Cheetah |
| **Files** | `elite-core/**`, `packages/elite-core-wasm/**`, CI `elite-core-rust.yml` |
| **Risks** | Formula disagreement; UniFFI learning curve; missing owner FIT files |
| **Tests** | `cargo test`, clippy, fmt, wasm32 build, cross-target JSON equality |
| **Rollback** | Revert crate modules; bindings stay stubs |
| **Acceptance** | Gate report `qa/reports/gate-F1.md` green |

## Phase 02 — Data & sync (F2)

| Field | Detail |
|-------|--------|
| **Objective** | Single Prisma schema on Supabase Postgres; Android Room; outbox; permission guard 100% branch coverage; chaos 1000 iters |
| **Files** | `prisma/**`, retire conflicting supabase SQL as SoT, `android/**` Room, `elite-core` sync/guard, REST auth middleware |
| **Risks** | Prod data migration; identity UUID vs cuid |
| **Tests** | Migration tests, guard property tests, chaos script |
| **Rollback** | Feature-flag new sync; keep read path on old store briefly |
| **Acceptance** | Zero data loss in chaos; demo mode OFF in staging |

## Phase 03 — Android shell (F3)

| Field | Detail |
|-------|--------|
| **Objective** | Sign-in, onboarding, Elite Surface theme, bottom nav, safe permissions UX |
| **Files** | `android/app/**`, token theme, Supabase Auth Android |
| **Risks** | Emulator still blocked; auth SDK mistakes |
| **Tests** | Unit + Maestro smoke + TalkBack spot check |
| **Rollback** | App versionCode revert |
| **Acceptance** | Onboarding completes on real device |

## Phase 04 — Capture (F4–F6)

| Field | Detail |
|-------|--------|
| **Objective** | FGS recording, survive kill, metrics UI, offline map tiles |
| **Files** | `android/core-capture/**`, app recording screens |
| **Risks** | Physical gates (D3 hardware); battery; Play FGS policy |
| **Tests** | Field protocol 20 rides; kill tests |
| **Rollback** | Disable capture feature flag |
| **Acceptance** | F4 gate metrics |

## Phase 05 — Sensors & health (F5, F8)

| Field | Detail |
|-------|--------|
| **Objective** | BLE HR/power/cadence; Health Connect R/W; FIT/GPX/TCX import; optional Strava push |
| **Files** | capture BLE, Health Connect module, importers |
| **Risks** | D4 legal blocks ZIP archive only (F8b); declaration form |
| **Tests** | 3 real straps; HC on device |
| **Acceptance** | F5/F8 gates |

## Phase 06 — Web harden (parallelizable with 03–05)

| Field | Detail |
|-------|--------|
| **Objective** | Demo OFF; auth all routes; orphan delete; ui-glass migration start; WASM analysis; PWA DPI |
| **Files** | `apps/web/**`, Cleanup_Report batch 1 |
| **Risks** | Breaking demo flows stakeholders use |
| **Tests** | Existing 236+ unit + e2e + lighthouse |
| **Rollback** | Env flag for demo in preview only |
| **Acceptance** | No open `?athleteId=` in prod; Lighthouse targets |

## Phase 07 — Coaching realtime (F11)

| Field | Detail |
|-------|--------|
| **Objective** | Roster, plans DnD, chat, live nudges cross-device |
| **Risks** | Realtime provider choice |
| **Acceptance** | Coach web → athlete Android without refresh |

## Phase 08 — Wear (F14) — OPTIONAL CUT

Scaffold exists. Build only if F13 gate says go.

## Phase 09 — Launch (F15)

Play listing, data safety, beta 20 athletes / 4 weeks, crash-free >99.5%.

---

## Cleanup waves (interleaved, never blocking critical path)

| Wave | When | Content |
|------|------|---------|
| W1 | After Phase 00 approval | Delete web orphans + `packages/ui`; refresh CLAUDE.md |
| W2 | During Phase 06 | ui-glass → elite-os migration by import count |
| W3 | During Phase 02 | Remove in-memory integration store |
| W4 | After F6 | Archive `apps/mobile` |

---

## Rollback global rules

- One phase = one branch = one PR.
- Never combine cleanup deletes with capture/BLE work.
- Prod demo-mode kill switch is an env change — document in release notes.
- Physical gates (🔴) park in `qa/HUMAN-QUEUE.md`; Via A continues on non-dependent work.
