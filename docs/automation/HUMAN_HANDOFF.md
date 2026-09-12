# FitConnect Human Handoff

**Rewritten 2026-09-12 after Cursor recovered the shell.** Engineering that can run in
the repo is no longer blocked. What remains is secrets, dashboards, devices, and
irreversible promotion.

---

## What Cursor did

Workspace `D:\fitconnect`, branch `feat/elite-os-v2`, remote
`https://github.com/querinoz/fitconnect.git`.

Local gates: typecheck, lint, unit (524), auth-prod (76), production-critical audit (0),
Next 15.5.25 build, schema reconcile (0 errors), CI validator (0 errors).

The previous claim that "no git, in any session" is **obsolete**.

---

## Human Required (ordered)

1. **Rotate `STRAVA_CLIENT_SECRET`.** Precautionary. `StravaConnection` has 0 rows; this
   is not incident response. Update GitHub/Vercel secrets after rotation.
2. **Enable Supabase leaked-password protection** in the dashboard.
3. **Map visual smoke** on `/map` after MapLibre 6.9.0 (markers, locate/`flyTo`,
   OpenFreeMap attribution).
4. **Physical Android** — install the new debug APK; ONE LOGIN, Feed, Profile, Athlete,
   Coach, mode switch. If MIUI blocks taps, that step stays human.
5. **Vercel production promotion** — only after GitHub CI is green on this branch. Do
   not promote automatically if the SHA is not the intended release.
6. **Triage 22 production high advisories** when convenient (`fast-uri`, `sharp`, …) —
   not release-blocking (criticals are 0).

---

## Not human, not blocked

- Applying `ci.yml`
- `pnpm` install / typecheck / lint / test / build
- Schema reconcile against production (read-only script)
- Commit and push to `feat/elite-os-v2`
- Reading and fixing GitHub CI

Those belong to Cursor's loop.

---

## Classification that must not regress

- Empty Strava tables ≠ breach.
- `android.yml` 50-second Success on an unrelated path filter ≠ Android build.
- Playwright green under `NEXT_PUBLIC_DEMO_MODE=true` ≠ production auth evidence.
- SKIPPED ≠ PASS.
