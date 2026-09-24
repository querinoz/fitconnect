# Third-party component matrix (Zenith ecosystem)

**Date:** 2026-09-24  
**Branch tip audited:** `feat/fitconnect-roadmap-v10-v11` @ `6b97698`  
**Policy:** Prefer permissive licenses. Never vendor GPL/AGPL/CC-BY-SA assets into proprietary product without an explicit legal decision.

| Source | Version/Commit | License | What is reused | How used | Attribution required? | Commercial compatibility | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| InlitX/GymMane | upstream main (README 2026) | **GPL-3.0** (code); **CC BY-SA 4.0** (exercise art) | Feature/UX concepts only | Native FitConnect implementation; **no source/asset copy** | N/A if no code | **Incompatible to vendor** without relicensing | **REFERENCE ONLY** |
| amarnath3003/quickLiquid | TBD if adopted | MIT | Refraction / glass primitives | Web only via `ZenithGlass` abstraction | MIT notice if shipped | OK | **CANDIDATE — Web selective** |
| OriginKit | catalog | Proprietary / API-key source fetch | Micro-interactions | Selective fetch only; never bulk | Per OriginKit terms | Check before ship | **CANDIDATE — Web selective** |
| Material 3 / Expressive | AndroidX | Apache-2.0 | Compose foundation | Android structural UI | Apache notice | OK | **ADOPT (foundation)** |
| Wear Compose Material3 | AndroidX Wear | Apache-2.0 | Wear surfaces | Wear only | Apache notice | OK | **ADOPT (Wear)** |
| Apple HIG / Liquid Glass | Apple | Apple SDK terms | Patterns (not assets) | iOS SwiftUI materials | Apple terms | OK for Apple platforms | **PATTERN ONLY** |
| obra/superpowers | upstream | Check LICENSE | Workflow (brainstorm/TDD/review) | Cursor agent process | Per LICENSE | Process OK | **PROCESS — selective** |
| affaan-m/ecc | upstream | Check LICENSE | Agents/skills/hooks | Selective modules only | Per LICENSE | Process OK | **PROCESS — selective; no dump** |
| mattpocock/skills | upstream | Check LICENSE | TDD/PRD/triage skills | Selective install | Per LICENSE | Process OK | **PROCESS — selective** |
| multica-ai/andrej-karpathy-skills | upstream | Check LICENSE | 4 engineering principles | `.cursor/rules/karpathy-engineering.mdc` | Per LICENSE | Process OK | **ADOPTED (principles)** |
| anthropics/skills | Anthropic | Restricted materials | Agent Skills *pattern* | Do **not** copy/vendor restricted content | Restricted | Do not reproduce | **PATTERN ONLY — no vendor** |
| UI/UX Pro Max | in-repo `.cursor/skills/ui-ux-pro-max` | Project skill | Styles/UX search | Already installed | Internal | OK | **INSTALLED** |
| OpenGym / Liftosaur / wger | various | AGPL/check | Concepts | Already in REFERENCE_LICENSE_REGISTRY | — | No AGPL import | **REFERENCE ONLY** |
| Component Gallery / AppShot | web refs | N/A | Visual benchmarks | Design research only | N/A | No install | **REFERENCE ONLY** |
| Velvetyne fonts | per font | OFL/check | Typography | Only after license + brand fit | Yes if shipped | Case-by-case | **HOLD** |
| Caveman | agent skill | Check | Verbosity control | Agent chat only — never code | — | OK process | **AGENT UX ONLY** |
| Humanizer | agent skill | Check | Marketing copy | External copy only | — | OK process | **COPY ONLY** |
| Deploy to Vercel | Vercel skill | Check | Preview/prod deploy | After release gates | — | OK | **PROCESS** |
| vphone-cli | Lakr233 | Check | iOS VM tooling | Windows = NOT EXECUTABLE | — | Dev tool | **DOCS ONLY on Windows** |

## Hard bans

1. Do not copy GymMane Flutter/source, art, or business logic into FitConnect.  
2. Do not vendor Anthropic restricted skill materials.  
3. Do not replace Compose/SwiftUI with Expo or React Native wrappers.  
4. Do not introduce QuickLiquid on Android/iOS/Wear.
