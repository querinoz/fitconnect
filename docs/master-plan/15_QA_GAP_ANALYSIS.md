# 15 — QA gap analysis

**Date:** 2026-08-20  
**Phase lock:** `P0-DOCS`

## Strong

- Web Vitest (lib + components)
- Android `:foundation`, `:core:fitness` social/strava allowlist tests
- Playwright specs (auth, booking, community, programs, landing motion) — **mostly demo**

## Gaps that matter for release

| Gap | Phase |
| --- | --- |
| CI `NEXT_PUBLIC_DEMO_MODE=true` on default + E2E | P1-AUTH |
| No two-user Postgres IDOR in CI (Docker) | P0-SEC / P1-DATA |
| Web Strava allowlist tests **encode the wrong policy** (`segments/explore` allowed) | P0-SEC |
| API routes thin on direct tests | P0-SEC + P1-DATA |
| Wear unit tests | P7 |
| Maestro / emulator | HUMAN + P11 |
| Physical watch / Play Test Lab | HUMAN |
| Production Google/email auth | HUMAN |
| Mobile Expo tests | ignore (frozen) |

## P11 full QA (later)

Android, Web, Wear, Athlete, Coach, Social, Squad, ASCEND, Realtime, Auth, FCM, GPS, Telemetry, Security, A11y, Performance — Playwright + Maestro + emulator + Wear + Test Lab.

## This phase

No new test code. Next phase **P0-SEC** must add/repair tests for allowlist, webhook fail-closed, status IDOR, rate limit, deletion/legal.
