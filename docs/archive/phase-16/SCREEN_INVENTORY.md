# Screen inventory (Android + web mobile cockpit)

**Date:** 2026-08-15  
LOCAL_DEMO labeled where data is not production.

## Android athlete

| Screen | Purpose | Primary CTA | Empty / error / loading / offline | testTag |
|--------|---------|-------------|-----------------------------------|---------|
| Splash | Brand + session restore | none (auto) | restore error → error route | `screen_splash` |
| Guest / Auth | LOCAL_DEMO or IdP | Continue / Sign in | unconfigured IdP copy | `screen_guest` / auth |
| Onboarding | First-run | Continue | — | onboarding flows |
| Home | Prime Recovery cockpit | Start monitoring | `AthleteLoad` | `athlete_home` |
| Discover | Coaches + map panel | Book | load/error | `athlete_discover` |
| Activity | Start/Pause/Resume/End | Start monitoring | sensor copy = simulated | `athlete_activity` |
| Community | Feed / post / react | Post | empty + error | `athlete_community` |
| Profile | Identity + appearance | Settings / Sign out | — | `athlete_profile` |
| Settings | Theme + language | chips | — | `athlete_settings` |
| Sessions / Programs / Telemetry / AI | Nested | various | `AthleteLoad` | existing tags |
| Offline banner | Connectivity | — | `Working offline` | `athlete_offline_banner` |

## Android coach

| Screen | Purpose | Primary CTA |
|--------|---------|-------------|
| Overview | Command center | nested links |
| Athletes / Calendar / Inbox / More | Role IA | navigate |
| Settings | Theme + language | chips |
| Bookings / Programs / Sessions | LOCAL_DEMO engines | existing |

## Web

| Screen | Purpose | Notes |
|--------|---------|-------|
| `/` landing | Marketing | Voltline |
| `/mobile` | Demo launcher | Not the Android tab model |
| `/app/mobile` | Mobile web cockpit | Home/Discover/Activity/Community/Profile + device frame |
| `/dashboard` … | PWA app shell | Existing |

## Accessibility notes

Compose buttons ≥48dp (`EliteButton`). Web cockpit buttons `min-h-11`. TalkBack / browser a11y **not executed** on a device this phase.
