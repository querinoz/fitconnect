# apps/mobile Dependency Audit

**Date:** 2026-09-10  
**Branch:** `feat/elite-os-v2`  
**HEAD:** `c5bba4c`  
**Deletion performed:** **NO**  
**Auditor scope:** Discover → Trace → Map → Classify → Verify → Recommend  

---

## Executive Summary

`apps/mobile` (Expo / React Native / `@fitconnect/mobile`) is **not a production surface**. Production mobile is Jetpack Compose under `android/` (ADR-005).

| Fact | Evidence |
|------|----------|
| Package `@fitconnect/mobile` | **Absent** from `pnpm m ls` workspace |
| Directory on disk | **`apps/mobile` does not exist** (`Test-Path` → False) |
| Git HEAD content | Only **3 orphan logo PNGs** still tracked under `apps/mobile/assets/brand/` (working tree already deleted them) |
| Full Expo tree | **Deleted** in `efec794` (2026-09-08), **not** `git mv`'d into `_archive/` |
| Recoverable snapshot | `efec794~1` = `251c62a` · **66 files** |
| Archive folder | `_archive/apps-mobile-frozen-adr005/` exists untracked with **1 leftover logo**; no `package.json` |
| Turbo / CI active filter | **None** requiring the package (stale `!@fitconnect/mobile` filter already fixed) |

**Recommendation for the target as a product/package:** **ARCHIVE** (already largely archived by deletion; complete stub cleanup + docs sync in a later authorized pass).

**Deletion safe (remaining stub assets only):** **YES** — HIGH confidence — **but not executed in this audit.**

---

## Current Architecture

```text
FitConnect Zenith
│
├── Web (production)
│   └── apps/web                    Next.js · @fitconnect/web
│
├── Android phone (production)
│   └── android/                    Kotlin · Jetpack Compose
│       ├── app / athlete / coach / …
│
├── Wear (production track)
│   └── android/wear
│
├── Shared TS packages
│   └── packages/*                  types, utils, design-tokens, api-client, …
│
└── Legacy Expo (non-operational)
    ├── apps/mobile                 STUB ONLY in git (3 logos) / ABSENT on disk
    ├── _archive/README.md          Documents removal
    └── git history @ 251c62a       Full Expo tree recoverable
```

`pnpm-workspace.yaml` includes `apps/*`, so a restored `apps/mobile/package.json` would **re-enter** the workspace automatically. That is a risk if someone reintroduces the tree without ADR review — **do not reintroduce Expo**.

---

## apps/mobile Purpose

| Era | Role |
|-----|------|
| Pre ADR-005 | Expo 52 preview UI (~demo screens, mock data, EN/PT) |
| ADR-005 (2026-08-07) | **Frozen Path A** — no new features; native Android is production |
| `efec794` (2026-09-08) | Source tree **deleted** from working tree; `_archive/README.md` added |
| Today (2026-09-10) | No runnable Expo app; leftover brand assets + documentation debt |

ADR-005 salvage list (i18n shape, readiness, screen map, design intent) was **not** a mandate to keep Expo code. Readiness already lives in `@fitconnect/utils`.

---

## Workspace Status

| Check | Result |
|-------|--------|
| `pnpm-workspace.yaml` | `apps/*`, `packages/*` |
| `@fitconnect/mobile` in `pnpm m ls` | **NO** |
| `apps/mobile/package.json` on disk | **NO** |
| Would auto-include if package.json restored? | **YES** (`apps/*`) |

**Classification:** workspace usage = **NO** (implicit glob only; no package present).

---

## Turbo Status

| File | Finding |
|------|---------|
| `turbo.json` | No `@fitconnect/mobile` / `apps/mobile` references |
| Root `package.json` `typecheck` | `turbo typecheck` — no mobile filter |
| Historical CI failure | `turbo typecheck --filter=!@fitconnect/mobile` → Turbo 2.x fails when package missing |

**Classification:** Turbo dependency = **NO** (active). Stale negation filter was a CI footgun, now comments-only.

---

## CI/CD References

| Workflow | Reference | Class |
|----------|-----------|-------|
| `.github/workflows/ci.yml` | Comments: Expo archived; do not negate missing package; mobile tests no longer gate | **STALE comment / ACTIVE correct behavior** |
| `.github/workflows/eas-preview.yml` | Disabled; `workflow_dispatch` job **exits 1** with archive notice | **DEAD / INTENTIONAL FAIL** — optional cleanup later |
| `.github/workflows/android.yml` | Gradle Android only | **ACTIVE** — unrelated to Expo |
| Other workflows | No Expo build | — |

