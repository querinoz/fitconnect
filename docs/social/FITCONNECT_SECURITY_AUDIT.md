# FitConnect — Social security audit

| Risk | Severity | Status |
| ---- | -------- | ------ |
| In-memory social graph | High for production | Demo only — do not call production |
| Supabase community RLS, no policies | High | Table unusable or locked; do not open with `using (true)` |
| Dual schema | Medium | Prisma vs SQL |
| tRPC empty stubs | Low | Fail-closed empty, not IDOR (auth added) |
| Health on posts | Mitigated | Redact unless opt-in |
| FLAG_SECURE | Release only | Debug capturable for QA |
| Secrets | PENDING_HUMAN | Never invent |

PASS for this slice = no new public SQL, no new fail-open policies, no telemetry on public cards.
