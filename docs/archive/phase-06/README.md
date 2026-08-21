# Phase 06 — Sports Intelligence Engine

Central domain layer for every current and future FitConnect sport.

## Reports

| Report |
|--------|
| [Sports_Audit_Report.md](./Sports_Audit_Report.md) |
| [Sports_Architecture.md](./Sports_Architecture.md) |
| [Sports_Domain_Model.md](./Sports_Domain_Model.md) |
| [Sports_Registry.md](./Sports_Registry.md) |
| [Exercise_Engine.md](./Exercise_Engine.md) |
| [Workout_Engine.md](./Workout_Engine.md) |
| [Metrics_Engine.md](./Metrics_Engine.md) |
| [Performance_Engine.md](./Performance_Engine.md) |
| [Goal_Engine.md](./Goal_Engine.md) |
| [Competition_Engine.md](./Competition_Engine.md) |
| [Sports_QA_Report.md](./Sports_QA_Report.md) |
| [Technical_Debt.md](./Technical_Debt.md) |

## Verify

```powershell
cd android
.\gradlew.bat :sports:testDebugUnitTest :athlete:testDebugUnitTest :app:assembleDebug
```

## Stop

Do **not** start Maps / Telemetry / AI without approval.
