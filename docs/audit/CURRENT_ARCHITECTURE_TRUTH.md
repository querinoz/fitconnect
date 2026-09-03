# Current Architecture Truth

**Date:** 2026-09-02
**Branch:** `feat/elite-os-v2` @ `7ee6811`
**Mode:** diagnostic only â€” verified against repository, not historical reports
**Production:** **NO-GO**

---

## 1. Topology

```
                    FITCONNECT ELITE OS
                            â”‚
         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
         â†“                  â†“                  â†“
      Android             Web               Wear
   android/            apps/web          android/wear
   Gradle              Next.js 14        Gradle :wear
         â”‚                  â”‚                  â”‚
         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                            â†“
              Identity: Firebase Auth (UID)
                            â†“
              Product DB: Supabase Postgres + RLS
                            â†“
              Privileged server: Prisma (Strava/Stripe jobs)
```

Expo `apps/mobile` remains **FROZEN** (ADR-005). Do not revive.

---

## 2. Applications

| Surface | Location | Build | Entry | Runnable? | Testable? | Status |
|---------|----------|-------|-------|-----------|-----------|--------|
| Landing + web app | `apps/web` | Next.js / pnpm / Vercel | `app/page.tsx` | YES (local + Vercel preview) | YES (Vitest, Playwright, live RLS) | LOCAL DEMO / PARTIAL |
| Android phone | `android/` | Gradle | `MainActivity` | YES (debug APK) | YES (unit + some instrumentation) | LOCAL DEMO; neu-glass UI ENGINEERING COMPLETE |
| Wear OS | `android/wear` | Gradle `:wear` | `WearMainActivity` | YES (debug) | PARTIAL (no `:wear` unit tests) | PARTIAL / UNVERIFIED device pair |
| Expo | `apps/mobile` | EAS | frozen | Do not use for product | Weak | FROZEN |

**HEAD commit:** `7ee6811` â€” Wave 7 Today editorial.
**Remote:** `origin/feat/elite-os-v2` â€” **8 commits behind local**.
**Working tree:** large dirty + untracked set (P1-DATA, P1-AUTH, 016/017, workout engine, HC telemetry, Instagram, docs).

---

## 3. Android modules (canonical)

`:app` `:wear` `:shared` `:ascend` `:core-capture` `:core:fitness` `:design` `:design-ui` `:foundation` `:sports` `:geo` `:telemetry` `:community` `:ai` `:athlete` `:coach`

Do **not** migrate to `apps/android/` in this phase.

---

## 4. Data

| Store | Role | Authoritative for product? |
|-------|------|----------------------------|
| Supabase Postgres (`012`â€“`016` on disk; `016`/`017` **untracked**) | Identity, activities, ASCEND, social, squad, strength schema | **YES** (when `DATABASE_URL` + JWT) |
| Prisma | Strava tokens, coaching admin, Stripe jobs | Privileged only â€” **not** user SoT |
| In-memory web stores | Vitest / CI fallback | DEMO |
| `gamification/store.ts` localStorage | Web XP UI | DEMO â€” not SoT |
| Android `InMemoryWorkoutSessionStore` | Workouts | DEMO |
| Android `InMemoryAscendStore` | XP | DEMO |
| Room `@Database` | â€” | **MISSING** |
| IndexedDB | â€” | **MISSING** |
| Convex | App events (target P3) | Not default |
| BroadcastChannel | Web realtime | **CI default** |

Canonical identity path:

```
Firebase Auth â†’ Firebase UID â†’ identity_profiles.id â†’ Postgres RLS (firebase_uid())
```

Legacy: `profiles` uuid / `auth.uid()`; Prisma `User` cuid â€” **not** product identity.

---

## 5. Auth

| Path | Status |
|------|--------|
| Firebase web + Android wiring | PARTIAL (LOCAL_AUTH) |
| Production Firebase / Google / Apple | PENDING_HUMAN |
| `NEXT_PUBLIC_DEMO_MODE` | Fail-closed if unset; **CI global = `"true"`**; build job `"false"` |
| P1-AUTH implementation | Present **uncommitted** locally â€” not HEAD |

---

## 6. Realtime

| Provider | Default? | Classification |
|----------|----------|----------------|
| BroadcastChannel | **Yes** (CI + unset env) | DEMO |
| Convex | When URL set | PARTIAL / PENDING_HUMAN |
| Supabase Realtime | Presence/chat when configured | PARTIAL |
| `domain_events` table | Persistence contract (016) | Schema REAL; fan-out P3 |

---

## 7. Watch

MessageClient / GMS Wearable **wired**. Session IDs `wear-*` / `fc-session-*` **not** reconciled to `activities.id`. Health Services HR **probe only**. Phoneâ†”watch E2E **UNTESTED** this audit.

---

## 8. Payments

Stripe routes exist (checkout, subscribe, Connect, portal, webhook). Live when keys set; else demo / 503. Production keys **PENDING_HUMAN**.

---

## 9. Capture / GPS / maps

| Piece | Truth |
|-------|-------|
| `EliteCapture` | STUB (`MODULE` constant) |
| `LiveActivityEngine` | DEMO simulated GPS/HR unless `ingestFix(LIVE)` |
| FusedLocationProvider | **MISSING** (comments only) |
| Foreground service | **MISSING** |
| EliteRouteMap | REAL polyline canvas â€” **not** MapLibre tiles |
| MapLibre / Google Maps SDKs | STUB / MISSING deps |

---

## 10. Offline

`DurableSyncQueue` exists (Android). Room not shipped. Web IndexedDB not shipped. Strength 017 tables designed for server; execution UI not shipped.

---

## Contradiction with frozen master plan

`docs/master-plan/21_FINAL_ROADMAP.md` (2026-08-20) still lists **P0-SEC** as next code after docs freeze.
P0-SEC exit stamp (2026-08-29): `NEXT_PHASE = P1-DATA`.
P1-DATA artifacts exist locally (untracked). Neu-glass waves 0â€“7 are **committed**.

**Repository reality overrides stale README â€œnext phase = P0-SECâ€.**
