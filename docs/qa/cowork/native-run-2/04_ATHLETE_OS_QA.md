# 04 — ATHLETE OS QA

**Persona:** LOCAL_DEMO Inês (athlete). **Auth class:** LOCAL_AUTH / DEMO_AUTH (on-device personas, password advertised `password1` not typed this run).

## Onboarding (6 steps)

| Step | Expected | Actual | Status |
|---|---|---|---|
| Welcome | Continue | Continue → Sport | **PASS** |
| Sport | Select + persist | Cycling selected; force-stop restored STEP 2 | **PASS** |
| Goals | Validation blank goal | Race prep + Continue | **PASS** |
| Wearables | Skip | Skip for now | **PASS** |
| Plan | LOCAL_DEMO billing copy | Athlete Pro preview, no Stripe | **PASS** |
| Complete | Enter Athlete OS | Sport/Goal/Wearable/Plan summary | **PASS** |

Halfway close/reopen: **PASS** (step persisted; Cycling tap failed once due to chip hit-target helper, then succeeded).

## Prime Recovery / Home

| Expected | Actual | Status |
|---|---|---|
| Recovery ring + metrics | PRIME RECOVERY **59 MODERATE**, HRV 64 ms, READINESS 84%, DAY STRAIN 9.9/21, LOAD 0.6, SLEEP 86% BALANCED | **PASS** (LOCAL_DEMO) |
| AI directive | “Green light for quality work…” | **PASS** |
| Recovery Center deeplink | Sleep 86, RHR 48, recovery 78, timeline, warnings | **PASS** |

Home vs Recovery Center scores **59 vs 78** — inconsistent surfaces, **FAIL** (P2) for displayed-user-state coherence (not scientific accuracy).

## Activity / History

Start / Pause / Resume / Finish: **PASS**. Session id `fc-session-1-1787569066267`. Distance **0.18 km**. Complete screen with Discard/Start.

## Other destinations

| Screen | Status | Notes |
|---|---|---|
| Discover | **PASS** | Marketplace LOCAL_DEMO, GPS DEMO instrument, Tomás Rivera VERIFIED |
| Community | **PASS** | Seeded feed, compose TEXT/WORKOUT, Tomás Ribeiro VIDEO — not Stories/Reels |
| Profile | **PASS** | Inês Costa, INICIADO, 19-day streak after activity, badges |
| Telemetry Center | **PASS** | Watch ERROR DATALAYER_GMS, Health Connect SDK AVAILABLE |
| Performance AI | **PASS** | Mixed: recovery INSUFFICIENT DATA vs program HIGH |
| Sleep deeplink | **FAIL** | Did not open Sleep screen |

## Evidence

`android/12_athlete_home.png`, `13_recovery.png`, `15_activity.png`, `28_community.png`, `29_profile.png`, dumps `12_*`–`33_*`.
