# 09 — Squad audit

**Date:** 2026-08-20  
**Phase lock:** `P0-DOCS`

## Status

Squad OS is **specified** (`docs/social/FITCONNECT_SQUAD_SPEC.md`, mega prompts) and **not** a v1 production subsystem.

## Dependencies (must exist first)

1. P0-SEC Strava barrier
2. P1-DATA canonical USER/PROFILE/ACTIVITY/XP
3. P3-REALTIME (live members)
4. P5-SOCIAL persistence + privacy

Then **P6-SQUAD**: identity, XP pool, momentum, missions, challenges, live members, squad feed, squad map, Coach Command, seasons.

## Risk if done early

Squad maps and feeds will leak Strava polylines or dual XP. That is a legal and architecture failure.

## Now

Document only. No Squad feature work in P0-DOCS or P0-SEC.
