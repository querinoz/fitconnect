# Athlete Full Journey (QA 360)

| STEP | ACTION | EXPECTED | ACTUAL | DATA | STATUS |
|------|--------|----------|--------|------|--------|
| launch | cold start | boot UI | Guest / splash | — | PASS (emu+Redmi) |
| auth | LOCAL_DEMO Inês | session demo | onboarding | LOCAL_DEMO | PASS (emu) |
| onboarding | 6 steps → Enter Athlete OS | Home | Home Inês | persisted demo | PASS (emu) |
| Home | observe | readiness/streak | 59% / 18 days LOCAL_DEMO | demo labeled | PASS |
| Analysis | tab | charts | Weekly load / HRV | demo | PASS |
| Profile | tab | XP/level | LEVEL 06 / 2395 XP | demo | PASS |
| Discover/Booking | marketplace book | persist | not re-run on device | API prior PASS | PARTIAL |
| Social | comment/react | persist | not re-run on device | API prior PASS | PARTIAL |
| Workout | deeplink + Start | ACTIVE sets | ACTIVE SET 1 | local engine | PASS (emu) |
| Outdoor/Map/GPS | physical | real points | not run | — | NOT_VERIFIED |
| Activity | history | details | not run | — | NOT_VERIFIED |
| Health | HC | grant/read | Update dialog only | — | PARTIAL |
| ASCEND | XP | labeled demo | streak/XP visible | demo | PASS |
| Settings/Logout | logout | guest | not completed | — | NOT_VERIFIED |
| Relaunch | restore | session | not completed | — | NOT_VERIFIED |

**Athlete journey = PARTIAL (LOCAL_DEMO core PASS; GPS/logout/real-auth open)**
