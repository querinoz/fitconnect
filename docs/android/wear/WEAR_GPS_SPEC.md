# GPS spec

## Recorded fields

latitude, longitude, timestampEpochMs, altitudeM, accuracyM, speedMps, bearingDeg

## Derived

distance (haversine), pace s/km, speed, elevation gain/loss, moving vs elapsed, average/best pace

## QA fixture (`QaGpsRoute`)

Five points north of Lisbon public coordinates:

START → ~500 m → ~1 km → ~1.5 km → FINISH (~2.0 km)

HR fixture 120, 135, 148, 165, 178 is **TEST_FIXTURE only**.

## Production rule

Do not label SIMULATED or emulator `geo fix` as LIVE.  
`GpsFeedStatus.LIVE` is reserved for a non-mock LocationManager/FusedLocation sample. That binder is not the default in LOCAL_DEMO UI.

## Indoor sports

INDOOR_RUN / INDOOR_CYCLING / STRENGTH / MOBILITY / RECOVERY / CUSTOM → GPS UNAVAILABLE, no polyline.
