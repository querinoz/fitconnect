# FitConnect — Social OS roadmap

Gates: tests pass, build pass, no invented production services. Human creds = PENDING_HUMAN.

| Phase | Name | Status | First slice |
| ----- | ---- | ------ | ----------- |
| A | Architecture | THIS PASS | Specs + title mapping on ASCEND achievements |
| B | Design system | THIS PASS | `ElitePlayerCard`, identity chips — tokens only |
| C | Profile | THIS PASS | Android Profile 2.0 from existing ASCEND + profile repo |
| D | Social graph | LATER | Persist graph; UI follow/block — no fake users |
| E | Feed | THIS PASS (thin) | Composer kinds + telemetry-gated facts; keep FeedEngine |
| F | Content creation | LATER | CREATE sheet; share-from-run already exists |
| G | Stories / Motion | LATER | Not started — no video pipeline |
| H | Gamification integration | LATER | Kill web XP fork or wrap ASCEND |
| I | Squads | LATER | Evolve `squad-fc-week`; no second XP |
| J | Realtime | PENDING_HUMAN | Needs hosted channel |
| K | Notifications | LATER | Prefs + quiet; FCM PENDING_HUMAN |
| L | Messaging | LATER | Coach inbox exists; not Messenger |
| M | AI social | LATER | Reuse AI safety layer; no privacy invasion |
| N | Mobile | ONGOING | Preserve 5 tabs |
| O | Watch | LATER | Companion only |
| P | Landing | LATER | Journey 01–06; mockups must match app |
| Q | Security | ONGOING | RLS policies before any public social SQL |
| R | Performance | LATER | Feed window already 200 |
| S | Full QA | ONGOING | Evidence or BLOCKED |
| T | Production | BLOCKED | Keys, signing, Play |

## Phase A–C acceptance (this engineering slice)

- [x] Titles derived from unlocked ASCEND achievements (not free)
- [x] Profile shows player card: name, sport, level, XP, streak, title, squad label
- [x] No sixth nav tab (`HOME · DISCOVER · ACTIVITY · COMMUNITY · PROFILE`)
- [x] Floor remains `#070B14`
- [x] Unit tests for title mapping (`TitleRegistryTest` 4/4)
- [x] No invented Supabase/Firebase

Phase E thin: composer kinds TEXT / WORKOUT / PROGRESS / ACHIEVEMENT. PHOTO/VIDEO still blocked (no media pipeline). Telemetry facts on feed only when `shareTelemetryFacts`.
