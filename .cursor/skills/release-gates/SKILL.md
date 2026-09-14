---
name: release-gates
description: Official Vercel production path, live smoke, and evidence rules for FitConnect releases.
---

# Release

## Prerequisites

- Branch `feat/elite-os-v2` (or the current release branch)
- GitHub environment `production` secrets (never paste into chat)
- `gh` authenticated

## Procedure

1. Inspect `.github/workflows/vercel-deploy.yml` and the latest Vercel Production run logs (classify pull / build / deploy / alias / app runtime).
2. Fix workflow or app code; do not ask for a new token until the current token has been tested.
3. Push; wait for Pull → inject → build → deploy --prebuilt --prod.
4. Smoke the **alias** `https://fitconnect-phi.vercel.app` (not only a preview URL):
   - `/` `/signin` `/signup`
   - `/api/health`
   - `GET /api/v1/identity/me` (unauth must not be `503 rate_limit_not_configured`)
5. Confirm deployed commit ≠ stale `8d87b93`.

## Validation

Report SHA, deployment id if available, alias, and endpoint status codes. CI green without alias proof is not a release.
