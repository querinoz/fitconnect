# FitConnect Gamification Audit

**Date:** 2026-08-29  
**Status:** PARTIAL — web fixtures only

## CURRENT_RULES

Documented in `lib/demo/demo-gamification.ts`:

```ts
export const GAMIFICATION_CURRENT_RULES = {
  status: "PARTIAL",
  xpSources: ["session-complete (planned)", "streak (planned)", "squad-challenge (planned)"],
  levelFormula: "cumulative XP thresholds — not wired to backend",
  badgeEngine: "fixture data only on profile demo",
  idempotency: "not implemented — requires event_id dedup layer",
  crossPlatform: "BLOCKED — no Android/Wear native clients in repo"
};
```

## XP / Level (Web)

| Field | Demo Value | Backend |
|-------|------------|---------|
| Level | 24 | Not persisted |
| XP | 8,420 / 10,000 | Not persisted |
| Title | Performance Operator | Static fixture |
| Streak | 12 days | Not computed |

## Badge Inventory (Demo Featured)

| ID | Name | Rarity | Status |
|----|------|--------|--------|
| badge-early-bird | Early Bird | RARE | Earned (demo) |
| badge-voltline | Voltline | EPIC | Earned (demo) |
| badge-pr-hunter | PR Hunter | ELITE | 2/3 progress |

**Collection:** 12 / 48 unlocked (fixture)

## Bugs / Gaps

| Issue | Severity | Notes |
|-------|----------|-------|
| No XP event pipeline | P1 | Single activity could not be golden-tested |
| No idempotency | P1 | Double-tap / reconnect not handled |
| No ASCEND route | P2 | Full badge grid not built |
| No level-up overlay | P2 | Animation spec not implemented |
| Cross-platform sync | P0 | Blocked — no native apps |

## Exploits

None identified in demo fixtures (local-only, no API).

## Recommendations

1. Introduce `GamificationEvent { eventId, type, userId, payload, at }` with unique constraint
2. Process once: activity complete → 1 XP event, 1 badge check, 1 feed event (optional)
3. Build `/ascend` with earned/locked/progress states
4. Level-up sequence per spec §27 (restrained, non-blocking)
