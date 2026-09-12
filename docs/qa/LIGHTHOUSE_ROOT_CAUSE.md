# Lighthouse: the SEO miss was metadata rendered outside `<head>`

**Date:** 2026-09-12. Diagnosed by running Lighthouse, not by reading the thresholds.

## Why a real audit was possible at all

The CI job's log needs sign-in, and `fitconnect-phi.vercel.app` is refused by this session's
egress policy (403 on CONNECT). But the Vercel MCP can fetch a deployment URL: the live
landing page came back as 108,679 characters of rendered HTML, which was served on localhost
and audited with Lighthouse 12 against Chromium, mobile emulation, 390×844.

**What that makes valid, and what it does not.** The snapshot is served without its
stylesheets, so audits that read computed styles — `color-contrast`, `target-size` — are
measuring unstyled defaults and their results are **not** usable. Audits that read the DOM —
`meta-description`, `heading-order` — are exactly as valid as on the real page. Only the
second kind is relied on below. The snapshot is also the **older production deployment**, not
`1780b097`, so absolute scores differ from CI; the deltas from a DOM-level change do not.

## SEO: 91 → 100, one cause

Single failing audit: **`meta-description` — "Document does not have a meta description"**.

The page *has* one. `generateMetadata()` in `app/layout.tsx` returns a title, description,
canonical, seven hreflang alternates, Open Graph and Twitter cards, and all of it is in the
document. The problem is *where*:

| | character offset |
|---|---|
| `</head>` closes | **3,358** |
| `<meta name="description">` appears | **89,611** |

**28 metadata tags are rendered inside `<body>`.** Everything inside `<head>` is charset,
viewport, the CSS and JS links, `next-size-adjust`, `theme-color`, `color-scheme`, and two
inline scripts. Stranded outside it: the description, `rel="canonical"`, `robots`, the web
manifest, all seven `hreflang` alternates, the entire `og:*` block and the entire
`twitter:*` block.

### The cause

`app/layout.tsx` renders its own `<head>` element to hold two inline scripts. In the App
Router that breaks the Metadata API: Next streams the `generateMetadata()` tags into the
document, and a hand-written `<head>` closes the element before they arrive, so they land in
`<body>`.

### Why this is worth more than three Lighthouse points

Lighthouse is the messenger. A crawler or social unfurler that parses only `<head>` — which
is most of them — saw **no description, no canonical URL, and no Open Graph image** for the
landing page. That is a live SEO and link-preview defect on the deployed site, independent of
any gate.

### The fix, and the measurement

Remove the manual `<head>`; move both inline scripts to the top of `<body>`. Each only touches
`document.documentElement` (`dataset.motion`, `dataset.colorMode`), and as the first children
of `<body>` they still run before any content paints, so there is no flash of unreduced
motion. The dev-only service-worker cleanup has no ordering requirement at all.

Measured by relocating exactly those tags into `<head>` in the served HTML and re-auditing:

| | SEO |
|---|---|
| as deployed | **91** |
| metadata inside `<head>` | **100** |

`meta-description` was the only audit whose result changed. CI reports SEO **92** against a
threshold of **95**; the same single audit is the deficit, and this clears it outright.

## Accessibility: the footer skipped a heading level

Failing DOM audit: **`heading-order` — "Heading elements are not in a sequentially-descending
order"**, weight 3, one node: `<h4 class="font-semibold mb-3 text-ink-100 text-sm">`.

Document heading sequence:

```
h1 h2 h1 h2 h2 h3 h3 h3 h3 h3 h3 h2 h2 h2 h4 h4 h4 h4
                                          ^^^^^^^^^^^^ footer columns
```

The four footer column titles — Produto, Empresa, Legal, Constrói connosco — are `<h4>`
following an `<h2>`. That skips `h3`.

`components/footer.tsx` becomes `<h3>` in those four places. **Nothing moves on screen:** the
visual size comes from `font-semibold mb-3 text-ink-100 text-sm`, which is untouched. The
heading level is the semantic outline, and the outline was wrong.

Measured: accessibility **91 → 93** on the snapshot, `heading-order` gone.

### What this means for CI's 89, said carefully

CI reports a11y **89** against a threshold of **90**. The snapshot starts at 91, so the
absolute numbers are not the same page. The `heading-order` audit carries weight 3 and
removing it moved the snapshot by **+2**, which would put CI at **91** — clearing 90 **by one
point**.

That is a pass, and it is thin. It is reported as a projection, not a result. The only honest
confirmation is the Lighthouse job itself on the next run.

## Two audits deliberately not touched

Both still fail, and both are reported rather than papered over:

- **`color-contrast`**, weight 7, 52 nodes — `text-eos-on-surface-muted`, 10px
  `text-eos-voltline`, and similar small text on translucent surfaces. Fixing it means moving
  Elite OS design tokens, which are canonical and out of scope for a gate fix. It also cannot
  be measured from a snapshot with no CSS.
- **`target-size`**, weight 7, 16 footer links — measured at 17px tall against a 24px
  requirement **in the unstyled snapshot**, so even that number is unreliable. A padding
  change (`inline-block py-1`) is the likely fix and was deliberately **not** applied: it
  could not be validated here, and it changes footer layout.

Neither is needed to clear the 90 threshold. Both are real and should be scheduled — the
contrast one especially, since 52 nodes is a genuine readability problem, not a scoring
artifact.

## Performance stays at 58 against 84

Untouched, and not addressable from a DOM snapshot. A −26 gap is a performance programme —
bundle splitting, image strategy, font loading, the motion work on the landing page — not a
patch. It is the reason `lighthouse-mobile` may still be red after these two fixes, and the
reason the release decision below is not "ready".

## Also found, not fixed

All seven `hreflang` alternates resolve to the **same** URL:

```html
<link rel="alternate" hrefLang="en" href="https://fitconnect-phi.vercel.app"/>
<link rel="alternate" hrefLang="pt" href="https://fitconnect-phi.vercel.app"/>
…
```

`layout.tsx` builds them as `${SITE_URL}?lang=${code}`; the query string is gone by the time
they render. `hreflang` annotations pointing at one URL tell a search engine nothing, so the
multilingual signalling does not work. Left alone because the fix needs the i18n routing
intent, which is a product decision — but it should not sit unrecorded.

And `app/robots.ts` hardcodes `sitemap: "https://fitconnect.querinoz.dev/sitemap.xml"` while
every other URL derives from `NEXT_PUBLIC_APP_URL ?? https://fitconnect-phi.vercel.app`. One
of those two hosts is wrong.

## Closure pass (2026-09-12)

The manual `<head>` removal was **necessary but not sufficient**. On a real `next start` build,
async `generateMetadata()` plus `await cookies()`/`headers()` in the root layout still streamed
description/canonical/OG into `<body>` (`</head>` at char 2480, description at 99189).

**Fix that actually put tags in `<head>`:** static `export const metadata` and a synchronous
root layout (no Next request APIs). Served HTML: `</head>` at 5241, description at 2757.

Live Lighthouse 12 on that build (390×844): **Performance 64 / Accessibility 90 / Best Practices 100 / SEO 100**. LCP **6232 ms**, CLS **0.001**. Performance still **FAIL** vs 84.

## Status

| | |
|---|---|
| SEO cause identified | **PASS** |
| SEO on real build | **PASS** — 100 |
| a11y heading-order on real build | **PASS** — 90 (footer `h3`) |
| `pnpm build` / typecheck | **PASS** |
| performance ≥ 84 | **FAIL** — 64 |
