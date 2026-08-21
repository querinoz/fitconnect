# Technical Debt — Phase 10

1. Live cloud provider adapters (OpenAI/Gemini/Anthropic) not shipped — local grounded provider + fallback only.
2. Program/Sports/Session AI ports use demo adapters in `:app` until Community Programs Engine is fully wired into AI.
3. Readiness score not injected into TelemetryFactSheet yet (Athlete OS remains authoritative; AI explains telemetry trends).
4. Maestro E2E not executed on a device in this run.
5. Streaming UI not fully polished in AthleteAiScreen (controller exists).
6. Web `packages/ai` readiness scorer remains web-only (intentional — do not port competing calc).
7. Phase 09 `:community` module present but not fully QA'd in this phase (out of Phase 10 stop scope).
