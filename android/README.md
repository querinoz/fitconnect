# FitConnect Android (native)

Kotlin + Jetpack Compose application per **ADR-005**. This is the **production-track** mobile codebase (not a Play GO).

Status: **LOCAL DEMO** · Watch sync **UNVERIFIED** · **PRODUCTION = NO-GO**

`apps/mobile` (Expo) is **frozen legacy** and must not receive new features.

## Modules

| Module | Responsibility |
|--------|----------------|
| `:app` | Application shell, navigation, theme wiring |
| `:foundation` | Errors, logging, network, storage, offline queue, analytics, DI root |
| `:design` | Generated Elite Surface color tokens (`pnpm tokens:kotlin`) |
| `:core-capture` | Capture/sensor bridge scaffold (`EliteCapture` is a placeholder) |
| `:wear` | Wear OS module (P7 certification PENDING_HUMAN) |

## Commands

```powershell
cd android
.\gradlew.bat :foundation:test
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

## Phase status

Canonical roadmap: [docs/master-plan/21_FINAL_ROADMAP.md](../docs/master-plan/21_FINAL_ROADMAP.md)

Current phase: **P0-SEC**. Historical phase-01…16 reports live in [docs/archive/](../docs/archive/).
