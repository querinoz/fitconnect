# Production dependency triage — result

**Date:** 2026-09-12. **Base:** branch tip `1780b097` (`feat/elite-os-v2`).
Every number below was produced by running `pnpm`, not by reading a matrix.

This closes `AUTONOMOUS_MASTER_TODO.md` item *"Triage the 22 high advisories in the
production tree"* and supersedes the disposition column of
[`DEPENDENCY_SECURITY_MATRIX.md`](DEPENDENCY_SECURITY_MATRIX.md) for the eleven packages
named here.

## Result

| `pnpm audit --prod` | Before | After |
|---|---|---|
| critical | 0 | **0** |
| high | 22 | **5** |
| moderate | 35 | **24** |
| low | 6 | **1** |
| total | 63 | **30** |

Full tree including devDependencies: **104 → 75**.

**Newly introduced advisories: zero**, proven by set-differencing the advisory identifiers
in `pnpm audit --json` before and after — in the production tree *and* in the full tree.
`pnpm install --frozen-lockfile` exits 0, and regenerating the lockfile from the same
manifests reproduces it with a **0-line** diff, so it is deterministic and CI's install
step cannot drift on it.

## Why the base was trustworthy

The lockfile on disk was reproduced byte-for-byte by `pnpm install --lockfile-only` in a
clean container (0-line drift) before anything was changed, and its `content-length`
matches `raw.githubusercontent.com` for the branch tip. The measurement started from the
real tree, not a reconstruction.

## Method

For each advisory: resolve **every** dependency chain from a production importer by walking
`importers.*.dependencies` and `snapshots` in the lockfile directly, rather than trusting
`pnpm audit`'s `paths` (empty in pnpm 9.15.9). Reachability was then decided from the chain
and the consumer's own declared range — which is also what decided whether an override is
safe, since an override that contradicts an upstream **exact pin** is a compatibility
change, not a patch.

## Applied — 10 scoped overrides + 1 range bump

Overrides are scoped by major (`"ws@>=8 <9"`), never bare, so a dev-only older major is
never dragged across a breaking boundary.

### Runtime-reachable — the ones that actually matter

| Package | → | Chain | Fixes |
|---|---|---|---|
| `protobufjs` 7.6.0 | **7.6.6** | `firebase > @firebase/firestore > @grpc/proto-loader` and `posthog-js > @opentelemetry/otlp-transformer` | 1 high, 2 moderate |
| `ws` 8.18.0 | **8.21.3** | `convex > ws` | 1 high, 1 moderate |
| `dompurify` 3.4.5 | **3.4.15** | `posthog-js > dompurify`; posthog declares `^3.3.2`, so 3.4.15 is in range | 6 moderate, 4 low |
| `fflate` 0.4.8 | **0.4.9** | `posthog-js > fflate`, declared `^0.4.8` | 1 moderate |
| `sharp` 0.34.5 | **0.35.4** | `next > sharp` — an **optionalDependency of `next`**, loaded by the server's image optimizer | 2 high |

`dompurify` is the same bug class that justified the MapLibre major: a sanitizer that runs
in the browser on content the app did not author.

`sharp` is the one to read twice. `next@15.5.25` declares `sharp: '^0.34.3 || ^0.35.4'`,
so **0.35.4 is a version Next explicitly supports** — the bump is inside the framework's
own contract, not around it. It moves 25 `@img/sharp-*` platform binaries and
`@img/sharp-libvips-*` 1.2.4 → 1.3.3, and adds two new optional targets
(`freebsd-wasm32`, `webcontainers-wasm32`) plus `@emnapi/runtime`. All optional and
platform-gated.

### Build-time only, patch-level

| Package | → | Chain | Fixes |
|---|---|---|---|
| `fast-uri` 3.1.2 | **3.1.7** | `ajv`, via webpack `schema-utils` and the Prisma CLI | **6 high** |
| `brace-expansion` 5.0.6 | **5.0.9** | `@serwist/next > glob > minimatch`; the 1.x and 2.x copies are dev-only and untouched | 3 high |
| `browserslist` 4.28.2 + 4.28.6 | **4.28.9** | `@serwist/utils`, `@babel/helper-compilation-targets` | 2 high |
| `nanoid` 3.3.12 | **3.3.19** | `postcss > nanoid` | 2 high |
| `baseline-browser-mapping` 2.10.31 | deduped to **2.11.15** | `browserslist` | 1 moderate |
| `@babel/core` 7.29.0 | **7.29.7** | `next > styled-jsx > @babel/core` | 1 low |

`fast-uri` was the single biggest win by count. Its SSRF variants only bite where a parsed
URI is then fetched; here it sits under Ajv doing schema validation at build time.

## Every lockfile line is accounted for

1119 lines, 70 packages, no unexplained entry:

