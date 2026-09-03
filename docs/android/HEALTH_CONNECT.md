# Android Health Connect — FitConnect integration

**Status:** ENGINEERING PARTIAL (read path implemented; write / background sync PLANNED)  
**Reference:** [Android Health & Fitness dev center](https://developer.android.com/health-and-fitness?hl=pt-br)

FitConnect uses **Health Connect** as the fitness data core per `AGENTS.md`. **Google Fit is not used** (API support ends end of 2026 — migrate to Health Connect per Google).

## What Google provides vs FitConnect

| Platform (Google) | FitConnect status | Notes |
|-------------------|-------------------|-------|
| [Health Connect](https://developer.android.com/health-and-fitness/health-connect?hl=pt-br) Jetpack **1.1.0** | **PARTIAL** | SDK probe, permissions, exercise read, latest HR read |
| Exercise routes (`ExerciseRoute`) | PLANNED | Domain `WorkoutStreams.latLng` exists; HC route import not wired |
| Sleep / steps records | PARTIAL | `READ_SLEEP` in manifest; incremental consent policy defined; readers PLANNED |
| Medical records (FHIR) | OUT OF SCOPE | Coaching app — not a clinical records product |
| [Wear Health Services](https://developer.android.com/health-and-fitness/fitness?hl=pt-br) | PARTIAL | Capability probe; `ExerciseClient` / live HR PLANNED (P7) |
| Sensor Manager / Recording API | PLANNED | `EliteCapture` placeholder; not production GPS yet |
| [Samples](https://developer.android.com/health-and-fitness/samples?hl=pt-br) | Reference only | FitConnect implements own `FitnessProvider` adapters |
| Google Fit migration | **N/A** | No Google Fit code in repo |

## Architecture

```
Health Connect APK / embedded SDK
        ↓
HealthConnectExerciseSessionReader  →  ExerciseSessionDto  →  WorkoutSessionStore
HealthConnectHeartRateReader        →  HeartRate (telemetry)
        ↓
FitnessProvider (HealthConnectSource) — ViewModels never import androidx.health.*
```

Strava remains a separate `FitnessProvider` adapter with `shareable = false` (never social).

## Permissions (incremental)

| Feature | Records | Manifest |
|---------|---------|----------|
| Onboarding | ExerciseSession, Steps, HeartRate, Distance | `READ_*` declared |
| Sleep (later) | SleepSession | `READ_SLEEP` declared |

Policy: `HealthConnectPermissionPolicy` in `core:fitness/domain/Models.kt`.

UI: `HealthConnectStatusCard` (install/update) + `HealthConnectPermissionCard` (grant) on Today.

## Key files

| File | Role |
|------|------|
| `core/fitness/.../HealthConnectSource.kt` | `FitnessProvider` + Changes API cursor |
| `core/fitness/.../HealthConnectExerciseSessionReader.kt` | `readRecords` / `getChanges` |
| `core/fitness/.../HealthConnectPermissionGateway.kt` | Granted permission checks |
| `athlete/di/FitnessContainer.kt` | Composition root for HC |
| `telemetry/.../HealthConnectHeartRateReader.kt` | Latest HR sample |
| `app/AndroidManifest.xml` | HC permissions + `ViewPermissionUsageActivity` alias |

## Verification

```powershell
cd android
.\gradlew.bat :core:fitness:testDebugUnitTest :athlete:testDebugUnitTest :telemetry:testDebugUnitTest
```

On-device: grant Health Connect permissions on Today → workouts sync into `WorkoutSessionStore` (in-memory until Room lands).

## Remaining work (aligned with master plan)

1. Room persistence for `WorkoutSessionStore`
2. WorkManager background sync + `getChanges` token persistence
3. Sleep / steps readers + Device Center real data
4. Write workouts + routes back to HC after `EliteCapture` ships
5. Wear `ExerciseClient` during active sessions
6. Bridge `HealthConnectProvider` telemetry facade to `FitnessContainer` (remove simulated duplicate)

**Production:** NO-GO until P1-DATA + live RLS apply.
