# FitConnect V12 — Master Component Audit

| Component | Code | Data | Actions | A11y | Test | Status |
| --- | --- | --- | --- | --- | --- | --- |
| LiveAthleteContextCard | REAL | `/api/v1/context` | refresh, nav | text labels | e2e mount | REAL |
| Today sport engine cards | REAL | adaptation/periodization | confirm flows | partial | unit | REAL |
| Device registry (lib) | REAL | per-user | status update | n/a | unit | REAL |
| Agent router | REAL | intent→tools | read-only route | n/a | unit | REAL |
| MCP gateway tools | REAL | event-store/registry | no silent write | n/a | unit | REAL |
| Sports network domain | REAL | spots/events | create/join | n/a | unit | REAL |
| Coach roster ACL | REAL | consent links | check/consent/revoke | n/a | unit | REAL |

## Marks

- **REAL** — wired + tested  
- **PARTIAL** — exists but external/device incomplete  
- **UNUSED** — none introduced as dead exports in V10–V11 delta after V12 cleanup
