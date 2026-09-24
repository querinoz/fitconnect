# Cross-platform design contract (Zenith)

**Date:** 2026-09-24  
**Brand anchors (do not replace):** Floor `#070B14` · Voltline `#C8FF00` · Iris `#6C63FF` · Telemetry `#3CD7FF`  
**Type:** Syne · Plus Jakarta Sans · JetBrains Mono

| Zenith token / concept | Android (M3 + Expressive) | iOS (HIG / Liquid Glass) | Wear (Wear Material3) | Web |
| --- | --- | --- | --- | --- |
| Primary surface / Floor | `colorScheme.background` + Zenith floor overlay | Standard material / opaque content | Wear surface | CSS `--eos-floor` |
| Primary CTA / Voltline | M3 primary → remapped to Voltline | Tint / button role | Primary chip | `--eos-voltline` + EliteButton |
| Focus / Iris | Secondary / tertiary container | Accent | Secondary | `--eos-iris` |
| Telemetry | Data emphasis color | SF Symbol + tint | Compact metric | `--eos-telemetry` |
| Glass / chrome | Compose blur/scrim (native) — **not** QuickLiquid | Liquid Glass on **nav/toolbars/controls only** | Wear surfaces | `ZenithGlass` → QuickLiquid **selective** + frost fallback |
| Content cards | M3 surfaces / Bento | Standard materials (not all glass) | Compact cards | BentoCard — glass sparingly |
| Navigation | Flexible / rail per IA V12 | Tab/nav Liquid Glass layer | Wear navigation | App shell |
| Motion | Compose + reduced motion | SwiftUI + reduce motion | Glanceable micro | Framer/OriginKit **selective** |
| Touch targets | ≥48dp | ≥44×44 pt | Wear guidelines | ≥44px interactive |
| Typography | M3 type scale + Zenith roles | Dynamic Type | Compact | Syne/Jakarta/Mono |

## Rules

1. **M3 is structure; Zenith is soul** — never ship default purple Material demo theme.  
2. **QuickLiquid / OriginKit = Web only.**  
3. **Wear Material3 ≠ phone Material3** — separate deps and patterns.  
4. **Liquid Glass = functional chrome**, not every content block (Apple guidance).  
5. Domain separation (V12 IA) remains: TRAIN ≠ Nutrition ≠ Routes ≠ Ascend.

## Related

- `docs/architecture/FITCONNECT_INFORMATION_ARCHITECTURE_V12.md`  
- `packages/design-tokens/` · `apps/web/app/elite-os.css`
