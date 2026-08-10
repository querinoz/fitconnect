# FitConnect Android (native)

Kotlin + Jetpack Compose application per **ADR-005**. This is the production mobile track.

`apps/mobile` (Expo) is **frozen legacy** and must not receive new features.

## Modules

| Module | Responsibility |
|--------|----------------|
| `:app` | Application shell, navigation, theme wiring |
| `:foundation` | Errors, logging, network, storage, offline queue, analytics, DI root |
| `:design` | Generated Elite Surface color tokens (`pnpm tokens:kotlin`) |
| `:core-capture` | Capture/sensor bridge scaffold |
| `:wear` | Wear OS scaffold (build decision at F13) |

## Commands

```powershell
cd android
.\gradlew.bat :foundation:test
.\gradlew.bat :app:assembleDebug
.\gradlew.bat build
```

Maestro (device required):

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

- Phase 01 = foundation ports  
- Phase 02 = Core Platform  
- Phase 03 = **Design System 2.0** (`:design` tokens + `:design-ui` components + catalog route)  

No Athlete, Coach, Maps, AI, Payments, or Dashboard features yet.

See `docs/phase-03/`. Tokens: `pnpm tokens:kotlin`.
