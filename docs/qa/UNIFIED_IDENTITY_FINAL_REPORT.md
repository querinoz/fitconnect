# FITCONNECT UNIFIED IDENTITY — FINAL QA REPORT

## Executive Summary

Unified identity spine landed: **1 Firebase account → capabilities → activeMode → Athlete/Coach OS without logout**. Figma auth works but **no FitConnect file key** is linked. Production readiness remains **NOT READY** until migration is applied in Supabase, Android device QA, and full security matrix run.

## Architecture Before

Exclusive `user_roles` + `role_locked` XOR Athlete/Coach OS.

## Architecture After

`user_capabilities` + `activeMode` preference + legacy role mirror. APIs: `/me`, `/active-mode`. Android session stores capabilities; Profile `ActiveExperienceSwitcher`.

## Authentication

| Item | Status |
|---|---|
| One Firebase session | PASS (model) |
| No dual login | PASS (model) |
| RoleSelect first grant | PARTIAL (still first pick; can add second capability) |

## Entitlements

| Item | Status |
|---|---|
| Plan → capabilities map | PASS (code) |
| Stripe live wiring of grants | PARTIAL |
| Expiration fallback | NOT IMPLEMENTED (doc only) |

## Active Mode

| Item | Status |
|---|---|
| Persist preference | PASS (API + session) |
| Server validation | PASS |
| Profile switcher UI | PASS (Compose) |
| NavHost remount | PASS |

## Athlete / Coach Experience

| Item | Status |
|---|---|
| Existing OS reused | PASS |
| Zenith IA mode-aware | NOT IMPLEMENTED |

## Profile

| Item | Status |
|---|---|
| ACTIVE EXPERIENCE | PASS |
| Unlock Coach CTA | PARTIAL (analytics only) |

## Navigation

PASS — shell keyed by `activeMode`.

## Database

| Item | Status |
|---|---|
| Migration `016_…` | PASS (file) |
| Applied to prod Supabase | BLOCKED / NOT VERIFIED |

## API

PASS (routes added).

## Security

| Item | Status |
|---|---|
| Capability helpers | PASS |
| Full privilege-escalation suite | PARTIAL |
| RLS live verify | BLOCKED until migration applied |

## Figma / Design Audit

BLOCKED for pixel match — see `docs/design/FIGMA_IMPLEMENTATION_AUDIT.md`. Auth PASS; file key MISSING.

## Mobile Android

| Item | Status |
|---|---|
| Code path | PASS |
| assembleDebug / device | NOT RUN this slice |

## Offline

PARTIAL — local capability cache allows switch; no invent of Coach.

## Tests

See verification section in agent response.

## Production Readiness

**NOT READY**

## Blockers

1. Apply `016_unified_identity_capabilities.sql` to Supabase.
2. Link FitConnect Figma fileKey for design validation.
3. Android install + Eduardo dual-persona QA.
4. Entitlement expiration → mode fallback implementation.
5. Full E2E-001…010 suite.
