# AI Provider Architecture

- Interface: `AiProvider` (generate, stream, embed, metadata, usage)
- Failures: timeout, rate limit, unavailable, invalid, auth, budget, cancelled
- `FallbackAiProvider` chains primary → fallbacks on retryable failures
- `GroundedLocalAiProvider` — deterministic offline/demo; never invents metrics
- `UnavailableAiProvider` — clean offline surface
- No OpenAI/Gemini/Anthropic SDK in app code; adapters only if added later
