---
name: mcp-security
description: FitConnect product MCP gateway vs Cursor .mcp.json; Zenith must not fabricate data or run unrestricted tools.
---

# MCP / Zenith

## Product gateway

Inspect `apps/web` `/api/v1/mcp` — registry, schemas, auth, permissions, audit, rate limit, timeouts.

Forbidden: unrestricted shell, arbitrary SQL, community MCP in the production trust boundary, secrets in logs or bundles.

## Cursor MCP

`.mcp.json` is developer-only. Do not point those servers at production credentials.

## Zenith

Use real FitConnect data. If sleep/HRV/readiness is missing, say so. Recommendations need evidence. Consequential actions need confirmation (Accept / Keep / Why).
