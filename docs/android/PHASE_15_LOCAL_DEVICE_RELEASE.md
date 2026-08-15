# PHASE_15_LOCAL_DEVICE_RELEASE.md

## Objective

`LOCAL_DEVICE_RELEASE = READY` — a human runs one command, scans a QR, installs the DEBUG APK, and explores the full LOCAL_DEMO product **without** USB/adb/production credentials.

Agent does **not** claim physical install PASS.

## Architecture

```
pnpm android:qr
  → :app:assembleDebug
  → validate APK + SHA-256
  → .fitconnect-local-distribution/ (gitignored)
  → index.html + qr.svg + app.apk + meta.json
  → LAN HTTP server (dedicated dir only)
  → print URL + ASCII QR
```

LOCAL_DEMO runtime (debug, no IdP): `LocalAuthRepository`, `InProcessRealtimeClient`, `DevNotificationGateway`, local athlete/coach/geo/community repositories. Release remains fail-closed (SIGN-02 + Supabase secrets).

## Commands

```powershell
pnpm android:qr
# or
.\android\scripts\run-local-distribution.ps1

# Engineering self-test (no phone):
.\android\scripts\run-local-distribution.ps1 -SelfTest
pnpm android:qr:test
```

## QR workflow

1. PC builds DEBUG APK (`com.fitconnect.android.debug`).
2. Detect private LAN IPv4 (not loopback).
3. QR encodes `http://<LAN>:<PORT>/` — never localhost.
4. Phone on same Wi-Fi → scan → install page → INSTALL APK.
5. Android may ask unknown-source permission — expected; not bypassed.

## Local demo behavior

Personas: Inês / Marina (athlete), Tomás (coach), password `password1`.  
Interactive LOCAL_DEMO: onboarding, readiness, telemetry, discover, booking, live-session FSM, community, programs, map overlay, coach command center.  
Live session / map explicitly labeled demo — not LiveKit / live GPS production.

## Known limitations

- DEVICE_INSTALLATION / Maestro device / Live Auth / FCM / Realtime prod / Test Lab / Signing / Play = PENDING_HUMAN or LOCKED
- Marina athlete login may share primary ath-1 home seed (roster/bookings already Marina)
- QR_DECODE auto-verify UNAVAILABLE without a decoder library (generation still PASS)
- Visual device screenshots BLOCKED without a phone

## Human steps

1. Same Wi-Fi as PC  
2. `pnpm android:qr`  
3. Scan QR → open page → install APK  
4. Open FitConnect → LOCAL DEMO  
5. Walk athlete + coach journeys end-to-end  

## Production limitations

`assembleRelease` without keystore + Supabase fails closed (verified). Do not weaken.

## Security model

Server binds LAN port; serves only `.fitconnect-local-distribution/`. Rejects `..`, `.env`, `.git`, keystore/local.properties, docs, package.json probes. No uploads/shell. Stop server with Enter (interactive) or end of `-SelfTest`.

## Troubleshooting

| Issue | Action |
|-------|--------|
| Phone cannot open URL | Same Wi-Fi? Firewall inbound port? VPN adapter? |
| Wrong QR host | Must be LAN IP from script output |
| Install blocked | Allow install from browser |
| Empty APK | Run without `-SkipBuild` |

## Exit gate

See `PHASE_15_EXIT_GATE.md` and `ANDROID_LOCAL_QR_DISTRIBUTION_EXIT_GATE.md`.
