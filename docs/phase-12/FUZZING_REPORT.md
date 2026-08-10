# Phase 12 — Fuzzing Report

## Scope

Fuzz testing of parsers, auth helpers, and AI tool inputs. **No dedicated fuzz CI job in Phase 12.**

## Candidates

| Target | Vector | Status |
|--------|--------|--------|
| `requireAthleteId` | Random/malformed athleteId params | Covered by unit tests (limited) |
| `NavGuard.deepLinkToRoute` | Malformed URIs | Partial — unit tests |
| `AiToolRuntime.invoke` | Unknown tool names, long args | Timeout + deny unknown |
| `HealthDataPolicy.scrub` | Secret substrings in text | Logic present — no fuzz runner |
| JSON API bodies | Oversized payloads | **Not fuzzed** |
| Strava webhook payload | `@fitconnect/strava-integration` | Package tests exist (9 tests) |

## Recommended fuzz tooling (future)

| Surface | Tool |
|---------|------|
| Web API | `schemathesis` / custom httpx fuzz |
| Android | JQF / Kotlin property tests |
| AI prompts | Adversarial prompt suite in `AiEvaluationSuite.kt` |

## Phase 12 execution

**None automated beyond existing unit/property tests.**

Existing related tests:

- `android/foundation/.../NavGuardTest.kt`
- `android/ai/.../AiEngineTest.kt`
- `apps/web/lib/api/require-auth.test.ts`

## Verdict

Fuzzing **not run as formal Phase 12 gate**. Residual risk for **parser crashes and unexpected auth bypass on malformed input** — recommend adding schemathesis to CI for `/api/v1/*`.
