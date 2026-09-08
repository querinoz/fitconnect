# Release Readiness — Full Spectrum Mission

**RELEASE STATUS: BLOCKED**

Not READY. External/device P1 blockers remain (Firebase/FCM prod delivery, Stripe LIVE Connect, LiveKit keys, Supabase apply 020, Wear hardware pairing, physical Redmi, iOS Simulator, AI insight HTTP API).

**Engineering status (code-owned):** `RELEASE_CANDIDATE_CODE_OWNED` — autonomous completion wave verified the items below without promoting product READY.

## Verified this wave (code PASS — not product READY)

| Area | Status | Notes |
|------|--------|-------|
| Booking durable + HTTP | PASS | `HttpBookingRemote` athlete/coach |
| Athlete GET bookings | PASS | GET `/api/v1/bookings` |
| Community remote routing | PASS | REMOTE / FAIL_CLOSED / LOCAL_DEMO |
| LiveKit port fail-closed | PASS | No fake join without keys |
| Wear readiness source | PASS | Selector + unit; pairing still BLOCKED |
| FCM deep link routing | PASS | Router + mapper unit; prod delivery BLOCKED |
| Stripe fail-closed | PASS | No invented paid success |
| Telemetry provenance labels | PASS | Honest labels |
| Sports catalog ≥50 | PASS | Unit |
| Maps UX states | PASS | Empty/error/permission/fallback |
| Programs HTTP | PASS | `HttpProgramRemote` |
| CI Wear gate | PASS | `:wear:assembleDebug` hard gate |
| Community SQL 020 | PASS (code) | Apply to Supabase = **EXTERNAL** |

## Checklist summary

See `docs/fitconnect-mobile-master-checklist.md` and `docs/qa/feature-matrix.json`.

## Required human / external actions

1. Firebase production + Android `google-services.json` + FCM cert (prod delivery)  
2. Stripe Connect LIVE  
3. LiveKit keys  
4. Apply Supabase migration `020_community_strava_never_social.sql`  
5. Wear AVD or hardware pairing  
6. Stable Redmi ADB for physical QA  
7. macOS/Xcode for iOS Simulator  
8. AI insight HTTP API (if product requires live insights)

## What not to do

- Revive Expo  
- Fake PASS for EXTERNAL  
- Mark READY with open BLOCKED critical rows  
- Treat fail-closed ports as LIVE integration PASS  
