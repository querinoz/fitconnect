# Phase 05 — Program Builder Report

## Capabilities shipped

| Feature | Support |
|---------|---------|
| Templates | `template = true` programs |
| Weeks / cycles | Fields on `CoachProgram` |
| Warmup / exercises / cooldown | `ProgramBlock` |
| Supersets | `ProgramExercise.isSuperset` |
| Intervals / rest | `interval`, `restSec` |
| Notes / attachments | Per block |
| Draft / publish | `setProgramDraft` / `publishProgram` |
| Clone | `cloneProgram` → new DRAFT |
| Version history | `version` increments on publish |

## UI

`ProgramBuilderScreen` + `ProgramsScreen` — full interactive local builder. Media attachments referenced by file id; binary upload pipeline deferred to storage adapter.
