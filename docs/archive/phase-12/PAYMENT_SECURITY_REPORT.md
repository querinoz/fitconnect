# Phase 12 — Payment Security Report

## Stack

| Layer | Path |
|-------|------|
| Demo checkout | `apps/web/lib/stripe/demo/` |
| Live checkout | `apps/web/lib/stripe/server.ts` |
| Webhook handler | `apps/web/lib/stripe/webhook-handler.ts` |
| API routes | `apps/web/app/api/stripe/*` |
| DB | `supabase/migrations/008_payments.sql` (RLS enabled) |

## Current state

**Stripe is largely demo.** Routes call `createDemoCheckout`, `createDemoSubscription`, `createDemoConnectAccount` when not live.

`isStripeLive()` gates real Stripe SDK usage — requires `STRIPE_SECRET_KEY` and related env.

## Controls (live path)

| Control | Status |
|---------|--------|
| Webhook signature verification | Implemented in `verifyStripeWebhook` |
| Idempotent event processing | `claimStripeEvent` in webhook handler |
| Server-side price IDs | Live checkout uses configured prices |
| Client publishable key only in browser | OK |

## Demo path risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Fake payment success UX | High (trust) | Hide payment flows or banner "demo" |
| No PCI scope in demo | Low | No card data touches demo |
| Connect onboarding fake | Medium | Block prod deploy without live keys |

## Phase 12 scope

Payment security **documented as debt**, not fully hardened:

- No Phase 12 change to move Stripe off demo
- RLS on `transactions` / `stripe_connect_accounts` not live-tested

## Recommendations (pre go-live)

1. `NEXT_PUBLIC_DEMO_MODE=false` AND `isStripeLive()` required for checkout routes
2. Webhook endpoint: reject unsigned in production (already targeted)
3. Coach Connect: verify account ownership server-side
4. Audit refund/cancel authorization

## Verdict

**Not production-ready for payments.** Demo paths acceptable for marketing only. **Do not process real money** until live Stripe + auth audit complete.
