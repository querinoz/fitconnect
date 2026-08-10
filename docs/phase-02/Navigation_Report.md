# Phase 02 — Navigation Report

## Model

| Route | Path | Guard |
|-------|------|-------|
| Splash | `splash` | Restore session |
| Guest | `guest` | Public |
| Auth | `auth` | Public |
| Home | `home` | `VIEW_LOGGED_SHELL` |
| Role | `role` | `VIEW_ROLE_GATE` |
| Error | `error` | Public recovery |

`CoreRoute` + `NavGuard.authorize()` is mandatory before guarded navigation. Compose `NavHost` calls the guard; screens do not invent permission checks.

## Deep links

- Custom: `fitconnect://app/{guest|auth|home}`  
- Universal (declared): `https://fitconnect-phi.vercel.app/app/...` (`autoVerify=true` — assetlinks.json still required in prod)

## Analytics

Every authorize call emits `nav_{path}` via `Analytics.screen`.

## Back stack

Standard `NavController` pop; logout clears to guest with `popUpTo(0)`.

## Gaps

- Nested feature graphs not added (no features yet)  
- Device verification of universal links blocked (no emulator)  
- Predictive back polish deferred
