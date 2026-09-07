# FitConnect — Wear Readiness (P7)

**Date:** 2026-09-04 · AUDIT ONLY · NO IMPLEMENTATION
**Verdict: P7-WEAR = NOT_READY (DEFER)**
**Confidence: HIGH** (code inspection of IDs + clients)

---

## Package / application IDs

| Surface | applicationId |
|---------|---------------|
| Phone app | `com.fitconnect.android` (app module) |
| Wear | `com.fitconnect.android.wear` |

IDs are distinct (expected). Pairing requires Capability/Message paths, not shared applicationId.

---

## Wiring classification

| Capability | Status | Notes |
|------------|--------|-------|
| MessageClient | **WIRED** | `WearTelemetrySender` uses `Wearable.getMessageClient` |
| CapabilityClient | **WIRED** (partial) | Present in wear stack historically |
| DataClient | **NOT IMPLEMENTED / UNUSED** | No durable DataItem sync path found as product truth |
| Watch UI | **ENGINEERING ONLY** | WearMainActivity + tiles/complications |
| Phone↔Watch E2E | **NOT VERIFIED** | No physical pair evidence |
| HR / sensors | **PROBE / SIMULATED** | `WearHealthServicesProbe` — classpath probe ≠ grant |
| ASCEND on watch | **LOCAL_DEMO labeled** | `LocalDemoIdentity.ATHLETE_ID`; complication description says LOCAL_DEMO |
| Inbox persistence | **NOT durable activities** | Memory/runtime oriented; does not own canonical activity store |

---

## CRITICAL: Identity compatibility

Canonical product truth (P1-DATA): **`activities.id` (UUID)** + session ownership contracts.

Wear today:

```kotlin
// WearRuntime.kt
@Volatile var sessionId: String = "wear-local"
// WearMainActivity sets:
WearRuntime.sessionId = "wear-${System.currentTimeMillis()}"
```

Comments in code correctly warn that `wear-*` must reconcile to canonical `activities.id` and are **not** a second product truth — but **runtime still uses independent local IDs**.

| ID | Wear | Canonical phone/backend | Compatible? |
|----|------|-------------------------|-------------|
| sessionId | `wear-*` / engine local | activities.id UUID / session lease | **NO** (reconcile required) |
| userId | LocalDemoIdentity paths | Firebase/auth user | **PARTIAL / DEMO risk** |
| activityId | Not proven as UUID write-back | activities.id | **NOT VERIFIED** |

---

## Feasibility of a real Wear phase now?

**Not yet.** Prerequisites:

1. Phone outdoor + guided completion proven durable (prefer **physical GPS evidence** first).
2. Explicit ID reconcile design (watch provisional → canonical UUID).
3. DataClient or equivalent durable sync decision.
4. Physical Wear OS device for E2E.
5. Kill LOCAL_DEMO presentation on complications for any non-demo claim.

---

## Verdict

| Field | Value |
|-------|-------|
| P7-WEAR | **NOT_READY** |
| Action | **DEFER** |
| Exciting? | Yes — **not** a reason to start |
