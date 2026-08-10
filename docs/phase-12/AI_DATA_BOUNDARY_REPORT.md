# Phase 12 — AI Data Boundary Report

## Boundary definition

Data that may enter AI context (prompts, tool results, retrieval) vs data that must never leave device/provider without consent.

## Zones

```
┌─────────────────────────────────────────┐
│ PUBLIC — community posts (PUBLIC scope) │
├─────────────────────────────────────────┤
│ ROSTER — coach assigned athlete IDs     │
├─────────────────────────────────────────┤
│ SELF — athlete own profile/telemetry    │
├─────────────────────────────────────────┤
│ HEALTH — sensitive metrics (HRV, etc.)  │
├─────────────────────────────────────────┤
│ FORBIDDEN — tokens, secrets, passwords│
└─────────────────────────────────────────┘
```

## Enforcement points

| Boundary | Enforcer | Path |
|----------|----------|------|
| Tool data scope | `AiPermissionGate` + `DataScope` enum | `permissions/AiPermissionGate.kt` |
| Health inclusion | `HealthDataPolicy.mayIncludeHealth()` | `privacy/HealthDataPolicy.kt` |
| Secret redaction | `HealthDataPolicy.scrub()` | same |
| Context assembly | `ContextEngine` | Must call policy before include |
| Provider egress | `AiProvider` adapters | No raw session in requests |

## Consent flow (health)

1. Default: `athleteConsent(athleteId) → false`
2. Athlete grants consent (UI → store)
3. `mayIncludeHealth(principal, athleteId)` checks role + assignment + consent
4. Coach: only assigned athletes with consent

## Tool registry boundaries

| Tool | Scopes | sensitiveHealth |
|------|--------|-----------------|
| `getTelemetrySummary` | SELF / ASSIGNED | **true** |
| `getRecoverySummary` | SELF / ASSIGNED | **true** |
| `getRelevantCommunityContext` | PUBLIC | false |
| `proposeProgramChange` | ASSIGNED | WRITE — not executed |

## Leakage vectors (residual)

| Vector | Status |
|--------|--------|
| Model logs at provider | Contractual/DPA — not code-controlled |
| Audit log retention | In-memory bounded (Phase 11) — review persistence |
| Error messages to UI | Must not include scrubbed secret fragments raw |
| Retrieval index cross-user | `RetrievalEngine` — verify athlete partition |

## Verdict

**Health data boundary is fail-closed by default.** SELF/ASSIGNED enforcement is **implemented in gate + runtime**. Provider egress and retrieval partitioning need **ongoing review** as features expand.
