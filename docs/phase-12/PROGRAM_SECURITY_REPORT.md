# Phase 12 — Program Security Report

## Components

| Surface | Path |
|---------|------|
| Coach program builder | `android/coach/` programs UI + `ProgramBuilderLogicTest.kt` |
| Athlete programs | `android/athlete/ui/programs/ProgramsScreen.kt` |
| AI propose change | `proposeProgramChange` tool (WRITE — blocked at runtime) |
| Web programs | `supabase/migrations/006_programs.sql` |
| Community programs | `android/community/programs/ProgramEngine.kt` |

## Authorization

| Action | Required permission |
|--------|---------------------|
| Athlete view enrolled program | `ACCESS_ATHLETE_OS` + enrollment |
| Coach edit program | `ACCESS_COACH_OS` + ownership |
| AI modify program | Denied — proposal only via `AiPermissionGate` |

## Phase 12 AI boundary

`proposeProgramChange`:

- Role: COACH only
- Scope: ASSIGNED_ATHLETES
- Access: WRITE → **runtime rejects execution**

Human/coach must approve in UI.

## Data integrity

- Local coach repos: test coverage in `LocalCoachRepositoryTest.kt`
- Server: RLS on `programs`, `program_enrollments` — not live-verified

## Threats

| Threat | Status |
|--------|--------|
| Athlete edits coach program | Blocked by role |
| Coach edits unassigned athlete program | Local authz — server TBD |
| AI auto-applies program change | Blocked (WRITE denial) |
| IDOR on program ID | **Open** — needs API audit |

## Verdict

**AI cannot auto-mutate programs** — key Phase 12 control. **Server-side program ownership checks** remain open debt.
