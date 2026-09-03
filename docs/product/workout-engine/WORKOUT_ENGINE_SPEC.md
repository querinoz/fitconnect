# Strength Workout Engine â€” Specification

**Version:** 1.0.0
**Date:** 2026-09-01
**Product:** FitConnect Elite OS

## Purpose

Native strength training execution for FitConnect â€” **not** an openGym clone. Integrates with Activity, ASCEND, Coach, Squad, Readiness, and Wear.

## Session state machine

```
IDLE â†’ PREP (3-2-1) â†’ ACTIVE â‡„ PAUSED â†’ FINISHED
                    â†˜ CANCELLED
```

| State | Screen awake | Network required |
|-------|--------------|------------------|
| ACTIVE | Yes (wakelock) | No for logging |
| PREP/PAUSED | Optional | No |
| FINISHED | No | Yes for sync (queued offline) |

## Completion flow

```
strength_session.completed
    â†’ activities (provider MANUAL, sport STRENGTH)
    â†’ domain_events activity.completed
    â†’ ascend_events (idempotent event_id)
    â†’ badge evaluation
    â†’ squad_contributions
    â†’ user_notifications (optional PR)
```

## UI principles (Elite OS)

- Obsidian floor, Voltline primary CTA
- Large "Log set" touch target (â‰¥56dp)
- Minimal navigation during ACTIVE
- PR celebration: subtle, not spam
- `prefers-reduced-motion` respected

## Platforms

| Platform | Wave |
|----------|------|
| Android phone | 2 |
| Web coach/athlete | 4 |
| Wear | 7 |

## Related specs

- `PROGRESSION_ENGINE_SPEC.md`
- `EXERCISE_MODEL_SPEC.md`
- `SET_MODEL_SPEC.md`
