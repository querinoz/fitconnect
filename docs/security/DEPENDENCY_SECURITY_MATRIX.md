# Dependency Security Matrix

**Measured:** 2026-09-10, updated 2026-09-11, `pnpm audit` (pnpm 9.15.9) against the repository's own
`pnpm-lock.yaml`, in a container that reproduces the lockfile byte-for-byte
(`pnpm install --lockfile-only` with no change produced a **0-line diff**, so nothing
below is environment drift).

Raw counts are not a security posture. Every row is classified by whether the package
ships, whether it is declared or pulled in, and whether the vulnerable code path is
reachable from FitConnect's own code.

## Totals

| Tree | Critical | High | Moderate | Low |
|---|---|---|---|---|
| Production (`--prod`) — **before** any fix | 3 | 25 | 37 | 6 |
| Production — after the Next fix | 1 | 22 | 35 | 6 |
| Production — **after the MapLibre fix** | **0** | 22 | 35 | 6 |
| Full tree (prod + dev) — before | 5 | 44 | — | — |
| Full tree — after | 2 | 40 | 59 | 11 |

Only **two** packages with a high-or-critical advisory are declared as direct production
dependencies: `next` and `maplibre-gl`. Everything else is transitive, or dev-only.

## Fixed in this session

| Package | Was | Now | Severity | Advisory | Reachable? | Validation |
|---|---|---|---|---|---|---|
| `next` | 15.5.23 | **15.5.25** | critical | `CVE-2026-75604` — unauthenticated RCE (Windows-hosted) | Yes — the app is Next | `pnpm audit --prod` critical 3 → 1, measured |
| `next` | 15.5.23 | **15.5.25** | critical | `GHSA-2xp9-vwfh-vxw4` — unauthenticated RCE in the Image Optimization API (AVIF) | Yes — `next/image` is in use | same run |

**How.** `pnpm.overrides.next` in the root `package.json` raised from `^15.1.0` to
`^15.5.24`, then `pnpm install --lockfile-only`. One line of `package.json`, 156 lines of
lockfile, and every one of those lines is `next`, `@next/env`, the eight
`@next/swc-*` platform binaries, and a `@serwist/next` re-key. `apps/web/package.json`
is untouched.

**Why the override and not `pnpm update next`.** Measured alternatives on the same inputs:

| Approach | Lockfile diff | Blast radius |
|---|---|---|
| `pnpm up next@15.5.24` | 781 lines | react, react-dom, webpack, babel, typescript, playwright, postcss, maplibre transitives |
| `pnpm --filter @fitconnect/web update next` | 375 lines | react 19.2.8, webpack, typescript 5.9.3, playwright 1.60.0, … |
| **`pnpm.overrides.next` + `--lockfile-only`** | **156 lines** | `next` and its own artifacts only |

The wide diffs are not a pnpm defect and not noise: `pnpm update` re-resolves the whole
importer to the newest versions its `^` ranges allow, and those ranges have been free to
float since the lockfile was last written. The override pins one package without
re-baselining the rest — and it reaches transitive consumers (`@serwist/next`) that a
per-app bump would miss.

**Still unverified:** `pnpm build` and the test suite have NOT been run against 15.5.25.
No shell on the repository this session. It is a patch release inside 15.5.x, but treat
CI as the proof, not this table.

## Open — production, direct

**None.** Both direct production dependencies that carried a critical are fixed.

### `maplibre-gl` 5.24.0 → 6.9.0 — fixed 2026-09-11

`CVE-2026-85061`, XSS sanitizer bypass in `DOM.sanitize()`. Fixed in `>=6.4.1`; there is no
5.x patch, because 5.24.0 is the last 5.x release.

This one is worth reading, because the first reachability verdict was wrong.

**First pass (session 2) — "not reachable".** `DOM.sanitize()` is what MapLibre calls when
it renders HTML strings into `Popup` and HTML-content `Marker`. The only map surface,
`apps/web/components/map/fit-connect-map.tsx`, imports exactly:

