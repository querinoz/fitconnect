# FitConnect — Platform Final Architecture (V12 hardening view)

## Layers

```text
Clients (Web / Android Compose / Wear)
    ↓
API /api/v1/*  (auth, confirm gates, capability checks)
    ↓
Domain services
  sports-intelligence (events, context, ACWR-lite, adaptation)
  devices/platform (adapter contract, normalize, conflict, per-user registry)
  nutrition/periodization
  ai/agent-router
  mcp/gateway (honest tools)
  coach/roster-acl (consent)
  social/sports-network (privacy)
    ↓
Persistence
  Durable: Prisma/Supabase (pre-V10 core)
  Process-local prototypes: event-store, device registry, roster, network
```

## Non-negotiables (still enforced)

1. Strava never social / never ML training data  
2. Health Connect is the data-plane core  
3. No fabricated biometrics  
4. Writes require explicit confirm where product policy demands  
5. MCP is controlled — no SQL/shell/community tools  

## V12 architecture fixes

- Device registry is **identity-scoped**  
- Coach links require **athlete consent**  
- Network join respects **visibility**  
- Metric provenance distinguishes **device REAL vs client ESTIMATED**  
- ACWR-lite labeled as **auxiliary** in UI + MCP notes  

## Production gap

In-memory V10–V11 stores must migrate to Postgres + RLS before multi-instance production. Semantics verified; durability not.
