# 11 — OFFLINE QA

**Method:** `adb shell svc wifi disable` + `svc data disable`, then athlete home deeplink. Re-enabled after.

| Surface | Expected | Actual | Status |
|---|---|---|---|
| Launch / Today | Cached LOCAL_DEMO | Home still rendered; banner **NO CONNECTION · CACHE 11:07** | **PASS** |
| Navigation | Tabs still work | Not fully re-walked offline | **PARTIAL** |
| Community / ASCEND / Settings | Sync errors | Not separately captured offline | **BLOCKED** (time) |
| Reconnect | Banner clears | Network restored; not re-dumped | **PARTIAL** |
| Duplicate/rollback | — | Not observed (no server sync) | **N/A** (LOCAL_DEMO) |

LOCAL_DEMO is largely on-device; offline is **not** a production sync test.

## Evidence

`dumps/44_offline_home.xml`, `android/44_offline_home.png`.
