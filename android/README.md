# FitConnect Android (native)

Kotlin + Jetpack Compose application per **ADR-005**. This is the **production-track** mobile codebase (not a Play GO).

Status: **LOCAL DEMO** · Athlete **neu-glass UI ENGINEERING COMPLETE** (waves 0–6) · Watch sync **UNVERIFIED** · **PRODUCTION = NO-GO**

`apps/mobile` (Expo) was **removed** from the working tree (ADR-005). Recover from git history if needed.  
**Only this `android/` tree is the mobile product.**

## Modules

| Module | Responsibility |
|--------|----------------|
| `:app` | Application shell, navigation, theme wiring |
| `:foundation` | Errors, logging, network, storage, offline queue, analytics, DI root |
| `:design` | Generated Elite Surface color tokens (`pnpm tokens:kotlin`) |
| `:design-ui` | Neu-glass primitives, charts, typography, design catalog |
| `:athlete` | Athlete surfaces (Today, Analysis, Achievements, Profile, Train) |
| `:core-capture` | Capture/sensor bridge scaffold (`EliteCapture` is a placeholder) |
| `:wear` | Wear OS module (P7 certification PENDING_HUMAN) |

## Neu-glass (athlete surfaces)

Waves 0–6 on branch `feat/elite-os-v2` — Today · Analysis · Achievements · Profile · Train FAB.

| Doc | Content |
|-----|---------|
| [docs/design/ELITE_OS_NEU_GLASS.md](../docs/design/ELITE_OS_NEU_GLASS.md) | Canonical spec |
| [docs/elite-os-neu-glass-wave6.md](docs/elite-os-neu-glass-wave6.md) | Final report + screenshots |

Screenshots: `wave1-today-screenshot.png` … `wave5-train-screenshot.png` in this directory.

In-app catalog: `fitconnect://app/catalog` → **Neu-glass (Elite OS 2026)** section.

## Commands

```powershell
cd android
.\gradlew.bat :foundation:test
.\gradlew.bat :design-ui:testDebugUnitTest
.\gradlew.bat :athlete:testDebugUnitTest
.\gradlew.bat :app:assembleDebug
.\gradlew.bat :wear:assembleDebug
```

### Local QR install (no USB / adb)

```powershell
# From repo root — same Wi-Fi as your phone
pnpm android:qr
```

Engineering self-test (no phone): `pnpm android:qr:test`

Docs: [docs/android/ANDROID_LOCAL_DEMO_GUIDE.md](../docs/android/ANDROID_LOCAL_DEMO_GUIDE.md) · [docs/android/README.md](../docs/android/README.md)

Maestro (device required; often NOT_RUN):

```powershell
maestro test ..\maestro\android\smoke-foundation.yaml
```

## Design tokens

Source of truth: `packages/design-tokens`. Regenerate Kotlin:

```powershell
pnpm tokens:kotlin
pnpm tokens:kotlin:check
```

Key Compose paths:

- `design-ui/.../neumorphic/EosGlassSurface.kt` — glass chrome
- `design-ui/.../theme/EliteTypography.kt` — full Material3 font mapping
- `design-ui/.../theme/EliteResponsive.kt` — compact breakpoints
- `design-ui/.../charts/EliteChartPalette.kt` — chart colors from tokens

## Phase status

Canonical roadmap: [docs/master-plan/21_FINAL_ROADMAP.md](../docs/master-plan/21_FINAL_ROADMAP.md)

Current phase: **P0-SEC**. Historical phase-01…16 reports live in [docs/archive/](../docs/archive/).
