# Mobile Functional Completion — Matrix

**Date:** 2026-09-07 · Updated during implementation cycle

| Area | Current state | Canonical source | Runtime | Missing | Impl required | Test required | Dependencies | Status |
|------|---------------|------------------|---------|---------|---------------|---------------|--------------|--------|
| AUTH | Firebase + Composite | Firebase UID → identity | Eng PASS | Physical SM-004 | Regression | Unit + device | HUMAN Firebase prod | PARTIAL |
| ONBOARDING | Persist KV + identity remote | KeyValueStore / IdentityRemote | Eng | Proof relaunch | Persistence checks | Unit | Auth | PARTIAL |
| ATHLETE | Shell real; data often LOCAL_DEMO | LocalAthleteRepository dominant | PARTIAL | Http athlete plane | Remote athlete repo | Journey | APIs | PARTIAL |
| COACH | UI complete; remote expanding | HttpCoachRepository | PARTIAL→improved | athleteDetail, calendar, analytics, profile | Wire remaining | API + Android | DB | PARTIAL |
| WORKOUT | Wave 2 eng PASS | Room FSM + sync | REAL | Device regression | None rebuild | Instr | — | REAL |
| ACTIVITY | Guided + outdoor sync | `/api/v1/workout-sessions` | REAL | History polish | Dedup audit | Unit | RLS | REAL |
| GPS | P2 eng PASS | FusedLocation + Room | REAL | Physical smoke | Device only | Physical | Hardware | PARTIAL |
| MAP | MapLibre eng + E2E 5/5 | CanonicalRouteRepository | REAL | Physical | Device | E2E | GPS | REAL |
| HEALTH CONNECT | HR real; sleep/steps wired to Today | HealthDataRepository + Room | PARTIAL→improved | Device permission smoke | WorkManager optional | Unit + device | HC SDK | PARTIAL |
| TELEMETRY | Mixed real/simulated vendors | HC + simulated providers | PARTIAL | Vendor OAuth | Label honesty | Unit | PENDING_HUMAN vendors | PARTIAL |
| ASCEND | ProgressionEngine + HttpAscendRemote | activities → XP | PARTIAL | Unify InMemoryAscendStore | No V2 | Idempotency | Auth | PARTIAL |
| SOCIAL | Android seed community | CommunitySeed | DEMO_ONLY | Wire posts API | Http community | API | Scope | DEMO_ONLY |
| SQUAD | Web API; Android demo joins | Squads API | PARTIAL | Android consumer | Wire or mark | API | Scope | PARTIAL |
| REALTIME | Clients exist; unused in UI | SupabaseRealtime / FailClosed | STUB product | Subscribers | DEFER or minimal | Contract | Config | NOT_READY |
| NOTIFICATIONS | Local + FCM receive | FCM + `/push/register` | PARTIAL→improved | Delivery cert | Server send | Unit | HUMAN FCM | PARTIAL |
| OFFLINE | DurableSyncQueue workout/GPS | OfflineCoordinator | REAL | Honest UX gaps | Audit screens | Unit | — | PARTIAL |
| SYNC | Multiple queues justified | Domain handlers | REAL | Unify docs | Document | Unit | — | PARTIAL |
| PROFILE | Local + identity | Session + remote | PARTIAL | Remote profile | Wire | Journey | Auth | PARTIAL |
| SETTINGS | Functional prefs | KeyValueStore | REAL | FCM delivery claim | — | Manual | — | PARTIAL |
| DISCOVER | Geo LOCAL_DEMO | PlacesCatalog / BookingEngine | DEMO_ONLY | Remote coaches | API | Journey | Scope | DEMO_ONLY |
| PROGRAMS | Coach remote list; athlete local | `/coaches/programs` + LocalAthlete | PARTIAL | Athlete enroll remote | Athlete API | API | DB | PARTIAL |
| BOOKINGS | Coach remote list/approve/reject | Sessions-as-requests | PARTIAL | Athlete create booking | Athlete API | API | DB | PARTIAL |
| SESSIONS | Coach remote list | `/sessions` | REAL | Reschedule remote | Optional | API | DB | PARTIAL |
| PAYMENTS | Fail-closed live; demo labeled | Stripe PENDING_HUMAN | STUB live | Stripe Connect | HUMAN | — | HUMAN | PENDING_HUMAN |
| WEAR | Bridge PARTIAL; IDs wrong | GMS MessageClient | BLOCKED | ID reconcile | DEFER P7 | Pair E2E | Phone truth | NOT_READY |
| ACCESSIBILITY | Partial tags | Compose semantics | PARTIAL | Critical TalkBack | Labels only | Manual | — | PARTIAL |
| SECURITY | P0-SEC PASS | RLS + Firebase | REAL | Path audits | Regression | Integration | — | PASS eng |
| OBSERVABILITY | Aggregate logs | Logger | PARTIAL | Workflow diagnostics | Safe aggregates | — | — | PARTIAL |

## Status rollup

```text
REAL / eng PASS core: Workout, GPS, Map, Activity sync, Auth engineering
IMPROVED this cycle: HC sleep/steps wire, FCM API register, Coach programs/bookings/inbox, earnings fail-closed
BLOCKED / DEFER: Wear, production Realtime product bus, Stripe earnings, physical device
DEMO_ONLY remaining: Athlete local repo, Social seed, Discover geo seed, vendor HC providers
```
