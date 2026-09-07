# FitConnect documentation index

**Current truth (2026-09-04):** [audit/NEXT_PHASE_READINESS_FINAL.md](audit/NEXT_PHASE_READINESS_FINAL.md) · [audit/NEXT_PHASE_DECISION.md](audit/NEXT_PHASE_DECISION.md) — recommended next: **Physical GPS verification**. **Production remains NO-GO.** Implementation from audit: **NONE**.

**History freeze:** [audit/RECONCILIATION_RESULT.md](audit/RECONCILIATION_RESULT.md). P1-AUTH engineering PASS. Outdoor P2-GPS/MAP/E2E hardening = engineering PASS (physical GPS still NOT_VERIFIED).

**Canonical entry:** [README.md](../README.md)

**Diagnostic snapshot:** [audit/FINAL_DIRECTION.md](audit/FINAL_DIRECTION.md)

**Frozen master-plan “current phase: P0-SEC” is HISTORICAL** (P0-SEC stamped PASS 2026-08-29). Do not copy it into new work. Do not treat [audit/NEXT_IMPLEMENTATION_PLAN.md](audit/NEXT_IMPLEMENTATION_PLAN.md) “next = P2-GPS / Wave 2” as current — superseded by the 2026-09-04 decision pack.

Prefer this index over archived reports. Status vocabulary: PASS · FAIL · BLOCKED · PENDING_HUMAN · UNVERIFIED · PLANNED · DEPRECATED · HISTORICAL.

## A. Root

| Document | Role |
|----------|------|
| [README.md](../README.md) | Product entry point |
| [AGENTS.md](../AGENTS.md) | Architecture rules (Strava / providers / IA) |
| [CLAUDE.md](../CLAUDE.md) | Project memory — **README is current status; master-plan is frozen history** |
| [SECURITY.md](../SECURITY.md) | Vulnerability reporting |
| [LICENSE](../LICENSE) | MIT |

## B. Master plan (frozen)

[docs/master-plan/](master-plan/) — 24 documents. Do not rewrite history inside them.

| Start here | Path |
|------------|------|
| Executive summary | [master-plan/00_EXECUTIVE_SUMMARY.md](master-plan/00_EXECUTIVE_SUMMARY.md) |
| Product status | [master-plan/03_PRODUCT_STATUS.md](master-plan/03_PRODUCT_STATUS.md) |
| Roadmap | [master-plan/21_FINAL_ROADMAP.md](master-plan/21_FINAL_ROADMAP.md) |
| Exit gates | [master-plan/22_PHASE_EXIT_GATES.md](master-plan/22_PHASE_EXIT_GATES.md) |
| GO / NO-GO | [master-plan/23_GO_NO_GO.md](master-plan/23_GO_NO_GO.md) |
| Human actions | [master-plan/17_HUMAN_ACTION_PLAN.md](master-plan/17_HUMAN_ACTION_PLAN.md) |

## C. Architecture

| Document | Role |
|----------|------|
| [adr/](adr/) | Architecture Decision Records |
| [architecture/TELEMETRY_PIPELINE.md](architecture/TELEMETRY_PIPELINE.md) | Telemetry path |
| [architecture/WATCH_MOBILE_SYNC.md](architecture/WATCH_MOBILE_SYNC.md) | Watch sync (UNVERIFIED on device) |
| [architecture/KMP_WEAR_ARCHITECTURE.md](architecture/KMP_WEAR_ARCHITECTURE.md) | Wear / shared architecture |
| [architecture/FUTURE_IOS_ARCHITECTURE.md](architecture/FUTURE_IOS_ARCHITECTURE.md) | iOS — PLANNED |
| [DECISION-LOG.md](DECISION-LOG.md) | Decision log companion |

## D. Auth / data / security (engineering evidence)

These describe **LOCAL / engineering** work. They do **not** mean production PASS.

| Document | Role |
|----------|------|
| [auth/HUMAN_AUTH_CONFIGURATION.md](auth/HUMAN_AUTH_CONFIGURATION.md) | Human auth handoff |
| [auth/P1_AUTH_IDENTITY_FLOW.md](auth/P1_AUTH_IDENTITY_FLOW.md) | Firebase UID → identity_profiles → RLS |
| [auth/P1_AUTH_TEST_MATRIX.md](auth/P1_AUTH_TEST_MATRIX.md) | Auth / API / RLS matrix (2026-09-02) |
| [auth/HUMAN_DEPENDENCIES_P1_AUTH.md](auth/HUMAN_DEPENDENCIES_P1_AUTH.md) | Engineering vs PENDING_HUMAN |
| [data/P1_DATA_RECONCILIATION.md](data/P1_DATA_RECONCILIATION.md) | 016/017 account + ASCEND stores |
| [audit/WORKTREE_RECONCILIATION.md](audit/WORKTREE_RECONCILIATION.md) | Dirty-tree classification |
| [audit/P1_AUTH_EXECUTION_REPORT.md](audit/P1_AUTH_EXECUTION_REPORT.md) | This phase evidence |
| [auth/GOOGLE_FIREBASE_SETUP.md](auth/GOOGLE_FIREBASE_SETUP.md) | Firebase / Google setup |
| [auth/AUTH_IMPLEMENTATION_REPORT.md](auth/AUTH_IMPLEMENTATION_REPORT.md) | Auth engineering report |
| [data/DATA_UNIFICATION_REPORT.md](data/DATA_UNIFICATION_REPORT.md) | Identity / data unification |
| [security/AUTH_RLS_SECURITY_REPORT.md](security/AUTH_RLS_SECURITY_REPORT.md) | RLS / IDOR engineering report |
| [master-plan/12_SECURITY_AUDIT.md](master-plan/12_SECURITY_AUDIT.md) | Canonical current security audit |

