# E2E Matrix — Path A Maestro

| Journey | Tool | Result | Evidence |
|---------|------|--------|----------|
| Smoke cold launch | Maestro | PASS | EXIT 0 |
| Athlete full shell | Maestro `athlete/full_journey.yaml` | PASS | Hardening wave EXIT 0 |
| Coach full shell | Maestro `coach/full_journey.yaml` | PASS | EXIT 0 |
| Cross-role sequential | Maestro cross-role A+B | PASS | EXIT 0 |
| Offline kill device | Maestro + airplane | PARTIAL | Unit `OfflineKillMatrixTest` PASS |
| Notification tap deep link | FCM prod | BLOCKED | EXTERNAL |
| Dual-device booking receive | 2 devices + Supabase | BLOCKED | EXTERNAL |
| Wear session | Wear AVD | BLOCKED | No wear emulator on host |

Runbook: `maestro/README.md`
