# 22 — Phase exit gates

**Date:** 2026-08-20  
**Phase lock:** `P0-DOCS`

A phase **PASS**es only with evidence (commands, counts). HUMAN items stay PENDING_HUMAN.

## P0-DOCS

- [x] 24 files exist under `docs/master-plan/`
- [ ] `git diff --stat` shows **only** this folder (verify after write)
- No Gradle/CI/DB/product changes in the same commit/intent

## P0-SEC

- Strava cannot be read by coaches/third parties (test + code)
- Web allowlist matches Android banned paths (table tests)
- Status route unauthorized → 401/503; no `a-ines` default
- Two-user IDOR on Postgres for identity **and** relevant activity tables
- Account deletion path exists and is authorized
- Privacy/Terms are real routes
- Production webhook refuses missing verify token; no unsigned job enqueue
- Rate limit on auth/webhook/identity (Upstash or documented fail-closed)
- Production still **NO-GO** until HUMAN tokens exist — but P0-SEC engineering can PASS

## P1-DATA

Canonical path documented; schema mismatch gone or gated; RLS; IDOR; Prisma privileged path documented; no service-role on clients.

## P1-AUTH

Firebase integrated; CI demo-false job; session restore; sign-out; PRODUCTION_AUTH may remain PENDING_HUMAN.

## P2–P12

See `21_FINAL_ROADMAP.md`. Social/Squad/Watch/GPS must not PASS if P0-SEC failed.

## Never PASS

- “Looks done in the UI”
- Firebase emulator confused with production Google
- Broadcast demo confused with Convex production
