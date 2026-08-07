# Phase 00 — Technical Debt Register

**Date:** 2026-08-07 · Interest rate: high on security items

Debt is listed with **principal** (effort to fix) and **interest** (cost of waiting).

---

## P0 — pay before real users

| ID | Debt | Principal | Interest | Pay in |
|----|------|-----------|----------|--------|
| TD-01 | `NEXT_PUBLIC_DEMO_MODE` defaults true | 0.5d | Account takeover / data leak | Phase 06 / immediately |
| TD-02 | Open `/api/v1` routes + `?athleteId=` impersonation | 2–3d | Same | Phase 02/06 |
| TD-03 | In-memory integration token store | 2d | Token loss / inconsistency | Phase 02 |
| TD-04 | Supabase UUID vs Prisma cuid identity split | 3–5d | Unlinkable users | Phase 02 |
| TD-05 | Expo app does not launch (MMKV/New Arch) | n/a (frozen) | Confusion if someone "just runs mobile" | Docs only / archive |

---

## P1 — pay on critical path

| ID | Debt | Principal | Interest | Pay in |
|----|------|-----------|----------|--------|
| TD-06 | Dual Prisma + Supabase SQL schemas | 1–2w | Migration hell | Phase 02 |
| TD-07 | Triple UI stack (elite-os / ui-glass / ui) | 1–2w | Design inconsistency | Phase 06 waves |
| TD-08 | ~32 orphan modules (~4k LOC) | 1–2d | Noise / false confidence | Wave W1 |
| TD-09 | tRPC stubs + unused client + public Strava procs | 2d | Fake API surface | Phase 06 |
| TD-10 | Realtime default BroadcastChannel | 2–3d | Features that "work on my machine" | F11 prep |
| TD-11 | Stripe Connect demo-only | 3–5d | Or hide in v1 | BACKLOG / hide |
| TD-12 | i18n gaps on authenticated web | 1w | Unprofessional locales | F12/F15 |
| TD-13 | Elite Core incomplete (F1 gate open) | 4–6w | Wrong athlete numbers | Phase 01 |
| TD-14 | `@fitconnect/config` wrong palette for mobile | 0.5d | Brand breakage if unfrozen | Only if Path B |
| TD-15 | High/critical npm audit items | 2–5d | Supply chain | Security train |

---

## P2 — scheduled debt

| ID | Debt | Principal | Pay in |
|----|------|-----------|--------|
| TD-16 | Vitest 2 vs 3 drift | 0.5d | Anytime |
| TD-17 | LiveKit deps while out of v1 | 0.5d remove or isolate | Cleanup |
| TD-18 | `packages/ui` empty | 5min | W1 |
| TD-19 | CLAUDE.md stale orphans / model counts | 0.5d | Docs hygiene |
| TD-20 | Coverage excludes large auth/i18n surfaces | 1w | F15 |
| TD-21 | Integration tests may double-run in CI | 0.5d | CI tidy |
| TD-22 | `stack.ts` claims Neon; ADR-009 says Supabase | 0.5d | Docs/code align |
| TD-23 | ImageKit loader orphan | 0.5d | Wire or delete |
| TD-24 | DEFAULT_LANG = pt hydration flash | 1d | Product decision |

---

## P3 — low interest

| ID | Debt |
|----|------|
| TD-25 | Emoji in mobile copy (a11y) — moot if archived |
| TD-26 | Docblock lies (`useMobileChannel` "wired") |
| TD-27 | `_sitemap` in Expo release — moot if archived |

---

## Intentionally accepted debt (with expiry)

| Debt | Expiry |
|------|--------|
| Wear OS empty module | Revisit F13 |
| Stripe demo for marketplace payments | Post-v1 |
| PostGIS / segments absent | BACKLOG-V2 |
| iOS absent | BACKLOG-V2 |
| Expo tree kept in repo | Archive after F6 |

---

## Debt burn plan

```
Week 0: Phase 00 approval
Week 1+: F1 (TD-13) — non-negotiable
Parallel: TD-01/02 env+auth (can start immediately after approval)
F2: TD-03/04/06
W1 cleanup: TD-08/18/19
F12/F15: TD-07/12/15
```
