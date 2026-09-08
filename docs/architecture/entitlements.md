# Entitlements

Plan → capabilities (existing Stripe plan ids):

| Plan | Capabilities |
|---|---|
| `athlete` (default/free) | athlete |
| `coach` | coach |
| `team` | athlete + coach |

Owned capabilities may exceed plan temporarily during grace; expired coach capability must fall back `activeMode` to athlete when available.

Resolver: `apps/web/lib/identity/entitlements.ts` + `@fitconnect/types` `capabilitiesFromPlan`.
