# Phase 12 — Privacy Data Map

## Data categories by surface

| Category | Examples | Storage | Legal basis (target) |
|----------|----------|---------|----------------------|
| Account | email, user ID | Supabase, SessionStore | Contract |
| Profile | name, sport, goals | Postgres, local repos | Contract |
| Health / telemetry | HRV, sleep, readiness | TelemetryStore, wearables tables | **Explicit consent** |
| Location | GPS tracks, map pins | LocationEngine, Strava activities | Consent / legitimate interest |
| Activity | workouts, TSS | Sports module, Strava | Contract + integration consent |
| Communications | coach messages | messages API, inbox | Contract |
| Payment | Stripe customer ID | transactions table | Contract |
| AI interactions | prompts, tool audit | AiAuditLog (memory) | Consent + transparency |
| Device | push token, analytics ID | push_tokens, PostHog | Consent where required |

## Flow diagram (simplified)

```
User → App UI → Auth/session → Domain modules → Local store
                              ↘ API (web) → Postgres/Supabase
                              ↘ AI provider (consent-gated)
                              ↘ Strava OAuth (third party)
```

## Phase 12 privacy controls mapped

| Data | Control | File |
|------|---------|------|
| Health in AI | Consent default false | `HealthDataPolicy.kt` |
| Coach sees metrics | Athlete-granted share only | `TelemetryPrivacy.kt` |
| Cross-account | Queue + session wipe | `AccountIsolationController.kt` |
| Backup exfil | allowBackup=false | AndroidManifest |
| Athlete API data | IDOR binding | `require-auth.ts` |

## Third parties

| Processor | Data shared | DPA required |
|-----------|-------------|--------------|
| Supabase | Auth, DB | Yes |
| Strava | Activities OAuth | User-directed |
| Stripe | Payment | Yes |
| Vercel | Hosting logs | Yes |
| AI provider (future) | Prompts (scrubbed) | Yes |
| PostHog | Analytics events | Consent banner |

## Retention

See `DATA_RETENTION_POLICY.md`.

## Verdict

Data map reflects **current architecture**. Production privacy policy must align with **consent defaults shipped in Phase 12**.
