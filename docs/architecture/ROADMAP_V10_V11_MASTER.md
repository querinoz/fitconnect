# FitConnect Roadmap V10 → V11 — Master

**Branch:** `feat/fitconnect-roadmap-v10-v11`  
**V9 tip (parent):** `e430a0f`  
**Frozen baseline:** `c78c2fd` (untouched)  
**Status:** IN PROGRESS → targeting **ROADMAP COMPLETE — EXTERNAL VERIFICATION PENDING**

## Phase gates

| Phase | Status | Evidence |
| --- | --- | --- |
| V10 Real-Time Intelligence | PASS (code+unit) | `lib/sports-intelligence/*`, `/api/v1/events`, `/api/v1/context`, LiveAthleteContextCard |
| V10.1 Device/Data Platform | PASS (code+unit) | `lib/devices/platform.ts`, `/api/v1/devices/status` |
| V10.2 Adaptive Training | PASS (code+unit) | `lib/sports-intelligence/adaptive-training.ts` |
| V10.3 Nutrition Intelligence | PASS (code+unit) | `lib/nutrition/periodization.ts` + V9 meal/grocery/recipes |
| V10.4 AI Agent Platform | PASS (code+unit) | `lib/ai/agent-router.ts`, `/api/v1/ai/route-agent`, MCP load/device wiring |
| V10.5 Coach Platform | PASS (code+unit) | `lib/coach/roster-acl.ts`, `/api/v1/coach/roster` |
| V11 Sports Network | PASS (code+unit) | `lib/social/sports-network.ts`, `/api/v1/network` |

## Non-negotiables preserved
- Strava never social / never ML
- Health Connect core via ProviderId registry
- No fabricated biometrics
- Confirm-gated writes
- Adaptation never auto-applies

## External pending
- WearOS physical device
- Preview credentials
- Official Garmin/WHOOP OAuth live sessions
- iOS device lab

## Data flow
```
DEVICE → NORMALIZE → EVENT → CONTEXT → TRAIN/RECOVERY/NUTRITION → AI/MCP → UI → FEEDBACK
```
