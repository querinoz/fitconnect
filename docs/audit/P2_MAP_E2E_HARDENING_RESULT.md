=========================================
FITCONNECT — P2-MAP E2E HARDENING
=========================================

Date: 2026-09-04
Branch: feat/elite-os-v2
Push: FORBIDDEN
Production: NO-GO

BASELINE
command:
  adb -s emulator-5554 shell pm clear com.fitconnect.android
  cd android
  .\gradlew.bat :app:connectedDebugAndroidTest
    -Pandroid.testInstrumentationRunnerArguments.class=com.fitconnect.android.athlete.OutdoorMapE2EInstrumentationTest
environment:
  emulator-5554 / fitconnect_phone / API 37 / boot_completed=1
  package com.fitconnect.android
failure:
  WAIT_FOR_START_BUTTON — activity_start not composed (LazyColumn off-screen)
  previously reported as generic “Compose timeout ~20s”

ROOT CAUSE
category: C. COMPOSE SYNCHRONIZATION (primary); A. TEST HARNESS (secondary)
description:
  Start/Pause/Finish lived mid-LazyColumn below map. Phone AVD did not compose
  off-screen Start; waitForTag timed out at 20s after athlete_activity appeared.
evidence:
  stack at waitForTag("activity_start", 20_000); athlete_activity already present;
  GuidedWorkout E2E (Train FAB, on-screen controls) already PASS.

FIX
files:
  android/athlete/.../ActivityScreen.kt — floating outdoor controls + tags + E2E nav skip
  android/athlete/.../AthleteScreen.kt — floatingAlignment
  android/athlete/.../AthleteScaffold.kt — handleDeepLink onNewIntent
  android/app/.../MainActivity.kt — singleTop + onNewIntent without setIntent(VIEW)
  android/app/src/main/AndroidManifest.xml — launchMode singleTop
  android/design-ui/.../HoldToConfirmButton.kt — caller testTag + a11y onClick
  android/design-ui/.../MapRenderHooks.kt + FitConnectRouteMap — E2E canvas fallback
  android/core-capture/.../OutdoorCaptureRuntime.kt — aggregate GPS diagnostics (no lat/lon)
  android/app/.../OutdoorMapE2EInstrumentationTest.kt — phase/point sync, geo after PREPARING
reason:
  Deterministic Compose sync + emulator geo timing; MapLibre not source of GPS truth.

E2E

RUN 1: PASS (docs/qa/p2-map-e2e/matrix-run1.txt)
RUN 2: PASS
RUN 3: PASS
RUN 4: PASS
RUN 5: PASS

RESULT: 5/5 deterministic PASS

GPS PIPELINE: PASS (PREPARING → ACCEPT → TRACKING; log OutdoorCapture fix_accept)
ROOM: PASS (accepted points increase; pause freezes count)
MAP: PASS under E2E canvas fallback (fitconnect_route_map + a11y); MapLibre still production path
PAUSE: PASS
RESUME: PASS
FINISH: PASS (semantics OnClick → outdoor.finish enqueue)
ACTIVITY: PASS (local completion)
SYNC: PASS honest SYNC_PENDING (no fake server success; no UI HTTP wait)

REGRESSION:
GPS: 12/12 PASS (GpsWaveUnitTest)
MAP: 12/12 PASS (MapWaveUnitTest) + CanonicalRouteRepositoryTest 2/2
WORKOUT: GuidedWorkoutInstrumentationTest PASS
WEB: 478 PASS / 0 skipped (filter @fitconnect/web test) — baseline was 468/10
ANDROID: assembleDebug PASS
WEB typecheck (@fitconnect/web): PASS
NOTE: full monorepo pnpm typecheck fails unrelated @fitconnect/strava-integration test typing

PHYSICAL GPS: NOT_VERIFIED

DEFECTS:
P0: none in scope
P1: none open for this gate
P2: HoldToConfirm wall-clock hold remains awkward under Compose virtual time (mitigated via a11y onClick)
P3: E2E skips route-detail auto-nav when MapRenderHooks.forceCanvasFallback (teardown Nav race)

PRODUCTION: NO-GO

NEXT RECOMMENDED PHASE:
STATE ONLY — do not start. Candidate after gate: physical-device GPS verification
or production auth / release prep when authorized. Not Wear / Social / Squad / FCM.

P2-MAP E2E HARDENING = PASS
