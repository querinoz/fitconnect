# FitConnect Live Demo Feed

## Overview

Controlled **simulation** of social activity for product demos. Never represents synthetic events as production users.

## Activation

```ts
// lib/demo/constants.ts
export const DEMO_FEED_MODE =
  process.env.NEXT_PUBLIC_DEMO_FEED_MODE === "true" ||
  (process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_DEMO_FEED_MODE !== "false");
```

**Production:** Set `NEXT_PUBLIC_DEMO_FEED_MODE=false` unless explicitly demoing.

## Behavior

| Property | Value |
|----------|-------|
| Interval | 4000 ms |
| Max in-memory posts | 24 |
| Data source | Local fixtures only |
| DB writes | None |
| Network requests | None |

## Event Cycle (32s loop)

| Offset | Type | Persona |
|--------|------|---------|
| 0s | Activity | Maya Rossi |
| 4s | Coach Insight | Tomás Rivera |
| 8s | Milestone | Elena Novak |
| 12s | Squad | Marina Costa |
| 16s | Recovery | Inês Costa |
| 20s | Personal Best | Lucas Mendes |
| 24s | Photo | Marina Costa |
| 28s | Motivation | Tomás Rivera |

## Demo Personas

All personas in `lib/demo/demo-personas.ts` include:

```ts
meta: { demoAsset: true, synthetic: true }
```

Fictional names: Marina Costa, Inês Costa, Tomás Rivera, Elena Novak, Lucas Mendes, Maya Rossi.

## Safety

- Timer cleared on unmount
- Pauses when document hidden
- Event IDs deduplicated via `seenEventIds` Set
- `pause()` / `resume()` API on hook
- Visible "Demo" badge on every card + indicator banner

## UI Entry Point

`/feed` (authenticated, compact `CommunityFeed`) — shows `DemoFeedIndicator` when active.

## Reactions

FitConnect set: 🔥 ⚡ 💚 🏆 🚀 💪 👏 🫡 — local state only.