## E. Operations / deployment

| Document | Role |
|----------|------|
| [deploy-vercel.md](deploy-vercel.md) | Vercel monorepo deploy |
| [ROLLBACK.md](ROLLBACK.md) | Rollback notes |
| [launch-checklist.md](launch-checklist.md) | Future launch checklist — **not** current GO |
| [.env.example](../.env.example) | Environment variable template |

## F. Android / Wear

| Document | Role |
|----------|------|
| [android/README.md](android/README.md) | Android docs index |
| [../android/docs/elite-os-neu-glass-wave6.md](../android/docs/elite-os-neu-glass-wave6.md) | Neu-glass wave 6 report + screenshots |
| [design/ELITE_OS_NEU_GLASS.md](design/ELITE_OS_NEU_GLASS.md) | Neu-glass canonical spec |
| [android/ANDROID_LOCAL_DEMO_GUIDE.md](android/ANDROID_LOCAL_DEMO_GUIDE.md) | Local demo install |
| [android/ANDROID_HUMAN_PENDING.md](android/ANDROID_HUMAN_PENDING.md) | Android PENDING_HUMAN |
| [android/wear/WEAR_PRODUCT_GAP_ANALYSIS.md](android/wear/WEAR_PRODUCT_GAP_ANALYSIS.md) | Watch gaps |

## G. Design / product domains

| Document | Role |
|----------|------|
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Elite OS design system (tokens, chart palette, neu-glass) |
| [design/ELITE_OS_NEU_GLASS.md](design/ELITE_OS_NEU_GLASS.md) | Android neu-glass waves 0–6 (athlete surfaces) |
| [design/FITCONNECT_SURFACE_SYSTEM.md](design/FITCONNECT_SURFACE_SYSTEM.md) | Surface system |
| [03-ux-m3-expressive.md](03-ux-m3-expressive.md) | Athlete IA (4 destinations + Train FAB) |
| [01-strava-2026.md](01-strava-2026.md) | Strava 2026 policy |
| [strava-integration.md](strava-integration.md) | Strava package notes |
| [integrations/strava-api-analysis.md](integrations/strava-api-analysis.md) | Strava API analysis |
| [sports-metrics.md](sports-metrics.md) | Metrics formulas |
| [ascend/ASCEND_ARCHITECTURE.md](ascend/ASCEND_ARCHITECTURE.md) | ASCEND — PARTIAL / two truths |
| [social/FITCONNECT_SOCIAL_ARCHITECTURE.md](social/FITCONNECT_SOCIAL_ARCHITECTURE.md) | Social v1 spec (PLANNED persistence) |
| [squad/SQUAD_OS_MEGA_PROMPT.md](squad/SQUAD_OS_MEGA_PROMPT.md) | Squad — PLANNED after social |

## H. QA / release evidence (current)

| Document | Role |
|----------|------|
| [qa/MASTER_PRODUCTION_GAPS.md](qa/MASTER_PRODUCTION_GAPS.md) | Open production gaps (snapshot; prefer master-plan 20) |
| [qa/ENVIRONMENT.md](qa/ENVIRONMENT.md) | QA environment notes |
| [release/P1_AUTH_DATA_EXIT_GATE.md](release/P1_AUTH_DATA_EXIT_GATE.md) | P1 engineering evidence — does not skip P0-SEC |
| [release/ENGINEERING_FREEZE.md](release/ENGINEERING_FREEZE.md) | Freeze **NOT LOCKED** |
| [release/HUMAN_FINAL_ACTIONS.md](release/HUMAN_FINAL_ACTIONS.md) | Human release actions |
| [HUMAN_FINAL_CONFIGURATION.md](HUMAN_FINAL_CONFIGURATION.md) | Hardware / console / keys |
| [documentation/DOCUMENTATION_CLEANUP_REPORT.md](documentation/DOCUMENTATION_CLEANUP_REPORT.md) | This cleanup |

## I. Historical

| Path | Role |
|------|------|
| [archive/](archive/) | Prior phases, gates, audits |
| [phase-00/](phase-00/) … [phase-16/](phase-16/), [phase-13r/](phase-13r/) | Stubs → archive |
| [phase-17/](phase-17/) | HISTORICAL cleanup/reporting (script-coupled; not moved) |

## J. Human configuration

Canonical ordered list: [master-plan/17_HUMAN_ACTION_PLAN.md](master-plan/17_HUMAN_ACTION_PLAN.md)

Auth checklist: [auth/HUMAN_AUTH_CONFIGURATION.md](auth/HUMAN_AUTH_CONFIGURATION.md)
