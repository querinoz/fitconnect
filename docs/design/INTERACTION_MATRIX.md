# FitConnect — Interaction matrix (D0 current state)

Living inventory. STATUS is **what ships today**, not a wish list. Update when a phase actually lands.

| COMPONENT | ACTION | GESTURE | FEEDBACK | ANIMATION | HAPTIC | NAVIGATION | ACCESSIBILITY | STATUS |
| --------- | ------ | ------- | -------- | --------- | ------ | ---------- | ------------- | ------ |
| EliteFloatingNavBar | Switch top-level section | Tap | Volt outline + label color | None (instant) | None | `saveState`/`restoreState` | content-desc per tab | SHIPPED |
| EliteButton Primary | Confirm | Tap | Press scale 0.97 | graphicsLayer scale | None | Caller | min 48dp, semantics label | SHIPPED |
| EliteButton Secondary | Alternate | Tap | Glass outline | Same scale | None | Caller | Same | SHIPPED |
| EliteButton Destructive | Dangerous confirm | Tap | Crimson fill | Same | None | Caller | Same | SHIPPED |
| EliteChip | Filter / react / kind | Tap | Selected Volt border | None | None | In-place | AssistChip 48dp height | SHIPPED |
| EliteCard | Open / none | Tap if `onClick` | Ripple (Material) | None | None | Optional | Not always labeled as button | PARTIAL |
| ElitePrimeInstrument | Read Prime | None | Static ring | None on Home | None | None | “Prime Recovery 59 percent MODERATE” | SHIPPED |
| EliteAiFab | Open AI | Tap | Volt disc | None | None | AI screen | “AI Coach” | SHIPPED — overlaps Home |
| EliteBottomSheet | Dismiss | Drag / tap outside | Material sheet | Platform | None | Pop | Handle from M3 | STOCK, not Elite glass |
| EliteDialog | Confirm / cancel | Tap | AlertDialog | Platform | None | Pop | Title+body | STOCK |
| EliteLoading | Wait | None | Spinner + SYS label | Spinner off if reduce-motion | None | None | Label | SHIPPED |
| EliteEmptyState | Recover | Tap action | Secondary button | EliteEnter on screens | None | Caller | Combined content-desc | SHIPPED |
| Community composer | Publish | Tap | Status text | None | None | Reload feed | Fields labeled | SHIPPED |
| Community reactions | React | Tap chip | Count refresh | None — **no explosions** | None | In-place | Chip text = enum name | SHIPPED |
| Community comment | Reply | Tap | Status text | None | None | In-place | Field labeled | SHIPPED — nested replies not in UI |
| Activity start/stop | Capture | Tap | IDLE→live | Unverified | LongPress haptic | Same screen | Buttons | PARTIAL |
| Appearance chips | Theme | Tap | Selected chip | None | None | Persist ThemeSettings | selectableGroup | SHIPPED |
| Accent wheel | Personalize Volt | — | — | — | — | — | — | **MISSING** (D17) |
| Pull-to-refresh | Reload feed | Swipe down | — | — | — | — | — | **MISSING** |
| Profile hover / long-press card | Preview identity | Hover / long-press | — | Shared avatar | — | Profile | Fallback: tap avatar | **MISSING** |
| Shared element avatar | Open profile | Tap | — | sharedElement | — | Profile | — | **MISSING** |
| Vertical Reels pager | Next clip | Swipe up | — | Follow finger | — | Motion only | — | **MISSING** (no Motion product) |
| Stories tap zones | Next/prev | Tap L/R | Progress | — | — | — | — | **MISSING** |
| Haptics master toggle | Disable vibration | Tap | — | — | Off | Settings | Required before expanding haptics | **MISSING** |
| Reduced motion | System | OS setting | Instant transitions | duration 0 | n/a | n/a | LocalReduceMotion | TOKEN EXISTS — device QA unverified |

Rule: never hide a critical action behind a gesture that has no visible control.
