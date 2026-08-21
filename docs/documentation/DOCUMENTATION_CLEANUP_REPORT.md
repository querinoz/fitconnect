# Documentation cleanup report

**Date:** 2026-08-20

**Mode:** documentation-only (no product, Gradle, package.json, database, CI, or app-behavior changes)

**Canonical entry:** [../../README.md](../../README.md)

**Production:** NO-GO

**Current phase:** P0-SEC

## Counts

| Metric | Value |
|--------|-------|
| TOTAL_MD_BEFORE | 616 |
| TOTAL_MD_AFTER | 638 |
| Archive Markdown | 354 |
| Master plan files | 24 (preserved, not rewritten) |

Before-count method: Python `rglob("*.md")` excluding `node_modules`, `.git`, `.next`, `dist`, `build`, `coverage`, `.turbo`, `target`.

After-count is the same method, run at the end of this cleanup. Net count **rises slightly** because each archived `docs/phase-*` folder kept a one-page **stub** at the original path (traceability + fewer broken links). Unique historical content was moved, not duplicated as authoritative status.

## KEPT (authoritative / current)

| Area | Paths |
|------|--------|
| Root entry | `README.md` |
| Architecture rules | `AGENTS.md` |
| Project memory | `CLAUDE.md` (banner: master-plan wins on status) |
| Security reporting | `SECURITY.md` (new, pointer-only) |
| License | `LICENSE` (not Markdown) |
| Master plan | `docs/master-plan/00`–`23` (24 files) |
| ADRs | `docs/adr/*` |
| Docs index | `docs/README.md` |
| Auth / data / security evidence | `docs/auth/*`, `docs/data/*`, `docs/security/AUTH_RLS_SECURITY_REPORT.md` |
| Release (current) | `docs/release/P1_AUTH_DATA_EXIT_GATE.md`, `ENGINEERING_FREEZE.md`, `HUMAN_FINAL_ACTIONS.md` |
| Android current | `docs/android/README.md` + local demo / architecture / human / wear specs / auth |
| Design | `docs/DESIGN_SYSTEM.md`, `docs/design/*` (minus archived snapshots) |
| Operations | `docs/deploy-vercel.md`, `docs/ROLLBACK.md`, `docs/launch-checklist.md` (PLANNED) |
| QA current | `docs/qa/ENVIRONMENT.md`, `honeycomb-bench.md`, `MASTER_PRODUCTION_GAPS.md` |
| Product domains | `docs/ascend/*` (architecture set), `docs/social/*`, `docs/squad/*` |
| Integrations | `docs/01-strava-2026.md`, `docs/strava-integration.md`, `docs/integrations/` |
| Phase 17 | `docs/phase-17/*` left in place (script-coupled) |
| Agent skills | `.cursor/skills`, `.agents/skills`, `.claude/skills` |
| Package READMEs | `android/README.md`, `apps/mobile/README.md`, `elite-core/README.md` |

## MERGED

| Concern | Canonical | Notes |
|---------|-----------|--------|
| Execution status | `docs/master-plan/` | Replaces competing PHASE_STATUS / FINAL_STATUS / GO reports as *current* |
| Human actions | `docs/master-plan/17_HUMAN_ACTION_PLAN.md` | Other human lists kept as snapshots with pointers |
| Security (current) | `docs/master-plan/12_SECURITY_AUDIT.md` | RLS engineering report remains evidence, not GO |
| Design motion | `docs/design/ELITE_OS_MOTION_LANGUAGE.md` | Former `docs/motion-language.md` archived |
| Android docs index | `docs/android/README.md` | Many near-identical exit gates archived |
| Product README | root `README.md` | Only canonical README-like entry for the repo |

No blind concatenation of reports.

## UPDATED

- Root `README.md` — full rewrite (20 required sections; no production-ready claims)
- `docs/README.md` — canonical index
- `docs/android/README.md` — current Android docs only
- `android/README.md` — LOCAL DEMO / NO-GO; links to current guides
- `CLAUDE.md` — current-status banner (HISTORICAL body retained)
- `qa/HANDOFF.md` — HISTORICAL + pointer to P0-SEC
- `docs/adr/ADR-003-stack-modernization.md` — SUPERSEDED IN PART
- `docs/launch-checklist.md`, `docs/HUMAN_FINAL_CONFIGURATION.md`, `docs/qa/MASTER_PRODUCTION_GAPS.md`
- `docs/release/P1_AUTH_DATA_EXIT_GATE.md`, `ENGINEERING_FREEZE.md`, `HUMAN_FINAL_ACTIONS.md`
- `docs/android/ANDROID_WEAR_STATUS.md`, `docs/android/auth/FIREBASE_AUTH_EXIT_GATE.md`
- `docs/phase-17/PHASE_17_FINAL_REPORT.md`, `DOCUMENTATION_INDEX.md`, `README.md`
- `docs/DESIGN_SYSTEM.md` — repaired links
- `elite-core/README.md` — PARTIAL (not F0 skeleton-only)

## ARCHIVED

Moved under `docs/archive/` (filename preserved):

