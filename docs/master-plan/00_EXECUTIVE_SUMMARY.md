# 00 — Executive summary

**Date:** 2026-08-20  
**Phase lock:** `P0-DOCS`  
**Production:** **NO-GO**

This folder is the frozen FitConnect finalization plan. After approval, **P0-DOCS is the only allowed work**: write these 24 files and stop. Do not change product code, Gradle, CI, databases, or production in this phase. Do not install skills in this phase.

## Verdict

FitConnect already has a large product surface (Elite OS web, native Android Athlete/Coach, Wear module, Strava package, design system). It is **not** a production SaaS. The shortest path to a real release is **not** more screens. It is:

1. Close Strava / legal / authz **P0-SEC**
2. Unify the data model **P1-DATA**
3. Make auth production-like in CI **P1-AUTH**
4. Then core UX, GPS, realtime, ASCEND, conservative Social, Squad, Watch, perf/a11y, observability, human infra, full QA, RC

## Composite score (honest)

| Area | Score | Note |
| --- | --- | --- |
| Design / Elite OS identity | 8/10 | Canonical `--eos-*`; Voltline soul preserved |
| Landing / marketing | 7/10 | Premium, but cinematic video and legal links incomplete |
| Native Android product | 6.5/10 | Real modules; LOCAL_DEMO still carries many flows |
| Web app | 6/10 | Strong UI; demo + dual data paths |
| Auth engineering | 6.5/10 | Firebase+identity work exists; production config absent |
| Data unification | 4/10 | Prisma ≠ SQL; identity 012 not applied to live DB |
| Strava compliance | 3/10 | Android barrier stronger than web allowlist |
| Tests / CI | 6/10 | Web unit strong; CI E2E still demo-on |
| Production infra | 3/10 | Secrets, signing, Play, legal HUMAN |
| **Release readiness** | **~42/100** | **NO-GO** |

## You are here

```
P0-DOCS  ← THIS PHASE (docs only)
   ↓
P0-SEC   ← next code command
   ↓
P1-DATA → P1-AUTH → P2-CORE → P2-GPS → P3-REALTIME
   ↓
P4-ASCEND → P5-SOCIAL (v1, no Stories/Reels) → P6-SQUAD
   ↓
P7-WATCH → P8-PERF/A11Y → P9-OBSERVABILITY
   ↓
P10-HUMAN-INFRA → P11-QA → P12-RC → Play Internal → Production
```

## Six P0 security themes (must close before claiming production)

1. Strava data must never reach coaches, feeds, rankings, or any third party
2. Web Strava allowlist must match Android bans (clubs members/admins/activities, kudos, comments, `segments/explore`)
3. Integration status / athlete-id binding must stay fail-closed (no anonymous `a-ines`)
4. RLS must be real, forced, and two-user tested on Postgres — not UI-only
5. Account deletion + real Privacy/Terms URLs
6. No default webhook verify token; no unsigned job fallback; real rate limiting

## What this phase does **not** do

- Install Cursor/Claude skills
- Implement Social OS, Squad OS, Stories, Reels, landing video
- Revive Expo `apps/mobile` (ADR-005 frozen)
- Claim PRODUCTION_AUTH, PRODUCTION_DATABASE, or Play readiness
- Ask the human for secrets in chat

## Next command (after these 24 files exist)

```
EXECUTE MASTER PLAN — PHASE P0-SEC
```

Git expectation for **this** phase: only `docs/master-plan/*` (plus this freeze). No product diffs.
