# ANDROID_HUMAN_PENDING

**Date:** 2026-08-15

These items must stay `PENDING_HUMAN`. They were not invented or faked as PASS.

| Item | Why blocked |
|------|-------------|
| Production Supabase URL / anon key / service role | Secrets not in repo; must not be fabricated |
| Firebase / FCM production | Push remains LOCAL_DEMO until credentials exist |
| Google Cloud / Test Lab login | No account in this agent session |
| Production keystore / Play signing | Debug signing only |
| Play Store listing / upload | LOCKED |
| Physical Android phone walkthrough | Agent has no attached device (`adb devices` empty) |
| Physical Wear OS device | Watch APK built; pairing not executed |
| BIOS VT-x + AEHD hypervisor | `emulator -accel-check` → **accel: 6** |
| Maestro on emulator | No booted AVD |
| Stitch project access | HTTP 500 — cannot pixel-compare |
| AI Studio mock access | Google sign-in (prior session) |
| LiveKit production rooms | Sessions use LOCAL_DEMO preview machine |
| Real GPS / BLE / Health Connect bind | Activity engine is simulated and labeled LOCAL_DEMO |

## What a human should do next (ordered)

1. Enable virtualization in firmware **or** plug in a phone on the same LAN as `pnpm android:qr`.
2. Install `app-debug.apk` (SHA-256 `A269251825A99D4EE6CE4FDA675C4A741D7408DB100BD22CB56681D27580F9E8`).
3. Walk Athlete (Inês `ines@fitconnect.demo` / `password1`) and Coach (Tomás `tomas@fitconnect.demo` / `password1`).
4. Run `maestro test maestro/android/` against that device.
5. Only then fill production IdP / FCM / signing.
