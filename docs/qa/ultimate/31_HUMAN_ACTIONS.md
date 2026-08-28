# 31 — Human actions

Only genuine external or environment dependencies. Everything an agent could do
was done or is listed as open in `MASTER_DEFECT_REGISTER.md`.

## H1 — Re-run the suite after the Stripe fix  *(2 minutes)*

```
pnpm --filter @fitconnect/web typecheck
pnpm --filter @fitconnect/web test
```

**Why:** this session cannot run them. `node_modules` was installed on Windows, so
rollup's native binary is `win32-x64-msvc`; vitest on Linux aborts at startup.
**Expected:** typecheck clean; suite green with 3 new Stripe tests (384 passing).

## H2 — Unblock the Android / Wear interaction pass

**Why:** computer-use grants IDEs at tier `click` only — no typing, no swipe, no
drag — and there is no host shell for `adb`. Both emulators are running with the
app installed; only input is missing.

**Option A (best):** give this session a shell it can type into — e.g. a live Linux
workspace with `adb` on the PATH and the emulators reachable. Everything from
§13–§36 of the mission then runs unattended.

**Option B:** run the interaction manually and paste back. The useful commands:
```
adb devices
adb shell am start -n com.fitconnect.android.debug/com.fitconnect.android.MainActivity
adb logcat -d --pid=$(adb shell pidof com.fitconnect.android.debug) > logcat.txt
adb emu geo fix -9.1393 38.7223      # GPS simulation, Lisbon
```

## H3 — Provide a Postgres `DATABASE_URL` for the RLS exit gate

**Why:** `tests/integration/identity-rls.integration.test.ts` is
`describe.skipIf(!DATABASE_URL)` — the two-user IDOR suite your own master plan
names as the P0-SEC exit gate. In the owner's run it **skipped**, i.e. reported
green by vanishing. A gate that turns "no database" into "pass" is not a gate.

**Expected:** the suite runs and both users are correctly isolated.
**Also:** `apps/web/vitest.config.integration.ts:6-10` reads `.vitest-db-env.json`
at config-load time while `vitest.setup.db.ts:39` writes it during globalSetup, so
even a local Testcontainers run skips. That ordering bug needs fixing too.

## H4 — Decide what `vercel-deploy.yml` is for  *(decision, not a task)*

`.github/workflows/vercel-deploy.yml` deploys to a GitHub `production` environment
with `--prod` and `NEXT_PUBLIC_DEMO_MODE=false` on every push to `main`, `master`
or `feature/fitconnect` — with **no `needs:` on any test job**. Meanwhile every
document in the repo says PRODUCTION NO-GO.

Either the workflow should gate on `ci.yml`, or the docs should stop calling the
hosted site a preview. Right now both are true and they contradict each other.

## H5 — Fix the CI branch pattern  *(1 line)*

`ci.yml:5`, `android.yml:5` and `elite-core-rust.yml:5` trigger on `feature/**`.
HEAD is **`feat/elite-os-v2`**. CI does not run on the branch the work is on, so
"CI is green" is currently unfalsifiable. Add `feat/**`.

## H6 — Production configuration (unchanged, still PENDING_HUMAN)

Firebase production project · Supabase production project + applied migrations
(including `013_p0_sec.sql`) · Google OAuth · Apple · release signing keystore ·
Play Console · physical Android device · physical Wear device.
