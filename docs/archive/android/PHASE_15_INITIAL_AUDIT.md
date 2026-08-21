# PHASE_15_INITIAL_AUDIT.md

**Date:** 2026-08-10  
**Branch:** `chore/android-phase-13r-recovery`  
**Baseline:** TESTS 135/135 · assembleDebug PASS · DEVICE none · MAESTRO CLI absent

## Architecture

Native Kotlin/Compose monorepo under `android/`:

| Module | Role |
|--------|------|
| `:app` | Splash, auth, onboarding gates, nav host, DI root |
| `:athlete` | Athlete OS screens + local repository |
| `:coach` | Coach OS screens + local repository |
| `:foundation` | Auth, offline, realtime demo, notifications demo, prefs |
| `:design` / `:design-ui` | Elite Surface tokens + Compose primitives |
| `:geo` | Discovery, booking engine, LOCAL map controllers |
| `:telemetry` / `:sports` / `:ai` / `:community` | Domain engines |
| `:wear` / `:core-capture` | Scaffolds (not product RC) |

## Navigation

- Athlete tabs: Home · Discover · Sessions · Programs · Community (+ deep: recovery, telemetry, sports, profile, AI, notifications, session detail)
- Coach tabs: Overview · Athletes · Calendar · Inbox · More (+ sessions, programs, bookings, revenue, analytics, AI, athlete detail)

## Demo mode

Debug / no IdP → `LocalAuthRepository` + `InProcessRealtimeClient` + `DevNotificationGateway` + local repositories. Release without config remains fail-closed.

Personas: Inês (athlete), Marina (athlete), Tomás (coach), Admin (non-elevating).

## Test coverage (baseline)

Unit tests across foundation/athlete/coach/community/geo/design-ui/app — **135**, 0 failures. Gaps: onboarding prefs, live session FSM, booking observe, sports/group chip behavior.

## Incomplete / risks (pre-fix)

| ID | Severity | Issue |
|----|----------|-------|
| P0-ID | P0 | Demo identity graph fragmented (Maya Costa vs Tomás; community cast diverge) |
| P0-BOOK | P0 | Coach bookings don’t auto-refresh after athlete create |
| P0-OFF | P0 | Offline handler `reject` vs `decline` typo |
| P1-CTA | P1 | Sports registry chips + athlete group chips dead `onClick={}` |
| P1-MAP | P1 | LOCAL MAP marker-only (no route/telemetry overlay) |
| P1-LIVE | P1 | Live session state machine Compose-only (no unit tests) |
| P1-ONB | P1 | OnboardingPrefs untested |
| P1-MAR | P1 | Marina persona shares Inês athlete seed |

## Dead code candidates (NOT deleted without proof)

MediaPipeline, AchievementEngine, CommunityNotifier, LeaderboardEngine, AiStreamController — engine-only, unused by DI; leave pending reference proof.

## Human boundaries

Supabase / FCM / Test Lab / Signing / Play = PENDING_HUMAN / LOCKED. Not fabricated.

## Post-Phase-15 remediation (2026-08-10)

| ID | Outcome |
|----|---------|
| P0-ID | Fixed — Tomás / Inês / Marina aligned in places, bookings, coach roster |
| P0-BOOK | Fixed — `revisions()` + coach UI collect |
| P0-OFF | Fixed — `decline` + `reject` handlers |
| P1-CTA | Fixed — sports + athlete group chips |
| P1-MAP | Fixed — LOCAL MAP route/zones/telemetry labels |
| P1-LIVE | Fixed — `LiveSessionPreviewMachine` + tests |
| P1-ONB | Fixed — OnboardingPrefsTest |
| P1-MAR | Partial — Marina on coach/booking surfaces; athlete home still primary ath-1 seed |

**Verification:** `.\gradlew.bat test` → 141/141; `:app:assembleDebug` PASS; device/Maestro BLOCKED.
