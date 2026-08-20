# 19 — Dead code audit

**Date:** 2026-08-20  
**Phase lock:** `P0-DOCS`  
**This phase does not delete files.**

## Already cleaned (do not relitigate)

Phase 01 removed 31 web orphans and empty `packages/ui` (`docs/phase-01/Cleanup_Executed.md`).

## Keep until migrated

- `components/ui-glass/**` (~47 importers)
- `voltline.css` deprecated aliases
- `apps/mobile` frozen tree
- `SupabaseAuthRepository` on Android (must not be live IdP; delete only after P1-AUTH confirms Firebase-only)

## P0-SEC likely deletions/disables (next phase, not now)

- Web client methods for clubs members/admins/activities, kudos, comments, segments/explore
- Coach Strava list implementation (`listActivitiesForCoach`) after route is proven dead
- Default `"fitconnect-dev"` verify token branch

## Deferred

Convex vs Broadcast dual until P3. Dual XP until P4. Capture placeholder until P2-GPS.

## Rule

One PR per block. No drive-by folder wipes during P0-SEC except what security requires.
