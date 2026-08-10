# ANDROID_LOCAL_DEMO_GUIDE.md

Install the **debug** APK and explore FitConnect without Supabase, Firebase, or production signing.

## Install

```powershell
cd D:\fitconnect\android
.\gradlew.bat :app:assembleDebug
adb install -r app\build\outputs\apk\debug\app-debug.apk
adb shell am start -n com.fitconnect.android.debug/com.fitconnect.android.MainActivity
```

**Package:** `com.fitconnect.android.debug`  
**Activity:** `com.fitconnect.android.MainActivity`

## Demo auth

| Persona | Email | Password | Role |
|---------|-------|----------|------|
| Inês | `ines@fitconnect.demo` | `password1` | Athlete |
| Marina | `marina@fitconnect.demo` | `password1` | Athlete |
| Tomás | `tomas@fitconnect.demo` | `password1` | Coach |

Use the on-screen persona buttons on Auth when available.

## Story coherence (LOCAL_DEMO)

- Primary athlete narrative: **Inês Costa** (`ath-1`)
- Second athlete on coach surfaces / bookings / places: **Marina Santos**
- Primary coach in Discover: **Tomás Rivera** (place id `p_coach_maya` retained for stability)
- Booking state lives in shared `BookingEngine` for the process lifetime

## Suggested walkthrough

1. Auth → Inês → athlete onboarding (if first launch) → Home (Prime Recovery)
2. Recovery → Telemetry → Training (join LOCAL_DEMO session: mute / camera / end)
3. Discover → search coach → open profile → book day/time → confirm
4. Programs → enroll → Community → react / comment
5. Profile / notifications
6. Sign out → Tomás → coach onboarding → Overview
7. Athletes (group chips) → Athlete detail → Bookings (should reflect athlete creates) → Sessions / Programs / Inbox

## Labels to trust

- Live session UI is **LOCAL_DEMO**, not LiveKit production
- Map overlay is **LOCAL MAP / demo fixture**, not live GPS
- Notifications use **DevNotificationGateway** in demo

## Production

Release builds remain **fail-closed** without human-owned Supabase / FCM / signing configuration. Do not expect production IdP or push in this APK.
