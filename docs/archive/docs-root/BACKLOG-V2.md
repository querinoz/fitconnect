# BACKLOG-V2 — everything that is NOT in v1

> **Contract:** if it is not in the v1 Feature Lockdown, it lives here. New ideas land here first — no exceptions, including the agent's own ideas. This list is a build order for later, not a rejection list.

## Platforms
- iOS app (SwiftUI over Elite Core via UniFFI — door kept open by ADR-005/006)
- Apple Watch, Garmin Connect IQ
- Native desktop app / Tauri (`ADR-004` keeps PWA as Windows strategy)

## Product
- Public segments and leaderboards
- Social feed, clubs, challenges, kudos
- Live beacon / public live sharing
- Route builder, heatmaps (needs PostGIS — deliberately out of v1)
- Direct Garmin/Whoop/Oura APIs (v1 = Health Connect + file import only)
- LiveKit live video sessions
- Public coach marketplace
- Real Stripe payments (v1 stays demo mode)
- Multi-tenant / white-label
- Wear OS breadcrumb map (ADR-008)

## Deferred tech
- Tailwind v4 / Next 15 / React 19 (ADR-003)
- ImageKit full asset migration + Higgsfield art pipeline (needs accounts)
- Tauri evaluation revisit (ADR-004)

_Anything added below this line must include date + who added it._
