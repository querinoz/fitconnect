# Phase 12 — Threat Model

**Method:** STRIDE-lite on FitConnect surfaces (web API, Android client, AI, telemetry, payments).

## Assets

| Asset | Location | Sensitivity |
|-------|----------|-------------|
| Session tokens | Android `SessionStore` / EncryptedSharedPreferences; web Supabase cookies | High |
| Health metrics | `android/telemetry/`, Health Connect ports | High (special category) |
| Strava OAuth tokens | Prisma `StravaToken`, web integration routes | High |
| Coach–athlete roster | Coach/athlete modules, API routes | Medium |
| Payment intents | Stripe (demo + partial live paths) | High |
| AI prompts/context | `android/ai/context/`, provider adapters | Medium–High |
| Offline outbox | `DurableSyncQueue` / `SyncQueue` | Medium |

## Threat actors

1. **Anonymous internet client** — probes open API routes, IDOR via `?athleteId=`.
2. **Authenticated peer** — athlete A reads athlete B data via param tampering.
3. **Malicious deep link** — bypass nav to coach/athlete screens without shell auth.
4. **Shared device** — prior user's offline queue visible after account switch.
5. **Rooted Android user** — forges local session role/tokens.
6. **Prompt injection** — AI tool calls exfiltrate another athlete's health data.
7. **MITM on cleartext** — intercept dev traffic (mitigated in release).

## Threats & mitigations

| ID | Threat | Mitigation (Phase 12) | Residual |
|----|--------|----------------------|----------|
| T1 | IDOR on REST `?athleteId=` | `requireAthleteId` binds to session; 403 on mismatch | Admin override intentional; demo mode permissive |
| T2 | Strava route athlete spoof | `resolveIntegrationAthlete` cookie + mismatch reject | Bearer secret path for jobs only |
| T3 | Demo mode accidentally ON | `isDemoMode` / `isDemoModeEnv` fail-closed (`=== "true"`) | Mis-set env still possible in deploy |
| T4 | Deep link OS bypass | `NavGuard.deepLinkToRoute` → HOME for `athlete/*`, `coach/*` | Unverified App Links not yet enforced |
| T5 | Cross-account data leak | `AccountIsolationController` clears queue + session | In-memory caches outside queue |
| T6 | Client ADMIN escalation | LocalAuth never grants ADMIN from email | Forgeable on rooted device |
| T7 | AI cross-athlete read | `AiPermissionGate` + `AiToolRuntime` self-bind | Provider prompt leakage if consent bypassed |
| T8 | Coach shares telemetry without consent | `TelemetryPrivacy.shareWithCoach` actor check | Server-side enforcement TBD |
| T9 | Backup exfiltration | `allowBackup=false`, exclude-all XML | ADB backup on debug builds |
| T10 | Cleartext credential sniff | Release NS config denies cleartext | Debug allows 10.0.2.2/localhost |
| T11 | Stripe fraud / replay | Webhook signature verify when live | Demo paths skip real auth |
| T12 | RLS bypass via service role | App uses server client with user context | Prisma direct access without RLS |

## Out of scope (Phase 12)

- Nation-state adversaries, hardware key extraction
- Full red-team physical device campaign
- Convex/LiveKit realtime pen-test (see `REALTIME_SECURITY_REPORT.md`)

## References

- `SECURITY_ARCHITECTURE.md`
- Phase 02 baseline: `docs/phase-02/Security_Report.md`
