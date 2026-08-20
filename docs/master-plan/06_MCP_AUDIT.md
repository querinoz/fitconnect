# 06 — MCP audit

**Date:** 2026-08-20  
**Phase lock:** `P0-DOCS`  
**Config:** `.mcp.json` (repo)

## Configured servers

| Server | Type | Purpose | Secrets |
| --- | --- | --- | --- |
| playwright | npx `@playwright/mcp` isolated headless | Desktop web QA shots → `docs/qa/shots` | none |
| playwright-mobile | Pixel 7 device | Mobile viewport | none |
| playwright-webkit | WebKit | Safari-class checks without Mac | none |
| firecrawl | `cmd /c npx firecrawl-mcp` | Web scrape/search | `FIRECRAWL_API_KEY` env |
| perplexity | `@perplexity-ai/mcp-server` | Research | `PERPLEXITY_API_KEY` (paid) |
| chrome-mcp-server | HTTP `127.0.0.1:12306` | Requires local Chrome bridge | local |
| context7 | HTTP `mcp.context7.com` | Library docs (Compose/Retrofit/HC) | none in repo |

Cursor also exposes `cursor-ide-browser` and `cursor-app-control` in-session (not in `.mcp.json`).

## Rules

- Three Playwright profiles exist because persistent profiles cannot be shared concurrently (`docs/AGENT_TOOLCHAIN.md`)
- Never put API keys in `.mcp.json` literals — keep `${VAR}` expansion
- Chrome MCP is useless unless the human runs the bridge
- Do not use browser MCP to bypass missing Strava/Firebase credentials
- Context7 is **required** before Health Connect / Compose API guesses (AGENTS.md §6)

## Not an MCP gap for P0-DOCS

Missing Datadog/Sentry MCP does not block P0-SEC. Observability is **P9**.
