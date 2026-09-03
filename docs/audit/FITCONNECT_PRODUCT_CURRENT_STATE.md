# FitConnect Product â€” Current State

**Date:** 2026-09-02
**Evidence branch:** `feat/elite-os-v2` @ `7ee6811` + dirty working tree
**Release:** **PRODUCTION NO-GO**

Do not confuse **exists in code** with **works** with **production-ready**.

---

## IMPLEMENTED (engineering â€” not production GO)

| Area | Evidence |
|------|----------|
| Elite OS tokens / chart palette | `packages/design-tokens`, `elite-os.css` |
| Android athlete neu-glass (Today, Analysis, Achievements, Profile, Train chrome) | Waves 0â€“7 commits `4f6f3dd`â€¦`7ee6811` |
| Wave 7 Today editorial layout | `HomeScreen.kt` + `wave7-today-screenshot.png` |
| Strava third-party social barrier (DB `shareable` + policy tests) | `011`/`016`, `workout-session-policy.ts` |
| Firebase UID identity SQL (`012`) | `identity_profiles` |
| P0-SEC engineering gates (unit + last live RLS 2026-08-29 / 2026-09-01) | `docs/security/P0_SEC_EXIT_GATE.md` â€” **not re-run this audit** |
| ProgressionEngine + 1RM estimator (domain) | Kotlin + TS unit tests â€” **untracked**; no UI |
| Health Connect 1.1.0 exercise read path | Committed in wave 7 (`FitnessContainer`, exercise reader) |
| Web landing + marketing routes | `apps/web/app/(marketing)/` |
| Makefile `start` / `fitconnect` targets | Exist on disk |

---

## PARTIAL

| Area | Why not complete |
|------|------------------|
| Auth | LOCAL_AUTH engineering; PRODUCTION_AUTH PENDING_HUMAN; P1-AUTH files uncommitted |
| Database | Dual Prisma + Supabase; `016`/`017` untracked on git HEAD |
| Activities API | `/api/v1/workout-sessions` â†’ `activities`; dashboard `db/repository.ts` still Prisma |
| ASCEND | SQL + Android engine + web Zustand â€” three truths |
| Social | SQL `014` REAL; web `server-posts.ts` memory in CI |
| Squad | SQL REAL; `server-challenges.ts` memory in CI |
| Health Connect | Exercise + HR readers; sleep/steps/Room/WorkManager/write-back missing |
| Wear Data Layer | Messages wired; IDs not canonical; no wear module tests |
| Coach OS | UI + in-memory `LocalCoachRepository`; neu-glass not applied |
| Stripe | Code REAL; keys PENDING_HUMAN; demo fallback |
| FCM | REAL with `google-services.json`; fail-closed / debug stubs otherwise |
| Realtime | Broadcast default; Convex/Supabase optional |
| RPE | Post-workout web/Expo; not per-set strength log |
| Exercise library | ~13 Android / ~14 web seeds â€” marketing claims â€œ600+â€ |
| Plan builder | Demo UI (Zustand / local coach programs) |

---

## DEMO / LOCAL_DEMO

- Athlete home metrics (provenance banners)
- `LiveActivityEngine` GPS/HR simulation
- Coach roster / programs / body weight
- Web gamification XP in localStorage
- Community/squad APIs when `PERSISTENCE_BACKEND=memory` or Vitest
- CI `NEXT_PUBLIC_DEMO_MODE=true` (except build job)

---

## STUB / MISSING

| Area | Classification |
|------|----------------|
| Guided strength workout UI | MISSING |
| Rest timer / wakelock | MISSING |
| FusedLocation + capture FGS | STUB (`EliteCapture`) |
| Room / IndexedDB | MISSING |
| MapLibre live tiles | STUB |
| Stories / Reels | NOT IN SCOPE (rejected for v1) |
| Sleep/steps HC readers | MISSING (permissions declared) |
| HC write-back | MISSING |
| StrengthWorkoutScreen | MISSING |
| Muscle map / training heatmap | MISSING (spec only) |
| FitNotes/Strong/Hevy import | MISSING (spec only) |

---

## BLOCKED

| Item | Why |
|------|-----|
| Wear sessionId â†” `activities.id` | Documented P7; local `wear-*` IDs |
| Production auth | Human Firebase/Google/Apple config |
| Physical Watch E2E | PENDING_HUMAN device |
| Play release | Signing, `google-services.json`, store listing |

---

## PENDING_HUMAN

See [`HUMAN_DEPENDENCIES.md`](./HUMAN_DEPENDENCIES.md).

---

## Marketing vs product

| Claim | Reality |
|-------|---------|
| â€œ600+ exercise libraryâ€ (`en.ts`) | ~14 web / ~13 Android seed |
| Health Connect as data core | Partial read path; telemetry still simulated provider |
| GPS live | Simulated in LOCAL_DEMO; UI even says FusedLocation is not claimed |
| Production URL | Hosted **preview**, not GO launch |

---

## Platforms score (product)

| Platform | Product status |
|----------|----------------|
| Athlete Android UI | ENGINEERING COMPLETE (visual) / LOCAL DEMO (data) |
| Athlete Android training | Endurance DEMO; strength execution MISSING |
| Coach | LOCAL DEMO |
| Web app | LOCAL DEMO / PARTIAL |
| Wear | PARTIAL companion |
| Landing | REAL marketing site; claims overshoot |
