# FitConnect Human Handoff

**Updated:** 2026-09-24 · Branch `feat/fitconnect-roadmap-v10-v11`

Engineering continues on the V10–V12 tip. Do **not** reset onto `feat/elite-os-v2`.

---

## Human Required (genuine)

1. **Xiaomi physical ADB** — USB “Unauthorized” / MIUI input blocks. Wi‑Fi HTTP APK handoff works; full Maestro on device needs authorized ADB.
2. **Play App Signing / upload keystore** — `assembleRelease` SIGN-02 not verified without keystore secrets.
3. **Rotate `STRAVA_CLIENT_SECRET`** — preventive; `StravaConnection` = 0 rows (not a breach).
4. **Vercel production promote** of V12 routes (`/nutrition`, `/ascend`, V10–V12 APIs) after required CI green on this branch tip.
5. **Cursor skill installs** (Superpowers / Matt TDD) on the developer machine — not vendored into the app.
6. **POST_NOTIFICATIONS** runtime grant on a physical device to visually confirm rest-timer tray updates.
7. **Health Connect write consent UX** — product copy for Settings toggle (engineering API ready; do not silent-write).

---

## Not blocked for Cursor

Rest notifications · HC writer · share card domain · guided export · ZenithGlass · sync vocabulary · further web Lighthouse / Wear audits.
