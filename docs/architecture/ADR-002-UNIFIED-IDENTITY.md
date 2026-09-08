# ADR-002 — Unified Identity (One Account · Multiple Capabilities)

**Status:** Accepted  
**Date:** 2026-09-08

## Context

FitConnect previously treated Athlete and Coach as exclusive roles (`user_roles` insert-once / `role_locked`), forcing a second mental model of “login as athlete vs coach”.

## Decision

1. **One Firebase account** = one `identity_profiles.id`.
2. **Capabilities** in `user_capabilities` (multi-row): `athlete`, `coach`, future roles.
3. **`activeMode`** is UX preference (persisted in `user_preferences.payload.activeMode` + session cache). It is **not** authorization.
4. **Authorization** always re-checks server capabilities (`requireCoachCapability`, roster ownership, RLS).
5. Legacy `user_roles.role` mirrors `activeMode` for older clients.
6. Stripe plans map to capability grants via `capabilitiesFromPlan` (`athlete` | `coach` | `team` → duo).

## Consequences

- Profile ACTIVE EXPERIENCE switcher remounts Athlete OS ↔ Coach OS without logout.
- Client cannot escalate by setting `activeMode=coach` without capability (403).
- Migration `016_unified_identity_capabilities.sql` backfills from legacy roles.
