---
name: elite-os-multiplatform
description: FitConnect three-surface architecture (Android Compose, Wear OS, Next.js web). Use when writing ADRs, session lock, realtime sync, Wear Data Layer, web dashboards, or deciding Compose Wasm vs React. Load before changing shared domain or claiming cross-device realtime.
---

# Elite OS multiplatform

Naming: **Elite OS** = product shell. **Elite Surface** = design tokens. **Elite Core** = Rust engine. Do not fork `--eos-*` hues (`#070B14` / `#C8FF00`).

## Source of truth

| Surface | Code | Tokens |
|---|---|---|
| Web app + landing | `apps/web` Next.js 14 | `apps/web/app/elite-os.css` + `packages/design-tokens` |
| Android phone | `android/app` + `:athlete` | generated `EliteSurfaceTokens.kt` via `pnpm tokens:kotlin` |
| Wear OS | `android/wear` | same Kotlin tokens; honeycomb static ≤3% or off in ambient |
| Shared domain (JVM) | `android/shared` | no Android APIs |
| Expo | `apps/mobile` | **frozen Path A** — do not revive as the reference app |

## Architecture locks (ADR-001 / ADR-002)

- Web stays **React + Next.js** sharing the API. Do not migrate to Compose Multiplatform / Wasm.
- Watch ↔ phone = **Wearable Data Layer** (Bluetooth), not the internet.
- Web ↔ cloud = same cloud subscription as phone (Supabase Realtime / Convex; Broadcast is demo-only).
- Watch standalone LTE = future; current Wear is companion-first.
- One **active session owner** (`deviceId`). Other surfaces show “session running on {device}” + transfer. Never a second session.
- Offline-first is the target (Room / IndexedDB / Wear local). Today most stores are in-memory + `OutboxQueue`. Do not claim Room/IndexedDB exists.
- Conflicts: `updatedAt` then `deviceId`. Active-session fields: owner wins until transfer ACKs.
- Metric origin: `DataSourceKind` (watch / phone / import / `LOCAL_DEMO`). Never upgrade a demo sample to `REAL_SENSOR`.

## Honesty

- No fake testimonials, user counts, or Lighthouse scores.
- Emulator / Gradle / TalkBack claims need command output. If blocked, write `⏭️` and continue.
- Health numbers without `LOCAL_DEMO` (or a real sensor path) are forbidden.

## Navigation

Mobile tabs stay **HOME · DISCOVER · ACTIVITY · COMMUNITY · PROFILE**. Web uses a persistent sidebar of the same five plus Settings. Wear is one datum per screen, rotary crown, ambient B/W during session.
