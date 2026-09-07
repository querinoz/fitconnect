# 03 — ANDROID APP QA

**Environment:** emulator-5554, `com.fitconnect.android.debug` 0.1.0-rc.1 (13), LOCAL_DEMO.
**Tools:** ADB, uiautomator, screencap, logcat. **Skills:** android-emulator-skill.

## Tests executed

| Test | Expected | Actual | Status |
|---|---|---|---|
| Install APK | Success | Streamed install Success | **PASS** |
| Cold start | Activity visible, no crash | `LaunchState: COLD` TotalTime **4847 ms**, Welcome card | **PASS** |
| Warm start | Faster | TotalTime **721 ms** to Athlete Today | **PASS** |
| Splash / Welcome | Elite OS entry | FITCONNECT DEBUG, Continue + Continue anonymously | **PASS** |
| Auth gate | LOCAL_DEMO personas | Inês / Marina / Tomás, Google/Apple/Email buttons | **PASS** |
| Force-stop mid-onboarding | Resume step | Returned to STEP 2/6 Sport | **PASS** |
| Process in foreground | Home usable | Athlete OS Today | **PASS** |
| Back from root | Must not lose app unexpectedly | System Back from Today sent user to **Android launcher** | **FAIL** (P2) |
| FATAL/ANR | None | No `FATAL EXCEPTION` for FitConnect | **PASS** |

## Navigation forensics (athlete)

Bottom bar observed: **Home · Discover · Activity · Community · Profile** (5 destinations, not the 4+FAB IA in architecture docs).

Deeplinks `fitconnect://app/athlete/{home,recovery,activity,telemetry,ai,sleep}`: home/recovery/activity/telemetry/ai **PASS**; sleep landed on a stub/splash with “ELITE OS” only — **FAIL** (P3).

## P0–P3

- P0: none on boot.
- P2: Back from Athlete Today exits to launcher.
- P3: sleep deeplink not a Sleep screen.

## Evidence

`qa/evidence/cowork/native-run-2/android/01_startup.png` … `12_athlete_home.png`, `dumps/01_startup.xml`.

## vs Run #1

Native runtime **RESOLVED** (was BLOCKED). App **does run**.
