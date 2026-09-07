# 21 — EXPLORATORY QA

Acted as new user (Welcome), athlete (Inês), coach (Tomás), confused user (Back to launcher), power user (deeplinks, geo inject).

## Unusual / notable

1. **Home vs Recovery scores disagree** (59 vs 78).
2. **System Back** from Today drops to launcher.
3. **PAIR WATCH** opens Bluetooth settings, not Wear Data Layer.
4. **Sleep deeplink** is a stub.
5. Profile **Sign out** buried under a long device list.
6. `pm clear` required to become coach — no in-session role switch found.
7. Achievement titles dump as HTML entities (`&#128205;`) in uiautomator — TalkBack risk.
8. Community is a rich **seed city**, easy to mistake for production users if LOCAL_DEMO badge is missed.
9. Coach squad km **already over target** (101.7 / 50) without this tester running 10 km.
10. Web `/auth` 404 vs Android having a first-class Identity Core.

No P0 crash found. No product fixes applied.
