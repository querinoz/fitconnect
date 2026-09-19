# FitConnect V12 — Information Architecture Release

## Scope

De-clutter TRAIN agglomeration; enforce domain ownership; rebuild sport selector (groups → sports → confirm); separate Train Plan, Nutrition subsurfaces, GPS/Routes; Android + Web parity; keep `applicationId` `com.fitconnect.android`.

## Artifact

| Field | Value |
|-------|-------|
| APK name | `FitConnectV12-IA-Polished.apk` |
| applicationId | `com.fitconnect.android` |
| versionCode | 18 |
| versionName | `0.1.0-rc.1-ia-polished` |
| Build type | debug (release signing keystore absent — SIGN-02 fail-closed) |
| Path | `docs/qa/physical/FitConnectV12-IA-Polished.apk` |
| SHA-256 | `D34B1DE1FD61AC501B6D7AFE178AEE2130B322D04302BDD643EB9380381C3041` |

## Security

No intentional changes to device isolation, coach consent, private events, MCP `strainScore`, MANUAL≠REAL, or device POST ACL. Local Active Training Sport preference is non-sensitive prefs (`PreferenceKeys.ACTIVE_TRAINING_SPORT`) for offline identity fallback only.

Regression: `:foundation:testDebugUnitTest *SecurityRegression*` — PASS.

## Status

**VERIFIED** on AVD `fitconnect_phone` (Maestro A–E PASS) + Android unit + web registry IA tests.

## NOT VERIFIED

- Physical Xiaomi (no ADB device)
- Play-signed release APK (keystore missing)
- Production web deploy
- iOS
