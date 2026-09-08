# FitConnect Mobile Master Checklist — Path A (autonomous completion)

**Architecture:** Compose Android + Wear + SwiftUI source. Expo archived.  
**Updated:** 2026-09-08  
**releaseStatus:** BLOCKED  
**engineeringStatus:** RELEASE_CANDIDATE_CODE_OWNED

## Verified PASS (code-owned)

| Area | Status |
|------|--------|
| Booking durable store + HTTP + SyncQueue | PASS |
| Athlete GET `/api/v1/bookings` | PASS |
| Community remote routing + Strava filter | PASS |
| SQL 020 Strava-never-social (code) | PASS (apply EXTERNAL) |
| LiveKit port fail-closed | PASS |
| Wear ReadinessSource (no silent 88) | PASS |
| FCM deep-link routing + fail-closed release | PASS |
| Stripe fail-closed / no fake paid | PASS |
| Telemetry provenance UI labels | PASS |
| Sports catalog ≥50 | PASS |
| Programs HttpProgramRemote | PASS |
| Maps permission/GPS empty/error UX | PASS |
| Offline kill matrix 14 mutations | PASS |
| Security regression unit | PASS |
| CI `:wear:assembleDebug` gate | PASS |
| Maestro athlete/coach/cross/smoke (ASCII demo_persona_*) | PASS |
| assembleDebug phone + wear | PASS |
| pnpm typecheck | PASS |

## BLOCKED (human/external only)

| Item | Human action |
|------|----------------|
| Firebase / FCM production delivery | google-services.json + Console + Play cert |
| Stripe Connect LIVE | Stripe credentials + Connect onboarding |
| LiveKit live rooms | LIVEKIT_API_KEY/SECRET/URL |
| Supabase apply migration 020 | Run SQL on project |
| AI insight HTTP API | Design + deploy `/api/v1/ai/insights` + model keys |
| Wear hardware pairing | Wear AVD or physical watch |
| Physical Redmi QA | Stable ADB |
| iOS Simulator | macOS + Xcode |
| Production signing / store | keystore + store listing |

## Honesty

PARTIAL remains only where live multi-device infra is required. No READY claim.
