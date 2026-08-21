# FitConnect — Master cohesion audit

**Date:** 2026-08-19  
**Assertion under test:** Android + Web + Watch + Athlete + Coach + Social + Squad + ASCEND = **one product**.

## Method

1. Inventory the tree (see `MASTER_COHESION_INVENTORY.md`).
2. Execute every flow that this machine can run.
3. Classify. Fix agent-owned P0/P1. Re-test the fix. Do not invent production evidence.

## Executed this run

| Check | Command / action | Result |
|---|---|---|
| Shared + capture tests | `.\gradlew.bat :shared:test :core-capture:test :wear:compileDebugKotlin` | **BUILD SUCCESSFUL** |
| Phone/coach compile | `.\gradlew.bat :athlete:compileDebugKotlin :app:compileDebugKotlin :coach:compileDebugKotlin` | **BUILD SUCCESSFUL** |
| Web unit | `pnpm --filter @fitconnect/web test` | **308/308 PASS** |
| Web types | `pnpm --filter @fitconnect/web typecheck` | **PASS** (`tsc --noEmit`) |
| Landing | Browser `http://localhost:3001/` | Elite OS hero, Volt CTAs, `LOCAL DEMO` |
| Athlete OS | Browser `/dashboard?demo=1` | Inês M. shell after auth-gate flash |
| Coach OS | Browser `/coach/dashboard?demo=1` | Tomás Ribeiro command center; map `LOCAL_DEMO • 132 BPM` |
| Profile after coach | Browser `/profile?demo=1` | **Did not switch role** — still Coach Command Center (coach session sticky) |
| Emulators | `adb devices` | **empty** |
| Cloud realtime / FCM / Play | — | **PENDING_HUMAN** (not probed) |

## Five layers

### Layer 1 — Visual

**Partial pass on web + token system. Not certified on live Android/Wear this run.**

Landing, athlete dashboard (a11y tree), and coach OS all use floor `#070B14`, Volt CTAs, Syne-like display, `LOCAL_DEMO` on health. Wear screenshot on disk matches that language but was **not** recaptured today.

Failures: web nav concepts ≠ Android five tabs; landing hero stats **12,418 verified coaches** vs body copy **318 active verified coaches** (invented / conflicting social proof).

### Layer 2 — Functional

Actions are **not** the same verbs across surfaces. Android ACTIVITY starts a capture engine. Web “Start today’s session” is dashboard booking/plan, not the same session object. Wear START is a companion lease.

### Layer 3 — Data

**FAIL.** Same human-looking “Inês” is three records: `ath-1` / Inês Costa (Android), `a-ines` / Inês M. (web athlete), Inês Correia (web coach roster). XP stores are separate.

### Layer 4 — Behavioral

**FAIL for the eight-surface event bus.** AscendEngine is idempotent **inside one process**. Web XP is a different store. No executed RUN-10KM that updated watch + phone + web + squad + coach.

Phone START is now lease-gated **in-process** after a watch envelope (unit test `watchEnvelopeLocksPhoneStart`). Cross-process Wear Data Layer was **not** run (no devices).

Realtime on this machine is **broadcast**. Production Convex/Supabase: **PENDING_HUMAN**.

### Layer 5 — Emotional

Web landing + coach OS **feel** like Elite OS. The journey does **not** continue as one world: opening Web after Android (even in code) is a different user, different XP, different nav, no squad, no shared feed.

## Agent-owned fixes applied this session

| ID | Issue | Fix | Re-test |
|---|---|---|---|
| P0-SESSION | Phone coordinator ignored `SessionOwnership` | `LiveSessionCoordinator` lease + `ActivityScreen` `claimLocalStart` | `LiveSessionCoordinatorTest.watchEnvelopeLocksPhoneStart` compiled+ran in `:core-capture:test` |
| P1-INSIGHTS | `/insights` not in middleware protect list | `isProtectedPath` + `/insights` | `middleware-auth.test.ts` 7 tests; suite 308/308 |
| P1-ACCENT | Appearance picker hid Volt spectrum | Wired `accent` / `onAccentChange` on athlete settings, auth, coach settings, coach profile | Compile `:athlete :app :coach` SUCCESS. **Live UI not captured** (no emulator) |
| P1-WEAR-ID | Wear Ascend/userId `wear-local` / `"local"` | `LocalDemoIdentity.ATHLETE_ID` (`ath-1`) | Wear `compileDebugKotlin` SUCCESS. **Not run on hardware** |

## Remaining classification

See `MASTER_COHESION_REPORT.md` for P0–P3 counts.

**Not fixed (would be fake product):** unifying `a-ines` with `ath-1` via an alias; inventing `/squads` and `/social`; claiming cloud XP.

## Quality gate (this run)

| Surface | Status | Why |
|---|---|---|
| ANDROID | **FAIL** | Live journeys BLOCKED; identity/XP not shared with web |
| WEB | **FAIL** (cohesion) | Demo shells work; nav/identity/social/squad/ascend do not unify |
| WATCH | **BLOCKED** | No adb. Code compiles. Prior screenshot STALE |
| ATHLETE | **FAIL** | Two athlete demos, not one user |
| COACH | **PARTIAL** | Role shell exists and loaded; roster names ≠ athlete profile |
| SOCIAL | **FAIL** | Android community module ≠ web marketing `/community` |
| SQUAD | **FAIL** | LOCAL_DEMO copy only |
| ASCEND | **FAIL** | Native engine ≠ web 120 XP widget |
| DATA | **FAIL** | IDs/names/XP diverge |
| REALTIME | **PENDING_HUMAN** (prod) / local broadcast only |
| VISUAL | **PARTIAL** | Token language shared; live matrix incomplete |
| BRAND | **PARTIAL** | Recognizable Elite OS; conflicting coach counts on landing |
| MOTION | **BLOCKED** | No cross-surface timing measurement this run |
| NAVIGATION | **FAIL** | Android 5 tabs ≠ web Today/Sessions/Coach/Inbox/Profile |
| ACCESSIBILITY | **BLOCKED** | TalkBack not run; web snapshot only |
| PERFORMANCE | **BLOCKED** | No gfxinfo / Lighthouse this run |
| SECURITY | **PARTIAL** | Insights now protected; demo mode ON locally; 4-level privacy model missing |
