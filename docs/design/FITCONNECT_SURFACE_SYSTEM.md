# FitConnect — Surface system (D4)

Ladder. Floor is always `#070B14` (never `#090402`).

| Level | Token | Use |
| ----- | ----- | --- |
| 0 Atmosphere | FLOOR | Screen |
| 1 Carbon | CARBON | Nav pill |
| 2 Surface | SURFACE / CONTAINER | Solid cards |
| 3 Glass L2 | `EliteGlass.L2` + highlight | Elevated cards |
| 4 Glass L4 | `EliteGlass.L4` | Bottom sheets |
| 5 Glass L5 | scrim | Modals |
| 6 Telemetry | high contrast, no blur | Live metrics |

Glass L2 opacity **equals** `OPACITY.glass` (0.72). Inner highlight uses `onSurface` at `GLASS.highlight` — not white hex.

**No fullscreen blur.** `blurL3–L5` exist as tokens for localized overlay later. D4 ships highlight + translucency only.

Neumorphism: still limited to circular Prime instrument depth, not full-screen soft UI.
