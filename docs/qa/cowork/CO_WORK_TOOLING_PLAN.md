# CO_WORK_TOOLING_PLAN — FitConnect Master QA (Cowork)

**Run:** 2026-08-24T07:36Z · **Executor:** Claude (Cowork) · **Mode:** VISIBLE / INTERACTIVE where possible

## Environment reality (decides the whole mission)
| Capability | Status | Evidence |
|---|---|---|
| Cloud container network → vercel.app | **NO** | curl to fitconnect-phi.vercel.app = 000; npm registry = 200 |
| Android emulator / Gradle / ADB (device) | **BLOCKED** | `querino`: "Virtualization Enabled In Firmware: No" — no WHPX/AEHD possible |
| Gradle in cloud container | **NO** | no Android SDK; device_bash has no network/SDK |
| Wear OS emulator | **BLOCKED** | same hypervisor block + image absent |
| Chrome (user device) live browser | **YES** | Browser 1 (Windows) — used for all live web QA |
| Playwright (cloud Chromium) | available, unused | vercel.app unreachable from cloud → no value here |

## Tools actually used
| Tool | Purpose | Used |
|---|---|---|
| claude-in-chrome (MCP) | Live web QA on user's Chrome: navigate, screenshot, JS probes, console/network | **YES — primary** |
| device_bash (remote-devices) | Read repo, grep modules, inspect Kotlin/env, apply local edits | **YES** |
| project_memory | Recall env limits + toolchain; record QA results | YES |
| Supabase / Vercel / Sentry / Figma MCP | Not required for this pass | no |

## Tools deliberately NOT used
- Android/Wear skills, Maestro, adb, Perfetto, r8-analyzer — **all gated by the hypervisor block**.
- Cloud Playwright — target host unreachable from the container.

## Method
1. Live web = real interaction through the user's Chrome (visible), with JS/DOM/console/network probes.
2. Native (Android/Wear) = **static code audit only**, labelled BLOCKED-BY-ENVIRONMENT — never simulated as PASS.
