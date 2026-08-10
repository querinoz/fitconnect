# AI Context Engine

`ContextEngine` builds minimum-necessary `AthleteContextBundle`:

1. Authorize (athlete=self, coach=assigned)
2. Pull telemetry / program / sport / session ports
3. Apply `HealthDataPolicy` before including health facts
4. Mark missing keys explicitly — never fabricate
5. Flag stale contexts (>36h)
6. Quarantine community blobs as untrusted data

Prompt block lists AVAILABLE / MISSING / STALE / EVIDENCE lines only.
