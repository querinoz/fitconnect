# Full Mobile QA 360 — Matrix

| ID | DEVICE | PRECONDITION | ACTION | EXPECTED | ACTUAL | EVIDENCE | STATUS | SEVERITY |
|----|--------|--------------|--------|----------|--------|----------|--------|----------|
| QA-DEVICE-001 | Redmi | adb wireless | `adb devices` | device | device curtana API30 | adb -l | PASS | — |
| QA-DEVICE-002 | Redmi | latest APK | `adb install -r` | Success | INSTALL_FAILED_USER_RESTRICTED | adb install | FAIL (external) | P1-EXT |
| QA-DEVICE-003 | Emulator | assembleDebug | install | Success | Success | adb install | PASS | — |
| QA-SM-001-E | Emulator | clear data | cold launch | no black screen | Guest welcome ~4.4s | am start -W + UI | PASS | — |
| QA-SM-001-R | Redmi | installed APK | cold launch | Today/Auth content | Today Inês after splash | UI dump | PASS | — |
| QA-SM-002-E | Emulator | logged LOCAL_DEMO | VIEW athlete/home | Today | Today | am start VIEW | PASS | — |
| QA-SM-002-E2 | Emulator | force-stop | VIEW athlete/workout | TRAIN | TRAIN PREP | UI dump | PASS | — |
| QA-SM-002-R | Redmi | force-stop | VIEW app/auth | Auth | Auth DEBUG | UI dump | PASS | — |
| QA-SM-004-E | Emulator | guest | observe badge | DEBUG not LOCAL_DEMO | FITCONNECT DEBUG | UI | PASS | — |
| QA-SM-004-E2 | Emulator | Inês demo | observe badge | LOCAL_DEMO | LOCAL_DEMO | UI | PASS | — |
| QA-SM-004-R | Redmi | auth deeplink | badge | DEBUG | FitConnect DEBUG | UI | PASS | — |
| QA-AUTH-001 | Emulator | guest | Continue → Inês | LOCAL_DEMO session | onboarding | UI | PASS | — |
| QA-AUTH-002 | Physical | Firebase email | sign-in | real UID badge | not run | — | NOT_VERIFIED | — |
| QA-ONB-001 | Emulator | Inês | steps 1–6 → Enter Athlete OS | Home | Home | UI | PASS | — |
| QA-ATHLETE-001 | Emulator | home | Analysis tab | Analysis metrics | Analysis LOCAL_DEMO | UI | PASS | — |
| QA-ATHLETE-002 | Emulator | home | Profile | XP/streak | LEVEL 06 / streak | UI | PASS | — |
| QA-WORKOUT-001 | Emulator | deeplink workout | Start workout | ACTIVE set UI | ACTIVE SET 1 bench | UI | PASS | — |
| QA-COACH-001 | Emulator | Tomás persona | enter coach | Coach onboarding | STEP 1/6 Tomás | UI | PASS | — |
| QA-GPS-001 | Redmi | outdoor | real track | accepted points | not executed | — | NOT_VERIFIED | — |
| QA-MAP-001 | — | outdoor | route render | map follows | not executed | — | NOT_VERIFIED | — |
| QA-HC-001 | Both | launch Today | HC permissions | usable or honest | Update required dialog | UI | PARTIAL | P2 |
| QA-BOOK-001 | API | prior P1 | create booking | 201 | 201 | p1-api-closure | PASS | — |
| QA-SOCIAL-001 | API | prior P1 | comment/react | persist | persist | p1-api-closure | PASS | — |
| QA-OFFLINE-001 | — | airplane | journeys | honest offline | not run | — | NOT_VERIFIED | — |
| QA-REALTIME-001 | — | dual session | event | receive | not run | — | PENDING_HUMAN | — |
| QA-ACCESS-001 | — | TalkBack | labels | operable | not run | — | NOT_VERIFIED | — |
| QA-SEC-001 | API | prior | IDOR | 403 | 403 | prior | PASS | — |
