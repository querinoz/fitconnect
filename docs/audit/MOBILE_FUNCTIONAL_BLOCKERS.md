# Mobile Functional Blockers

**Date:** 2026-09-07

| ID | Severity | Area | Blocker | Owner |
|----|----------|------|---------|-------|
| B-PHYS-001 | P0 evidence | Device | Redmi ADB offline — cannot close SM / GPS physical | HUMAN + agent when device online |
| B-WEAR-001 | P2 defer | Wear | Session ID mismatch `wear-*` vs `activities.id` | Engineering (P7) |
| B-RT-001 | P2 defer | Realtime | No Android product subscribers; web default BroadcastChannel | Engineering (P3) after product event list freeze |
| B-PAY-001 | P1 honesty | Earnings | Stripe Connect PENDING_HUMAN — fail-closed on live | HUMAN credentials |
| B-ATH-001 | P1 | Athlete data | `LocalAthleteRepository` only — no Http athlete plane | Engineering |
| B-SOC-001 | P2 | Social | Android community seed not using `/community/posts` | Engineering / scope |
| B-FCM-001 | P1 cert | Notifications | Token registers to API; **delivery** uncertified | HUMAN Firebase + Play |
| B-HC-001 | P1 evidence | Health Connect | Device permission smoke not run | Device |
| B-DISC-001 | P2 | Discover | Geo booking LOCAL_DEMO catalog | Engineering / API |

## Explicitly not blockers for “engineering functional completion”

- Visual polish / neu-glass consistency
- MapLibre production tiles
- Expo thaw
- Stories/Reels

## Human dependencies

- Firebase production config
- FCM delivery certification
- Stripe Connect
- Play signing
- Physical Redmi for smoke
