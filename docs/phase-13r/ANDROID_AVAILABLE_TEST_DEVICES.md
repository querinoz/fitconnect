# ANDROID_AVAILABLE_TEST_DEVICES.md

**Probed:** 2026-08-09 (Phase 13R autonomous cycle)

## Host

| Tool | Result |
|------|--------|
| Cursor terminal | **Operational** |
| Java | 17.0.12 |
| Node | v25.9.0 |
| pnpm | 9.15.9 |
| Gradle | 9.5.0 |
| ADB | 1.0.41 |
| `adb devices -l` | **Empty** |
| Maestro | **Not installed** (npm install attempted; still absent on PATH at gate time) |
| gcloud / Test Lab | **Not installed** |
| keystore.properties | **Absent** |
| google-services.json | **Absent** |
| local.properties | **Absent** |

## Classification

**Environment class C** — terminal OK, no Android execution target.

Device-dependent gates remain **FAIL/BLOCKED**.
