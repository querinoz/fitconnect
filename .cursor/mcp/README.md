# Cursor MCP inventory (developer machine)

Product MCP (Zenith tools, authz, audit) lives in the FitConnect gateway (`apps/web` `/api/v1/mcp`). **This folder is not that gateway.**

Runtime config: repo-root [`.mcp.json`](../../.mcp.json).

| Server | Connect | Production trust |
| --- | --- | --- |
| playwright / playwright-mobile / playwright-webkit | local npx | no — QA only |
| context7 | hosted HTTP | no — docs |
| firecrawl | needs `FIRECRAWL_API_KEY` | no |
| perplexity | needs `PERPLEXITY_API_KEY` | no |
| chrome-mcp-server | only if `127.0.0.1:12306` is up | no |

Do not add servers here that accept production `DATABASE_URL`, `VERCEL_TOKEN`, or provider client secrets.

Health: `pnpm tooling:health` reports configured server names, not secrets.
