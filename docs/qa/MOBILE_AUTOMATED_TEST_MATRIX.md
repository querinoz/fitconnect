# Mobile Automated Test Matrix

**Date:** 2026-09-07

| ID | Function | Expected | Actual | Status |
|----|----------|----------|--------|--------|
| MOBILE-001 | Deep link classify | Path → destination | DeepLinkClassifyTest 7/7 | PASS |
| MOBILE-002 | Identity badge | REAL > LOCAL_DEMO | identityBadgeLabel tests | PASS |
| MOBILE-003 | Guided ownership | Foreign user rejected | P2CORE-001 | PASS |
| MOBILE-004 | Guided provider | STRAVA rejected | P2CORE-002 | PASS |
| MOBILE-005 | Coach roster source | seed/empty/postgres | P2CORE-003 | PASS |
| MOBILE-006 | Coach sessions source | labeled + status | P2CORE-004 | PASS |
| MOBILE-007 | Coach programs source | labeled | P2CORE-005 | PASS |
| MOBILE-008 | Coach bookings source | labeled | P2CORE-006 | PASS |
| MOBILE-009 | HC durable sync | Room upsert / dedupe | HealthConnectDurableSyncTest | PASS (prior) |
| MOBILE-010 | Map E2E | 5/5 | OutdoorMapE2E | PASS (prior) |
| MOBILE-011 | Strava banned paths typing | refreshToken null | index.test.ts | FIXED |
| MOBILE-012 | Physical SM gate | Device PASS | No device | BLOCKED |

## Commands

```powershell
pnpm typecheck
pnpm test
pnpm test:coverage
cd android; .\gradlew.bat :app:assembleDebug :foundation:testDebugUnitTest
```
