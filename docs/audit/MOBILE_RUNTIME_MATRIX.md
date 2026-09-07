# Mobile Runtime Matrix

**Date:** 2026-09-07

| Runtime | Status | Notes |
|---------|--------|-------|
| Android Emulator | AVAILABLE | Primary automated + assembleDebug target |
| Redmi Note 9S (API 30) | **NOT_AVAILABLE** | Wireless ADB host unresolved this cycle |
| Web vitest | AVAILABLE | `pnpm test` |
| Android unit tests | AVAILABLE | Gradle modules |
| Android instrumentation | AVAILABLE on emulator | Map E2E 5/5 previously |
| Production servers | NO-GO | No production GO |

## Scenarios

| Scenario | Emulator | Physical |
|----------|----------|----------|
| Cold launch | Runnable | BLOCKED |
| Warm launch | Runnable | BLOCKED |
| Background / resume | Runnable | BLOCKED |
| Process death | Runnable | BLOCKED |
| Permissions (HC / location) | Limited (HC often unavailable) | BLOCKED |
| Network loss | Runnable | BLOCKED (Wi‑Fi kills wireless ADB) |

```text
PHYSICAL_DEVICE = BLOCKED / NOT_AVAILABLE
Do not relabel emulator as physical.
```
