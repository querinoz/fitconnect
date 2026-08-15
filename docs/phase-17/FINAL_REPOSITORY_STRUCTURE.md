# PHASE 17 — final repository structure

Existing architecture was preserved. No invented `web/` or `watchos/` trees.

```
fitconnect/
├── android/                 # ANDROID_KOTLIN — production mobile (ADR-005)
│   ├── app/
│   ├── athlete/
│   ├── coach/
│   ├── wear/                # Wear OS (not watchOS)
│   ├── design/ + design-ui/
│   ├── foundation/ geo/ telemetry/ …
│   └── scripts/
├── apps/
│   ├── web/                 # WEB_APP + LANDING (Next.js 14)
│   └── mobile/              # REVIEW_REQUIRED — Expo frozen Path A
├── packages/                # SHARED (types, tokens, api-client, strava, …)
├── elite-core/              # SHARED Rust engine
├── prisma/ convex/ supabase/
├── docs/                    # DOCUMENTATION (phase-00…17 retained)
├── qa/                      # QA scripts + archived screenshots
├── scripts/                 # BUILD + reporting/
├── brand-sources/           # canonical brand masters
├── maestro/                 # QA (device flows; emulator currently BLOCKED)
├── .github/                 # CI_CD
├── Makefile
├── package.json
└── pnpm-workspace.yaml
```

**Absent on purpose:** `watchos/` (no Swift/Xcode sources). Do not scaffold it from this cleanup.

**Root cleanup:** APK/log dumps ignored; duplicate logos removed or moved under `brand-sources/` / `qa/archive/`.
