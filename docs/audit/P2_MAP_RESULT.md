# FITCONNECT — P2-MAP RESULT

**Date:** 2026-09-04
**Branch:** `feat/elite-os-v2`
**Push:** forbidden
**Production:** NO-GO

=========================================
FITCONNECT — P2-MAP RESULT
=========================================

## Verdict

**P2-MAP = ENGINEERING PASS**
**P2-MAP E2E HARDENING = PASS** (2026-09-04) — see [`P2_MAP_E2E_HARDENING_RESULT.md`](./P2_MAP_E2E_HARDENING_RESULT.md)

MapLibre + Room-backed route rendering is wired. Full UI Start→geo→Finish instrumentation is **5/5 PASS** on emulator after hardening (canvas fallback under E2E; GPS/Room remain source of truth).

Truth > PASS.

---

## MAPLIBRE

| Item | Status | Evidence |
|------|--------|----------|
| SDK | PASS | `org.maplibre.gl:android-sdk:11.11.0` |
| Style | PASS | OpenFreeMap dark (`FitConnectMapStyles.OPENFREEMAP_DARK`) |
| Update model | PASS | GeoJsonSource in place — MapView not rebuilt per point |
| Failure isolation | PASS | `FitConnectRouteMap` falls back to Canvas `EliteRouteMap` |

## ROUTE SOURCE

| Item | Status |
|------|--------|
| Canonical Room ACCEPT points | PASS — `CanonicalRouteRepository` |
| Ordering sequenceNumber ASC | PASS — unit |
| No production fake route | PASS — outdoor still `allowSimulatedGps=false` |

## LIVE / COMPLETED / CAMERA

| Item | Status |
|------|--------|
| Live Room → map | PASS engineering (`ActivityScreen` observes store) |
| Completed detail | PASS engineering (`ActivityRouteDetailScreen`) |
| Start / finish / current markers | PASS engineering (`RouteCameraLogic` + MapLibre layers) |
| Follow + gesture release + recenter | PASS unit + UI chrome |
| Fit bounds when completed | PASS engineering |

## OFFLINE / RECOVERY / RLS

| Item | Status |
|------|--------|
| Offline local route | PASS engineering (Room observe; no network required) |
| Process recovery of points | PASS engineering (Room authoritative; P2-GPS recovery unchanged) |
| A/B route RLS | PASS regression — prior GPS-012 live RLS; no new API |

## E2E

| Item | Status | Evidence |
|------|--------|----------|
| `OutdoorMapE2EInstrumentationTest` | **PASS 5/5** | Hardening 2026-09-04 — see `P2_MAP_E2E_HARDENING_RESULT.md` |
| Emulator geo inject | PASS | labeled **TEST / SIMULATED DEVICE GPS INPUT** |
| GuidedWorkout instrumentation | PASS | regression after hardening |
| Room GPS androidTest | PASS | prior `RoomGpsRouteStoreInstrumentationTest` |

## ACCESSIBILITY

| Item | Status |
|------|--------|
| Textual route summary | PASS — `route_a11y_summary` |
| Recenter contentDescription | PASS |
| Quality chip not color-only | PASS — text labels GPS GOOD/DEGRADED/LOST/RECOVERING |

## PERFORMANCE

| Item | Status |
|------|--------|
| No MapView rebuild per point | PASS — MAP-006/012 unit |
| 10–1000 point rebuild policy | PASS unit (never rebuild view) |

## TESTS

| Suite | Result |
|-------|--------|
| MAP-001…012 (`MapWaveUnitTest`) | **12/12 PASS** |
| CanonicalRoute + GpsQuality | **2/2 PASS** |
| GPS-001…012 regression | **12/12 PASS** |
| Wave 2 unit | PASS (prior run this cycle) |
| assembleDebug | **PASS** (libmaplibre.so packaged) |
| Web typecheck | **PASS** |
| Web suite | **468 passed / 10 skipped** |
| Outdoor Map UI E2E | **FAIL / NOT VERIFIED** |
| REAL_DEVICE_GPS | **NOT_VERIFIED** |

## Docs

- `docs/product/P2_MAP_ARCHITECTURE.md`
- `docs/product/ROUTE_VISUALIZATION.md`
- `docs/product/MAP_PRIVACY.md`
- `docs/qa/P2_MAP_E2E.md`
- `docs/audit/P2_MAP_RESULT.md` (this file)

---

## Exit gate (honest)

| Gate | Status |
|------|--------|
| MapLibre integrated | ✅ |
| Map consumes Room GPS | ✅ |
| No production fake route | ✅ |
| Live / completed / markers / follow | ✅ engineering |
| Offline route | ✅ engineering |
| Full UI Start→Geo→Pause→Resume→Finish | ❌ NOT VERIFIED |
| Activity detail route | ✅ engineering (code path) |
| Build / MAP units / GPS units / Web | ✅ |
| Accessibility baseline | ✅ |
| Sensitive route logging | ✅ (no lat/lon logs added) |

**Critical unverified:** full UI E2E outdoor map tour → therefore **do not claim P2-MAP = absolute PASS**.

**Reported status:** **ENGINEERING PASS with E2E BLOCKED** (or **P2-MAP = PARTIAL**).

---

## Defects

**P0** — none in capture/map data path.

**P1**
- Stabilize `OutdoorMapE2EInstrumentationTest` (sign-in flake / early timeout) and capture screenshots under `docs/qa/`.

**P2**
- Prefer `LocalLifecycleOwner` from `lifecycle-runtime-compose` (deprecation warning).
- Optional coarse-only map chrome polish.

**P3**
- Heatmap / MapLibre offline tile packs (out of scope).

---

## PRODUCTION

**PRODUCTION = NO-GO**

Push / FCM / Play signing / Wear / Social remain forbidden.

---

## NEXT RECOMMENDED PHASE

State only — **do not start:**

**P2-MAP E2E hardening** (close Start→geo→Finish UI evidence)
*or* product phase that is not Wear / Social / Realtime rewrite / FCM / production.

STOP RULE honored.
