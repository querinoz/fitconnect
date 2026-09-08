# Zenith Core — Architecture

See [ZENITH_AUDIT.md](./ZENITH_AUDIT.md) and [ADR-001-ZENITH-ARCHITECTURE.md](./ADR-001-ZENITH-ARCHITECTURE.md).

```text
Wearable / Health Connect
        ↓
   Telemetry (normalized)
        ↓
 @fitconnect/zenith-core   ← deterministic
        ↓
   Zenith AI (LLM)         ← explain only (Phase 4)
        ↓
 Athlete mobile / Coach dashboard
```

Package entry: `evaluateAthleteState()`.
