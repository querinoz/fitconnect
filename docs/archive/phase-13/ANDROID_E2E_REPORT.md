# ANDROID_E2E_REPORT.md

## Scripts available

| Script | App ID | Status |
|--------|--------|--------|
| `maestro/android/smoke-foundation.yaml` | `.debug` | NOT RUN |
| `maestro/android/smoke-athlete-os.yaml` | `.debug` | NOT RUN |
| `maestro/android/smoke-coach-os.yaml` | `.debug` | NOT RUN |
| `maestro/android/smoke-geo-discovery.yaml` | `.debug` | NOT RUN |
| `maestro/android/smoke-telemetry-center.yaml` | `.debug` | NOT RUN |
| `maestro/android/smoke-ai-performance.yaml` | `.debug` | NOT RUN |
| `maestro/android/smoke-release-rc.yaml` | release | NOT RUN (new) |

## Athlete / Coach journeys

| Journey | Status | Notes |
|---------|--------|-------|
| Athlete full E2E | **BLOCKED** | Release auth locked without IdP; debug local auth only |
| Coach full E2E | **BLOCKED** | Same |
| Guest → Auth screen | Scripted | Needs device |

## Unit-level substitutes

NavGuard, RolePermission, LocalAuth (incl. release refuse), telemetry privacy, AI gate — **PASS** (see Phase 12 + Phase 13 auth test).

**Verdict:** E2E device certification **FAIL / NOT RUN** — release gate incomplete.
