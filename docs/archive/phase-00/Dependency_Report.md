# Phase 00 — Dependency Report

**Date:** 2026-08-07 · **No code changed**

---

## 1. Workspace package inventory

| Package | Purpose | Source files | Tests? | Build step? | Importers | Verdict |
|---------|---------|-------------:|--------|-------------|----------:|---------|
| `@fitconnect/types` | Shared DTOs | ~small | no | no | 39 | **KEEP — CORE** |
| `@fitconnect/design-tokens` | EOS colour/motion tokens | few | via web sync test | no | 14 | **KEEP — CORE** |
| `@fitconnect/strava-integration` | OAuth, webhook, v3 allowlist, mappers | 9 | 9 cases | no | 14 | **KEEP — CORE** |
| `@fitconnect/utils` | readiness compute (canonical) | few | yes | no | 12 | **KEEP — SHARED** (metrics migrate to elite-core over time) |
| `@fitconnect/api-client` | tRPC router + context | ~8 | pact stubs | no | 9 | **KEEP — harden auth** |
| `@fitconnect/maps` | MapLibre helpers | few | mobile test | no | 7 | **KEEP** |
| `@fitconnect/config` | token shim for RN/web | few | no | no | 4 | **REFACTOR** — mobile points here instead of design-tokens (DS-01) |
| `@fitconnect/ai` | LangGraph readiness / coach verification | 3 | no | no | 4 | **UNKNOWN** — keep for F10 or archive |
| `@fitconnect/realtime-client` | transport types | few | no | no | 3 | **KEEP thin** |
| `@fitconnect/db` | migration test utils | few | yes | no | 2 | **UNDERUSED** |
| `@fitconnect/elite-core-wasm` | TS wrapper for wasm | 2 | 1 | wasm-pack later | 2 | **KEEP — F1** |
| `packages/ui` | empty `src/`, no package.json | 0 | no | no | 0 | **REMOVE_CANDIDATE** |

Apps: `@fitconnect/web` (primary), `@fitconnect/mobile` (legacy frozen).

Outside pnpm: `elite-core` (Cargo), `android/` (Gradle).

---

## 2. Third-party technology evaluation (Step 6)

| Technology | Current usage | Correct usage? | Problems | Migrate? | Recommendation | Score /10 |
|------------|---------------|----------------|----------|----------|----------------|----------:|
| **Expo** | Frozen `apps/mobile` | Was for cross-platform | App does not launch; no Wear OS | **Yes — already decided** | Archive after native F6; do not unfreeze | 1 |
| **React Native** | Same as Expo | — | Same | Yes (away) | ADR-005 | 1 |
| **Expo Router** | Mobile routes | Idioms used, bugs in custom tab bar | Phantom tabs, hydration race | N/A with archive | — | 2 |
| **React Query / TanStack Query** | Declared on web | **Underused** — Zustand holds data | No QueryClient-driven server cache | Adopt on web for server state | Use for F12 dashboards | 4 |
| **MMKV** | Mobile cache | Wrong version/arch | New Arch unset → crash | Downgrade or enable New Arch if unfrozen | Irrelevant if Path A | 1 |
| **Prisma** | Web DB access | Correct ORM choice | Dual schema with Supabase SQL | Unify on Prisma (ADR-009) | KEEP | 7 |
| **Supabase** | Auth (+ partial realtime) | Auth yes; DB PostgREST unused | Parallel migrations; identity split | Keep Auth; stop dual SQL | KEEP Auth | 6 |
| **Convex** | Polling transport | Docs say primary; code defaults broadcast | Not production-hardened | Decide primary realtime | Keep or cut — decide in F11 | 4 |
| **Stripe** | SDK + demo fallback | Connect demo-only | Not go-live ready | Real Connect later (BACKLOG) | Hide/disable Connect in v1 | 5 |
| **LiveKit** | Token + room | Out of v1 lockdown | Heavy dep for deferred feature | Leave; don't expand | BACKLOG-V2 | 4 |
| **MapLibre** | Web thin; mobile none | Correct choice (ADR-008) | Incomplete product surface | Finish on web + Android native | KEEP | 5 |
| **Zustand** | Web + mobile | Good for UI state | Used as fake DB | Narrow to UI | KEEP, constrain | 6 |
| **Reanimated** | Mobile only | Fine | Dead with freeze | — | — | 3 |
| **FlashList / Skia** | Not present | — | Prompt assumed them | Add on native if needed | Native Compose lists/Canvas instead | n/a |
| **Sentry** | `@sentry/browser` ~2 files | Thin | Barely wired | Wire properly F15 | KEEP | 3 |
| **PostHog** | ~2 files | Client-only | OK for v1 | Keep light | KEEP | 5 |
| **Detox** | Not present | — | — | Prefer Maestro for Android | Do not add Detox | n/a |
| **Maestro** | Not yet | Target for Android E2E | Emulator blocked (BIOS) | Add in F3 | Adopt | — |
| **GSAP / Lenis / Motion** | Landing heavy | Correct for cinematic landing | Perf budget risk | Keep with guards | KEEP | 7 |
| **tRPC** | Server mount | No web client; stubs | Public Strava procs | Harden or delete unused | Harden CORE procs | 4 |

