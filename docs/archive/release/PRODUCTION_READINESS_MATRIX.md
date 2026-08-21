# Production readiness matrix

**Date:** 2026-08-19  
**Engineering GO:** **NO-GO** — production rows are informational only.

Legend: PASS · FAIL · BLOCKED · PENDING_HUMAN · N/A (locked)

| Area | Engineering | Production | Notes |
|---|---|---|---|
| Android debug assemble | PASS | N/A | `:app:assembleDebug` 2026-08-19 |
| Wear debug assemble | PASS | N/A | `:wear:assembleDebug` |
| Signed AAB | FAIL | PENDING_HUMAN | Not started |
| Web Vitest | PASS (312/312) | N/A | |
| Web typecheck | PASS | N/A | |
| Web lint | PASS (img warnings) | N/A | |
| Web production build | BLOCKED this gate | PENDING_HUMAN | Not re-run |
| Playwright E2E | BLOCKED this gate | PENDING_HUMAN | |
| Android emulator smoke | BLOCKED | PENDING_HUMAN | `emulator-5554 offline` |
| Wear emulator smoke | BLOCKED | PENDING_HUMAN | Not launched this gate |
| Athlete E2E | FAIL | N/A | Missing live chain |
| Coach E2E | FAIL | N/A | Shell ≠ cohesion |
| Social product | FAIL | N/A | |
| Squad product | FAIL | N/A | |
| Ascend cross-platform | FAIL | N/A | |
| Data cohesion | FAIL | N/A | `ath-1` vs `a-ines` |
| Local realtime (broadcast) | PASS as LOCAL_DEMO | N/A | `.env.local` provider=broadcast |
| Production realtime | PENDING_HUMAN | PENDING_HUMAN | |
| Demo mode off | FAIL locally | PENDING_HUMAN | `NEXT_PUBLIC_DEMO_MODE=true` |
| Supabase production | PENDING_HUMAN | PENDING_HUMAN | |
| Firebase / FCM | PENDING_HUMAN | PENDING_HUMAN | CLI not installed |
| Google / Apple OAuth | PENDING_HUMAN | PENDING_HUMAN | |
| Play Console / Test Lab | PENDING_HUMAN | PENDING_HUMAN | |
| RLS proven | BLOCKED | PENDING_HUMAN | No prod DB this run |
| Secrets in git | PASS (scan) | PENDING_HUMAN | Re-scan before any release |
| Accessibility | BLOCKED | PENDING_HUMAN | |
| Performance / gfxinfo | BLOCKED | PENDING_HUMAN | |
| Visual cohesion cert | FAIL | N/A | Token rhyme ≠ one product |
| Navigation cohesion | FAIL | N/A | |

**Unlock production configuration only after ENGINEERING STATUS = GO.**
