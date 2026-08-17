# FitConnect — Social Performance OS Architecture

**Product name:** FitConnect  
**Positioning:** The social operating system for human performance.  
**Not:** Instagram, Strava, Nike Run Club, or a generic fitness app.

## Principle

One performance event fans out. It does not fork into disconnected apps.

```
WORKOUT_COMPLETED (ASCEND eventId, idempotent)
        │
        ├─ metrics / vault
        ├─ individual XP + badges + streak (ASCEND only)
        ├─ squad contribution XP (slice of same event)
        ├─ optional feed post (opt-in telemetry facts)
        ├─ optional memory
        └─ notifications (why-should-I-care gate)
```

## Canonical engines (do not duplicate)

| Concern | Canonical | Forbidden |
| ------- | --------- | --------- |
| Individual XP / level / badge | `android/ascend` | Web Zustand as a second universe; Community AchievementEngine XP |
| Social graph | `android/community` graph (later persist) | Parallel friends table in UI |
| Feed ranking | `FeedEngine` + `FeedRanker` | `ORDER BY created_at` in UI |
| Visibility / health redact | `VisibilityResolver` | Public HRV/GPS by default |
| Capture / GPS | `:core-capture` | Fake live GPS |
| Design | Elite Surface `#070B14` / Volt `#C8FF00` / Connect `#00DDB4` | Floor `#090402` |

## Identity layers (one profile)

```
PLAYER CARD     → level, title, streak, squad mark
ATHLETE PROFILE → sports, Prime, vault highlights
SOCIAL PROFILE  → posts, follows, pinned
PERFORMANCE ID  → DNA, PRs, story timeline
```

Titles are **achievement-gated**, never free cosmetics.

## Navigation (decision — do not destroy)

Keep athlete bottom tabs:

`HOME · DISCOVER · ACTIVITY · COMMUNITY · PROFILE`

CREATE is **not** a sixth tab. It is:

- Home/Community FAB or “What happened today?” sheet
- Auto-prompt after `PerformanceCompleteOverlay`

Squads live **inside Community** as the first surface (Squad home + feed), not a replacement of Activity.

## Persistence target (later phases)

Prisma-only for product data (existing ADR). New models only when a writer exists. Until then: Android engines stay the executable spec; SQL is a contract, not a fake network.

## Realtime

Use only for: squad live events, notifications, message delivery, reaction counts.  
Do **not** realtime Prime/HRV.

## Responsible engagement

No fake activity, fake likes, shame for rest, or “zero rest day” challenges. Recovery is a first-class win.

## Privacy default

Location OFF. Telemetry facts OFF on posts unless the athlete opts in per post (`shareTelemetryFacts`).
