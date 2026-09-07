# SM Gate Status — SM-001 / SM-002 / SM-004

**Date:** 2026-09-07 (Full Mobile QA 360)

| ID | Engineering | Emulator | Physical Redmi | Claim |
|----|-------------|----------|----------------|-------|
| SM-001 | PASS | PASS | PASS (installed APK) | Physical PASS on present APK; latest install blocked |
| SM-002 | PASS | PASS | PASS (cold auth deeplink) | Nested activity/settings deeplinks incomplete |
| SM-004 | PASS | PASS (DEBUG + LOCAL_DEMO) | PASS (DEBUG on auth; LOCAL_DEMO on session) | Real Firebase badge NOT_VERIFIED |

## Blockers

- MIUI `INSTALL_FAILED_USER_RESTRICTED` for APK refresh
- Real AUTH path not smoke-tested on Redmi this cycle

```text
PHYSICAL_DEVICE = PARTIAL
```
