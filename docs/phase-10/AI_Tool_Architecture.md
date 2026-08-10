# AI Tool Architecture

Controlled tools only (`getTelemetrySummary`, `getProgramProgress`, …).

Each tool declares: roles, scopes, read/write, sensitive health, audit.

`AiToolRuntime`:
- Permission gate first
- Write tools always denied (propose via ActionProposalService)
- Timeout 5s
- Audit ok/denied without prompt bodies

NL search maps intents → tools; never raw SQL.
