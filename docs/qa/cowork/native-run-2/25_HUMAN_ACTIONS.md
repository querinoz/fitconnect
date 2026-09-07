# 25 — HUMAN ACTIONS

Only genuine remaining dependencies. Do **not** paste secrets in chat.

1. **Wear companion / Play services pairing** — Phone AVD reports `MISSING_COMPANION_APP`. Need a supported phone image with Wear companion, or a physical Pixel + Watch, to test Data Layer.
2. **Physical GPS / HR** — Emulator QA route is simulated. Outdoor fused location and Health Services HR need a physical device.
3. **Production auth** — Google / Apple / real email on Android; web sign-in **modal** retest ( `/auth` is 404). Human Play/Test Lab accounts.
4. **TalkBack** — Enable on emulator/device for a dedicated a11y pass.
5. **Firebase / Supabase production** — Demo backend; rate limit Redis still disabled on live health.
6. **Secret rotation / disk audit** — Prior finding of local secrets; not re-done here.
7. **Signing / Play / Test Lab** — If store builds differ from `0.1.0-rc.1` debug.
8. **Deploy landing nav fix** — Uncommitted `overflow-hidden` removal exists locally; **do not treat as shipped**.

BIOS virtualization is **no longer** a blocker on this host (emulators run).
