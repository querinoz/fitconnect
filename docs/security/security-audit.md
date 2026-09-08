# Security Audit — Mobile Path A (spot)

**Date:** 2026-09-08

| Finding | Severity | Status |
|---------|----------|--------|
| Release `ALLOW_LOCAL_AUTH=false` | — | PASS |
| Demo AI ports only when debug LOCAL_AUTH | Medium→Fixed | PASS this wave |
| FCM / Firebase without google-services fail-closed | — | PASS architecture |
| Stripe invoice/transfer never client-trusted success | — | PASS (BLOCKED_EXTERNAL mutations) |
| Strava never social (DB RLS) | Critical product rule | PASS ownership at backend; mobile must not surface Strava in community |
| Production Firebase/RLS matrix | High | BLOCKED EXTERNAL |
| Secrets in repo | High | Spot PASS — do not commit google-services secrets |

Unit: `SecurityRegressionHardeningTest` PASS.