```ts
import Map, { Layer, Marker, NavigationControl, Source, type MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
```

No `Popup`, no `setHTML`, no `dangerouslySetInnerHTML`, no direct `maplibre-gl` import
anywhere, and react-map-gl's `Marker` renders React children rather than parsing an HTML
string. All true — and incomplete. It only traced the paths FitConnect's **own content**
travels.

**Second pass (session 3) — reachable.** The same file contains:

```tsx
<Map mapStyle={mapStyle} attributionControl={{ compact: true }} ... >
```

and `mapStyle = getMapStyleUrl()` → `https://tiles.openfreemap.org/styles/dark`, overridable
via `NEXT_PUBLIC_MAP_STYLE_URL`. MapLibre's attribution control renders the `attribution`
HTML carried inside a style's sources, through the very sanitizer the CVE bypasses:

```
third-party style JSON → source.attribution → AttributionControl → DOM.sanitize() → DOM
```

Not reachable from FitConnect's content; reachable through the style host. A supply-chain
path via a free, community-run tile service — lower likelihood than a self-inflicted XSS,
not zero. Disabling attribution would have cut the path but broken the tile licence, so the
answer was to remove the vulnerable code.

**Inclusion analysis.** Direct dependency in `apps/web/package.json`, and also an optional
peer of `react-map-gl`. One importer; five other map surfaces reach it only through
`next/dynamic`, every one with `ssr: false`, every file `"use client"` → it lands in a lazily
loaded **client** chunk and never executes server-side.

**What changed.** `maplibre-gl ^5.6.0` → `^6.4.1` (resolves 6.9.0) and
`react-map-gl ^8.1.1` → `^8.1.3`. 219 lockfile lines, every one inside the map stack;
`next` untouched; no peer warnings (react-map-gl's `maplibre-gl` peer is an optional
`>=1.13.0`).

**Validation.** `pnpm audit --audit-level critical --prod` exits 0. A set-difference of the
JSON advisory output before and after confirms **zero new advisories introduced** — the only
delta is the maplibre critical disappearing.

**Still NOT RUN:** `pnpm build` and a map visual smoke. 5 → 6 is a major. The app's maplibre
surface is small — declarative react-map-gl components plus `MapRef.getMap().resize()` and
`flyTo()` — but that is an argument about blast radius, not evidence that it builds.

## Open — production, transitive

None of these are declared anywhere in the workspace; they arrive through other packages.
The fix for each is an upgrade of the parent, or a `pnpm.overrides` entry once the direct
work above is settled.

| Package | Severity | Advisories | Fixed in | Notes on reachability |
|---|---|---|---|---|
| `fast-uri` | high ×6 | `CVE-2026-16221`, `-18446`, `-75975`, `-75899`, `-76172`, `-13676` | `>=3.1.6` | URI parsing behind Ajv/schema validation. SSRF variants matter only where a parsed URI is then fetched. Highest-count item in the tree; triage first. |
| `brace-expansion` | high ×3 | `CVE-2026-13149`, `-14257`, `-69152` | `>=1.1.17` / `>=2.1.2` / `>=5.0.9` | Glob expansion, DoS class. Reached only with attacker-controlled glob patterns. |
| `sharp` | high ×2 | `GHSA-f88m-g3jw-g9cj`, `GHSA-rgj7-g3m4-5g8c` | `>=0.35.4` | Declared as a **root devDependency** but pulled into the production tree by Next's image optimization — so it does ship. libvips/libheif image parsing on user-supplied images. Treat as production. |
| `postcss` | high ×2 | `CVE-2026-45623`, `CVE-2026-73646` | `>=8.5.18` | Build-time CSS. Needs attacker-controlled CSS with a crafted `sourceMappingURL`. |
| `nanoid` | high ×2 | `CVE-2026-67214`, `CVE-2026-67213` | `>=3.3.18` | Infinite-loop DoS with non-positive `size`. Not reached unless size is caller-controlled. |
| `browserslist` | high ×2 | `CVE-2026-73089`, `CVE-2026-73088` | `>=4.28.7` | Build-time target resolution. |
| `ws` | high | `CVE-2026-48779` | `>=8.21.0` | WebSocket memory exhaustion. Realtime is BroadcastChannel today, so this is likely inert — confirm before deprioritising. |
| `hono` | high | `CVE-2026-54290` | `>=4.12.25` | CORS middleware reflecting any Origin with credentials. Transitive; FitConnect does not use Hono directly, so the middleware is not mounted. |
| `mysql2` | high | `GHSA-3f6p-5ww8-9rcr` | `>=3.22.0` | Auth-plugin downgrade leaking plaintext credentials. **The product is Postgres** — no MySQL connection exists, so unreachable. |
| `protobufjs` | high | `CVE-2026-48712` | `>=7.6.1` | DoS via unbounded `Any` expansion during JSON conversion. |
| `deepmerge-ts` | high | `CVE-2026-40345` | `>=8.0.0` | Stack exhaustion on recursive object graphs. |

