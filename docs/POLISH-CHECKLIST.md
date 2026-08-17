# Polish checklist — Elite OS

**Rule:** a cell is ✅ only with screenshot or dump. Code review = ⏭️.

Eight columns: 1 optical align · 2 4dp rhythm · 3 state consistency · 4 motion family · 5 density (one Volt CTA) · 6 text (no CSS uppercase) · 7 touch ≥48dp · 8 contrast/roles.

## Android (Athlete)

| Screen | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| Home | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | older `docs/qa/elite-os-v2-home.png` — not re-audited 2026-08-18 |
| Discover | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | no v2 recapture |
| Activity | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | `elite-os-v2-activity.png` |
| Community | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | |
| Profile | ⏭️ | ⏭️ | ⚠️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | Settings rows still on Profile (FASE 2B incomplete) |
| Settings | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | `elite-os-v2-settings.png` |
| Sleep / Daily | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | Daily empty is honest |
| Wear session | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | no Wear screenshot; ambient **missing** |

## Web product (maquette `docs/mockups/dashboards.html`)

| Panel | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| Load / recovery | ⏭️ | ⏭️ | ✅* | ✅* | ✅* | ✅* | n/a pointer | ⏭️ | *in HTML contract only; not production |
| Progression | ⏭️ | ⏭️ | ✅* | ✅* | ✅* | ✅* | n/a | ⏭️ | |
| Distribution | ⏭️ | ⏭️ | ✅* | ✅* | ✅* | ✅* | n/a | ⏭️ | |
| Sleep / HRV | ⏭️ | ⏭️ | ✅* | ✅* | ✅* | ✅* | n/a | ⏭️ | |
| History + CSV | ⏭️ | ⏭️ | ✅* | ✅* | ✅* | ✅* | n/a | ⏭️ | export is real Blob in the maquette |
| Period compare | ⏭️ | ⏭️ | ✅* | ✅* | ✅* | ✅* | n/a | ⏭️ | |

## Landing maquette (`docs/mockups/landing.html`)

| Section | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Hero | ⏭️ | ⏭️ | n/a | ✅* | ✅* | ✅* | n/a | ⏭️ | real phone shots; no fake social proof |
| Features | ⏭️ | ⏭️ | n/a | ✅* | ✅* | ✅* | n/a | ⏭️ | only features that exist |
| Multi-device | ⏭️ | ⏭️ | n/a | ✅* | ✅* | ✅* | n/a | ⏭️ | Wear labeled unverified |
| FAQ / footer | ⏭️ | ⏭️ | n/a | ✅* | ✅* | ✅* | n/a | ⏭️ | no third-party tracking |

Production Next landing was **not** replaced this session.
