# Mobile Functional Wave 2 — QA Matrix

| ID | Check | Expected | Result |
|----|-------|----------|--------|
| ATHLETE-001 | Local repo is demo constant / not silent prod | Http wraps local only on LOCAL_DEMO | PASS (unit) |
| DISCOVER-001 | Discover source never `seed` without DB | `postgres` \| `empty` | PASS (web) |
| DISCOVER-002 | Remote book intro | NOT_IMPLEMENTED message | ENGINEERING (UI) |
| SOCIAL-001 | Remote feed list/create | API or 503 persistence_not_configured | ENGINEERING |
| SOCIAL-002 | Remote react/comment | NOT_IMPLEMENTED status | ENGINEERING |
| COACH-ATHLETE-001 | Unrelated athlete ownership | false | PASS (web) |
| COACH-ATHLETE-002 | Unowned detail | null athlete | PASS (web) |
| COACH-ATHLETE-003 | Route 403 via requireCoachOwnsAthlete | 403 forbidden | ENGINEERING (API) |
| COACH-CALENDAR-001 | Events from session ids | `cal-{sessionId}` | ENGINEERING |
| COACH-ANALYTICS-001 | Revenue not fake 0 success | Unavailable flag | ENGINEERING |
| REALTIME-001…003 | Codec round-trip | encode/decode | PASS (unit) |
| REALTIME-010…012 | Hub connect/auth/dedupe | AppResult + state | PASS after fix |
| WEAR-001 | No wear-* mint | UUID sessionId | ENGINEERING |
| WEAR-002 | Physical E2E | — | BLOCKED |
| SM-001/002/004 | Physical Redmi | device online | NOT_AVAILABLE |
| REGRESSION-WEB | typecheck + test + coverage | green | PASS (476 tests) |
| REGRESSION-ANDROID | assembleDebug | green | **PASS** |
