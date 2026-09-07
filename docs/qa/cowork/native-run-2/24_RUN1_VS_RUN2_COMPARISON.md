# 24 — RUN 1 vs RUN 2 COMPARISON

| FINDING | RUN 1 | RUN 2 (this execution) | STATUS | EVIDENCE | NOTES |
|---|---|---|---|---|---|
| Native emulator won't boot (SVM) | BLOCKED | Phone+Wear booted | **RESOLVED** | adb devices 5554/5556 | BIOS SVM enabled |
| Android app not installed | BLOCKED | Installed + launched | **RESOLVED** | am start COLD 4847ms | Cursor shell |
| Wear not runnable | BLOCKED | Wear app workout PASS | **RESOLVED** | wear dumps | LOCAL_DEMO |
| Phone↔Watch | BLOCKED (no devices) | Executed, no Data Layer | **STILL OPEN** | MISSING_COMPANION_APP | Now evidenced, not hypothetical |
| Native GPS fused | Code NO-GO | Runtime simulated QA | **STILL OPEN** | Activity GPS DEMO | **CONFIRMED** |
| Language dropdown clip | P2 | list inside nav overflow hidden | **STILL OPEN** | CDP listH=230 navH=62 | Local uncommitted nav fix **not deployed** |
| Demo/email creds | P2 then escalated P1 | `/auth` 404; demo dashboard works | **STILL OPEN** | curl 404 | Modal not retyped |
| Sign out doesn't clear | P2 | Prior Run2 web NOT_REPRODUCED | **NOT_REPRODUCED** | — | Android Sign out not reached |
| Rate limiting disabled | P2 | health redis disabled | **STILL OPEN** | /api/health | |
| Protected API leak | historical | 503 fail-closed | **RESOLVED** | /api/v1/readiness | holds |
| Icon button a11y | P3 | 7 unnamed on dashboard | **STILL OPEN** | CDP unnamed:7 | |
| Pricing €12 vs tiers | P3 | still on /pricing | **STILL OPEN** | WebFetch | |
| Footer /# links | P3 | About/Careers/Press/Partnerships | **STILL OPEN** | CDP hashes | |
| Social / Squads incomplete | NOT_IMPLEMENTED | Community seed + coach challenge | **STILL OPEN** | dumps 28, 60 | richer than “nothing” |
| Secrets on disk | P2 | not re-audited | **STILL OPEN** | — | carry |
| Back exits to launcher | — | Today + Back | **NEW** | exploratory | P2 |
| Recovery 59 vs 78 | — | Home vs Recovery Center | **NEW** | dumps 12 vs 13 | P2 |
| Sleep deeplink stub | — | fitconnect://app/athlete/sleep | **NEW** | dump 33 | P3 |
| PAIR WATCH → BT settings | — | observed | **NEW** | dump 35 | |
| `/auth` 404 | — | curl/browser | **NEW** | | P3 |
| Cold start ~5s | — | am TotalTime | **NEW** | | P2 perf |
| Wear unlabeled START | — | empty content-desc | **NEW** | wear XML | P3 |
