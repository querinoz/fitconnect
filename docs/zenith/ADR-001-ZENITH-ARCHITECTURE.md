# ADR-001 — Zenith Performance Architecture

**Status:** Accepted  
**Date:** 2026-09-08  
**Context:** FitConnect needs an AI performance layer without LLM-invented scores.

## Decision

1. **Deterministic engine first** (`@fitconnect/zenith-core`) computes readiness, recovery, load, trends, risk, recommendations, confidence, and data quality.
2. **LLM second** (Phase 4: `@fitconnect/ai` + Android `:ai`) only explains, summarizes, and converses over validated engine output via a Context Builder + Guardrails.
3. **Single TS readiness formula** remains `@fitconnect/utils` `computeReadiness`; zenith-core wraps it and adds UNKNOWN / explainability.
4. **Coach-in-the-loop** for `TRAINING_ADJUSTMENT` / REST that alters plans (`requiresCoachApproval: true`).
5. **Strava** never enters social surfaces or ML training datasets (AGENTS.md).
6. **Product “Zenith IA” nav** (Information Architecture) is unchanged; intelligence is “Zenith Performance Engine”.

## Consequences

- Production path must not ship `mockZenithResponse()` as truth.
- Insufficient telemetry → `UNKNOWN`, never a fake score.
- Model/engine versioning stamped on every evaluation (`zenith-core@x.y.z`).
