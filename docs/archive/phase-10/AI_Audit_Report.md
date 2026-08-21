# Phase 10 — AI Audit Report

**Date:** 2026-08-08  
**Branch:** `phase-10/ai-performance-engine`

## Existing AI surfaces

| Location | Kind | Status |
|----------|------|--------|
| `android/coach/.../CoachAiPorts.kt` | Interface stubs (`ArchitectureCoachAiPort`) | LEGACY → wire to `:ai` |
| `android/sports/.../SportsAiPort.kt` | Interface stubs | LEGACY → wire to `:ai` |
| `packages/ai` (web TS) | Rules-based readiness + optional OpenAI flag | WEB-ONLY — do not couple Android |
| `apps/web/lib/ai/rules.ts` | Deterministic PR / readiness rules | WEB-ONLY |
| `apps/web/app/api/v1/ai/readiness` | HTTP readiness AI route | WEB-ONLY |

## Findings

1. **No Android AI runtime** — only empty architecture ports.
2. **Web package invents readiness scores** via local rules (`packages/ai`) — Android must NOT port that as competing calculation; readiness stays in Athlete/Telemetry engines.
3. **No provider abstraction** on Android.
4. **No prompt versioning, safety, tools, cost, or evaluation** layers.
5. **Coach/Sports ports are correct seams** — keep contracts, replace stubs with `:ai` adapters.
6. **No AiInsightCard** in design-ui yet — add Elite-aligned component.
7. **Sensitive data:** no AI path currently sends health data (safe by absence); Phase 10 must enforce minimization before any provider call.

## Classification

| Item | Class |
|------|-------|
| `CoachAiPort` / `SportsAiPort` interfaces | CORE (keep) |
| `ArchitectureCoachAiPort` / `ArchitectureSportsAiPort` | MIGRATED (replaced by adapters) |
| `packages/ai` web readiness scorer | OUT OF SCOPE (web) — not deleted |
| Hardcoded "AI Engine not enabled" strings | REMOVE after wiring |

## Architecture violations to fix

- Zero AI provider coupling today (good).
- Risk: wiring UI to invent recommendations — forbidden; all insights must cite evidence from ports.
