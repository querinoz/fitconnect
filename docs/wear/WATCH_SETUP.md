# FitConnect Wear OS setup

Application ID: `com.fitconnect.android.wear`  
Phone: `com.fitconnect.android` (debug suffix `.debug`)

## Build

```powershell
cd android
.\gradlew :wear:assembleDebug :app:assembleDebug
```

APKs:

- `android/wear/build/outputs/apk/debug/`
- `android/app/build/outputs/apk/debug/`

## Pairing (platform)

1. Pair the watch in **system Bluetooth / Wear OS** (not a FitConnect QR flow).
2. Install both APKs (same major Play Services).
3. Launch phone and watch apps so both advertise capability `fitconnect_telemetry`.
4. Device Center must show **CONNECTED** only when a **remote** node is reachable.

If the watch is Bluetooth-paired but the Wear app is not running, FitConnect shows **NOT_PAIRED**.

## Watch UX

- START MONITORING / PAUSE / RESUME / END
- Elapsed, pace, distance from LOCAL_DEMO engine
- **HR UNAVAILABLE** unless Health Services reports AVAILABLE (this build’s probe does not claim a sensor)
- Voltline / Floor / Telemetry tokens from `:design`

## Permissions

Watch manifest declares `BODY_SENSORS` and `ACTIVITY_RECOGNITION`. Declaring them is not a sensor reading.

## Blocked on this machine

- No Wear AVD image installed
- Phone AVD cannot start without Windows hypervisor driver (admin)
