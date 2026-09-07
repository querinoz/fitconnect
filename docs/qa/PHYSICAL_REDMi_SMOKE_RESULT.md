# Physical Redmi Smoke Result

**Device:** Redmi Note 9S · Android 11 · API 30 · arm64-v8a · 1080×2400
**ADB:** wireless `device`
**APK:** installed `com.fitconnect.android` `0.1.0-rc.1` (refresh of same build **blocked** by MIUI)

| Gate | Result | Evidence |
|------|--------|----------|
| Install latest | **BLOCKED** | INSTALL_FAILED_USER_RESTRICTED |
| SM-001 cold | **PASS** | Cold launch → Athlete Today (Inês) / no black screen |
| SM-001 warm | **PASS** | Activity delivered to top instance; UI still Today |
| SM-002 cold auth | **PASS** | `fitconnect://app/auth` → Auth screen |
| SM-004 | **PASS** (demo/debug) | Auth shows FitConnect DEBUG; session shows LOCAL_DEMO |
| input automation | **BLOCKED** | INJECT_EVENTS SecurityException |
| GPS outdoor | **NOT_VERIFIED** | Not started |
| Fatal crashes | **None sampled** | logcat *:E filtered |

**PHYSICAL_DEVICE smoke = PARTIAL**