**CI dependency on `apps/mobile` content:** **NO**.

---

## Script References

| Script / name | Meaning | Expo? |
|---------------|---------|-------|
| `pnpm smoke:mobile` | `scripts/mobile-pwa-check.mjs` against web `:3001` | **NO** — PWA smoke |
| `pnpm audit:mobile` | `@fitconnect/web` audit:mobile | **NO** |
| `pnpm lighthouse:mobile` | Lighthouse vs web | **NO** |
| `pnpm android:qr` | Native distribution | **NO** |
| `scripts/` grep for `apps/mobile` / `expo start` / `eas build` | **None found** | — |
| Former `pnpm dev:mobile` | Removed per duplicate-app resolution doc | **DEAD** |

Naming collision: “mobile” in root scripts usually means **web mobile viewport / PWA**, not Expo.

---

## Import Graph

Searches (repo-wide patterns):

- `@fitconnect/mobile`
- `apps/mobile/`
- `../../apps/mobile`
- package imports from deleted Expo tree

| Consumer | Imports `apps/mobile`? |
|----------|------------------------|
| `apps/web` | **NO** (has own `components/mobile/*` = web PWA UI) |
| `packages/*` | **NO** |
| `android/` | **NO** (Kotlin; no TS import path) |
| Tests outside Expo | **NO** |

**Production / runtime import dependency:** **NO**.

---

## Shared Package Dependencies

Historical `@fitconnect/mobile` depended on workspace packages:

`config`, `maps`, `realtime-client`, `types`, `utils`

Those packages remain for **web** (and tooling). They do **not** depend back on `apps/mobile`.

| Item | Status |
|------|--------|
| `lib/readiness.ts` (Expo) | Was re-export of `@fitconnect/utils` — **already migrated** |
| Tokens | Canonical in `packages/design-tokens` → Kotlin pipeline |
| Types / API client | Live in `packages/*` for web |

**Shared reverse dependency on `apps/mobile`:** **NO**.

---

## Asset Dependencies

| Asset | Status |
|-------|--------|
| HEAD: `apps/mobile/assets/brand/logo{,@2x,@3x}.png` | Tracked in git; **deleted in working tree**; **zero code references** found |
| Canonical brand | `brand-sources/`, `apps/web/public/brand/`, Android vector/mipmap drawables |
| `_archive/.../assets/brand/logo.png` | Untracked leftover (1 file) — not wired |

**Asset dependency for production:** **NO**.

Stub logos are **REMOVE candidates** (authorized later), not KEEP.

---

## Test Dependencies

| Layer | Depends on `apps/mobile`? |
|-------|---------------------------|
| Web Vitest / Playwright | **NO** |
| Package tests | **NO** |
| Android unit / androidTest | **NO** |
| Historical Expo vitest (`__tests__`, `lib/readiness.test.ts`) | Deleted with tree; recoverable from git only |

**Test dependency:** **NO**.

---

## Documentation References

| Kind | Examples | Action (later) |
|------|----------|----------------|
| **Active / correct** | `android/README.md`, `_archive/README.md`, ADR-005, many QA gate docs marking Expo frozen/removed | Keep; lightly refresh “frozen” → “removed from tree” |
| **Stale / incorrect** | Root `README.md` still lists Expo under `apps/mobile/` as frozen present path; ADR-010 open item “kill or revive”; CLAUDE.md deferred note | **Update docs** in a docs-only follow-up |
| **Historical** | `docs/archive/**`, phase-00 reports, MOBILE_DUPLICATE_APP_RESOLUTION | Keep as history |

This audit **does not delete** documentation.

---

## Environment References

| Pattern | `.env.example` / root env templates | Consumer |
|---------|--------------------------------------|----------|
| `EXPO_*` | **Not found** | — |
| `EAS_*` | **Not found** | — |
| `REACT_NATIVE_*` | **Not found** | — |

Android/Firebase/Supabase vars are for **Compose / web**, not Expo.

**Env dependency on Expo:** **NO** (names only; no secrets printed).

---

## Dependency Analysis (lockfile)

| Package | Classification |
|---------|----------------|
| `expo`, `expo-router`, `react-native`, `eas-cli` as workspace consumers | **MOBILE-ONLY historically** |
| `pnpm why expo` / `pnpm why react-native` (current) | **No why-output** → not required by current workspace graph |
| Remaining web/react deps | **SHARED** (Next.js) |

Expo SDK packages are **not** required by the live product graph.

---

## Build Graph

