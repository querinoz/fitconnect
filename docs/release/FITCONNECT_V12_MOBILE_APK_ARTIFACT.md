# FitConnect V12 — Mobile APK Artifact Evidence (pre-device)

**Git SHA:** `f7095a7a12efc7f89fe16e8ebd615cb034eea333`  
**Branch:** `feat/fitconnect-roadmap-v10-v11`  
**Freeze ancestor:** `c78c2fd` OK  
**Built:** 2026-09-19  

## Artifact

```text
Artifact: FitConnectV12.apk
Path: D:\fitconnect\FitConnectV12.apk
Package: com.fitconnect.android
VersionCode: 16
VersionName: 0.1.0-rc.1-polish5
Size: 151149647 bytes (144.15 MB)
SHA256: 151F23AB6B14E1287F3C895DF3325C8A8A46C15B4500188352B0B4C17771B9A7
Build: PASS (:app:assembleDebug)
Installability check: PASS (ZIP intact + aapt badging)
Label: FitConnect DEBUG
ABI: arm64-v8a, armeabi-v7a, x86, x86_64
minSdk: 26 · targetSdk: 35 · compileSdk: 36
Signing: debug (release keystore.properties absent — SIGN-02 fail-closed)
API base (physical): https://fitconnect-phi.vercel.app (local.properties physical.apiBaseUrl)
```

## Why debug variant

- `android/keystore.properties` missing → `assembleRelease` blocked by design (SIGN-02).
- `google-services.json` present → debug keeps `applicationId = com.fitconnect.android` (no `.debug` suffix).
- Matches expected package for sideload smoke.

## Device transfer (Wi‑Fi)

USB ADB Interface on Redmi Note 9S was present but **not authorized** (PnP status Unknown).  
User requested **Wi‑Fi transfer**.

### Method: LAN HTTP (active)

```text
URL: http://192.168.1.76:8765/FitConnectV12.apk
Server: python http.server on 192.168.1.76:8765
Content-Length: 151149647 (matches APK)
HTTP probe: 200 OK (curl)
```

On the Xiaomi (same Wi‑Fi as PC):

1. Open Chrome / browser → paste the URL above  
2. Download → file lands in **Download**  
3. Install manually (Files / Download / FitConnectV12.apk)

### ADB Wi‑Fi push (optional, for later smoke)

Requires **Wireless debugging** enabled (Developer options). Classic `:5555` not open on LAN yet; mDNS empty. After pair/connect, agent can `adb push` without re-download.
