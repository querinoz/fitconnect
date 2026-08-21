# ANDROID PRODUCT VISUAL EXIT GATE

**Date:** 2026-08-09
**Verdict:** **NOT ISSUED — BLOCKED**
**Reason:** ENV-01. No build, emulator, screenshot, browser or test evidence exists.

A visual exit gate asserts what a product *looks like*. Nothing in this session
rendered a single pixel. Every row below is therefore `UNVERIFIED` — not FAIL
(which would imply it was checked and found wrong), and categorically not PASS.

```
ANDROID PRODUCT VISUAL EXIT GATE
================================

BRAND:            UNVERIFIED
LOGO:             UNVERIFIED  (P1-BRAND-01 open — two marks ship)
APP ICON:         UNVERIFIED  (full density set present; never rendered)
SPLASH:           UNVERIFIED  (P1-SPLASH-01 fix applied, NOT visually confirmed)
TYPOGRAPHY:       FAIL        (P0-TYPO-01 — proven by file inventory, see below)
COLORS:           UNVERIFIED  (token pipeline sound; never rendered)
CARDS:            UNVERIFIED
NAVIGATION:       UNVERIFIED
ATHLETE:          UNVERIFIED
COACH:            UNVERIFIED
DISCOVER:         UNVERIFIED
BOOKING:          UNVERIFIED
SESSIONS:         UNVERIFIED
COMMUNITY:        UNVERIFIED
PROGRAMS:         UNVERIFIED
MAP:              UNVERIFIED
TELEMETRY:        UNVERIFIED
MOCKUPS:          UNVERIFIED
LANDING PARITY:   UNVERIFIED
MOTION:           UNVERIFIED
ACCESSIBILITY:    UNVERIFIED
PERFORMANCE:      UNVERIFIED
EMULATOR:         BLOCKED     (ENV-01)
TESTS:            BLOCKED     (ENV-01)
PRODUCTION:       PENDING_HUMAN (Supabase, Firebase, signing, Play — Phase 13R)

EXIT_GATE:        BLOCKED
```

`TYPOGRAPHY` is the one row stated as FAIL rather than UNVERIFIED, because it is
provable without rendering: `res/font/` contains three files, all Regular, while
the generated type scale requires weights 700/600/500. Compose must synthesise.
See `ANDROID_LANDING_PARITY_AUDIT.md` § P0-TYPO-01.

## Changes applied this session

| File | Change | Risk | Verified |
|------|--------|------|----------|
| `android/app/src/main/res/drawable/ic_fitconnect_logo.xml` | Wrapped mark artwork in `<group>` scaled 0.82 about centre so the outer Voltline ring fits the splash circular mask safe zone; documented the derivation in-file | Low — declarative vector XML, single call-site (`themes.xml:13`), verified well-formed by inspection | **NO** — not compiled, not rendered |

## Changes deliberately NOT applied

| Item | Why not |
|------|---------|
| Real font weights (P0-TYPO-01) | Binary `.ttf` files; cannot be added without a shell. Registering absent fonts breaks the build. |
| Tokenising the brand-mark palette (P1-BRAND-01) | `EliteSurfaceTokens.kt` is generated; CI enforces drift via `pnpm tokens:kotlin:check` (`.github/workflows/ci.yml:34`, `android.yml:38`). Editing the TS source without regenerating **would fail CI**. |
| Base colour migration to `#090402` | Owner ruled: keep `#070B14`. |
| Hero/scroll cinematics, cockpit, coach centre, discover, booking, sessions, community, programs, map, navigation, microinteractions | All require seeing rendered output. Rewriting Compose blind, at scale, with no compiler and no screenshot, on a project already under release certification, trades a real risk of regression for an unverifiable claim of improvement. |

## To unblock

1. Enable hardware virtualization (BIOS VT-x/AMD-V; Hyper-V/WSL2 as applicable).
2. `pnpm tokens:kotlin:check` · `./gradlew :app:assembleDebug` · `adb devices`.
3. Render splash at mdpi/xhdpi/xxxhdpi → confirm the ring is uncropped and the
   optical weight is right (0.82 is derived, not eyeballed; expect one nudge).
4. Add real font weights → rebuild → compare catalog against landing hero.
5. Then, and only then, screenshots → landing mockup sync → re-issue this gate.
