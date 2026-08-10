# PHASE_13R_INTAKE.md

**Date:** 2026-08-08  
**Branch:** `phase-13/android-release-candidate`  
**Mission:** Complete Phase 13 — recovery only. No Phase 14/15. No Play publish.

## Reconciled prior “PASS” claims

| Prior claim | Executed? | Commit/build/device/env | Status now |
|-------------|-----------|-------------------------|------------|
| Release compile + R8 | YES (Phase 13) | engineering host; unsigned | **VERIFIED** (build) |
| AAB packaging | YES | `app-release.aab` | **VERIFIED** (artifact exists; signing not) |
| Local auth disabled release | YES unit | LocalAuth tests | **VERIFIED** (unit) |
| Demo UI debug-only | code review | — | **VERIFIED** (code) |
| Cleartext denied release | code | NSC XML | **VERIFIED** (code) |
| Prod API URL in release | code | BuildConfig | **VERIFIED** (code) |
| Athlete/Coach E2E | NO | — | **UNVERIFIED** |
| Device matrix | NO | — | **UNVERIFIED** |
| FCM | NO | NoOp | **OPEN** |
| Realtime | NO | NoOp | **OPEN** |
| Production IdP | NO | empty Supabase | **OPEN** |
| Production signing | NO | no keystore.properties | **OPEN** / **BLOCKED_EXTERNAL** |

---

## Blocker register

### B-AUTH-01 — Production Supabase IdP
| Field | Value |
|-------|-------|
| SEVERITY | P0 |
| SOURCE | ANDROID_RELEASE_BLOCKERS B1 |
| CURRENT STATE | Release `ALLOW_LOCAL_AUTH=false`; `SUPABASE_URL`/`ANON_KEY` empty; `LocalAuthRepository` only |
| ROOT CAUSE | No mobile Supabase AuthRepository; no prod credentials in build |
| REQUIRED ACTION | Implement Supabase auth adapter + inject prod URL/anon via local props/CI secrets; E2E signup/signin |
| AUTOMATION POSSIBLE | YES (code + tests); credentials NO |
| HUMAN ACTION REQUIRED | YES — production Supabase URL + anon key in secure config (not chat) |
| TEST REQUIRED | Auth E2E on device against intended env |
| REGRESSION REQUIRED | NavGuard, account isolation, logout wipe |
| EVIDENCE REQUIRED | Device logs without secrets; Maestro/auth script result |
| STATUS | **IN_PROGRESS** (adapter + fail-fast) → credentials **BLOCKED_EXTERNAL** |

### B-SIGN-01 — Production signing
| Field | Value |
|-------|-------|
| SEVERITY | P0 |
| SOURCE | B2 |
| CURRENT STATE | unsigned APK; no `keystore.properties` |
| ROOT CAUSE | Keystore never provisioned |
| REQUIRED ACTION | Create keystore offline; fill gitignored `keystore.properties`; rebuild signed AAB |
| AUTOMATION POSSIBLE | Partial (Gradle wiring exists) |
| HUMAN ACTION REQUIRED | YES — keystore + passwords in local/CI secret store |
| TEST REQUIRED | `jarsigner`/`apksigner` verify; Play-compatible AAB |
| REGRESSION REQUIRED | Install signed APK on device |
| EVIDENCE REQUIRED | Cert fingerprint (public); never passwords |
| STATUS | **BLOCKED_EXTERNAL** |

### B-FCM-01 — FCM push
| Field | Value |
|-------|-------|
| SEVERITY | P0 (if product claims push) / P1 if explicitly deferred |
| SOURCE | B3 |
| CURRENT STATE | `NoOpNotificationGateway`; no `google-services.json` |
| ROOT CAUSE | Firebase not configured for `com.fitconnect.android` |
| REQUIRED ACTION | Firebase Android app + SHA + google-services (gitignored) + FCM gateway + backend token store |
| AUTOMATION POSSIBLE | Scaffold YES; live send NO without Firebase |
| HUMAN ACTION REQUIRED | YES — Firebase project + google-services.json |
| TEST REQUIRED | Real device foreground/background/killed |
| REGRESSION REQUIRED | Deep link authz |
| EVIDENCE REQUIRED | Screenshot/log of received notification (no tokens) |
| STATUS | **BLOCKED_EXTERNAL** |

