# Unified Identity — QA notes

## Automated (this slice)

| Check | Command | Result |
|---|---|---|
| Entitlements unit | vitest identity tests | (run in CI / local) |
| Role policy | role-policy + entitlements tests | |

## Manual Android (LOCAL_DEMO)

1. Sign in `eduardo@fitconnect.demo` / `password1`
2. Open Profile → ACTIVE EXPERIENCE shows Athlete + Coach
3. Switch to Coach → Coach OS without logout
4. Switch back to Athlete
5. Cold start preserves mode
6. `ines@…` athlete-only: no Coach radio (or unlock CTA)
7. `tomas@…` coach-only: Coach selected

## Security

- PUT active-mode without capability → 403
- Coach API without capability → 403
- Cross-athlete → 403 via `requireCoachOwnsAthlete`