- `phase-00` … `phase-08`, `phase-10` … `phase-14`, `phase-16`, `phase-13r`
- Android snapshot / exit-gate / visual-QA reports
- QA cohesion / mega reports
- Production-readiness snapshots
- Release GO/RC snapshots (pre master-plan)
- ASCEND exit/completion snapshots
- Design audit snapshots
- `superpowers/`, `landing/`, `ux/`, `audit/`, `production/`
- Former docs-root snapshots (`RELATORIO-*`, `00-BASELINE*`, `AGENT-STATE`, etc.)
- Root `AGENT_PROGRESS.md`, `AUDIT_FINDINGS.md`, `DESIGN.md`

`docs/phase-17/` was **not** moved: `scripts/reporting/*.mjs` still reads that path. Marked HISTORICAL instead. Scripts were not edited (documentation-only / no source-code change).

There was **no** `docs/phase-09` or `docs/phase-15` content tree to archive. An accidental phase-09 stub was deleted.

## DELETED

| Item | Reason |
|------|--------|
| Duplicate leftover copies after `git mv` of tracked files (untracked twins) | No unique information; archive already held the tracked copy |
| Accidental `docs/phase-09/README.md` stub | No corresponding archive / original tree |
| One-shot archive helper scripts | Temporary |

No historical evidence artifact was deleted merely for age.

## CANONICAL_DOCUMENTS

```
README.md
docs/README.md
docs/master-plan/          (24 files; roadmap = 21_FINAL_ROADMAP.md)
docs/adr/
docs/architecture/
docs/android/              (current set only)
docs/auth/
docs/data/
docs/security/
docs/design/
docs/qa/                   (3 current files)
docs/release/              (3 current files)
docs/archive/              (HISTORICAL)
SECURITY.md
AGENTS.md
```

## REMOVED_DUPLICATES (as *current* status)

Multiple PHASE_*_EXIT_GATE, ANDROID_FINAL_*, PRODUCTION_READINESS_*, MASTER_COHESION_*, RELATORIO-ELITE-OS*, AGENT_PROGRESS vs master-plan. Canonical *current* status is the master plan + README. Duplicates remain readable in `docs/archive/`.

## STALE_DOCUMENTS

Documents that claimed freeze, completion, or production-adjacent PASS were either archived or labeled HISTORICAL / SNAPSHOT / PENDING_HUMAN / NO-GO.

`CLAUDE.md` still contains May-2026 inventory text; the banner forbids treating it as current GO.

## BROKEN_REFERENCES_FIXED

| Link | Fix |
|------|-----|
| `docs/DESIGN_SYSTEM.md` → `motion-language.md` / `art-direction.md` | Point to `design/ELITE_OS_MOTION_LANGUAGE.md` and archive art-direction |
| Root README → `AGENT_PROGRESS.md` / `AUDIT_FINDINGS.md` | Rewritten index → master-plan + `docs/README.md` |
| `android/README.md` → `docs/phase-03/` / PHASE_15 QR doc | Current android demo/QR guides |
| `docs/adr/ADR-003` → `AGENT_PROGRESS.md` | master-plan |
| `qa/HANDOFF.md` → `docs/phase-00/` | archive + stub |
| Stubs at `docs/phase-*/README.md` | Point at `docs/archive/phase-*/` |

Script paths to `docs/phase-17/` were **not** changed.

## README_UPDATED

YES — full rewrite. Does not claim production ready, real FCM, production Google auth, production Supabase, real Watch sync, real GPS, or production signing.

## CURRENT_PRODUCT_STATUS

| Label | Value |
|-------|--------|
| Current phase | P0-SEC |
| Production | NO-GO |
| Local demo | YES (web `?demo=1`, Android debug APK) |
| Auth engineering | LOCAL_AUTH PASS / PRODUCTION_AUTH PENDING_HUMAN |
| Social Stories/Reels | Out of frozen v1 scope |
| Next command | `EXECUTE MASTER PLAN — PHASE P0-SEC` |

## Inventory (classification, not 600 skill rows)

Agent skills (`.cursor`, `.agents`, `.claude`) = **KEEP** (tooling). Cursor `.artifacts` = **TEMPORARY** (left in place). `qa/` reports and `docs/archive/` = **HISTORICAL**. `docs/master-plan/` = **REQUIRED / CURRENT**.

ACTION summary:

| ACTION | What |
|--------|------|
| KEEP | Master plan, ADRs, current auth/data/security/android/design/ops, skills, package READMEs |
| MERGE | Status surfaces → master plan + README |
| UPDATE | README, indexes, banners on remaining snapshots |
| ARCHIVE | Prior phases, duplicate gates, production-readiness packs |
| DELETE | Duplicate leftovers + bogus phase-09 stub + temp scripts |
| REVIEW | `docs/phase-17/` (script-coupled HISTORICAL) |

## Verification

Commands run after cleanup: Markdown recount, relative-link check on current (non-archive, non-skill) docs, `git status`, `git diff --stat`, `git diff --check`. No commit. No push. No source/CI/Gradle/package.json edits in this pass except Markdown / LICENSE-adjacent docs.