### B-RT-01 — Production realtime
| Field | Value |
|-------|-------|
| SEVERITY | P0 (if product claims live) / P1 if deferred |
| SOURCE | B4 |
| CURRENT STATE | `NoOpRealtimeClient` |
| ROOT CAUSE | No Convex/Supabase Realtime client wired on Android |
| REQUIRED ACTION | Choose provider; implement client; E2E two sessions |
| AUTOMATION POSSIBLE | Scaffold YES |
| HUMAN ACTION REQUIRED | YES — production Convex/Supabase realtime credentials + backend |
| TEST REQUIRED | Athlete+coach dual session |
| REGRESSION REQUIRED | Account switch unsubscribe |
| EVIDENCE REQUIRED | Event sequence log |
| STATUS | **BLOCKED_EXTERNAL** |

### B-DEV-01 — Real device / emulator certification
| Field | Value |
|-------|-------|
| SEVERITY | P0 |
| SOURCE | B5 |
| CURRENT STATE | ADB attached devices empty at session start; AVD `fitconnect_phone` exists |
| ROOT CAUSE | Certification never executed |
| REQUIRED ACTION | Boot AVD and/or attach hardware; install; smoke + E2E |
| AUTOMATION POSSIBLE | YES for emulator |
| HUMAN ACTION REQUIRED | Preferred for OEM/flagship matrix; emulator partial |
| TEST REQUIRED | Matrix + Maestro |
| REGRESSION REQUIRED | Full smoke after each P0 fix |
| EVIDENCE REQUIRED | Device props + screenshots/logs |
| STATUS | **IN_PROGRESS** |

### B-E2E-01 — Athlete E2E
| Field | Value |
|-------|-------|
| SEVERITY | P0 |
| SOURCE | B6 |
| CURRENT STATE | Maestro YAML exists; not executed; release auth blocked |
| ROOT CAUSE | Depends on B-AUTH-01 + device |
| REQUIRED ACTION | Auth live → run athlete journey |
| AUTOMATION POSSIBLE | YES after auth |
| HUMAN ACTION REQUIRED | Indirect (auth secrets) |
| TEST REQUIRED | Full athlete path |
| REGRESSION REQUIRED | Restart from start on failure |
| EVIDENCE REQUIRED | Maestro report |
| STATUS | **OPEN** |

### B-E2E-02 — Coach E2E
| Field | Value |
|-------|-------|
| SEVERITY | P0 |
| SOURCE | B6 |
| CURRENT STATE | Same as athlete |
| ROOT CAUSE | Same |
| REQUIRED ACTION | Same |
| AUTOMATION POSSIBLE | YES after auth |
| HUMAN ACTION REQUIRED | Indirect |
| TEST REQUIRED | Full coach path |
| REGRESSION REQUIRED | Yes |
| EVIDENCE REQUIRED | Maestro report |
| STATUS | **OPEN** |

### B-TOOL-01 — Maestro CLI
| Field | Value |
|-------|-------|
| SEVERITY | P1 |
| SOURCE | Phase 13R discovery |
| CURRENT STATE | `maestro` not on PATH |
| ROOT CAUSE | Not installed |
| REQUIRED ACTION | Install Maestro; run `maestro/android/*.yaml` |
| AUTOMATION POSSIBLE | YES |
| HUMAN ACTION REQUIRED | Optional if agent can install |
| TEST REQUIRED | smoke-foundation / smoke-release-rc |
| REGRESSION REQUIRED | — |
| EVIDENCE REQUIRED | Maestro output |
| STATUS | **OPEN** |

## Counts (intake)

| Status | Count |
|--------|-------|
| OPEN | 3 |
| IN_PROGRESS | 2 |
| BLOCKED_EXTERNAL | 3 |
| RESOLVED | 0 |
| VERIFIED | 0 (launch gates) |

**Phase 13 gate:** NOT COMPLETE (mandatory).
