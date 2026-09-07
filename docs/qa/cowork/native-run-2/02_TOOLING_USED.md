# 02 — TOOLING USED (Native Run #2 — executed)

| Tool | Purpose | Used | Value |
|---|---|---|---|
| ADB | install, launch, logcat, screencap, geo fix, permissions, dumpsys | **YES — primary native** | High |
| Android Emulator (`fitconnect_phone`) | visible phone runtime | **YES** | High |
| Wear OS Emulator (`fitconnect_wear`) | visible watch runtime | **YES** | High |
| aapt dump badging | package / version / launchable | **YES** | Medium |
| uiautomator dump | navigation forensics, labels | **YES** | High |
| `adb shell dumpsys gfxinfo` / `meminfo` | performance | **YES** | Medium |
| Cursor IDE browser MCP | live landing + dashboard | **YES** | High |
| curl | HTTP smoke + `/api/health` | **YES** | Medium |
| WebFetch | pricing copy | **YES** | Medium |
| Skills: `android-emulator-skill`, `android-accessibility` | boot/install/a11y checklist | **YES** (guidance only) | Medium |
| Playwright CLI | version check only | version only | Low |
| Maestro | — | **NO** | — |
| Firebase MCP | loading / unused | **NO** | — |

## Skills / MCPs not used

No mass skill install. Compose/Health Connect docs not needed for test-only.

## Evidence root

`qa/evidence/cowork/native-run-2/` (android / wear / dumps / logcat / web).
