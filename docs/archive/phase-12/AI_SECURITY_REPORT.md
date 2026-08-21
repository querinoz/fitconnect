# Phase 12 — AI Security Report

## Architecture

| Layer | Path |
|-------|------|
| Permission gate | `android/ai/.../AiPermissionGate.kt` |
| Tool runtime | `android/ai/.../AiToolRuntime.kt` |
| Safety layer | `android/ai/.../AiSafetyLayer.kt` |
| Audit log | `android/ai/.../AiAuditLog.kt` |
| Cost controller | `android/ai/.../AiCostController.kt` |

## Phase 12 controls

### 1. Tool authorization (fail-closed)

- Unknown tool → denied
- Wrong role → denied
- WRITE tools → always denied at runtime (proposals only)
- Athlete SELF: `targetAthleteId` must equal `principal.userId` (null **not** fail-open)

### 2. Self-binding before authz

`AiToolRuntime.invoke`:

```kotlin
val boundTarget = when (principal.role) {
    AiRole.ATHLETE -> targetAthleteId ?: principal.userId
    else -> targetAthleteId
}
```

Prevents null target from slipping past SELF checks.

### 3. Health data policy

`HealthDataPolicy`: consent default `{ false }` — no health in prompts without explicit consent.

### 4. Secret scrubbing

Forbidden fragments: `access_token`, `refresh_token`, `api_key`, `Bearer `, etc.

### 5. Timeouts & audit

- 5s tool timeout
- Denied/OK logged to `AiAuditLog`

## Prompt injection

| Vector | Mitigation | Residual |
|--------|------------|----------|
| User message overrides system | Safety layer + tool allowlist | Model-dependent |
| Tool arg injection | Static dispatch, no eval | Low |
| Cross-athlete exfil via tool | Permission gate | Mitigated |
| Community context poisoning | PUBLIC scope only | Review content moderation |

## Web AI

Package `@fitconnect/ai` — server-side; not fully hardened in Phase 12 scope. Android native AI is primary audit target.

## Tests

- `android/ai/src/test/java/com/fitconnect/android/ai/AiEngineTest.kt`
- Phase 10 baseline: `docs/phase-10/AI_Security_Report.md`

## Verdict

Android AI tool surface is **authorization-first and fail-closed** for health/SELF scope. **Provider-side prompt injection** remains model-risk. **Web AI package** needs parallel audit.
