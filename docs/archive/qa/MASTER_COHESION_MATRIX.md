# FitConnect — Master cohesion matrix

**Date:** 2026-08-19  
**Legend:** PASS = executed and matched · FAIL = executed or inspected and diverged · PARTIAL = exists but not the same product · BLOCKED = could not run · PENDING_HUMAN = needs prod credentials · MISSING = no implementation

| FEATURE | ANDROID | WEB | WATCH | ATHLETE | COACH | SOCIAL | SQUAD | ASCEND | DATA | REALTIME | VISUAL | STATUS |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| AUTH | Compose auth + demo | Demo cookie + gate; SIGNING IN flash | n/a companion | Demo | Demo; sticky coach session | n/a | n/a | n/a | Separate sessions | n/a | Elite ring | **PARTIAL** |
| PROFILE | Inês Costa `ath-1` | Inês M. `a-ines` | No full profile | Divergent | Roster Inês Correia | Community UserProfile seed | Preview MISSING | Native vs web XP | **FAIL** | n/a | Token chrome | **FAIL** |
| ACTIVITY | LiveActivityEngine | Plan/session cards, not capture | START companion | Phone engine | Coach sees seed activities | Workout posts in `:community` | MISSING | EventIds on native | No shared activity id | Broadcast only | Instruments | **FAIL** |
| GPS | Capture + map Compose | Dashboard map LOCAL_DEMO | n/a | LOCAL_DEMO unless sensor | Roster map LOCAL_DEMO | n/a | n/a | n/a | No shared trace | n/a | Dark map | **PARTIAL** |
| TELEMETRY | Engine + privacy manager | Demo HRV/sleep copy | HR UNAVAILABLE | LOCAL_DEMO | Coach facade + seed | n/a | n/a | n/a | Not same stream | PENDING_HUMAN | LOCAL_DEMO labels | **PARTIAL** |
| RECOVERY | Recover route | Readiness cards | READINESS pane | Separate compute | Roster HRV alerts | n/a | n/a | Recovery events native | Dual readiness libs historically | n/a | Rings | **PARTIAL** |
| XP | AscendEngine | 120 XP Helium widget | Ascend pane LOCAL_DEMO | Native store | Coach missions widget | n/a | Squad XP MISSING | **FAIL cross-store** | **FAIL** | n/a | Rings | **FAIL** |
| BADGES | Ascend achievements | Limited client missions | Pane only | Native | n/a | Achievement posts | MISSING | Native registry | **FAIL** | n/a | PARTIAL | **FAIL** |
| LEVEL | Ascend levels | Lv 2 Helium | Rank code on pane | Native | Same widget | n/a | MISSING | **FAIL** | **FAIL** | n/a | PARTIAL | **FAIL** |
| STREAK | Ascend streaks | “5-week PR streak” copy | streak n on pane | Native | n/a | n/a | MISSING | Native | **FAIL** | n/a | Copy | **FAIL** |
| FEED | CommunityScreen | Dashboard “Activity feed” seed | n/a | Native engine | Roster alerts ≠ feed | **FAIL unify** | MISSING | n/a | Two feeds | broadcast | Cards | **FAIL** |
| POST | `:community` create | Marketing community; no app `/social` | n/a | Native | n/a | **FAIL** | MISSING | n/a | n/a | n/a | n/a | **FAIL** |
| COMMENT | Community engines | Not productized | n/a | Native | n/a | **FAIL** | MISSING | n/a | n/a | n/a | n/a | **FAIL** |
| REACTION | ReactionEngine idempotent | Celebration emoji rows (UI) | n/a | Native | n/a | **FAIL** | MISSING | n/a | n/a | n/a | n/a | **FAIL** |
| STORY | Not a product surface | Not found as route | n/a | MISSING | MISSING | MISSING | MISSING | n/a | n/a | n/a | n/a | **MISSING** |
| REEL | Not a product surface | Not found | n/a | MISSING | MISSING | MISSING | MISSING | n/a | n/a | n/a | n/a | **MISSING** |
| SQUAD | LOCAL_DEMO label + cards | Copy / roster only | Squad status MISSING | FAIL | LiveSquadCard LOCAL_DEMO | n/a | **FAIL** | Squad XP MISSING | **FAIL** | n/a | Cards | **FAIL** |
| MISSION | Ascend missions | Daily missions +15 XP UI | n/a | Native | Coach missions UI | n/a | MISSING | Dual | **FAIL** | n/a | Lists | **FAIL** |
| MOMENTUM | Not found as named system | Not found | n/a | MISSING | MISSING | n/a | MISSING | MISSING | n/a | n/a | n/a | **MISSING** |
| WATCH | Wear Data Layer code | Insights ownership transfer UI | Companion compile | Phone adopt envelope | n/a | n/a | n/a | Wear user now ath-1 | Lease unit-tested | Data Layer untested live | STALE shot | **BLOCKED** live |
| NOTIFICATION | Prefs + FCM PENDING_HUMAN | PWA push PENDING_HUMAN | Ongoing Activity code | Native | Native | CommunityNotifier in-memory | n/a | n/a | n/a | PENDING_HUMAN | n/a | **PENDING_HUMAN** |
| JOURNEY | Not a shipped surface | Not found | n/a | MISSING | MISSING | n/a | n/a | MISSING | n/a | n/a | n/a | **MISSING** |
| MEMORY | Not a shipped surface | Not found | n/a | MISSING | MISSING | n/a | n/a | MISSING | n/a | n/a | n/a | **MISSING** |

### Row status counts (23 feature rows)

| STATUS | Count |
|---|---|
| FAIL | 12 |
| PARTIAL | 4 |
| MISSING | 5 |
| BLOCKED | 1 |
| PENDING_HUMAN | 1 |
| PASS | **0** |

Zero feature rows earned an ecosystem PASS. That is the matrix result, not an opinion.
