# PHASE 17 — security findings

Values are **not** recorded here.

| File | Line | Type | Severity | Action |
|------|------|------|----------|--------|
| `apps/web/tests/fixtures/domain.ts` | Stripe fixture | Dummy key used `sk_live_` prefix | LOW | **Fixed** — renamed to `sk_test_fixture` so scanners do not treat it as live |
| `.env.example` | Supabase/Convex URLs | Project identifiers in template | INFO | Keep as example; no private keys present (`your-anon-key` placeholders) |
| `docker-compose.test.yml` | Postgres/Pact | Test-only passwords | INFO | Local test compose; not production |

**Scan (no values printed):** `API_KEY`, `SECRET`, `TOKEN`, `PASSWORD`, `PRIVATE_KEY`, `SERVICE_ROLE`, `sk_live_` real-looking keys, `AIza`, `BEGIN PRIVATE`.

**Result:** no production private keys, keystores, or `google-services.json` in git (`git ls-files` empty for those). `.env.local` is gitignored.

`SECURITY = FINDINGS` (low/info only; no live credential leak identified).
