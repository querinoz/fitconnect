# Wear product gap analysis

Inspiration: Mi Fitness, Zepp Life, Garmin Connect, Strava, WHOOP — **functional parity where it serves Elite Human Performance**, not clones. No vendor IP, assets, or private APIs.

| Capability | FitConnect | vs inspiration | Priority |
|---|---|---|---|
| Athlete + Coach OS | ALREADY_EXISTS | Unique | keep |
| Elite Surface identity | ALREADY_EXISTS | Unique | keep |
| Phone start/pause/finish activity | PARTIAL → implemented engine | Garmin/Strava | P0 |
| Outdoor GPS route | PARTIAL (QA/sim) | Garmin/Strava | P0 — LIVE GPS PENDING_DEVICE |
| Activity map + replay | PARTIAL → EliteRouteMap | Strava flyby | P0 |
| HR zones Z1–Z5 | PARTIAL (formula + LOCAL_DEMO curve) | Garmin/WHOOP | P1 — sensor UNAVAILABLE on emulator |
| Sleep stages | MISSING as observed | Mi/Zepp/WHOOP | P1 — DATA SOURCE REQUIRED |
| Recovery / readiness | PARTIAL LOCAL_DEMO | WHOOP | P1 — labeled CALCULATED |
| Daily steps | PARTIAL store | Mi Fitness | P1 — empty store stays empty |
| Auto-detect workouts | ARCHITECTURE_ONLY | Mi/Zepp | P2 — never CONFIRMED in production |
| Wear OS instrument | PARTIAL → panes | premium Wear | P0 |
| Phone ↔ watch Data Layer | PARTIAL — logic tested | Garmin | P0 — pairing PENDING_ENVIRONMENT |
| Health Connect | PARTIAL probe | Android | P1 — contextual permission, no silent grant |
| Strava OAuth export | ARCHITECTURE (payload) | Strava | PENDING_HUMAN |
| Garmin/WHOOP/Oura APIs | NOT_RELEVANT until official creds | vendors | PENDING_HUMAN |
| Xiaomi BLE | NOT_RELEVANT | Mi Fitness | BLOCKED_EXTERNAL_DEPENDENCY |
| Watch faces / Play listing | FUTURE | Wear | PENDING_HUMAN |
| Medical diagnosis | NOT_RELEVANT | — | never |

Do not blindly implement Mi “standing hours” or Zepp social as product core. FitConnect differentiator remains Coach live + AI evidence kinds + Elite OS.
