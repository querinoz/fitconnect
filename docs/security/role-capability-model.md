# Role vs capability model

| Concept | Meaning | Trusted? |
|---|---|---|
| Firebase UID | Account identity | Yes (token) |
| Capability | What the account may use | Server DB |
| activeMode | Which shell is shown | UX only |
| Legacy role | Mirror of activeMode | Compatibility |

## Forbidden

- Client sending `role=coach` to unlock coach APIs without capability.
- Coach reading athletes outside roster (`requireCoachOwnsAthlete`).
- Treating demo dual capabilities as production entitlements.
