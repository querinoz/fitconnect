# FitConnect — Master cohesion inventory

**Date:** 2026-08-19  
**Executor:** Master Cohesion QA (this session)  
**Mode:** Phase 0 inventory + executed checks. Previous QA reports were **not** trusted; they were re-opened against the live tree.

**Environment (measured, not assumed)**

| Probe | Evidence |
|---|---|
| Web dev | `http://localhost:3001` — Next.js **15.5.23**, `pnpm dev` running |
| `NEXT_PUBLIC_DEMO_MODE` | `"true"` in `apps/web/.env.local` |
| `NEXT_PUBLIC_REALTIME_PROVIDER` | `"broadcast"` (same-tab / BroadcastChannel). Cloud realtime **not** claimed |
| `adb devices` | empty — no phone, no Wear |
| Phone AVD `fitconnect_phone` | prior restart **failed** (emulator exit 1) |
| Stitch | tab open at stitch.withgoogle.com (visual reference only) |

---

## ANDROID (Compose — Path B phone)

**Modules:** `:app`, `:wear`, `:shared`, `:ascend`, `:core-capture`, `:design`, `:design-ui`, `:foundation`, `:sports`, `:geo`, `:telemetry`, `:community`, `:ai`, `:athlete`, `:coach`

**Athlete bottom tabs (as shipped in this inventory):** HOME · DISCOVER · ACTIVITY · COMMUNITY · PROFILE (`AthleteDest` in `android/athlete/.../AthleteNav.kt`). Extra routes exist off-tab (Sessions, Programs, Recover, Telemetry, AI, Settings).

**Product lock since 2026-08-20 (`AGENTS.md` §6):** four destinations (Hoje · Análise · Conquistas · Perfil) + Treinar FAB. The five-tab list above is **current code**, not the target IA.

**Coach tabs:** Overview / Athletes / Calendar / Inbox / More (Compose coach module).

**Identity (LOCAL_DEMO):** `LocalDemoIdentity.ATHLETE_ID = "ath-1"`. Profile display name **Inês Costa** (`LocalAthleteRepository.profile()`).

**Session ownership:** `SessionOwnership` in `:shared` (ADR-011). Wear claims on START. Phone `LiveSessionCoordinator` now holds a lease and blocks a second START after a watch envelope (unit-tested this session).

**Squad:** no Gradle module. Coach Overview `LiveSquadCard` + Home label `SQUAD · LOCAL_DEMO` only.

**Social:** `:community` in-memory engines (feed, reactions, graph). Not a cloud social graph.

**Ascend:** `:ascend` `AscendEngine` + `EventIds.workoutCompleted(userId, sessionId)` (duplicate process returns `DUPLICATE`). Seeded LOCAL_DEMO users include `ath-1` and demo personas.

**Accent:** `ThemeSettings` + `EliteAppearancePicker`. Wired this session on athlete settings, auth, coach settings, coach profile.

**Offline:** `OfflineCoordinator` enqueue with idempotency keys. Not executed live (no emulator).

**Health numbers:** must be `LOCAL_DEMO` unless a real sensor path exists. Wear HR probe remains UNAVAILABLE.

---

## WEB (Next.js 15 — `apps/web`)

**Marketing:** `/` (`LandingPageContent`, not HTML mockups). Live 2026-08-19: title **FitConnect — Elite OS**, floor + Volt, `LOCAL DEMO` capsule.

**Athlete app:** `/dashboard`, `/sessions`, `/map`, `/inbox`, `/profile`, `/my-coach`, `/insights` (DEMO-ONLY workspace).

**Coach app:** `/coach/dashboard`, `/coach/roster`, `/coach/sessions`, `/coach/inbox`, `/coach/profile`, `/coach/athletes/[id]`.

**Auth:** fail-closed unless `NEXT_PUBLIC_DEMO_MODE === "true"`. This machine is demo-on. Middleware `PROTECTED_PREFIXES` now includes `/insights` (tested).

**Identity:** `DEMO_ATHLETE_ID = "a-ines"`. Live dashboard greeting **Inês M.** / **Inês's Athlete OS**. Coach demo **Tomás Ribeiro**. Roster card **Inês Correia** (third Inês).

**Nav (measured):**

- Desktop athlete sidebar: Overview, My Coach, Programs, Community (`/community` marketing), Settings → `/profile`
- App chrome: Today, Sessions, Coach, Inbox, Profile
- Mobile dock: Today, Sessions, Map, Coach, Inbox, Profile

**Missing product routes:** no `/social`, no `/squads`, no `/ascend`.

**Gamification on web:** client store — live coach/athlete widgets showed **Lv 2 Helium · 120 XP**. Not `:ascend`.

**Expo (`apps/mobile`):** frozen Path A. Not the reference phone app.

---

## WATCH (Wear OS — `:wear`)

Companion, not a second phone. Idle pager: HOME, READINESS, HEART_RATE, ASCEND, SLEEP, RECOVERY, STEPS, SETTINGS. Workout is not an idle page.

**Identity after this session:** telemetry `userId` and Ascend snapshots use `LocalDemoIdentity.ATHLETE_ID` (`ath-1`). Default `sessionId` string remains `"wear-local"` (session handle, not user id).

**HR:** UNAVAILABLE / LOCAL_DEMO.

**Live this run:** **not executed** (`adb` empty). Screenshot `docs/qa/wear-m3-idle.png` exists from a **prior** session — STALE for this certification.

---

## BACKEND

| Piece | Inventory |
|---|---|
| Next `/api` | Present; demo bypass when DEMO_MODE true |
| Supabase | Client + middleware; production session **PENDING_HUMAN** |
| Prisma | Schema exists; no DATABASE_URL claimed here |
| Realtime | Default **broadcast**. Convex/Supabase transports exist as code paths |
| FCM / Play / signing | **PENDING_HUMAN** |

---

## SHARED DOMAIN

| Concept | Where | Unified? |
|---|---|---|
| User id | Android `ath-1` · Web `a-ines` · Wear user now `ath-1` | **No** (web ≠ native) |
| Display name | Inês Costa / Inês M. / Inês Correia | **No** |
| Session lease | Kotlin + TS mirror `session-ownership.ts` | Contract aligned; phone now gates START |
| XP | Android AscendEngine vs web Zustand 120 XP | **No** |
| Social graph | Android `:community` only | **No** |
| Squad | Copy / LOCAL_DEMO cards | **No product** |
| Privacy levels INVISIBLE…FULL_TELEMETRY | **Not found** as those enums | Telemetry has coach metric sharing, not the four-level product model |

---

## WHAT THIS INVENTORY IS NOT

- Not a production user.
- Not Firebase/FCM/Play evidence.
- Not a passing ecosystem certification.
