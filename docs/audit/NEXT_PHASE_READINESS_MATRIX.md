# FitConnect — Next Phase Readiness Matrix

**Mode:** AUDIT ONLY · READ-ONLY
**Date:** 2026-09-04
**Git:** `feat/elite-os-v2` @ `0a9155f` · **14 ahead / 0 behind** `origin/feat/elite-os-v2`
**Worktree:** DIRTY (~165 short-status lines; uncommitted Android GPS/Map/workout/telemetry + docs/web) — **do not clean**

Confidence legend: **HIGH** = runtime/test evidence this session · **MEDIUM** = code + prior result docs · **LOW** = static inference

| AREA | CURRENT STATE | EVIDENCE | CONFIDENCE | BLOCKERS | TECHNICAL DEBT | DEPENDENCIES | NEXT ACTION | RECOMMENDED PHASE |
|------|---------------|----------|------------|----------|----------------|--------------|-------------|-------------------|
| P1-DATA | PASS | Prior reconcile commits + docs/data; identity/activity contracts on branch | MEDIUM | Dirty tree may hide uncommitted schema drift | Dual Prisma/Supabase history | None for next product phase | Keep frozen; do not reopen | — |
| P1-AUTH | ENGINEERING PASS | Commits `88534c7` etc.; Firebase flow engineered; prod keys HUMAN | MEDIUM | Prod Firebase JWT trust | LOCAL_DEMO still widely labeled | Human Firebase/Google | Do not reopen engineering | P10 parallel |
| WORKOUT | ENGINEERING PASS | Wave 2 code + GuidedWorkout instrumentation historically PASS; StrengthWorkoutScreen semantics present | MEDIUM | TalkBack NOT_VERIFIED | Open Gym progression UI partial | Stable athlete UI | A11y/device evidence later | P8-A11Y / Open Gym later |
| HEALTH CONNECT | PARTIAL / ENGINEERING | compileSdk 36 align; HC durable sync code; simulated fixtures remain | MEDIUM | Physical HC smoke NOT_VERIFIED | LOCAL_DEMO telemetry fixtures | Device permissions | Device HC smoke optional | Evidence later |
| GPS | ENGINEERING PASS | GpsWaveUnitTest this session BUILD SUCCESSFUL; OutdoorMap E2E 5/5 prior | HIGH (unit) / LOW (physical) | **Physical GPS NOT_VERIFIED** | Main-looper / per-fix Room risk unmeasured | Physical phone | **Authorize physical GPS verify** | **Physical GPS** |
| MAP | ENGINEERING PASS | MapWaveUnitTest this session; P2-MAP + E2E HARDENING PASS docs | HIGH (emu) | Physical map NOT_VERIFIED | Canvas fallback E2E-only | MapLibre tiles network | Bundle with physical GPS | Physical GPS |
| ACTIVITY SYNC | PARTIAL | OutdoorSyncHandlers / WorkoutSyncHandlers exist; enqueue-not-HTTP finish | MEDIUM | Real backend sync path unverified end-to-end | Demo vs remote coach paths | Auth + remote API | Verify after GPS device | Later |
| ASCEND | PARTIAL | Engine present; Wear still LocalDemoIdentity labeled | MEDIUM | Triple-store / demo-labeled users risk | Demo ascend on Wear | Identity freeze (done eng) | Do not expand | Debt watch |
| COACH | PARTIAL | HttpCoachRepository present; dashboards still BroadcastChannel loops | MEDIUM | Realtime + bookings remote incomplete | Coach demo remnants | Realtime/auth | Defer Realtime | Not next |
| ATHLETE | ENGINEERING STRONG | Neu-glass waves 0–6 committed; outdoor + guided screens uncommitted | HIGH (build) | Dirty uncommitted athlete surfaces | LOCAL_DEMO labels in Discover/Sports | Commit hygiene | Freeze after GPS evidence | Ops |
| REALTIME | NOT_READY | `NEXT_PUBLIC_REALTIME_PROVIDER ?? "broadcast"`; BroadcastChannelTransport default | HIGH | No cloud auth’d fan-out; package underused | Multi-transport / Convex poll | Event contracts + auth | **DEFER** | P3 later |
| WEAR | NOT_READY | `wear-*` session ids; MessageClient wired; DataClient unused; package `com.fitconnect.android.wear` | HIGH | ID reconcile; physical watch | LOCAL_DEMO readiness tiles | Phone durable activity + watch | **DEFER** | P7 later |
| SOCIAL | PARTIAL / LOCAL_DEMO | Community seed LOCAL_DEMO; Strava social forbidden by architecture | MEDIUM | Never show STRAVA socially (DB/RLS) | Seed world | RLS evidence | Do not expand | Not next |
| SQUAD | PARTIAL | Spec/docs exist; not production | LOW | Product scope | — | Realtime/social | Defer | Not next |
| ACCESSIBILITY | NOT_READY (cert) | Semantics/testTags/contentDescription on guided + outdoor; TalkBack NOT_VERIFIED | MEDIUM | Device TalkBack | Archive a11y debt | Stable UI | Focused cert after GPS or if no device | P8-A11Y 2nd |
| PERFORMANCE | UNVERIFIED / RISK | No dumpsys/LCP this audit; GPS/Room/MapLibre sensitive paths | LOW | Measurement gap | Main-thread GPS risk | Profiling tooling | Measure don’t optimize yet | P8-PERF later |
| SECURITY | HISTORICAL P0-SEC PASS | Not re-certified this session | LOW (today) | Prod secrets hygiene | — | Human keys | Do not claim fresh PASS | P0-SEC historical |
| OBSERVABILITY | PARTIAL | Health endpoint; Crashlytics needs release google-services | MEDIUM | FCM/Crashlytics HUMAN | — | Firebase release | Human track | P10 |
| CI/CD | PARTIAL | Local web 478 + assemble PASS; CI not re-run this audit | MEDIUM | Dirty tree vs remote | — | Commit/push policy | No push | Ops |
| DEVOPS | PARTIAL | Vercel/EAS historically; prod NO-GO | MEDIUM | Prod Redis/domains | — | Human | Parallel | P10 |
| FIREBASE | ENGINEERING + PENDING HUMAN | Auth engineering PASS; prod project HUMAN | MEDIUM | Release config | Debug may omit FCM | Human | Human track | P10 |
| FCM | FORBIDDEN / PENDING | Product phases forbid Push; release google-services HUMAN | HIGH | Human + policy | — | Human | Do not start Push | P10 later |
| STRIPE | ENGINEERING + PENDING HUMAN | Code/demo without live keys | MEDIUM | Live keys | Demo payment paths | Human | Later release | P10 later |
| PRODUCTION INFRA | NO-GO | Explicit product stance | HIGH | Many human blockers | LOCAL_DEMO fallbacks | Human + evidence | Stay NO-GO | — |
| TESTING | STRONG EMU / WEAK DEVICE | Web 478 PASS; assembleDebug PASS; OutdoorMap E2E 5/5 prior; physical GPS/Watch NOT_VERIFIED | HIGH (web/android build) | Physical evidence | Instrumentation vs device | Device | Physical GPS next | Physical GPS |
| DOCUMENTATION | STALE IN PLACES | `NEXT_IMPLEMENTATION_PLAN.md` still points at P2-GPS / RECONCILE; Open Gym gap Guided=MISSING stale vs Wave 2 | HIGH | Stale “next phase” pointers | Historical PASS language in CLAUDE.md | This audit pack | Supersede via this pack | Docs hygiene |

---

## Baseline re-verify (2026-09-04 this audit)

| Check | Result | Evidence |
|-------|--------|----------|
| Web typecheck `@fitconnect/web` | **PASS** | `tsc --noEmit` exit 0 |
| Web tests `@fitconnect/web` | **PASS** | **478/478** (148 files) |
| `:app:assembleDebug` | **PASS** | BUILD SUCCESSFUL |
| GpsWaveUnitTest + MapWaveUnitTest | **PASS** | BUILD SUCCESSFUL (UP-TO-DATE) |
| OutdoorMap E2E 5/5 | **PASS (prior session)** | docs/qa + audit result — not re-run this audit |
| Physical GPS | **NOT_VERIFIED** | No device run |
| Physical Wear | **NOT_VERIFIED** | No pair run |
| Production | **NO-GO** | Policy + missing human infra |
| Push | **FORBIDDEN** | Product phase policy |