| Product | Build command / path | Status |
|---------|----------------------|--------|
| Web | `pnpm build` / `@fitconnect/web` | **ACTIVE** |
| Android APK | `android/` Gradle `:app:assembleDebug` | **ACTIVE** |
| Wear | `:wear:assembleDebug` | **ACTIVE** |
| Expo / EAS | `eas-preview.yml` disabled fail-notice | **INACTIVE** |
| `@fitconnect/mobile` | No package | **ABSENT** |

---

## Git History

| Event | Commit / note |
|-------|----------------|
| Expo existed as full app | Pre-`efec794` · 66 files at `251c62a` |
| Tree deleted (+ archive README) | `efec794` — **delete**, not move |
| Docs claimed `git mv` → `_archive/...` | **Incomplete vs claim** — archive folder empty of source |
| Brand logos left behind | Still in HEAD index until WT delete |
| Recovery | `git checkout 251c62a -- apps/mobile` (do **not** without ADR) |

---

## Migration Gap Analysis

Expo was a **UI preview** (ADR-005), not feature-complete product. Matrix vs Compose:

| Feature | Old Expo | Current Android | Shared package | Missing vs Expo intent |
| ------- | -------: | --------------: | -------------: | ---------------------- |
| Auth | Demo signin/signup screens | Compose `AuthScreen` + ONE LOGIN | Session/API on server | Expo path obsolete |
| Feed | Athlete community screen | `athlete/ui/feed` | Community module | Superseded |
| Profile | Athlete/coach profile | Profile + `ActiveExperienceSwitcher` | — | Superseded |
| Athlete shell | Expo Router tabs | AthleteOsApp Zenith nav | — | Superseded |
| Coach shell | Expo coach routes | CoachOsApp | — | Superseded |
| Telemetry | Thin / mock | `telemetry` module + screens | — | Beyond Expo |
| Maps | Expo map routes | MapLibre + geo | `@fitconnect/maps` (web) | Superseded on Android |
| Sports | Programs list | `sports` / programs UI | — | Superseded |
| Notifications | `expo-notifications` stub | Android notifications UI + FCM path | — | Native > Expo stub |
| Realtime | `use-mobile-channel` | Android realtime / product link | `realtime-client` (TS) | Expo hook not needed |
| Offline | MMKV cache banner | Android offline queue + banners | — | Superseded |
| Wear | **Impossible in Expo** | `android/wear` | elite-core | Expo gap closed by native |
| Readiness logic | Re-export utils | Android readiness UI + utils for web | `@fitconnect/utils` | **Migrated** |
| i18n | EN/PT thin dict | Android string resources (+ web i18n) | — | No Expo dict to keep |
| Health Connect | Stub files | First-class Android | — | Expo stubs obsolete |

**Migration gaps blocking ARCHIVE/REMOVE of stub:** **NO** (product features live on Compose; Expo code was not the source of truth).

Residual **documentation** gaps (README still says “frozen present”) are not code migration gaps.

---

## Architecture Gap

| Concern | Verdict |
|---------|---------|
| Business logic trapped in `apps/mobile` | **NO** — tree gone; readiness already in utils |
| UI that should move to packages | **NO** — demo UI; Compose redesigned |
| Need to revive Expo for production | **NO** — contradicts ADR-005 / Wear requirements |

---

## File Classification

### Inventory (current)

| Path | On disk | In HEAD | Class | Confidence | Notes |
|------|---------|---------|-------|------------|-------|
| `apps/mobile/` (directory) | Absent | Partial tree | **ARCHIVE** | HIGH | Product gone |
| `apps/mobile/assets/brand/logo.png` | Absent (WT deleted) | Tracked | **REMOVE** | HIGH | Orphan; brand elsewhere |
| `apps/mobile/assets/brand/logo@2x.png` | Absent | Tracked | **REMOVE** | HIGH | Orphan |
| `apps/mobile/assets/brand/logo@3x.png` | Absent | Tracked | **REMOVE** | HIGH | Orphan |
| `_archive/README.md` | Present | Tracked | **KEEP** | HIGH | Archive contract |
| `_archive/apps-mobile-frozen-adr005/**` | Partial empty + 1 logo | Untracked | **ARCHIVE** / cleanup | MEDIUM | Incomplete archive; source in git |
| Historical 66-file Expo tree | Absent | At `251c62a` | **ARCHIVE** | HIGH | Recover via git only |

### Historical paths (pre-delete) — summary class

All former `app/`, `components/`, `lib/`, `hooks/`, configs, tests: **ARCHIVE** (git history). None are **KEEP** for production. None require **MIGRATE** before stub removal (readiness already in utils). Optional future archaeology of i18n copy = **UNKNOWN/LOW value**, not a REMOVE blocker.

