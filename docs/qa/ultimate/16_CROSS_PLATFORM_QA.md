# Cross-Platform Progression QA

**Date:** 2026-08-28  
**Verdict:** PASS (canonical store + aligned level table)

## Problem fixed

Web used periodic-table XP (`50×(N-1)²`) while Android used `LevelTable.kt` bands — no shared server store.

## Solution

| Component | Path |
|-----------|------|
| Canonical levels (Android parity) | `lib/ascend/canonical-levels.ts` |
| Server progression store | `lib/progression/server-store.ts` |
| API | `GET/POST/PATCH /api/v1/ascend/progression` |
| Web gamification levels | `lib/gamification/levels.ts` → canonical bands |
| Mission sync | `gamification/store.ts` POSTs events to API |

## Evidence

| Check | Result |
|-------|--------|
| `canonical-levels.test.ts` | 4/4 PASS — bands match Android (0…25000 XP) |
| `progression-route.test.ts` | 2/2 PASS — snapshot + event dedup |
| Live GET progression | `totalXp=120`, canonical level |

## Residual

- Android ASCEND engine still uses in-memory store; web API is the cross-platform contract for future mobile sync.
- Full bidirectional sync requires Android HTTP client wiring (out of scope for web-only fix).
