# FitConnect — Master production gaps

**Date:** 2026-08-19

**Status:** SNAPSHOT — prefer [../master-plan/20_MASTER_GAP_MATRIX.md](../master-plan/20_MASTER_GAP_MATRIX.md) as current

**Production:** NO-GO

**Rule:** HUMAN_PENDING is not an engineering fail. Inventing Firebase/Play/users is forbidden.

## PENDING_HUMAN (external ownership)

| Gap | Why an agent cannot close it |
|---|---|
| Production auth | `NEXT_PUBLIC_DEMO_MODE` is `"true"` locally. Prod must be `"false"` with real Supabase keys — operator decision |
| Supabase session in this browser | Demo cookie path used |
| Convex / Supabase realtime | Provider is `broadcast` |
| FCM / APNs | Coach settings copy already says FCM production PENDING_HUMAN |
| Play signing / Wear companion pairing | No store credentials; no devices attached |
| Real GPS / Health Services HR | Emulators down; Wear HR stub UNAVAILABLE |
| Production users / activity | None claimed |
| Apple watchOS | Landing lists COMING SOON — correct, not a fake pair |
| DATABASE_URL / Prisma live | Not asserted this run |

## Engineering gaps (agent-owned, still open)

| Gap | Notes |
|---|---|
| Identity service | `ath-1` vs `a-ines` vs roster Inês Correia |
| Shared XP / Ascend on web | Web Helium widget ≠ `:ascend` |
| Squad product | Cards and copy only |
| Social product on web | Marketing `/community` only |
| Four-level telemetry privacy | Spec names not in code |
| Android/Web IA | 5 tabs vs Today/Sessions/Coach/Inbox/Profile |
| Live Wear↔phone | Needs emulator/device |
| Landing social proof | 12,418 vs 318 coaches |
| Auth-gate flash / sticky role | SIGNING IN; `/profile?demo=1` kept coach |

## Closed this session (not production)

- Phone `SessionOwnership` lease on live coordinator + Activity start gate  
- `/insights` middleware protection  
- Accent picker actually receives `accent`  
- Wear Ascend/userId aligned to `ath-1`

## What must not be reported as done

- “Watch and phone share a live workout”  
- “Coach saw the athlete’s run in realtime”  
- “Squad XP updated”  
- “Production RLS proven”  
- “TalkBack PASS”  
- “44/100 means almost cohesive” — 44 is a fail.

## Suggested human sequence

1. Boot `fitconnect_phone` + `fitconnect_wear`; pair; recapture the visual matrix.  
2. Turn demo mode off on a staging URL; re-run auth journeys.  
3. Decide **one** demo athlete id and name; seed Android + web + coach roster from that record.  
4. Either ship Squad/Social/Ascend as real surfaces or stop selling them as one OS on the landing ecosystem chapter.
