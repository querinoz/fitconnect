# 10 — ASCEND audit

**Date:** 2026-08-20  
**Phase lock:** `P0-DOCS`

## Two implementations

| Location | What it is |
| --- | --- |
| `android/ascend` | Domain engine: XP, levels, badges, streaks, missions, anti-abuse, tests |
| `apps/web/lib/gamification` | Zustand store + levels/missions — **not** the same engine |

## Target domain (single)

```
Activity → Performance → XP → Badge → Level → Streak → Profile → Squad → Social
```

All of that reads **shareable** product activities, never Strava-origin rows.

## When

**P4-ASCEND**, after P1-DATA persistence and P3-REALTIME.

## Now

Do not merge engines, do not add web-only XP. Keep Android tests green when touching fitness later.
