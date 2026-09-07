# Mobile Functional Gaps Closed — Wave 2

| Gap | Disposition |
|-----|-------------|
| LocalAthleteRepository as production primary | **CLOSED** — `HttpAthleteRepository` wraps demo fallback only when `isLocalDemo` |
| Discover dead / seed remote | **CLOSED** — remote discover API; empty without postgres; no silent fake coaches |
| Discover booking fake success | **CLOSED** — remote path returns NOT_IMPLEMENTED message |
| Social silent local only | **PARTIAL** — remote list/create; reactions/comments honest NOT_IMPLEMENTED |
| Coach athleteDetail | **CLOSED** — HTTP + ownership ACL; seed forbidden remotely |
| Coach calendar | **CLOSED** — events from sessions; mutations NOT_IMPLEMENTED (honest) |
| Coach analytics fake € | **CLOSED** — derived metrics; revenue/retention/conversion Unavailable |
| Realtime none | **CLOSED (eng)** — ProductRealtimeHub + topics + codec; prod PENDING_HUMAN |
| Wear wear-* IDs | **MITIGATED** — UUID mint; full Wear still BLOCKED |
| Physical SM gate | **OPEN** — hardware NOT_AVAILABLE |

Intentionally **not** invented: Stories, Reels, second calendar system, fabricated analytics.
