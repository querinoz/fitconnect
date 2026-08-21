# FitConnect Landing — Audit Before Remediation

**Date:** 2026-08-15  
**STITCH_ACCESS:** UNAVAILABLE (HTTP 500 on https://stitch.withgoogle.com/projects/14054299058988485854)  
**Floor token:** keep `#070B14` (`--eos-floor`). Brief `#090402` is **not** applied (would fork Elite Surface).

Sources inspected: `apps/web/app/page.tsx`, `components/landing/*`, `components/marketing/landing-v2/*`, `elite-os.css` / `COLOR_TOKENS`, Android `HomeScreen.kt`, web `EliteMobileCockpit`, Wear docs (Phase 16/17).

---

| CATEGORY | CURRENT STATE | PROBLEM | SEVERITY | LOCATION | RECOMMENDED FIX | EXPECTED RESULT |
|----------|---------------|---------|----------|----------|-----------------|-----------------|
| SEO / SSR hero | `sr-only` H1 is still “Find my specialist” | Conflicts with Elite OS positioning; crawlers/a11y tree see marketplace copy | P1 | `apps/web/app/page.tsx` | Align H1 with Elite OS headline | Same story for SEO and visual hero |
| Schema.org | `operatingSystem: "Web, iOS, Android"` | No native iOS app; Expo frozen; watchOS absent | P1 | `page.tsx` jsonLd | `Web, Android` only; no invented iOS/watch | Honest product surface list |
| Boot gate | Plays ~1.8s every visit; `aria-hidden` on whole overlay | Blocks return visitors; not a dialog; no session skip | P1 | `hero-gate.tsx` | sessionStorage skip; role=dialog; EN/PT copy | 1–2s first visit only; reduced-motion skip |
| Hero CTAs | “Find my coach” / “Watch the OS” | Does not say ENTER ELITE OS / EXPLORE SYSTEM | P1 | `hero-elite-os.tsx` + i18n | Canonical CTAs → `/signup` and `#athlete-os` | Clear product entry |
| Hero “Live” | Badge + session UI look production-live | Values are LOCAL_DEMO, not live GPS/telemetry | P0 | `hero-elite-os.tsx` | Label **LOCAL DEMO** | No fake live integration |
| Home nav | Home is **not** in `(marketing)` layout | No sticky lang/nav after scroll; hero header has no mobile menu / LangPicker | P1 | `page.tsx` vs `marketing-nav.tsx` | Sticky `LandingOsNav` with real hrefs | Every control has a destination |
| Floor leak | Marketing canvas hardcodes `#090402` | Forks Elite Surface floor | P1 | `landing-canvas.tsx` | `var(--eos-floor)` | One obsidian |
| App demo i18n | Hardcoded “Same OS. Real preview.” | Mixed-language UI | P1 | `app-demo-section.tsx` | Dictionary keys EN+PT | No mixed language |
| App demo mock | Abstract glass cards, not Android tabs | Visitor cannot see Athlete OS (Home/Discover/Activity/Community/Profile) | P1 | `app-demo-section.tsx` | Embed real `EliteMobileCockpit` (LOCAL_DEMO) | Landing matches Android nav |
| Stock photos | Unsplash gym photos in scroll story | Generic fitness stock; extra origin | P1 | `scroll-story.tsx` | EOS surfaces / product frames, no Unsplash | One visual system |
| Wearables | Manifesto: Strava/Garmin/Apple Health/Whoop “already here” | Only Strava is mature; Wear OS is LOCAL_DEMO; watchOS / HyperOS not implemented | P1 | manifesto + missing Act 08 | Honest ecosystem matrix | READY / PREVIEW / COMING SOON / UNSUPPORTED |
| Problem act | Missing | Narrative jumps hero → marquee → coaches | P2 | `landing-page-content.tsx` | Short fragmented-fitness → one OS act | Clear why |
| Coach OS | Coach reel + quote; no roster from app | Weak Coach OS story | P1 | landing | LOCAL_DEMO coach roster panel | Athlete + Coach both shown |
| Buttons | Hero uses raw Link styles; EliteButton exists | Multiple button languages | P1 | hero, final CTA | EliteButton variants | One system |
| Overlays | Gate not a dialog | Gate a11y | P1 | `hero-gate.tsx` | Dialog semantics; reduced motion | Accessible init |
| Watch frames | Apple Ultra chrome exists | Can imply Apple Watch product | P1 | `galaxy-watch-frame.tsx` | Honest ecosystem labels only | No fake pairing |
| href="#" | None found in marketing TS | — | — | — | Keep none | No dead hash CTAs |
| Tokens | `#070B14` / `#C8FF00` / `#00DDB4` | Brief asked `#090402` | — | design-tokens | **Do not change floor** | Brand continuity |

## Navigation map (as found)

| Element | Destination | Issue |
|---------|-------------|--------|
| Hero primary | `/signup` | Copy not Elite OS |
| Hero secondary | `#demo` | Works if demo mounts |
| Hero nav Overview/Telemetry | `#demo` | Two items, same target |
| Hero Initialize | `/signup` | Hidden on small screens |
| Final CTA primary | `/discover` | OK |
| Final CTA secondary | `/dashboard?demo=athlete` | Must stay labeled demo |
| Download | `/mobile` | Marketing launcher, not `/app/mobile` |

## Android source of truth

- Tabs: Home · Discover · Activity · Community · Profile
- Recovery score + SYS labels
- EliteButton / EliteCard
- Floor `#070B14`, Voltline CTAs
- Activity GPS = LOCAL_DEMO simulated

## Honest wearable matrix

| Surface | Claim |
|---------|--------|
| Android phone | READY (LOCAL_DEMO in this repo) |
| Web app + landing | READY |
| Wear OS module | PREVIEW / LOCAL_DEMO |
| watchOS | COMING SOON |
| Xiaomi HyperOS proprietary | UNSUPPORTED |

## Out of scope / not fabricated

- Stitch pixel diffs
- Emulator / physical device screenshots
- Production live telemetry on the landing
- Payments or production auth
