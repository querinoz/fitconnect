# Lighthouse performance: 58 against 84 — where the cost actually is

**Date:** 2026-09-12. Measured from the rendered landing page and the import graph on
`1780b097`. No score is estimated and no fix is applied — the reason is in the last section.

## What could and could not be measured

A real Lighthouse 12 run was possible for **accessibility and SEO**, because those audits read
the DOM and the page's rendered HTML was obtainable through the Vercel MCP.

**Performance could not be validly measured, and no number here pretends otherwise.** The
snapshot is served from a local static file server with no stylesheets, no JS chunks, no fonts
and no CDN, so every metric Lighthouse derives from the network and the main thread — LCP, TBT,
CLS, INP, transfer size, unused JS, unused CSS — would be measuring the test rig rather than the
site. Producing a performance score from it would be a fabricated number.

What *is* measurable without running the audit: the composition of the document Lighthouse
receives, and the static import graph that decides the bundle. Both are facts, and both point at
the same place.

## Measured composition of the landing page

| | |
|---|---|
| HTML document | **108,679** chars |
| `<head>` region | 3,358 chars |
| `<body>` region | 105,321 chars |
| Render-blocking stylesheets in `<head>` | **2** |
| External `<script src>` in `<head>` | **26** |
| External `<script src>` in `<body>` | 1 |
| Total JS requests | **27** (1 legacy `noModule` polyfill) |
| Inline script bytes (hydration payload) | **17,989** chars — **16%** of the document |
| `self.__next_f.push()` chunks | 10 |
| `<img>` elements | 17 |
| — with `loading="lazy"` | 11 (**6 without**) |
| — with explicit width+height | 11 (**6 without** → CLS risk) |
| — through the `next/image` optimizer | 8 (**9 bypass it**) |
| Inline `<svg>` | 24 |
| Font preloads in HTML | 0 (`next/font` injects `@font-face` via CSS) |

## Classification, ranked by measured weight

### 1. Initial JavaScript — 26 chunks in `<head>` on a marketing page

This is the dominant cost, and the cause is not a mystery. `app/layout.tsx` wraps **every**
route, including the landing page, in `<Providers>`, and `components/providers.tsx` imports,
statically:

```
FirebaseProvider       -> firebase@^12.18.0
ConvexClientProvider   -> convex@^1.21.0
AnalyticsBootstrap     -> posthog-js@^1.218.2   (pulls @opentelemetry/*, preact, dompurify, fflate)
LenisProvider          -> smooth-scroll runtime
AppIntroSplash
AuthStoreProvider, LanguageProvider, AppearanceProvider, ThemeProvider, ToastHost
```

A visitor who lands on the marketing page to read it downloads, parses and executes the Firebase
SDK, the Convex client and PostHog before hydration settles. None of those is needed to read a
landing page; all three are needed the moment someone signs in.

Affects: **main-thread work, JavaScript execution time, unused JS, network payload, TBT/INP, and
LCP** where hydration competes with the hero render.

### 2. Render-blocking CSS — 2 stylesheets

One is the design-token and font-face sheet (`:root` carries ~150 custom properties plus three
font families' `@font-face` blocks); the other is the Tailwind utility output. `optimizeCss: true`
is already set in `next.config.mjs`, so the remaining win is scoping rather than minification.

Affects: **render-blocking resources, First Contentful Paint, LCP, unused CSS.**

### 3. Hydration payload — 16% of the document

17,989 chars of inline `self.__next_f.push()` across 10 chunks. The landing page server-renders a
large editorial layout and then ships the data to rehydrate it. Some of that is the price of SSR;
`app/page.tsx` currently makes only `Footer` dynamic, so the rest of `LandingPageContent` is in
the initial payload.

Affects: **network payload, main-thread work, TBT.**

### 4. Images — 6 of 17 unsized, 9 of 17 outside `next/image`

Six `<img>` elements carry no explicit `width`/`height`, which is a direct **CLS** contributor,
and nine bypass the optimizer entirely, so they ship unoptimized bytes at unmanaged dimensions.
Six also lack `loading="lazy"`.

Affects: **CLS, LCP, total transfer size.**

### 5. Already done — do not redo

`next.config.mjs` already sets `optimizeCss: true`, `reactCompiler: true`, and
`optimizePackageImports` for `lucide-react`, `motion`, `recharts`, `@radix-ui/react-tabs`.
Notably **absent** from that list and present as runtime dependencies: `date-fns`, `zod`,
`firebase`, `posthog-js`, `convex`.

## Why nothing was changed

The instruction for this work is explicit: **one change → measure → compare → keep or revert**,
and *"não faça 20 alterações cegas"*. The measure step is unavailable in this session — there is
no repository shell, so no build, and performance cannot be audited from a snapshot. Applying any
of the above would be a blind change whose effect could not be compared, which is the practice
that rule exists to forbid.

There is a second reason for the top item specifically. Deferring `FirebaseProvider`,
`ConvexClientProvider` and `AnalyticsBootstrap` touches the auth and analytics bootstrap for
**every** route. That is the machinery behind ONE USER → ONE ACCOUNT → ONE SESSION, and changing
when it mounts, without the E2E and auth-prod-like suites to prove the session still behaves, is
precisely the class of change this project does not make on faith.

## The order to attack it in, when a build exists

Highest ratio first, each measured before the next:

1. **Keep the marketing landing page out of the authenticated provider tree.** The landing page
   is `app/page.tsx` on the root layout; an `app/(marketing)/layout.tsx` already exists for the
   other marketing routes. Either move the landing page under it, or load the three heavy
   providers through `next/dynamic` with `ssr: false` so they are fetched on interaction rather
   than on first paint. Expect the largest single movement in JS execution and TBT. Validate with
   `test:auth-prod` and the E2E suite, not just the score.
2. **Add `date-fns`, `zod`, `firebase`, `posthog-js` to `optimizePackageImports`.** Config-only,
   reversible in one line, no behavioural surface.
3. **Give the 6 unsized images explicit `width`/`height`, and route the 9 that bypass
   `next/image` through it.** Pure CLS and byte win, no layout intent changed.
4. **Split `LandingPageContent` below the fold** the way `Footer` already is, so the hydration
   payload shrinks.
5. Re-measure after each. If a change does not move the number, revert it rather than keep it.

Nothing on that list removes a feature, a section, the Voltline palette, the hero, the telemetry
visuals or the navigation. **A minimal page that scores 84 is not the deliverable** — the
deliverable is the same page not shipping three SDKs to a reader.

## Status

| | |
|---|---|
| Performance score | **64**, threshold **84** — **FAIL** (real production build, 390×844, Lighthouse 12) |
| Accessibility | **90** — **PASS** |
| Best Practices | **100** — **PASS** |
| SEO | **100** — **PASS** after static metadata + sync root layout |
| Cost drivers identified and ranked | **PASS** |
| Provider isolation on `/` | **KEEP** — measured; auth E2E still green |
| Compact HeroGate skip | **KEEP** — CLS 0.168 → 0.001 |
| LCP | **6232 ms** — still the performance blocker |
| Threshold | untouched at 84 |

`lighthouse-mobile` is aggregated by `release-gate`, so this **blocks the release**.
