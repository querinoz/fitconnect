# ANDROID_VISUAL_QA.md

**Date:** 2026-08-09  
**Reference:** Elite OS / Voltline tokens + product brief  
**Stitch URL:** login-walled in this environment — not pixel-compared

| Screen | STATUS | layout | color | typography | spacing | components | interaction | motion | safe area |
|--------|--------|--------|-------|------------|---------|------------|-------------|--------|-----------|
| Splash | PASS | OK | Floor/Volt | Syne bundled | OK | Logo + tagline | OK | Splash API | OK |
| Auth | PASS | OK | Elite | Plus Jakarta | OK | Personas + forms | Demo CTAs | — | OK |
| Athlete onboarding | PASS | 6-step scroll | Elite | Bundled | OK | Chips/fields | Next/Back/Skip | — | OK |
| Coach onboarding | PASS | 6-step scroll | Elite | Bundled | OK | Profile/pricing | Persist + finish | — | OK |
| Athlete Home | PASS | Cockpit | Volt/teal | Metric/mono | OK | Recovery ring | Deep links | Ring | OK |
| Discover | PASS | Map+list | LOCAL MAP badge | OK | OK | Coach cards | Profile/book | — | OK |
| Coach Profile | PASS | Sheet card | Avatar | OK | OK | Book/Message | OK | — | OK |
| Map | PASS | Intentional preview | Grid+markers | OK | OK | LOCAL MAP | Non-blank | — | OK |
| Sessions | PASS | List+detail | Tags | OK | OK | Live preview | Join/mute/end | State delays | OK |
| Programs | PASS | Expand detail | Progress | OK | OK | Enroll | Expand/collapse | — | OK |
| Community | PASS | Feed+composer | Cards | OK | OK | React/comment | Publish/refresh | — | OK |
| Coach Dashboard | PASS | Command center | Elite | OK | OK | Roster links | Tabs icons | — | OK |
| Roster | PASS | Athlete list | Cards | OK | OK | Open detail | OK | — | OK |
| Athlete Detail | PASS | Metrics+actions | Semantic | OK | OK | AI/notes | Nav paths | — | OK |
| Plan Builder | PASS | Editor | Elite | OK | OK | Save/demo | Persist session | — | OK |
| Earnings | PASS | Revenue | Teal accent | OK | OK | ROI cards | From More | — | OK |
| Profile | PASS | Settings hub | Elite | OK | OK | Telemetry/AI | Sign-out | — | OK |
| Settings | PASS | Theme/locale | Elite | OK | OK | Toggles | OK | — | OK |

**Notes**

- Bottom nav uses Material Icons (coherent set), not letter glyphs.
- Generic Material defaults avoided for surfaces (EliteCard / EliteButton).
- Device visual pass pending physical install.
