# Phase 01 — Folder Tree (Android foundation focus)

```
fitconnect/
├── android/                          # Native product (ADR-005)
│   ├── app/
│   │   ├── src/main/java/com/fitconnect/android/
│   │   │   ├── FitConnectApplication.kt
│   │   │   ├── MainActivity.kt
│   │   │   └── ui/
│   │   │       ├── ErrorBoundary.kt
│   │   │       ├── navigation/
│   │   │       │   ├── AppDestinations.kt
│   │   │       │   └── FitConnectNavHost.kt
│   │   │       └── theme/
│   │   │           └── EliteSurfaceTheme.kt
│   │   └── src/main/res/
│   │       ├── values/{strings,themes,colors}.xml
│   │       ├── values-night/themes.xml
│   │       └── xml/network_security_config.xml
│   ├── foundation/                   # Cross-cutting single source of truth
│   │   └── src/main/java/.../foundation/
│   │       ├── a11y/
│   │       ├── analytics/
│   │       ├── common/
│   │       ├── config/
│   │       ├── crash/
│   │       ├── di/
│   │       ├── network/
│   │       ├── offline/
│   │       ├── performance/
│   │       └── storage/
│   ├── design/                       # Generated Elite Surface tokens
│   ├── core-capture/
│   ├── wear/
│   ├── gradle/libs.versions.toml
│   └── README.md
├── apps/
│   ├── web/                          # Next.js PWA (cleanup W1 applied)
│   └── mobile/                       # FROZEN Expo legacy
├── packages/
│   ├── design-tokens/                # Token SoT → Kotlin via pnpm tokens:kotlin
│   └── …                             # api-client, strava-integration, …
├── elite-core/                       # Rust domain (parallel F1)
├── maestro/android/                  # Device smoke YAML
├── docs/
│   ├── phase-00/                     # Diagnosis (approved)
│   └── phase-01/                     # This phase outputs
├── configs/
├── scripts/
└── prisma/
```

## Mapping from the Phase 01 prompt’s RN package tree

| Prompt folder | Native location |
|---------------|-----------------|
| `packages/auth` | `foundation/di/SessionStore` (+ F3 Supabase) |
| `packages/network` | `foundation/network` |
| `packages/storage` | `foundation/storage` |
| `packages/telemetry` | `foundation/analytics` + `common/Logger` |
| `packages/design-system` | `android/design` + `packages/design-tokens` |
| `packages/{athlete,coach,maps,ai,payments}` | **Not created** (forbidden this phase) |
| `packages/testing` | JUnit under modules + `maestro/` |
