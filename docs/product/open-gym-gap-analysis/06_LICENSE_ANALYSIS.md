# openGym â€” License Analysis

**Date:** 2026-09-01
**Reference project:** openGym (GNU AGPL v3.0 per public documentation)

## Compliance decision

| Question | Decision |
|----------|----------|
| Copy openGym source into FitConnect? | **NO** |
| Copy UI assets / branding? | **NO** |
| Copy exercise media bundle? | **NO** â€” audit license per asset if ever imported |
| Reimplement functional behavior natively? | **YES** |
| Read public docs for requirements? | **YES** |

## AGPL implications

AGPL v3 requires source availability for **network-interactive** derivatives if based on AGPL code. FitConnect **does not incorporate** openGym source; functional reimplementation under FitConnect's own license stack is the approved path.

## If direct reuse ever proposed

| Field | Required |
|-------|----------|
| FILE | Path in FitConnect |
| SOURCE | openGym path + commit |
| LICENSE | SPDX identifier |
| IMPACT | Which modules affected |
| COMPLIANCE DECISION | Legal review + explicit approval |

**Default:** STOP until approved.

## FitConnect distribution model

- Android APK (proprietary product)
- Web SaaS (Vercel)
- Self-hosted docs reference Supabase project

AGPL-contaminated code would complicate mobile/store distribution â€” another reason for native reimplementation only.

## Exercise data

- Do not bulk-import openGym exercise JSON without license review
- Seed catalog: FitConnect-owned minimal set + user custom exercises
- Media: lazy-loaded, license recorded in `exercises.media_license`

## Attribution

openGym credited as **functional reference** in gap analysis docs only â€” not as a dependency.
