# Phase 05 — Coach OS

Native Kotlin/Compose **Coach Operating System** (`:coach`).

## Reports

| Report |
|--------|
| [Coach_OS_Report.md](./Coach_OS_Report.md) |
| [Coach_Architecture.md](./Coach_Architecture.md) |
| [Program_Builder_Report.md](./Program_Builder_Report.md) |
| [Analytics_Report.md](./Analytics_Report.md) |
| [Offline_Report.md](./Offline_Report.md) |
| [Accessibility_Report.md](./Accessibility_Report.md) |
| [Performance_Report.md](./Performance_Report.md) |
| [QA_Report.md](./QA_Report.md) |
| [Technical_Debt.md](./Technical_Debt.md) |
| [DECISION-scope.md](./DECISION-scope.md) |

## Verify

```powershell
cd android
.\gradlew.bat :coach:testDebugUnitTest :app:assembleDebug
```

Coach demo: Auth → **Enter coach demo** (`coach@fitconnect.app`).

## Stop

Do **not** start Sports Engine / Maps / Telemetry / AI without human approval.
