# FitConnect — Layout system (D1/D3)

4px grid. Source: `packages/design-tokens/layout.ts` → generated `EliteSurfaceSpacing`.

| Token | dp |
| ----- | -- |
| none | 0 |
| xxs | 2 |
| xs | 4 |
| sm | 8 |
| md | 12 |
| lg | 16 |
| **inset** | **20** |
| xl | 24 |
| xxl | 32 |
| **section** | **40** |
| xxxl | 48 |
| huge | 64 |

Phone content padding: `EliteSpace.Lg` (16dp). FAB screens add `Huge + Section` bottom inset so content clears the AI control.

Do not hardcode `20.dp` / `32.dp` in new UI — use tokens.
