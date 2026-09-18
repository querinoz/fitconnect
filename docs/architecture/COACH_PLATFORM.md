# Coach Platform (V10.5)

## Roster ACL
`coachMayAccessAthlete({ coachId, athleteId, scope })`

- Default deny cross-tenant
- Explicit link + scopes required
- Revocation supported
- Nutrition scope independent (also see `coachMayReadNutrition`)

## API
`GET/POST /api/v1/coach/roster`