## Open — development only

These never reach a user. They still matter for the integrity of the build machine and CI.

| Package | Severity | Advisory | Fixed in | Notes |
|---|---|---|---|---|
| `vitest` | **critical** | `CVE-2026-47429` | `>=3.2.6` | Arbitrary file read/execute **only while the Vitest UI server is listening**. CI runs `vitest run`, which does not start the UI. Real risk is a developer running `vitest --ui` on an untrusted network. |
| `undici` | high ×3 | `CVE-2026-1526`, `-2229`, `-12151` | `>=6.27.0` | WebSocket client DoS. |
| `extract-zip` | high ×2 | `CVE-2026-56876`, `CVE-2026-19693` | *no fix published* | Symlink path traversal. Arrives via Playwright's browser download. No patched version exists — track upstream. |
| `axios` | high | `CVE-2026-67320` | `>=1.18.0` | Proxy inherited after interceptor config cloning. |
| `vite` | high | `CVE-2026-53571` | `>=6.4.3` | `server.fs.deny` bypass on Windows alternate paths. Dev server only — but this repository is developed on Windows. |
| `tmp` | high | `CVE-2026-44705` | `>=0.2.6` | Path traversal via unsanitised prefix/postfix. |
| `js-yaml` | high | `CVE-2026-84375` | `>=4.3.2` | CPU exhaustion on empty merge sources. |
| `form-data` | high | `CVE-2026-12143` | `>=4.0.6` | CRLF injection in multipart field names. |
| `underscore` | high | `CVE-2026-27601` | `>=1.13.8` | Unlimited recursion in `_.flatten` / `_.isEqual`. |

## How the CI gate uses this

`.github/workflows/ci.yml`, job `security-audit`:

- **Blocking:** `pnpm audit --audit-level critical --prod`. As of 2026-09-11 this **passes**
  — zero criticals in the production tree. It is a real gate now, not a decorative one, so
  the next critical that lands will stop the build.
- **Reported, not blocking:** `pnpm audit --audit-level high`. 22 production highs need
  per-package triage, not one switch. They are printed so they cannot hide.
- **Blocking:** semgrep. It was running under `continue-on-error` here while `sast.yml`
  only covers pull requests and `main`, so feature branches had no SAST gate at all.

Before this session both audit steps ran under `continue-on-error: true` while
`release-gate` counted the job as a required PASS. That is how 5 criticals and 44 highs
stayed invisible. Do not re-add it, and do not lower `--audit-level` to get green.

## Re-running this

```bash
pnpm audit --json --prod > prod.json     # what ships
pnpm audit --json        > all.json      # prod + dev
```

Classify each finding by: declared directly or transitive · production tree or dev ·
whether FitConnect's own code reaches the vulnerable call. A count on its own says
nothing.
