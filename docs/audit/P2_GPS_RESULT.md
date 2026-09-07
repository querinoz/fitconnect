# FITCONNECT — P2-GPS RESULT

**Date:** 2026-09-04
**Branch:** `feat/elite-os-v2`
**Push:** forbidden
**Production:** NO-GO

=========================================
FITCONNECT — P2-GPS RESULT
=========================================

## Verdict

**P2-GPS = ENGINEERING PASS** (capture + persist + sync path real; physical GPS hardware **NOT_VERIFIED**)

Truth notes:
- Outdoor production path no longer auto-walks `QaGpsRoute` (`allowSimulatedGps` default **false**).
- Emulator `adb emu geo fix` exercised as **TEST / SIMULATED DEVICE GPS INPUT** — not hardware proof.
- Full START→geo-fix→PAUSE→RESUME→FINISH UI tour on emulator was **not** instrumented end-to-end this cycle; Room + FusedLocation + unit/instrumentation + live RLS provide engineering evidence.

---

## Architecture

| Item | Status | Evidence |
|------|--------|----------|
| FusedLocationProviderClient | PASS | `FusedLocationGpsSource` · Play Services Location 21.3.0 |
| Sampling | DOCUMENTED | interval 2s · fastest 1s · HIGH_ACCURACY · minDisplacement 0 |
| Foreground service | PASS | `CaptureLocationService` · `foregroundServiceType=location` |
| Notification | PASS | FitConnect · Recording/Paused · elapsed · distance |
| ACCESS_BACKGROUND_LOCATION | NOT REQUESTED | intentional — foreground workout only |
| Room points + sessions | PASS | `LocationPointEntity` / `GpsSessionEntity` |
| Offline enqueue finish | PASS | `outdoor.activity.complete` + `outdoor.xp.award` |
| Canonical activity | PASS | `provider=GPS` → `activities` + `activity_route_points` |
| Map rewrite | OUT OF SCOPE | existing Canvas polyline only |

Docs: `docs/product/P2_GPS_ARCHITECTURE.md`, `GPS_DATA_CONTRACT.md`, `GPS_OFFLINE_SYNC.md`, `GPS_PRIVACY.md`

---

## Permissions

| State | Behavior |
|-------|----------|
| not granted | ERROR / PERMISSION_DENIED · no fake coords · rationale UI |
| fine/coarse granted | prepare → FGS → fixes |
| revoked mid-session | filter/source fails closed; no simulation fallback |

---

## Distance / speed / filter

| Rule | Value |
|------|-------|
| ACCEPT / LOW_CONFIDENCE / REJECT | `GpsAccuracyFilter` |
| LOW_ACCURACY_M | 50 |
| REJECT_ACCURACY_M | 200 |
| MAX_JUMP_M | 1500 |
| Distance | haversine on ACCEPT only |
| Speed | provider m/s preferred |

---

## Activity state

`IDLE → PREPARING → TRACKING` (TRACKING only after first ACCEPT) · `PAUSED` · `GPS_DEGRADED` · `FINISHING` · `SYNC_PENDING` · …

Recovery: Room `activeSession` includes `PREPARING|TRACKING|PAUSED|…`

---

## Sync / idempotency / RLS

| Item | Status | Evidence |
|------|--------|----------|
| API | PASS | `POST /api/v1/workout-sessions` branch `provider=GPS` |
| Idempotency | PASS (contract) | `(GPS, sessionId)` upsert; XP key `xp:user:session` |
| Live RLS GPS-012 | PASS | User B cannot read/insert route onto A activity |
| Live RLS suite | PASS | 5/5 with `P0_SEC_LIVE_RLS=1` · authenticated · rolbypassrls=false |
| Strava social | unchanged | still blocked by generated shareable + RLS |

---

## Privacy / security

- No lat/lon in OutdoorCapture logs (event names only).
- Notification shows elapsed/distance aggregates only.
- Emulator mock → `EMULATOR_INJECTED` (never claimed as LIVE hardware).

---

## Tests

| Layer | Result |
|-------|--------|
| GPS-001…012 unit | **12/12 PASS** (`GpsWaveUnitTest`) |
| LiveActivityEngine (+ allowSimulatedGps fixtures) | **7/7 PASS** |
| Room androidTest | **1/1 PASS** (`RoomGpsRouteStoreInstrumentationTest` on `fitconnect_phone`) |
| Wave 2 regression | **PASS** (`GuidedWorkoutWave2Test` + assembleDebug) |
| Web outdoor contracts | **3/3 PASS** |
| Web unit (no live RLS env) | **468 passed · 10 skipped** |
| Web typecheck (`@fitconnect/web`) | **PASS** |
| Live RLS activities | **5/5 PASS** (incl. GPS-012) |
| assembleDebug | **PASS** |

---

## Emulator

| Item | Status |
|------|--------|
| AVD | `fitconnect_phone` / emulator-5554 |
| `adb emu geo fix -9.1393 38.7223` | OK — **TEST / SIMULATED DEVICE GPS INPUT** |
| End-to-end outdoor UI geo tour | **NOT_VERIFIED** (no dedicated UI instrumentation this cycle) |

## Physical device

**REAL_DEVICE_GPS = NOT_VERIFIED** (only emulator attached)

---

## Exit gate (honest)

| Gate | Status |
|------|--------|
| Real FusedLocationProviderClient | ✅ |
| No production outdoor QaGpsRoute walk | ✅ |
| Permission lifecycle | ✅ engineering |
| FGS + notification | ✅ |
| Room route points | ✅ |
| Accuracy / speed / UTC timestamps | ✅ |
| Distance from accepted points + jump filter | ✅ |
| Pause/resume same activity | ✅ unit |
| Offline recording + enqueue | ✅ engineering |
| Recovery from Room | ✅ engineering |
| One GPS activity + sync path | ✅ |
| Idempotency contract | ✅ |
| RLS isolation proven | ✅ live GPS-012 |
| Emulator geo input | ✅ labeled simulated |
| Emulator full UI route tour | ❌ NOT_VERIFIED |
| Physical GPS | ❌ NOT_VERIFIED |
| Build / unit / instrument / web | ✅ |
| Sensitive GPS logging | ✅ (no coords in logs) |
| Docs | ✅ |

---

## P0 / P1 / P2 / P3

**P0** — none blocking engineering gate.

**P1**
- Emulator UI instrumentation: Start → geo fix stream → Pause → Resume → Finish → enqueue evidence.
- Physical device permission + screen-off + FGS soak when a phone is available.

**P2**
- Coarse-only degraded UX polish; GPS_LOST / GPS_RECOVERED explicit events if product wants them beyond `GPS_DEGRADED`.
- Elevation gain reliability gates (currently opportunistic from altitude when present).

**P3**
- MapLibre production visualization (explicitly deferred).
- Battery / batching tuning beyond 2s interval.

---

## PRODUCTION

**PRODUCTION = NO-GO**

Push / FCM / Play signing / Watch / Social remain out of scope.

---

## NEXT RECOMMENDED PHASE

State only — **do not start**:

**MapLibre / route visualization polish** (consume real Room route points)
*or* remaining product gaps that do not include Wear / Social / production / FCM.

STOP RULE honored: no Wear · Realtime product · Social · Squad · ASCEND V2 · Heatmap · Muscle Map · Importers · Production.
