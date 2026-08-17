# MEGA SYSTEM INVENTORY

**Date:** 2026-08-17  
**Code changes in this file's cycle:** none (inspection only)

## Actual tree (not assumed)

```
fitconnect/
├── android/          Kotlin/Compose phone + Wear (authoritative mobile)
├── apps/web/         Next.js 14 production
├── apps/mobile/      Expo 52 FROZEN
├── packages/         11 workspace packages
├── docs/
├── maestro/android/  31 YAML flows
├── qa/               existing QA scripts + archive screenshots
├── scripts/
├── prisma/
├── supabase/
├── convex/
├── elite-core/       Rust metrics
├── design/           Stitch / design sources
├── brand-sources/
├── Makefile + make.ps1 + make.cmd
├── package.json / pnpm-workspace.yaml / turbo.json
└── .github/workflows/
```

No top-level `wear/` or `landing/` folders. Wear = `android/wear`. Landing = `apps/web` marketing routes.

## Android modules (`android/settings.gradle.kts`)

`:app` `:wear` `:shared` `:core-capture` `:design` `:design-ui` `:foundation` `:sports` `:geo` `:telemetry` `:community` `:ai` `:athlete` `:coach`

## Web / packages

- `@fitconnect/web` — Next 14, Playwright, Vitest, smoke
- packages: ai, api-client, config, db, design-tokens, elite-core-wasm, maps, realtime-client, strava-integration, types, utils

## Tests

- Android JUnit under each module (`android/*/src/test`)
- Web Vitest + Playwright (`apps/web`)
- Maestro YAML (`maestro/android/*.yaml`)
- No `androidTest` instrumentation found in prior audit

## Design / assets

- Tokens: `packages/design-tokens` → `android/design` (generated)
- Compose UI: `android/design-ui`
- Web CSS: `apps/web/app/elite-os.css`
- Launcher: `android/app/src/main/res/mipmap*`

## CI

`.github/workflows/`: android.yml, ci.yml, eas-preview.yml, elite-core-rust.yml, sast.yml, security.yml, vercel-deploy.yml

## Configuration

- `.env.example`, `.env.local` (local, not to be committed)
- `android/keystore.properties.example`
- Production URL: https://fitconnect-phi.vercel.app
