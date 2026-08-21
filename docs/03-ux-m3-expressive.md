# UX / M3 Expressive checklist

## 7. Audit

| # | Item | Result |
|---|---|---|
| 1 | ≤4 destinations + primary action FAB | PASS — `AthleteDest.bottomTabs` is Today / Analysis / Achievements / Profile; Train is `EliteTrainFab` |
| 2 | Zero Material Drawer | PASS |
| 3 | Zero Material `NavigationBar` / `BottomAppBar` | PASS — `EliteFloatingNavBar` + rail |
| 4 | Compact: floating bar + FAB; ≥600dp collapsed rail; ≥1240dp expanded rail | PASS — `AthleteScaffold` `screenWidthDp` |
| 5 | Active training targets ≥56dp | PASS — `HoldToConfirmButton` uses `PREFERRED_TOUCH_TARGET_DP` (56) |
| 6 | Dominant metric tabular figures ≥48sp | PASS — `EliteMetricHeroTextStyle` is 52sp + `tnum` |
| 7 | Finish is hold-to-confirm ~1.5s, not a dialog | PASS |
| 8 | Live metrics do not animate digits | PASS — timer `Text` has no number animation |
| 9 | Effort zones sequential, labelled, not rainbow | PASS — `EffortZoneStrip` |
| 10 | Empty Today is a Health Connect step | PASS — `HealthConnectStatusCard` |
| 11 | Wear: one datum, tile start, streak complication, Health Services | PASS — existing tile + streak complication |
| 12 | TalkBack + 200% font on live session | ⏭️ emulator not required in this pass — not claimed |

Palette remains Elite OS (`#070B14` / `#C8FF00`). Catalog orange/green from ui-ux-pro-max was rejected.
