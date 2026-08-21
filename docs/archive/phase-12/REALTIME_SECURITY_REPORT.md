# Phase 12 — Realtime Security Report

## Components

| System | Path | Status |
|--------|------|--------|
| Web Broadcast | `packages/realtime-client/` | Same-tab default; demo fallback |
| Convex | `convex/` (generated, not committed) | Planned primary |
| LiveKit | JWT in `apps/web` env | Video sessions |
| Android realtime | NoOp port in release graph | Not wired to production backend |

## Threats

1. **Channel subscription without auth** — user joins another athlete's room
2. **Token leakage** — long-lived LiveKit JWT in client
3. **Message injection** — unauthenticated publish to broadcast channel
4. **Replay** — stale tokens accepted

## Current controls

- LiveKit: server-minted JWT when keys configured; demo fallback when missing
- Broadcast client: typically same-origin/session-scoped in web app
- Android: NoOp realtime — **no exposure** in current native build

## Gaps

| Gap | Severity |
|-----|----------|
| No auth on all Broadcast channels | High (when enabled cross-tab) |
| Convex auth rules not in Phase 12 scope | High |
| LiveKit room naming predictable | Medium |
| Android future wiring | TBD |

## Recommendations

1. Room IDs: `{coachId}:{athleteId}:{sessionId}` + server membership check before JWT
2. Short-lived LiveKit tokens (<1h)
3. Convex: `ctx.auth.getUserIdentity()` on every mutation/subscription
4. Disable demo realtime in production builds

## Verdict

Realtime is **not hardened end-to-end** in Phase 12. Native Android has **no realtime attack surface** today. Web LiveKit/Broadcast require **dedicated auth audit** before prod scale.
