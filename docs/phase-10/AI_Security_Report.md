# AI Security Report

Attack surface reviewed:

| Attack | Mitigation |
|--------|------------|
| Unauthorized athlete | Context + tool gate |
| Prompt injection | Refuse / quarantine |
| Tool injection | Allowlist only |
| Write via AI | Denied |
| Secret leakage | Scrub + no prompt logs |
| Cross-user context | Principal checks |

Malicious community string in demo adapter is quarantined in context.
