# Phase 08 — Technical Debt

| # | Item | Severity | Notes |
|---|---|---|---|
| 1 | Providers run on `SimulatedProviderSource` | Medium (known, by design) | No vendor SDK keys/OAuth apps exist for this build. Contracts, capabilities, failure taxonomy and consent flows are final; each real SDK lands inside one adapter class. Health Connect first (see HealthConnect_Report). |
| 2 | `InMemoryTelemetryStore` instead of Room/SQLite | Medium | Port (`TelemetryStore`) is DB-shaped (indexes, pages, source-record lookups). Swap is additive; no caller changes. Millions-of-records claims must be re-benchmarked on the DB implementation. |
| 3 | Sync checkpoints/pending queue not persisted across process death | Medium | Checkpoints live in engine memory. Persist alongside the Room store when it lands (same schema migration). |
| 4 | Cursor semantics assume provider cursors are range-independent | Low | True for the simulated source (absolute day cursor). Real adapters must return range-scoped cursors or reset on range change — enforce in adapter reviews. |
| 5 | Demo identity split: athlete app `ath-1` vs coach roster `a1` | Low | Debug bootstrap syncs both. Unify user/athlete identity when real auth lands (Phase 02 session already carries user id). |
| 6 | Coach roster list readiness numbers still seeded | Low | `RosterAthlete.readiness/recovery` on the list view are seed data; the detail view uses real authorized telemetry. Migrate list once telemetry has per-roster coverage. |
| 7 | WorkManager scheduler not implemented | Low | `BackgroundSyncPolicy` is ready; `:app` worker + constraints mapping is a small task gated on real providers (nothing to schedule for simulated data). |
| 8 | Device matrix testing not run | Medium | No device/emulator in this environment. Maestro flows + matrix documented; must run before release. |
| 9 | Battery/memory device profiling pending | Medium | Depends on #1/#8. Policy-level protections tested at unit level. |
| 10 | Sleep stages & location streams have models but no simulated generator | Low | `SleepSession`/`SleepStage`/`LocationSample` are modeled + stored (`upsertSleep`); generators land with real providers that emit them. |

No TODO/FIXME markers exist in code — this document is the single debt registry.
