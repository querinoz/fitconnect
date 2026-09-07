# HUMAN_FINAL_ACTIONS — FitConnect

Only genuine human dependencies. Ordered by unblock value.

## 1. Enable virtualization (unblocks ALL native runtime QA)
- WHAT: Reboot → BIOS/UEFI → enable SVM (AMD) / VT-x. Then Windows Hypervisor Platform (OptionalFeatures.exe) or Android Emulator hypervisor driver (AEHD).
- WHY: `querino` reports "Virtualization Enabled In Firmware: No" → no emulator, no Gradle-run, no ADB, no Wear.
- VERIFY: `emulator -avd fitconnect_phone` boots; `adb devices` lists it.
- OUTPUT: Phases Android/Wear/Cross-platform become executable.

## 2. Confirm this is intended as a DEMO deployment, not a live product
- WHAT: Decide whether fitconnect-phi.vercel.app should stay demo (banner "no real backend") or connect real Firebase auth + Supabase data + Stripe live.
- WHY: All app data today is client-seeded; localStorage "auth" is forgeable (fine for demo, not for real users).
- VERIFY: With DEMO_MODE=false + Firebase configured, protected routes return 401/200 with real tokens instead of 503.

## 3. Rotate & audit local secrets
- WHAT: `.env.local` and `.vercel/.env.production.local` on the dev machine contain live Stripe secret, Supabase service_role, Strava secrets. Confirm they were NEVER committed (`git log -p --all -- '*.env*'`), rotate if in doubt.
- WHY: real credentials on disk; a single accidental commit exposes prod.
- VERIFY: git history clean; keys rotated in Stripe/Supabase/Strava dashboards.

## 4. Wire real device GPS (engineering, but needs product decision on scope)
- WHAT: geo/LocationEngine has no FusedLocationProvider/LocationManager implementation (only mock). Add play-services-location binding.
- WHY: native "GPS/telemetry" cannot acquire real location today.

## 5. Physical device pass (after #1)
- WHAT: One phone + one Wear watch for the phone↔watch journeys and cross-platform identity/event tests.
- WHY: emulator evidence cannot stand in for Data Layer + sensor behaviour.
