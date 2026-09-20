# FitConnect V12 — Final Release Status

**SHA:** `3a62174`  
**Status:** **VERIFIED WITH EXTERNAL LIMITATIONS**

## Artifact for manual install

| Field | Value |
| --- | --- |
| APK | `FitConnectV12-Final.apk` |
| applicationId | `com.fitconnect.android` |
| versionCode | 18 |
| versionName | `0.1.0-rc.1-ia-polished` |
| Signature | Debug (LOCAL) — **not** Play-signed |
| SHA-256 | `D34B1DE1FD61AC501B6D7AFE178AEE2130B322D04302BDD643EB9380381C3041` |
| Wi‑Fi URL | `http://192.168.1.76:8765/FitConnectV12-Final.apk` |

## External limitations

| Item | Status |
| --- | --- |
| Xiaomi physical smoke | NOT VERIFIED — ADB unauthorized / wireless not paired |
| Play / release signing | NOT VERIFIED — `keystore.properties` absent (SIGN-02) |
| Production Web feature parity | NOT VERIFIED — V10–V12 APIs and `/nutrition`/`/ascend` return 404 on `fitconnect-phi.vercel.app` |
| WearOS / Garmin / WHOOP | NOT VERIFIED |

## Internally re-verified on this gate run

AVD Final APK cold launch · Maestro A–D · V12 security units 51/51 · Prod landing HTTP 200 without DEMO_MODE strings

Full matrix: `docs/qa/FITCONNECT_V12_FINAL_RELEASE_GATE.md`
