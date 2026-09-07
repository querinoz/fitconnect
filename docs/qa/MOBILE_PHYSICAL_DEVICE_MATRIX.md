# Mobile Physical Device Matrix

**Date:** 2026-09-07
**Device target:** Redmi Note 9S · API 30 · `com.fitconnect.android`

| Case | Expected | Actual | Status |
|------|----------|--------|--------|
| ADB connect | device online | empty `adb devices` | BLOCKED |
| install APK | success | not run | BLOCKED |
| cold start | no blank | not run | BLOCKED |
| warm start | resume | not run | BLOCKED |
| auth identity badge | LOCAL_DEMO off if Firebase | not run | BLOCKED |
| deep link | destination | not run | BLOCKED |
| logout / relaunch | unauth | not run | BLOCKED |
| outdoor GPS | LIVE points | not run | BLOCKED |
| HC permissions | grant → sync | not run | BLOCKED |
| workout | complete | not run | BLOCKED |

```text
PHYSICAL_DEVICE = BLOCKED / NOT_AVAILABLE
```

Do not treat emulator results as physical PASS.
