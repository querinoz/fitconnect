# Human-final configuration

**Status:** PENDING_HUMAN

**Canonical ordered list:** [master-plan/17_HUMAN_ACTION_PLAN.md](master-plan/17_HUMAN_ACTION_PLAN.md)

**Production:** NO-GO

Agent-complete items are omitted. Only actions that require a human account, admin, or hardware:

1. **Install Android Emulator hypervisor driver (WHPX or AEHD)** so `fitconnect_phone` can boot. Agent run failed: “Android Emulator hypervisor driver is not installed”.
2. **Install a Wear OS system image + create a Wear AVD** (none present; only `android-37.0 google_apis_playstore_ps16k`).
3. **Physical Wear OS watch** for REAL_SENSOR HR/GPS and pairing confirmation (`WATCH_REAL_DEVICE = PENDING_HUMAN`).
4. **Release keystore** (`android/keystore.properties` — gitignored) for `assembleRelease`.
5. **Firebase `google-services.json`** for FCM (release Gradle fails closed without it).
6. **Supabase production URL + anon key** (and never a service-role key on device) for live auth/realtime.
7. **Play Console** listing, signing upload, Wear standalone/companion form — LOCKED.
8. **Xiaomi HyperOS official SDK** if that SKU is a product requirement — currently `BLOCKED_EXTERNAL_DEPENDENCY`.
9. **GitHub `VERCEL_TOKEN`** if CI web deploys must pass (unrelated to Android, still missing).
10. **iOS / Apple Developer** — not this cycle.

Do not place service-role keys, Play upload keys, or production signing passwords in the repo or on the watch.
