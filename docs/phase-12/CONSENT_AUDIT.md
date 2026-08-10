# Phase 12 — Consent Audit

## Consent surfaces

| Surface | Scope | Default | Mutator |
|---------|-------|---------|---------|
| Health provider import | `ConsentScope.PROVIDER_CONNECTION` | Deny until grant | Athlete |
| Coach metric sharing | `ConsentScope.COACH_SHARING` | Deny until grant | **Athlete only** (`actorId == athleteId`) |
| Analytics | `ConsentScope.ANALYTICS` | Separate from health | Athlete/user |
| AI health in prompts | `HealthDataPolicy` | **false** | Athlete consent callback |
| Strava OAuth | Third-party | User initiates OAuth | User at Strava |
| Location | OS permission | Deny until grant | User at system dialog |

## Phase 12 fixes verified

### TelemetryPrivacy.shareWithCoach

- **Before:** Potential for non-athlete actor to grant sharing
- **After:** `actorId != athleteId` → deny + audit `coach_share_denied:actor_mismatch`

### HealthDataPolicy

- `athleteConsent: suspend (String) -> Boolean = { false }`
- Fail-closed: no health in AI without explicit true

### Web demo mode

- Not a consent mechanism — must remain off in prod

## UI linkage (status)

| Consent | UI screen | Wired to store |
|---------|-----------|----------------|
| Provider connect | Telemetry settings | Partial |
| Coach sharing | Recovery/telemetry | Partial |
| AI health | Athlete AI screen | Verify `AiContainer` wiring |
| Cookie/analytics | Web banner | **Open** |

## Regulatory alignment

- **GDPR Art. 7:** separate consents for provider vs coach vs analytics — **modeled correctly**
- **Withdrawal:** `revokeProviderConsent`, `revokeCoachSharing` exist — UI must expose
- **Health (EU):** explicit opt-in default false — **PASS** for AI policy

## Gaps

- Server-synced consent record for multi-device
- Consent version / timestamp export for audits
- Web health readiness API lacks separate consent header (uses auth only)

## Verdict

**Consent defaults fail-closed** on Android health/AI/telemetry sharing. **UI completeness and server sync** remain open.
