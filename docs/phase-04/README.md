# Phase 04 — Athlete OS

Native Kotlin/Compose **Athlete Operating System** (`:athlete`) on Design System 2.0 + Core Platform.

## Reports

| Report |
|--------|
| [Athlete_OS_Report.md](./Athlete_OS_Report.md) |
| [Navigation_Report.md](./Navigation_Report.md) |
| [Offline_Report.md](./Offline_Report.md) |
| [Performance_Report.md](./Performance_Report.md) |
| [Accessibility_Report.md](./Accessibility_Report.md) |
| [UX_Report.md](./UX_Report.md) |
| [QA_Report.md](./QA_Report.md) |
| [Technical_Debt.md](./Technical_Debt.md) |
| [DECISION-scope.md](./DECISION-scope.md) |

## Verify

```powershell
cd android
.\gradlew.bat :athlete:testDebugUnitTest :app:assembleDebug
```

Maestro (device required): `maestro/android/smoke-athlete-os.yaml`

## Stop

Do **not** start Coach OS / Maps / Telemetry / AI Engine without human approval.
