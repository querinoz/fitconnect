# ZENITH IA — ARCHITECTURE AUDIT

**Date:** 2026-09-08  
**Phase:** 1 — AUDIT (gate before implementation)  
**Status:** COMPLETE — implementation may proceed under Phase 2 constraints below  
**Scope:** FitConnect monorepo (`apps/web`, `android/`, `packages/`, `elite-core`, Prisma, API)

---

## Naming collision (critical)

| Term in repo today | Meaning |
|---|---|
| **Zenith IA** (`docs/design/ZENITH_MOBILE_IA.md`) | **Information Architecture** — nav lock `Feed · Ascend · [TRAIN] · Dashboard · Profile` |
| **Zenith OS / Elite OS** | Product shell + design system (neu-glass, EOS tokens) |
| **User request “Zenith IA”** | **Artificial Intelligence Performance Engine** |

**Decision:** Product nav lock stays. The intelligence layer is named **Zenith Performance Engine** in code (`@fitconnect/zenith-core`, Android `:ai` / `AiPerformanceEngine`). UI copy may say “Zenith” / “Zenith Insight” without adding a 5th bottom tab or cloning mock CONNECT/CHAT/HOME.

---

## Current architecture

```text
FitConnect monorepo
├── apps/web          Next.js 14 — athlete/coach dashboards, REST /api/v1, tRPC stubs
├── apps/mobile       Expo (Path A frozen — not production mobile for this work)
├── android/          Compose Path A — athlete, coach, ai, telemetry, providers, wear
├── packages/         ai, utils, types, api-client, strava-integration, design-tokens, …
├── elite-core/       Rust sports metrics (partial golden files)
├── prisma/           19+ models (ReadinessSnapshot, biometrics, TrainingPlan.aiSuggestion)
├── supabase/         migrations / RLS (parallel to Prisma — known dual-schema debt)
└── convex/           web-centric realtime (Android uses Supabase RT / FCM / LiveKit)
```

**Mobile production path:** Compose under `android/` (not Expo).

---

## Existing telemetry

| Surface | Location | Notes |
|---|---|---|
| Health Connect core | `android/providers`, `FitnessProvider` | Architecture lock: HC is data core |
| Telemetry module | `android/telemetry` | Normalization / pipeline stubs |
| Wear | `android/wear` | Contracts/adapters; not full production watch OS yet |
| Strava | `packages/strava-integration` + Prisma | **Never social / never ML training data** (AGENTS.md) |
| Web readiness APIs | `/api/v1/ai/readiness`, readiness routes | Auth/demo dual-path risk |

**Gaps:** Full prod HC continuous sync; no invented wearable values; Strava must stay out of Zenith social/ML fact sheets.

---

## Existing AI

| Layer | What exists | Gap |
|---|---|---|
| `@fitconnect/ai` | Rule readiness + coach stubs; OpenAI gated but **empty LLM body** | Duplicate formula vs `@fitconnect/utils`; no structured Zenith response |
| `@fitconnect/utils` readiness | Canonical TS: HRV 40% / sleep 30% / strain 30% | Should be **single source** for TS |
| Android `:ai` | `AiPerformanceEngine`, prompts, guardrails, local grounded provider | Cloud LLM adapters incomplete |
| `android/shared` | `PerformanceIntelligence` (BodyState, training load snapshot) | Parallel vocabulary vs TS |
| `elite-core` | Rust metrics | Golden-file completeness |

**No `packages/zenith-core` before this audit.**

---

## Existing athlete dashboard

- Android: `HomeScreen` / `TodayCommandCenter` / readiness panels — neu-glass Elite OS
- Secondary AI surface: `AthleteAiScreen` (not a bottom tab)
- Web: athlete dashboard widgets (readiness, sessions) — i18n incomplete

**Gap:** Insights not yet a first-class STATE → WHY → WHAT hierarchy on Dashboard; risk of chatbot-only UX if we only ship chat.

---

## Existing coach dashboard

- Android coach: Zenith-parity nav in progress
- Web coach: Today / Sessions / Roster — no Zenith Attention overview yet
- `TrainingPlan.aiSuggestion` in Prisma — stub for adaptive suggestions

**Gap:** Coach-in-the-loop Accept / Modify / Reject + decision history not productized.

---

## Existing mobile architecture

- Athlete module navigation lock (Feed · Ascend · TRAIN FAB · Dashboard · Profile)
- Firebase Auth on Android; Supabase on web (dual IdP)
- Offline: local prefs / cache patterns exist — do not invent a second cache stack
- Demo chrome: `AppConfig.visualQaChromeDiet` / LOCAL_DEMO gates

