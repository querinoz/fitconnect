# openGym Gap — Priority Matrix

**Date:** 2026-09-01

## P0 — Safety & data integrity (before UX polish)

| Item | Action | Owner phase |
|------|--------|-------------|
| Canonical exercise + set models | Implement types + migration `017` | **Now** |
| Plan vs execution separation | Schema + docs | **Now** |
| Progression engine (deterministic) | Kotlin + TS + tests | **Now** |
| RLS on new strength tables | Migration `017` | **Now** |
| No AGPL code copy | License doc | **Done** |
| ASCEND idempotency on completion | Reuse `activity.completed` | P6 integration |

## P1 — Core workout product

| Item | Depends on |
|------|------------|
| Guided workout execution UI | P0 models + FSM |
| Set logging (reps/weight/time) | P0 |
| Rest timer + wakelock | Execution UI |
| Progression explanation UI | ProgressionEngine |
| Weekly plan + occurrence model | Migration 017 |
| Rescheduling | Occurrence model |
| Supersets execution | Set model |
| Timed sets | Set model |
| Failed rep / stall rules | ProgressionEngine |

## P2 — Analytics & body metrics

| Item | Notes |
|------|-------|
| Body weight chart + goal | `body_weight_entries` |
| Estimated 1RM UI | OneRepMaxEstimator |
| RPE/RIR per set | Informational only |
| Muscle map | FitConnect visual language |
| Training heatmap | Analysis tab |
| Cardio set mode | Link to telemetry |

## P3 — Import/export & sharing

| Item | Notes |
|------|-------|
| JSON export v1 | No secrets |
| Plan share merge | No health data |
| FitNotes/Strong/Hevy importers | Preview → commit |

## P4 — Coach & integrations

| Item | Notes |
|------|-------|
| Coach plan builder → Postgres | Wire existing UI |
| Coach analytics (authorized) | Privacy gates |
| Push: rest timer, reminders | FCM + preferences |

## P5 — Watch & realtime

| Item | Notes |
|------|-------|
| Phone↔watch workout sync | P7-WATCH |
| domain_events for session state | P3-REALTIME |

## Rejected / incompatible

| Item | Reason |
|------|--------|
| Copy openGym UI | Brand / Elite OS |
| "No telemetry" product rule | FitConnect observability needs |
| Replace Firebase/Supabase with passkey-only | P1-AUTH architecture |
| 600+ exercise media bundle at startup | Performance — lazy load |
