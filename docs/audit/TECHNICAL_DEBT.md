# Technical Debt

**Date:** 2026-09-02

## P0

| Debt | Impact |
|------|--------|
| Git HEAD lacks `016`/`017`/`canonical.ts` (untracked) | Canonical schema not on the branch remote tracks |
| Dirty mixed worktree (P1-AUTH + HC + Instagram + docs) | Cannot ship or review one phase |
| README / `docs/README.md` say next phase **P0-SEC** | Contradicts P0-SEC PASS stamp |
| Marketing “600+ exercises” | False product claim |
| Triple ASCEND (SQL / Zustand / Android memory) | Duplicate XP risk if all write |

## P1

| Debt | Impact |
|------|--------|
| Prisma dashboard `db/repository.ts` vs `activities` | Dual fitness identity |
| Community/squad memory stores in CI | Tests ≠ production path |
| No Room / no IndexedDB | Offline workout cannot be SoT |
| `EliteCapture` stub vs LiveActivityEngine demo | GPS name exists, capture does not |
| Telemetry `HealthConnectProvider` still `BaseSimulatedProvider` | Dual HC truth |
| Coach LOCAL_DEMO only | Coach OS not a product |
| CI `NEXT_PUBLIC_DEMO_MODE=true` | E2E not production-like |
| Strength engine untracked, no UI | Domain without product |
| Wear `wear-*` IDs | Cannot join ASCEND activity UUID |

## P2

| Debt | Impact |
|------|--------|
| Dual notification tables (uuid vs Firebase UID) | Migration later |
| `workout_sessions` uuid vs `activities` | Legacy |
| Broadcast realtime default | P3 still required |
| Expo frozen but still in repo | Confusion |
| Instagram/marketing binaries in tree | Noise |
| Coach without neu-glass | Visual split |

## P3

| Debt | Impact |
|------|--------|
| i18n dashboards incomplete | Polish |
| Documentation volume / HISTORICAL CLAUDE.md | Agents copy stale PASS |
| Unused MapLibre stubs | Dead adapters |

**Do not delete anything in this audit phase.**
