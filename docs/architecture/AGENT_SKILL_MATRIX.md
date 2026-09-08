# FitConnect — Agent Skill Matrix (Path A · Mobile Zenith)

**Date:** 2026-09-08  
**Stack lock:** Native Android Compose + SwiftUI iOS (ADR-005). Expo skills = `N/A_PATH_A`.

| Skill | Source | Version | Installed | Used | Purpose | Agent | Evidence |
|-------|--------|---------|-----------|------|---------|-------|----------|
| superpowers | `.claude/skills/superpowers` | local | Y | Y | Plan → verify → iterate | Orchestrator | This Zenith plan + wave gates |
| interface-design | `.claude/skills/interface-design` | local | Y | Y | IA, dashboards, cards | Design | Home/Coach command remakes |
| ui-ux-pro-max | `.claude` + `.cursor` | local | Y | Y | Hierarchy, spacing, a11y | Design | MOBILE_DESIGN_SYSTEM.md |
| mobile-design | `.claude/skills/mobile-design` | local | Y | Y | Touch, thumb zones, sheets | Android UI | Nav FAB + touch targets |
| android | `.claude/skills/android` | local | Y | Y | Compose, system UI, back | Android | `android/` remake |
| impeccable | `.claude` + `.agents` | local | Y | Y | Polish passes | Design/QA | Visual QA loops |
| mobile-security-coder | `.claude/skills/mobile-security-coder` | local | Y | Y | Auth, tokens, PII | Security | No token logs; Firebase UID |
| multi-platform-apps | `.claude/skills/multi-platform-apps-multi-platform` | local | Y | Y | Android↔iOS↔web contracts | Integration | shared + iosApp adapters |
| elite-surface | `.claude` + `.cursor` | local | Y | Y | EOS tokens, neu-glass | Design | design-ui honeycomb/glass |
| elite-core-rust | `.claude/skills/elite-core-rust` | local | Y | Y | UniFFI physiology core | Core | Wave 5 UniFFI scaffold |
| sports-metrics | `.claude` + `.cursor` | local | Y | Y | LTHR zones, TSS honesty | Telemetry | HeartRateZones + UniFFI zones |
| ios-developer | `.claude/skills/ios-developer` | local | Y | Y | iOS app structure | iOS | `iosApp/` |
| swiftui-agent-skill | `.claude/skills/swiftui-agent-skill` | local | Y | Y | SwiftUI composition | iOS | iosApp screens |
| swiftui-expert-skill | `.claude/skills/swiftui-expert-skill` | local | Y | Y | State, architecture | iOS | Navigation shells |
| swiftui-microinteractions | `.claude/skills/swiftui-microinteractions` | local | Y | Y | Springs, haptics (source) | iOS | Motion tokens mirrored |
| android-emulator-skill | `.cursor/skills/android-emulator-skill` | local | Y | Y | assembleDebug, adb, shots | QA | Emulator screenshots |
| android-accessibility | `.cursor/skills/android-accessibility` | local | Y | Y | TalkBack, targets | QA | contentDescription audit |
| elite-os-multiplatform | `.cursor/skills/elite-os-multiplatform` | local | Y | Y | Three-surface ADR | Architecture | Path A docs |
| brand | `.cursor/skills/brand` | local | Y | Y | Brand lock | Design | Voltline palette |
| design-system | `.cursor/skills/design-system` | local | Y | Y | Token architecture | Design | MOBILE_DESIGN_SYSTEM.md |
| stitch-ui-design | `.claude/skills/stitch-ui-design` | local | Y | Conceptual | Density reference only | Design | Not brand clone |
| droidmind | `.claude/skills/droidmind` | local | Y | Partial | Device automation | QA | Emulator; Redmi MIUI blocked |
| app-store-optimization | `.claude/skills/app-store-optimization` | local | Y | Partial | Metadata structure | Release | MOBILE_RELEASE_READINESS |
| app-paywall-pilot | `.claude/skills/app-paywall-pilot` | local | Y | Audit only | No new monetization | Product | No invented paywall |
| swift-mcp-gui | `.claude/skills/swift-mcp-gui` | local | Y | N/A Windows | Mac GUI tooling | iOS | BLOCKED_EXTERNAL |
| Expo official skills | npx skills expo | — | **N** | **N/A_PATH_A** | Expo/RN product stack | — | ADR-005; Expo archived |
| Vercel RN skills | external | — | **N** | **N/A_PATH_A** | RN practices | — | Path A native only |

## Notes

- Expo product skills intentionally **not installed** (Path A).
- “Used” means a decision, code change, audit, test, or doc in this Zenith cycle — not merely “skill loaded”.
