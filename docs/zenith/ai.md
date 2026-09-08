# Zenith AI (LLM layer) — Phase 4

**Not started as production path.**

Rules locked by ADR-001:

- LLM never computes readiness / recovery / load scores.
- Input = `evaluateAthleteState()` output via Context Builder.
- Structured output + schema validation + guardrails required.
- Providers: OpenAI / Anthropic / Google / Local / Mock(test).

Current: `@fitconnect/ai` calls zenith-core for scores; OpenAI env only reserved for future explanation.
