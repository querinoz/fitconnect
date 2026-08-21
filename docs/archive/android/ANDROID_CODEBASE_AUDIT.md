# ANDROID_CODEBASE_AUDIT.md

**Date:** 2026-08-09  
**Commit:** `7843233` (+ uncommitted hardening)  
**Branch:** `chore/android-phase-13r-recovery`  
**Policy:** Evidence-first · Fail-closed · No invented PASS

---

## 1. Architecture map

```
:app (shell, nav, FCM service, AI adapters)
  ├── :foundation   Auth · session · network · offline · DI · nav guard
  ├── :athlete      Athlete OS UI + LocalAthleteRepository
  ├── :coach        Coach OS UI + LocalCoachRepository
  ├── :geo          Maps · discovery · booking engines
  ├── :telemetry    Wearables / readiness / metrics engines
  ├── :sports       Sports Intelligence catalog
  ├── :ai           Performance AI engine + ports
  ├── :design / :design-ui  Elite OS tokens + Compose kit
  ├── :core-capture Scaffold only
  └── :wear         Wear OS F0 scaffold (separate applicationId)

:community          Social engines — INCLUDED in settings, NOT depended by :app (orphan)
```

Preferred target: UI → ViewModel → Domain → Repository interfaces → Prod/Test adapters.

**Current:** UI → CompositionLocal containers → Local repositories / engines. ViewModels largely absent (agent-fixable debt).

---

## 2. Module map

| Module | Role | Wired to app? |
|--------|------|---------------|
| app | Entry, nav, FCM | yes |
| foundation | Platform | yes |
| athlete / coach | Product OS | yes |
| geo / telemetry / sports / ai | Domain engines | yes |
| design / design-ui | Design system | yes |
| community | Social domain | **no** (compile via settings only) |
| core-capture / wear | Scaffold | capture yes / wear separate |

---

## 3. Dependency / runtime map

| Adapter | Debug (no live IdP) | Live IdP | Release no config |
|---------|---------------------|----------|-------------------|
| Auth | LocalAuthRepository | SupabaseAuthRepository | Local locked + gate |
| Realtime | InProcessRealtimeClient | SupabaseRealtimeClient | FailClosedRealtimeClient |
| Notifications | DevNotificationGateway | Fcm if JSON | FailClosedNotificationGateway |
| Offline | DurableSyncQueue + coordinator | same | same |
| Analytics / ImageLoader | NoOp (wired) | NoOp | NoOp |

**Human-owned:** Supabase URL/anon, `google-services.json`, keystore, gcloud auth, physical device.

---

## 4. Feature map

| Feature | Engineering state |
|---------|-------------------|
| Auth | Adapters + fail-closed; release UI must not no-op when live auth configured |
| Athlete OS | Screens present; fixtures via LocalAthleteRepository |
| Coach OS | Screens present; fixtures via LocalCoachRepository |
| Booking | Geo BookingEngine + coach bookings UI |
| Map | MapsEngine + in-memory controller; Discover panel (not MapLibre SDK) |
| Telemetry | Engines + simulated HC; explicit missing/stale handling needed in UI |
| Sports | Catalog + screens |
| Offline | Queue + banners |
| Realtime | Prod + in-process; expand lifecycle tests |
| FCM | Gateway + service; channels/`showLocal` incomplete |
| Community | Engines orphaned from app |
| Onboarding | Storage key only — incomplete |
| Payments / Capture / Wear | Stubs |

---

## 5. Adapter classification

| Class | Class |
|-------|-------|
| PRODUCTION | SupabaseAuthRepository, SupabaseRealtimeClient, FcmNotificationGateway, FailClosed*, EncryptedSecureStore |
| DEVELOPMENT | LocalAuthRepository, InProcessRealtimeClient, DevNotificationGateway, Local*Repositories |
| TEST | FakeConnectivity, InMemorySecureStore, unit doubles |
| DEMO | Demo*AiAdapters, ArchitectureCoachPaymentsGateway, simulated HC |
| LEGACY candidates | NoOpNotificationGateway, NoOpRealtimeClient (unused by DI), ArchitectureCoachAiPort |

---

## 6. Dead-code candidates (proof required before delete)

| Candidate | Evidence | Action |
|-----------|----------|--------|
| NoOpNotificationGateway | DI never references | Delete or deprecate after grep |
| NoOpRealtimeClient | DI never references | Delete or deprecate after grep |
| ArchitectureCoachAiPort | EngineCoachAiPort wired | Delete after grep |
| :community unlinked | 0 app imports | Wire minimal surface OR document exclude |

Do **not** delete Expo `apps/mobile` without archival ADR decision.

---

## 7. Agent-fixable remediation matrix

| ID | Sev | Issue | Owner |
|----|-----|-------|-------|
| A-01 | P0 | Release auth primary no-op when not debug | Agent |
| A-02 | P0 | Orphan NoOp adapters can be reintroduced | Agent |
| A-03 | P1 | FakeNotificationGateway missing for tests | Agent |
| A-04 | P1 | FCM local channels / showLocal incomplete | Agent |
| A-05 | P1 | Realtime lifecycle tests incomplete | Agent |
| A-06 | P1 | Onboarding not implemented | Agent |
| A-07 | P1 | Community not reachable from app | Agent |
| A-08 | P1 | Map Compose surface beyond raw fixture text | Agent |
| A-09 | P1 | Auth engineering tests incomplete | Agent |
| A-10 | P2 | ArchitectureCoachAiPort dead | Agent |
| A-11 | P2 | Maestro flows 12–18 missing | Agent |
| A-12 | P2 | Docs suite under docs/android/ | Agent |

**PENDING_HUMAN (not agent-fixable):** PRODUCTION_AUTH, PRODUCTION_FCM, PRODUCTION_SIGNING, CLOUD_TEST_AUTH, DEVICE.

---

## 8. Recommended deletions (after reference proof)

1. Unused NoOp realtime/notification classes once Fake* exist for tests  
2. ArchitectureCoachAiPort if zero callers  
3. None of Expo/web unless proven unused by Android only

---

## 9. Recommended refactors

1. Auth screen: live IdP form when `usesLiveAuth`  
2. Minimal onboarding graph + `ONBOARDING_DONE`  
3. Wire `:community` into athlete nav  
4. NotificationHelper for channels + FCM display  
5. Expand realtime unit tests (reconnect, dedupe, dispose)  
6. Compose MapSurface bound to MapController (deterministic provider labeled)

---

*Audit precedes deletions. Remediation follows in ENGINEERING COMPLETE+ cycle.*
