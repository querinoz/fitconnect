# FitConnect V10–V11 Architecture

```
Web / Android / iOS / WearOS
        │
   Design System (Zenith EOS) + Motion
        │
   Domain Layer
   ├── Sports Intelligence (events, context, load, adaptive TRAIN)
   ├── Devices (adapters, normalize, conflict, freshness)
   ├── Nutrition (periodization + V9 meal/grocery/recipes)
   ├── AI Agents (router → MCP tools)
   ├── Coach (roster ACL)
   └── Sports Network (spots/events/challenges)
        │
   API (/api/v1/events|context|devices|ai/route-agent|coach/roster|network|mcp|nutrition|train)
        │
   Realtime transports (Broadcast / Convex / Supabase) + Event store
        │
   Data: Postgres/Supabase + in-memory honest fallbacks
        │
   Observability: MCP audit · API errors · no sensitive payload logs
```
