# PHASE 16 — Tools and skills

**Date:** 2026-08-15

## Skills used

| Skill | Why |
|-------|-----|
| Elite Surface (`.claude/skills/elite-surface`) | Tokens, no invented hues, reduce-motion, no fake screenshots |
| Workspace verify-before-responding | No PASS without executed commands |

Not used: Azure/Foundry skills (irrelevant). Impeccable/design-taste: only if a new UI surface is built after 16A.

## MCP (this session)

| Server | Status | Used for |
|--------|--------|----------|
| `cursor-app-control` | ready | not required for audit |
| `cursor-ide-browser` | ready | optional **web** visual evidence after `/app/mobile` exists — not used to fake Android |

No Android emulator MCP. No Maestro MCP.

## Local toolchain (discovery, not a PASS on product)

| Tool | Discovery method | Result |
|------|------------------|--------|
| Git | `git status` | available |
| Node / pnpm | `package.json` packageManager pnpm@9.15.9 | available (used in prior sessions) |
| Gradle | `android/gradlew.bat` | available — 152 unit tests previously |
| Java/Kotlin | AGP 9 built-in Kotlin | available via Gradle |
| Android SDK | `%LOCALAPPDATA%\Android\Sdk` | present |
| `adb` | PATH | present; **no devices** |
| `emulator.exe` | SDK `emulator\emulator.exe` | present; **accel: 6** hypervisor missing |
| AVD | `emulator -list-avds` | `fitconnect_phone` |
| Maestro | PATH / `npx` | **not usable** (CLI missing; npx hang; no device) |
| Python | QR script requires it | used by `android:qr` |
| Playwright | `pnpm test:e2e` | exists; not claimed run in 16A |
| gcloud | — | PENDING_HUMAN if needed |
| Xcode / watchOS | glob `*.swift` / `*.xcodeproj` | **absent** |
| Detekt | android Gradle | **not configured** |

## Install policy

- Do not install AEHD (admin + BIOS) from this agent.
- Do not install Xcode on Windows.
- Do not `npx maestro` if it hangs and no device exists.
- Gradle/pnpm already present — use them.

## Evidence rule

Browser MCP screenshots of **web** pages are valid web evidence.  
They are **not** Android emulator evidence.