---

## 3. Heavy / suspicious dependencies (web)

| Dependency | Files importing | Verdict |
|------------|----------------:|---------|
| `motion` | 82 | USED |
| `framer-motion` | 0 | **UNUSED — remove candidate** |
| `convex` | 8 | UNDERUSED (poll fallback) |
| `lenis` | 3 | USED (landing) |
| `maplibre-gl` | 2 | UNDERUSED relative to ambition |
| `posthog-js` | 2 | USED light |
| `@sentry/browser` | 2 | UNDERUSED |
| `livekit-client` | 1 | UNDERUSED / out of v1 |
| `@livekit/components-react` | 2 | UNDERUSED / out of v1 |

---

## 4. Version drift

| Package | web | mobile | other |
|---------|-----|--------|-------|
| `react` | ^18.3.1 | 18.3.1 (exact) | — |
| `zustand` | ^5.0.1 | ^5.0.3 | drift minor |
| `vitest` | ^2.1.9 | ^2.1.9 | strava-integration ^3.0.9 **major drift** |
| `typescript` | (workspace) | ^5.6.3 | packages vary |

---

## 5. Security audit snapshot

`pnpm audit --audit-level high` reports multiple **critical/high** issues (Vitest UI, node-tar, Next.js DoS, undici, xmldom, etc.). Many are transitive/dev. **Not blindly upgradeable in Phase 00** — tracked as debt; remediation is a dedicated security phase after architecture freeze.

Prior production-relevant highs to schedule:
1. Next.js DoS / RSC advisories — upgrade Next on a dedicated PR.
2. Undici websocket issues — comes via fetch stack.
3. Vitest critical — **dev-only** if UI server unused in CI.

---

## 6. Turbo / pnpm notes

- Workspace: `apps/*`, `packages/*` (elite-core and android outside).
- Mobile excluded from CI typecheck/test (freeze) — correct for Path A.
- `tokens:kotlin:check` wired into CI — good.
- Risk: packages without `build` scripts still participate in turbo graphs inconsistently.

---

## 7. Top 10 dependency problems

1. Demo-mode default creates effective auth bypass regardless of library quality.
2. Dual Prisma/Supabase schema ownership.
3. `framer-motion` declared or residual with 0 imports — `motion` is real.
4. Vitest major version drift (2 vs 3) across packages.
5. LiveKit shipped while out of v1 lockdown — weight without payoff.
6. `packages/ui` invalid package directory.
7. `@fitconnect/config` token shim diverges from `design-tokens` (breaks mobile DS).
8. tRPC dependency cost without client usage.
9. Convex dependency with broadcast default — pay for unused path.
10. High/critical audit backlog without a scheduled upgrade train.
