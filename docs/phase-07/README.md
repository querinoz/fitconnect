# Phase 07 — Maps, Discovery & Booking Engine

Geospatial + scheduling backbone (`:geo`).

## Reports

| Report |
|--------|
| [Maps_Audit_Report.md](./Maps_Audit_Report.md) |
| [Maps_Architecture.md](./Maps_Architecture.md) |
| [Discovery_Engine.md](./Discovery_Engine.md) |
| [Booking_Engine.md](./Booking_Engine.md) |
| [Availability_Engine.md](./Availability_Engine.md) |
| [Route_Engine.md](./Route_Engine.md) |
| [Offline_Maps_Report.md](./Offline_Maps_Report.md) |
| [Performance_Report.md](./Performance_Report.md) |
| [Accessibility_Report.md](./Accessibility_Report.md) |
| [QA_Report.md](./QA_Report.md) |
| [Technical_Debt.md](./Technical_Debt.md) |

## Verify

```powershell
cd android
.\gradlew.bat :geo:testDebugUnitTest :athlete:testDebugUnitTest :coach:testDebugUnitTest :app:assembleDebug
```

## Stop

Do **not** start Telemetry / Wearables / AI without approval.
