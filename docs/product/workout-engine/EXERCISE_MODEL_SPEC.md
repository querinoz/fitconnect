# Exercise Model — Specification

## Canonical fields

| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid/text | Stable catalog id |
| `name` | string | i18n key or display name |
| `sport` | CanonicalSport | |
| `category` | enum | strength, cardio, mobility, … |
| `primaryMuscles` | string[] | e.g. `chest`, `quads` |
| `secondaryMuscles` | string[] | |
| `equipment` | string[] | barbell, dumbbell, bodyweight, … |
| `mode` | ExerciseMode | REPS, TIME, BODYWEIGHT, … |
| `sideAware` | boolean | unilateral |
| `weighted` | boolean | external load allowed |
| `instructions` | string | localized on demand |
| `mediaUrl` | string? | lazy loaded |
| `mediaLicense` | string? | required if media present |
| `source` | enum | builtin, custom, imported |
| `isCustom` | boolean | user-created |

## ExerciseMode

```
REPS | TIME | DISTANCE | DURATION_SPEED | BODYWEIGHT | WEIGHTED_BODYWEIGHT
```

## Storage

- Catalog: `exercises` table (017)
- Custom: same table, `is_custom = true`, `user_id` owner

## Android mapping

Extend `ExerciseDefinition` → sync with canonical id; do not fork naming.

## Search / filter

Composable: equipment ∧ muscle ∧ category ∧ sport ∧ difficulty

Empty state when no results — never silent blank screen.
