# ADR-009 — Database: Supabase Postgres for v1 (Neon + TimescaleDB deferred)

**Date:** 2026-08-07
**Status:** Accepted
**Deciders:** Product owner + engineering

## Context

The original v1 prompt fixed Neon + TimescaleDB as the database. Engineering reviewed the actual repo state instead of the prompt in isolation and recommended Supabase Postgres; the owner accepted that recommendation because it was grounded in what already exists, not a fresh preference:

- Supabase Auth is already the auth provider (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — see `CLAUDE.md` §16). Adding Neon means a second vendor for auth-adjacent data with no auth story of its own.
- `prisma/schema.prisma` already targets a plain Postgres-compatible connection string (`DATABASE_URL` / `DIRECT_URL`). Supabase Postgres is a drop-in target; Neon would be too, but buys nothing extra.
- v1 has no analytical workload that requires TimescaleDB on day one. The heavy time-series data (per-second GPS/HR/power streams) does not need to live in a relational database at all — it needs cheap, durable object storage, with Postgres holding summaries.

A decision deferred with an explicit, measurable trigger is not technical debt — it's engineering. This ADR exists to write that trigger down so "later" has a concrete definition instead of being a vibe.

## Decision

**Supabase Postgres for all v1 relational data.** No Neon, no TimescaleDB, no hypertables in v1.

- **Structured data** (users, athletes, coaches, sessions, activities summary rows, laps, zones, readiness, sync outbox, permission guard state — the 19 Prisma models) → Supabase Postgres via Prisma, as today.
- **Raw time-series streams** (per-second GPS/HR/power/cadence arrays from FIT files) → object storage (S3-compatible: S3 or Cloudflare R2), addressed by activity ID. Postgres stores only derived summary rows per activity/lap (NP, IF, TSS, GAP, splits, zone time) — never the raw per-second series.
- Elite Core (Rust, ADR-006) is the only thing that reads/writes raw stream blobs; it decodes FIT, computes metrics, writes the summary rows to Postgres, and pushes the stream blob to object storage. The API layer never round-trips full streams through Postgres.

## Migration trigger (any one, sustained for 2 consecutive weeks of real usage, not a single spike)

1. **p95 latency of a "history" query** (90-day CTL/ATL/TSB trend, season power/pace curve, paginated activity list with aggregates) exceeds **500ms** in production.
2. **Stream storage friction**: object storage volume crosses a point where per-request cost or cross-service query federation (joining summary rows in Postgres with stream data in R2/S3 for a single view) becomes the actual bottleneck — approximated as **>50GB of stream blobs** or the need to query *inside* streams at the database layer (not just fetch-by-ID).
3. **Write throughput**: background sync/ingestion workers for activity uploads queue-backed for **>30s under normal load** (not a burst), i.e. Postgres write path is the constraint on the F4 recording-sync gate.

When triggered: evaluate TimescaleDB **then**, against the actual query patterns that forced the trigger — not against the assumption made today. Options at that point include Timescale as a Postgres extension (self-hosted or Timescale Cloud) or a purpose-built time-series store, decided against real data, not speculation.

## Consequences

- `DATABASE_URL` / `DIRECT_URL` → Supabase Postgres connection strings (already listed in `CLAUDE.md` §16).
- Prisma schema stays Postgres-flavored, no change in kind.
- New infra needed: an S3-compatible bucket (S3 or R2) for raw FIT files and derived stream blobs, with a lifecycle/retention policy — not yet specified, tracked as an F2/F8 task.
- `packages/api-client` and Elite Core's sync layer must draw a hard line: summary rows only through the API/Prisma path, raw streams only through the object-storage path. This boundary is part of the F1 gate scope (same FIT → same output) — the metrics that land in Postgres are the ones that must match Golden Cheetah within tolerance.
- Revisit this ADR at the F7 gate (metrics validated against Golden Cheetah) or immediately if any trigger above fires, whichever comes first.
