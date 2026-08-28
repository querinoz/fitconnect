# 01 — Environment

**Probed:** 2026-08-27 23:45 UTC+1 · **Host:** Windows 10.0.26200 · **Branch:** `feat/elite-os-v2`

## Host toolchain

| Item | Value | Status |
|---|---|---|
| OS | Windows 10.0.26200 | PASS |
| Node | v25.9.0 | PASS |
| pnpm | 9.15.9 | PASS |
| Java | 17.0.12 LTS | PASS |
| Git | 2.53.0 | PASS |
| ADB | 1.0.41 | PASS |
| Android SDK | `C:\Users\duhqu\AppData\Local\Android\Sdk` | PASS |
| GNU Make | not in PATH | FAIL — use `.\make.ps1` or `npm run env:start` |
| Docker | not probed | — |

## AVDs

| AVD | Role | API | State (session) |
|---|---|---|---|
| `fitconnect_phone` | Phone | 37 (sdk_gphone16k_x86_64) | was RUNNING; offline at end of session |
| `fitconnect_wear` | Wear | 34 (sdk_gwear_x86_64) | was RUNNING; offline at end of session |

## Execution surfaces

| Surface | Status | Notes |
|---|---|---|
| PowerShell / shell | PASS | Full command execution |
| Web dev server :3001 | PASS | PID 23912, smoke 14/14 |
| Android emulator + ADB | PARTIAL | Verified via UI dump; emulators disconnected later |
| Wear emulator | PARTIAL | WearMainActivity + STEPS screen verified |
| Browser MCP | BLOCKED | cursor-ide-browser server not found |
| Production URL | NOT RUN | local-only this session |

## Test results (this session, Windows)

```
pnpm --filter @fitconnect/web test     → 384 passed, 2 skipped (131 files)
pnpm --filter @fitconnect/web typecheck → PASS
pnpm lint                               → PASS (img warnings only)
gradlew :app:testDebugUnitTest          → PASS
node scripts/smoke-test.mjs :3001       → 14/14 PASS (after hero marker fix)
marketing-route-audit.test.ts           → 2/2 PASS
pnpm typecheck (monorepo)               → FAIL @fitconnect/mobile AnimatedCircle
```
