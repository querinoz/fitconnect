# AI Architecture Report — Phase 10

## Verdict

Provider-independent `:ai` module is the FitConnect AI Performance Engine.
**AI is never a source of truth.** Authoritative data enters only through ports.

## Layout

```
:ai
├── provider/     AiProvider, Fallback, GroundedLocal, Unavailable
├── context/      ContextEngine (min-necessary, authorized)
├── tools/        AiToolRuntime (authz + timeout + audit)
├── safety/       medical / injection / dangerous training
├── permissions/  role × scope gate (write tools blocked)
├── privacy/      health consent + secret scrub
├── insights/     grounded AiInsight (+ confidence categories)
├── recommendations/ overrideable AiRecommendation
├── actions/      proposals only — no auto-apply
├── assistant/    Athlete + Coach workflows
├── retrieval/    provenance-bearing knowledge
├── memory/       session / prefs (opt-in long-term)
├── cost/         rate + budget + cache
├── evaluation/   golden cases + grounding checks
├── audit/        operational events (no prompt dumps)
└── di/           DefaultAiContainer
```

## Absolute rule enforcement

| Domain calculation | Owner | AI |
|--------------------|-------|----|
| HRV / sleep / load | Telemetry | consumes fact sheet |
| Readiness score | Athlete OS | explains only |
| Program progress | Programs | aggregates presentation |
| Sport metrics | Sports | sport keys via port |

## Extensibility

- New provider → implement `AiProvider`
- New tool → register permission + runtime branch
- New insight kind → InsightEngine data path
- Ranking/personalization N/A (insights are evidence-driven)

## External architect answers

| Question | Answer |
|----------|--------|
| Replace AI without breaking Athlete OS? | Yes — ports/adapters |
| New telemetry provider without AI change? | Yes — Telemetry facade |
| Invent missing data? | No — insufficient confidence |
| Auto-modify programs? | No — proposals + human override |
| Prompt injection as authority? | No — quarantine + refuse |
