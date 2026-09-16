# Zenith Experience Engine

**Status:** implemented (web consolidation) · 2026-09-16  
**Surfaces:** `apps/web` + `@fitconnect/design-tokens` (+ Compose via `pnpm tokens:kotlin`)  
**Non-goals:** Componentry package install · Manus runtime dependency · Expo revival · fake telemetry

## Rule stack

| Layer | Owns |
|-------|------|
| **Zenith** | Identity — Floor / Voltline / Iris / Telemetry |
| **Componentry patterns** | Adapted ideas only — never a showcase |
| **Motion** | Behavior — `MOTION_TOKENS` + `lib/motion/*` |
| **FitConnect** | Product experience — Feed · Ascend · TRAIN · Dashboard · Profile |
| **MCP** | Agent tools — least privilege, no fabricated biometrics |
| **Manus** | Optional long-running ops — not a product runtime |

## Motion ladder

Canonical source: `packages/design-tokens/motion.ts`

| Zenith | Seconds | Canonical alias |
|--------|--------:|-----------------|
| instant | 0.09 | — |
| fast | 0.15 | `micro` |
| normal | 0.22 | `ui` |
| slow | 0.34 | (screen ceiling 0.40) |
| cinematic | 0.80 | (data ceiling 1.20) |

Springs: `snappy` · `soft` · `heavy` · `telemetry` · `navigation`  
Stagger: **28 ms**  
Metric numbers: **settle ease / no snap overshoot** (`eliteMetricLand` + `TelemetryMetric`)

Reduced motion: `MotionConfig reducedMotion="user"` + `muteEliteMotion` + `data-motion` boot script in `layout.tsx`.

## Web entrypoints

- Tokens: `@fitconnect/design-tokens` → `EOS_MOTION` in `lib/design-system/tokens.ts`
- Presets: `lib/motion/elite-motion.ts` (`zenithMotion`, `zenithSpring`)
- Metric UI: `components/telemetry/telemetry-metric.tsx`
- Landing: existing GSAP + Lenis (unchanged storytelling); entrance timings unified to MOTION_TOKENS

## MCP

Gateway: `apps/web/lib/mcp/`  
Adds honest read tools / aliases: `get_user_profile`, `get_coach_profile`, `get_readiness`, `get_recovery`, `get_sleep`, `get_hrv`, `get_training_load`, `get_activity`, `get_workout`, `get_device_status`, `get_program`, `get_feed`, `get_connections`.

Missing stores return `UNAVAILABLE` / `MISSING` / `NOT_CONNECTED` — never invent HRV, sleep, GPS, or device links.

## Componentry

**Not installed.** Patterns (magnetic dock, scroll choreography, etc.) may be adapted into Zenith-native components only when justified. Do not ship a Componentry demo aesthetic.

## Manus

**Not a runtime dependency.** Use for research / release ops when available; do not block product builds on Manus.

## Verification

Run: `pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm --filter @fitconnect/web build` · smoke/Lighthouse as needed.
