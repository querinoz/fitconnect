# FitConnect — MAX-safe skill polish design

**Date:** 2026-09-07  
**Status:** APPROVED  
**Branch:** `feat/elite-os-v2`  
**Skills driving this pass:** superpowers · interface-design · ui-ux-pro-max · mobile-design · android · impeccable · mobile-security-coder · multi-platform-apps · droidmind/emulator

## Intent

Athlete and coach at training time: calm OLED density, one primary action per screen, Elite OS soul (`--eos-*`, `#070B14` / `#C8FF00`). Polish functional UX and a11y — **not** a rebrand.

## Constraints

- Preserve Elite OS tokens, Syne / Plus Jakarta / JetBrains Mono, neu-glass
- No landing redesign, Playwright visual baselines, iOS, ASO, paywall, MCP installs
- No new product features
- Verify before claiming done

## Scope

1. **Android Athlete + Coach** — touch ≥48dp, TalkBack labels on icon actions, empty/error/offline harden, disable while mutating
2. **Web app shells** — dashboard/settings empty/error clarity with EOS tokens only
3. **Security smoke** — no secrets in logs; auth/demo gating intact; fix only concrete issues
4. **Verify** — typecheck / unit tests / assembleDebug / emulator launch + logcat

## Non-goals

Wear OS, Expo redesign, Stripe/FCM live, Redmi/physical GPS, SwiftUI skills application.

## Success criteria

- Icon-only controls used in nav/header/FAB expose meaningful `contentDescription`
- Primary async actions cannot double-submit while loading
- Empty/error states use honest copy (impeccable clarify/harden)
- Regression: typecheck + web tests + assembleDebug + emulator smoke PASS

---

## Implementation log (2026-09-07)

| Skill | Delivered |
|-------|-----------|
| superpowers | Design approved; this doc |
| android + mobile-design | Nav tab selected semantics; decorative icons under parent CD; touch floors unit-tested |
| ui-ux-pro-max | Empty states with CTA; web join target ≥44px; loading-button pattern |
| impeccable harden | CoachLoad timeout parity; Discover booking/DM submitting guards; Bookings busyId |
| interface-design | `EmptyState` + SessionsList + MessageInbox product empty states (`--eos-*`) |
| multi-platform-apps | Aligned empty/error copy AthleteLoad ↔ CoachLoad |
| mobile-security-coder | Smoke: no token values in logs; Discover no longer surfaces raw `AppError` in DM status |
| droidmind / emulator | assembleDebug PASS; emulator boot failed this session (only Redmi online — DEFERRED_DEVICE, not used) |

### Verification

| Check | Result |
|-------|--------|
| `:app:assembleDebug` | PASS |
| `:design-ui` / `:athlete` / `:coach` compile | PASS |
| `AccessibilityConstantsTest` | PASS |
| `pnpm` web `tsc` + `test` | PASS 500 / 10 skipped |
| Emulator install/launch | PARTIAL — AVD did not come online; Redmi not used |

### Files touched (primary)

- `android/coach/.../CoachScreen.kt`, `BookingsScreen.kt`
- `android/athlete/.../DiscoverScreen.kt`
- `android/design-ui/.../EliteFeedback.kt`, `EliteNavigation.kt`, `EosTrainActionFab.kt`
- `android/foundation/.../AccessibilityConstantsTest.kt`
- `apps/web/components/ui/empty-state.tsx`, `app/sessions-list.tsx`, `inbox/message-inbox.tsx`
- `docs/plans/2026-09-07-max-safe-skill-polish-design.md`
