# AI Agent Platform (V10.4)

## Router
`routeAgentQuery(query)` → TRAINING | NUTRITION | RECOVERY | PERFORMANCE | DEVICE | COACH | SPORT

## Tool execution
Always via FitConnect MCP gateway (`/api/v1/mcp`) — auth, audit, no fabricated results.

## Wired improvements
- `get_training_load` → ACWR-lite from event history
- `get_device_status` → device registry honesty

## API
`POST /api/v1/ai/route-agent` — classification + answer shell only