---

## KEEP

- `_archive/README.md` — documents non-revival policy  
- Production surfaces: `android/`, `apps/web/`, `packages/*` (not under `apps/mobile`)  
- ADR-005 and related architecture docs (update wording later)

## MIGRATE

- **None required** from remaining `apps/mobile` stubs  
- Already done: readiness → `@fitconnect/utils`  
- Optional later: sync stale README/ADR-010 wording (docs-only, not code migrate)

## REMOVE

*(Authorized second execution only)*

- `apps/mobile/assets/brand/logo.png`  
- `apps/mobile/assets/brand/logo@2x.png`  
- `apps/mobile/assets/brand/logo@3x.png`  
- Optionally empty `apps/mobile/` tree after last files gone  
- Optionally disable/delete `eas-preview.yml` or leave as tombstone  
- Optionally remove empty `_archive/apps-mobile-frozen-adr005` leftover logo **or** populate archive via intentional `git checkout` of historical tree into `_archive/` (prefer explicit archive commit over silent delete of history)

## ARCHIVE

- Overall product decision for Expo Path A  
- Full source: retain in git at `251c62a` / pre-`efec794`  
- `_archive/README.md` policy  

## UNKNOWN

- Whether product owners want a **populated** `_archive/apps-mobile-frozen-adr005` snapshot checked into git for offline browsing (vs history-only) — **UNKNOWN preference**, not a production dependency  

---

## Confidence Levels

| Decision | Confidence | Why |
|----------|------------|-----|
| No production/runtime dependency | **HIGH** | No package, no imports, no builds |
| No CI/workspace/test/shared/asset runtime dep | **HIGH** | Verified greps + `pnpm m ls` + workflows |
| Recommend **ARCHIVE** (not KEEP Expo) | **HIGH** | ADR-005 + Compose production |
| Stub logos **REMOVE**-safe | **HIGH** | Zero references; brand relocated |
| Whole-tree already deleted safely | **HIGH** | `efec794` shipped; CI green without package |
| Docs still say “frozen present” | **HIGH** (docs debt) | README paths outdated |

No **REMOVE** recommendation is made at **LOW** confidence.

---

## Risks

1. **Reintroduce Expo under `apps/*`** → Turbo/workspace auto-discovery resurrects `@fitconnect/mobile` and CI pain.  
2. **Stale docs** → engineers may think Expo is still a frozen sibling app.  
3. **Incomplete archive folder** vs docs that claimed `git mv` — recovery confusion.  
4. **Script name `smoke:mobile`** → mistaken Expo association (actually PWA).  
5. **Deleting git history** — never rewrite; archive ≠ `git filter-repo`.

---

## Recommended Next Step

1. **Do not restore Expo.**  
2. Authorize a **docs + stub cleanup** PR:  
   - `git rm` the three logo stubs (if still tracked)  
   - Update root `README.md` / ADR-010 checkbox to “removed from tree; history at `251c62a`”  
   - Decide whether to materialize full tree under `_archive/apps-mobile-frozen-adr005` from `251c62a` **or** keep history-only  
3. Leave `eas-preview.yml` as fail tombstone **or** delete in same authorized PR.  
4. Re-run this audit checklist after cleanup.

---

## Deletion Preconditions

Before any `REMOVE` execution:

- [x] No production dependency (this audit)  
- [x] No runtime import dependency  
- [x] No CI job consuming Expo sources  
- [x] No workspace package present  
- [x] No external tests importing path  
- [x] No shared package reverse dependency  
- [x] Brand assets exist outside `apps/mobile`  
- [x] Migration of readiness confirmed in `@fitconnect/utils`  
- [ ] **Explicit human authorization** for deletion/cleanup PR  
- [ ] Docs updated in same change set  
- [ ] No force-push / history rewrite  

**DELETION PERFORMED THIS RUN:** **NO**

---

## Package.json snapshot (historical)

Recovered from `efec794^` / `251c62a`:

- **name:** `@fitconnect/mobile`  
- **version:** `0.1.0`  
- **private:** true  
- **main:** `expo-router/entry`  
- **scripts:** `expo start`, `tsc`, `vitest`  
- **deps:** Expo 52, RN 0.76, expo-router 4, workspace packages (`utils`, `types`, …)  

---

## Final decision rule application

Whole-directory operational role fails every KEEP test. Incomplete stub fails MIGRATE. Full source already gone from tree → **ARCHIVE**. Remaining tracked logos qualify for **REMOVE** in a later authorized pass with **HIGH** confidence.
