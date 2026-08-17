# Watch ↔ mobile test matrix

**Date:** 2026-08-17  
Statuses: PASS / FAIL / BLOCKED / UNVERIFIED / PENDING_HUMAN / EMULATOR_LIMITATION / TEST_FIXTURE

| Test | Phone | Watch | Result | Evidence |
|------|-------|-------|--------|----------|
| Build assembleDebug | ✓ | ✓ | **PASS** | `.\gradlew :app:assembleDebug :wear:assembleDebug` BUILD SUCCESSFUL |
| Unit tests | ✓ | n/a (`:wear` has no unit tests) | **PASS** | `.\gradlew test` — **166 tests, 0 failures** |
| Install | | | **BLOCKED** | `adb devices` empty; emulator exit: hypervisor driver not installed |
| Launch | | | **BLOCKED** | same |
| Pair | | | **PENDING_HUMAN** | CapabilityClient implemented; no second node |
| Connect | | | **PENDING_HUMAN** | CONNECTED only if remote `fitconnect_telemetry` reachable |
| HR | | ✓ | **EMULATOR_LIMITATION** | Health Services probe returns UNAVAILABLE; watch UI shows `HR UNAVAILABLE`; wire sample availability UNAVAILABLE |
| GPS | | ✓ | **EMULATOR_LIMITATION** | Not bound; LOCAL_DEMO distance on phone engine only |
| Pace / distance | ✓ LOCAL_DEMO | LOCAL_DEMO envelope | **TEST_FIXTURE** / LOCAL_DEMO | `LiveActivityEngineTest` |
| Cadence | | | **PASS** (honest) | envelope CADENCE value null + UNAVAILABLE |
| Session SM | ✓ | ✓ | **PASS** | `SharedDomainTest`, `LiveActivityEngineTest` |
| Pause / Resume / End | ✓ | ✓ | **PASS** (logic) | engines + `SessionControlCommand` round-trip |
| Sync protocol | ✓ | ✓ | **PASS** (TEST_FIXTURE) | `WearTelemetryInbox` ACCEPTED then DUPLICATE |
| Offline queue | ✓ | ✓ | **PASS** (TEST_FIXTURE) | `OutboxQueue` + `InMemoryWearSessionLink` |
| Reconnect flush | | | **UNVERIFIED** on device | GMS flush when nodes appear — no hardware |
| Duplicate prevention | ✓ | ✓ | **PASS** | `SequenceDeduper` + inbox |
| Realtime cloud | | | **BLOCKED** / PENDING_HUMAN | no production Supabase on device |
| Battery state | | | **PASS** (honest) | UI shows Battery UNAVAILABLE — not 82% fake |
| Health Connect SDK probe | ✓ | n/a | **PASS** (classpath) | `androidx.health.connect` linked; records not read |
| Xiaomi | | | **BLOCKED_EXTERNAL_DEPENDENCY** | `XiaomiPlatformAdapter` |
| assembleRelease | | | **PENDING_HUMAN** | keystore + FCM + secrets required by Gradle gates |
| Lint `:wear` | | ✓ | **PASS** | `:wear:lintDebug` succeeded |
| Lint `:app` | ✓ | | **FAIL** | 23 pre-existing `MissingTranslation` errors (es/…) — not introduced by Wear/KMP files |
| Maestro | | | **BLOCKED** | no device |
| Visual screenshots | | | **UNVERIFIED** | no emulator |
