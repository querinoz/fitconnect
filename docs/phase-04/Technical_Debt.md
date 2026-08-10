# Phase 04 — Technical Debt

## Intentional deferrals (STOP / scope)

1. **Community hub** — social feed / clubs not a dedicated tab; Discover + coach messages cover coach discovery for now.  
2. **Live wearable SDKs** — `ArchitectureWearableGateway` only; Health Connect path next.  
3. **Room durable Athlete cache** — in-memory `LocalAthleteRepository` mirrors `LocalAuthRepository` pattern.  
4. **Remote Athlete API adapter** — interface ready; no network implementation this phase.  
5. **Dedicated Sleep / HR / Training Load screens** — embedded in Recovery/Home to avoid route duplication.  
6. **Bottom nav vector icons** — text glyphs temporary.  
7. **Device Visual / Maestro / TalkBack** — blocked on emulator BIOS SVM.

## Engineering follow-ups

| Item | Priority |
|------|----------|
| Coil binding for session media URLs | P1 |
| Compose UI tests for Home/Recovery load paths | P1 |
| Conflict merge for offline session notes | P2 |
| Foldable `WindowSizeClass` breakpoints in Athlete scaffold | P2 |
| Replace `ANONYMOUS → AthleteOsApp` with explicit demo athlete flag | P1 |

## Compile note (fixed this phase)

Named-arg typo `Box(Modifier = …)` (capital M) in app nav host broke overload resolution — fixed to `modifier` + explicit `content = {}`. Prefer named `content =` for Scaffold/Box/Row in this Compose BOM.
