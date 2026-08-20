# 08 — Social audit

**Date:** 2026-08-20  
**Phase lock:** `P0-DOCS`

## Rule (non-negotiable)

No session with `provider = 'STRAVA'` may appear in feed, ranking, challenge, comparison, public badge, shared map, or third-party profile. Enforced in **database** (`shareable` generated column + RLS), not UI flags.

## Current code

- Android `:community` module exists
- SQL `011_workout_sessions_shareable.sql` + fitness social filter tests
- Web community e2e (`phase9-community.spec.ts`) still demo-oriented
- Strava web allowlist still contains **social-adjacent** third-party endpoints (kudos/comments/clubs) — **P0-SEC**

## V1 social (P5) — conservative

Allowed after P0-SEC, P1-DATA, P3-REALTIME:

- Profiles, posts, photos, comments, reactions
- Performance sharing **only** when `shareable=1`
- Community + privacy controls
- Realtime fan-out without Strava rows

## V2 (explicitly not v1)

Stories, Reels, creator studio, memories, recommendation engine.

## Do not start P5 now

Social OS mega-prompts in `docs/social/` are vision, not the next sprint.