- the 11 targets above;
- `@babel/*` (parser, traverse, types, template, helpers, compat-data, code-frame,
  helper-*) — `@babel/core@7.29.7`'s own pinned internals;
- 25 `@img/sharp-*` + 11 `@img/sharp-libvips-*` + `@emnapi/runtime` — sharp's native
  binaries;
- `caniuse-lite`, `electron-to-chromium`, `node-releases`, `update-browserslist-db` —
  browserslist's data packages;
- `@protobufjs/eventemitter` 1.1.0 → 1.1.1 and `@protobufjs/inquire` dropped — protobufjs
  internals;
- `semver`, `escalade`, `picocolors`, `js-tokens`, `tslib` — dedupe churn from the above;
- `next`, `styled-jsx`, `serwist`, `@serwist/*` — **key rewrites only**. Their lockfile
  keys embed a peer hash that contains the `@babel/core` version; the resolution did not
  change.

Confirmed untouched: `ws@7.5.10`, `brace-expansion@1.1.14` / `@2.1.0`,
`@opentelemetry/core@1.30.1`, and the whole Prisma CLI chain.

## Accepted, with the reason — the 5 remaining highs

Each of these would require overriding a version an upstream maintainer pinned **exactly**.
That is a compatibility change disguised as a security patch, and `pnpm build` /
`pnpm test` are the only things that could tell the difference. None is reachable from the
running server.

| Package | Pinned exactly by | Why accepted |
|---|---|---|
| `postcss` ×2 (`>=8.5.12`, `>=8.5.18`) | `next@15.5.25` → `postcss: 8.4.31` | Build-time CSS parsing of the project's own stylesheets. No untrusted input. Overriding replaces the version Next ships and tests with. |
| `deepmerge-ts` (`>=8.0.0`) | `@prisma/config@7.8.0` → `deepmerge-ts: 7.1.5` | The fix is a **major** bump, inside the package that loads `prisma.config.ts` — the migration path. Highest-risk item on the list for the least reachable bug. |
| `mysql2` (`>=3.22.0`) | `prisma@7.8.0` → `mysql2: 3.15.3` | Auth-plugin downgrade leaking credentials. The product is **Postgres**; no MySQL connection is ever opened. |
| `hono` (`>=4.12.25`) | via `@prisma/dev@0.24.3` | CORS middleware reflecting any Origin. `@prisma/dev` is Prisma's local dev server; the middleware is never mounted. |

The honest correction to the matrix: `mysql2` and `hono` are **in** the production
dependency tree — `@prisma/client` declares `prisma` as an *optionalDependency*, so the CLI
installs alongside the client. They are unreachable **at runtime**, which is not the same
as absent. The real remediation for all four is a `prisma`/`next` minor upgrade when
upstream ships one, not a local override.

### Measured, and rejected

Overriding all four *does* reach **0 production advisories, of any severity**, with zero
newly introduced, for 437 more lockfile lines. It was measured and not applied: with
`pnpm build` unavailable here, deviating from two upstream exact pins is an unvalidated
change, and an unvalidated change presented as a fix is the thing this project's rules
exist to prevent. The numbers are recorded so the decision can be revisited in one commit
now that a build runs — `postcss` first, `deepmerge-ts` last.

## The remaining critical is a false positive

`vitest <3.2.6` (`CVE-2026-47429`) is the only critical anywhere, and it is dev-only. It
requires the **Vitest UI server** to be listening. Stronger than "CI does not start it":
**`@vitest/ui` is not installed at all** — it appears in the lockfile only inside vitest's
`peerDependencies` block, marked `optional: true`, with no snapshot entry. The vulnerable
code is not in the tree, and no workspace script passes `--ui` (every one is `vitest run`).

Forcing the 3.x line was measured and **rejected**: `vitest@>=3 <4 → ^3.2.6` resolves
3.2.4 → 3.2.7, costs 154 lockfile lines, **adds 3 new high advisories**, and does not clear
the critical, because `vitest@2.1.9` remains for the six packages that declare `^2.1.9`.
The only real fix is the vitest 2 → 3 major across those six packages, which needs the test
suite to run.

## Status

| | |
|---|---|
| `pnpm audit --audit-level critical --prod` | **exits 0** — VERIFIED |
| `pnpm install --frozen-lockfile` | **exits 0** — VERIFIED |
| Lockfile determinism | 0-line drift on regeneration — VERIFIED |
| No new advisories | set-difference, prod and full tree — VERIFIED |
| `pnpm build` against this lockfile | **NOT RUN** — no repository source in this environment |
| `pnpm test` against this lockfile | **NOT RUN** |

`sharp` is the change a build must actually exercise: a native module crossing a minor,
used by the server's image optimizer. A broken install surfaces immediately as a failed
`pnpm install` or a 500 from `/_next/image`, both caught by `Production build` and
`Playwright E2E`.
