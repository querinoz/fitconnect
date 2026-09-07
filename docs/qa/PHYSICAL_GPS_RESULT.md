# Physical GPS Result

**Status:** **NOT_VERIFIED**

## Why

1. Latest APK refresh on Redmi blocked by MIUI (`INSTALL_FAILED_USER_RESTRICTED`).
2. Outdoor capture + physical walk not executed this cycle.
3. Emulator geo / mock location **explicitly disallowed** by QA charter — not used.

## Required to PASS

1. Install latest debug APK on Redmi (human Install via USB).
2. Outdoor → Start → PREPARING → TRACKING with **real** movement.
3. PAUSE / RESUME / FINISH.
4. Record: TTFF, accepted point count, quality, distance, sync — **without** precise coordinates in report.
5. Background/screen-off sample if safe.

**PHYSICAL_GPS = NOT_VERIFIED**