---

## Existing data models (Prisma-relevant)

Present (reuse): `ReadinessSnapshot`, biometric fields, `TrainingPlan` (+ `aiSuggestion`), athlete/coach relations, sessions.

Absent (do not invent until Phase 3): `ZenithInsight`, `ZenithRecommendation`, `ZenithDecision`, `ZenithConversation`, `ZenithBaseline`, `ZenithModelVersion`.

---

## Existing authentication

- Web: Supabase session; demo mode still a production risk (`NEXT_PUBLIC_DEMO_MODE`)
- Android: Firebase IdP
- API: never trust client-supplied `athleteId` / role as authority

---

## Existing realtime

- Web: Convex / Broadcast patterns
- Android: Supabase realtime, FCM, LiveKit for live sessions
- Zenith recalculation should invalidate granularly (readiness/recovery), not full app remount

---

## Existing tests

- Web / packages: Vitest strong on utils readiness; AI package thin
- Android: unit tests on push mappers, some AI adapters (`UnavailableAiAdaptersTest`)
- E2E Playwright web; Maestro mobile **often blocked** (CLI / device policy)

---

## Potential conflicts

1. **Triple readiness formulas:** `@fitconnect/utils` vs `@fitconnect/ai` vs Android `PerformanceIntelligence` / `:ai`
2. **IA vs AI naming** confusing product + docs
3. **Demo data** leaking into production telemetry paths
4. **Strava** accidentally entering social insight or ML training sets
5. **LLM calculating scores** if adapters bypass deterministic engine
6. **Prisma vs Supabase** dual schema for new Zenith tables
7. **Coach plan auto-mutation** without explicit policy

---

## Required changes (phased)

| Phase | Work | Status after audit |
|---|---|---|
| 1 | This audit | **DONE** |
| 2 | `@fitconnect/zenith-core` — baseline, readiness, recovery, load, trends, risk, confidence, recommendations (deterministic) | **START** |
| 3 | Wire telemetry / API / Prisma entities as needed | PENDING |
| 4 | Context builder + LLM provider abstraction + guardrails (extend `@fitconnect/ai` + Android `:ai`) | PENDING |
| 5–6 | Athlete Dashboard insights + Coach attention UX | PENDING |
| 7 | Adaptive training + coach-in-the-loop decisions | PENDING |
| 8–9 | Watch contracts + offline reuse | PENDING |
| 10–13 | Security, eval, device QA, final report | PENDING |

**Placement rule:** Formulas live in `zenith-core` (TS) / `elite-core` (Rust) / Android ports — **one documented formula per metric**. LLM only explains validated engine output.

---

## Risk areas

| Risk | Severity | Mitigation |
|---|---|---|
| Hallucinated readiness scores | P0 | Deterministic engine + UNKNOWN on insufficient data |
| Medical diagnosis language | P0 | Guardrails + non-diagnostic copy |
| Strava in social/ML | P0 | DB/RLS + Zenith context excludes STRAVA provider |
| Coach auto-apply AI plan | P0 | Coach-in-the-loop required |
| Secret leakage to LLM | P0 | Context builder minimization |
| Scope explosion (13 phases) | P1 | Ship Core + contracts first; no fake “100% done” |
| Android physical QA blocked | P1 | Emulator evidence + explicit BLOCKED on device |

---

## Reuse map (do not duplicate)

| Need | Reuse |
|---|---|
| Readiness math (TS) | `@fitconnect/utils` → re-export / wrap from `zenith-core` |
| Types | `@fitconnect/types` |
| Android AI orchestration | `android/ai` `AiPerformanceEngine` |
| Body state vocabulary | Align with `PerformanceIntelligence` over time |
| Design | EOS tokens / neu-glass — no new palette |
| Nav | Existing athlete destinations — Zenith insight on Dashboard/Home |

---

## Explicit non-goals for Phase 2

- ChatGPT-style bottom tab
- Fake `const readiness = 82` production path
- Full Prisma migration of all Zenith tables (Phase 3)
- Cloud LLM production without env-configured provider
- Claiming PRODUCTION READY without device + security QA

---

## Next authorized step

**Phase 2 — CORE:** implement `packages/zenith-core` with documented formulas, tests, and UNKNOWN / confidence / data-quality semantics. Point `@fitconnect/ai` at zenith-core for scoring. Leave LLM as optional explanation layer only.
