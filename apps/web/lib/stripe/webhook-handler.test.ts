import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  claimStripeEvent,
  dispatchStripeEvent,
  isStripePersistenceAvailable,
  isWebhookProcessingEnabled,
  processStripeWebhookEvent
} from "./webhook-handler";

vi.mock("@/lib/db/client", () => ({
  getPrisma: vi.fn()
}));

vi.mock("./persistence", () => ({
  isStripePgPersistenceAvailable: vi.fn(() => false),
  claimStripeEventPg: vi.fn(),
  upsertSubscriptionPg: vi.fn(),
  updateSubscriptionByStripeIdPg: vi.fn(),
  recordPaymentTransactionPg: vi.fn()
}));

vi.mock("./server", () => ({
  syncConnectAccountFromStripe: vi.fn().mockResolvedValue(undefined)
}));

import { getPrisma } from "@/lib/db/client";
import { syncConnectAccountFromStripe } from "./server";
import {
  isStripePgPersistenceAvailable,
  claimStripeEventPg,
  upsertSubscriptionPg,
  updateSubscriptionByStripeIdPg,
  recordPaymentTransactionPg
} from "./persistence";

describe("stripe webhook handler", () => {
  beforeEach(() => {
    vi.mocked(getPrisma).mockReturnValue(null);
    process.env.STRIPE_WEBHOOK_PROCESSING = "true";
  });

  it("should_disable_processing_when_feature_flag_false", () => {
    process.env.STRIPE_WEBHOOK_PROCESSING = "false";
    expect(isWebhookProcessingEnabled()).toBe(false);
  });

  it("should_ack_unknown_event_types_without_throwing", async () => {
    const event = { id: "evt_1", type: "unknown.event", data: { object: {} } } as never;
    await expect(dispatchStripeEvent(event)).resolves.toBeUndefined();
  });

  it("should_return_unprocessed_when_processing_disabled", async () => {
    process.env.STRIPE_WEBHOOK_PROCESSING = "false";
    const result = await processStripeWebhookEvent({
      id: "evt_demo",
      type: "checkout.session.completed",
      data: { object: {} }
    } as never);
    expect(result.processed).toBe(false);
  });

  it("should_claim_event_when_db_available", async () => {
    const create = vi.fn().mockResolvedValue({});
    vi.mocked(getPrisma).mockReturnValue({
      processedStripeEvent: { create }
    } as never);

    const claimed = await claimStripeEvent({
      id: "evt_unique",
      type: "checkout.session.completed"
    } as never);
    expect(claimed).toBe(true);
    expect(create).toHaveBeenCalledOnce();
  });

  it("should_reject_duplicate_event_ids", async () => {
    const create = vi.fn().mockRejectedValue(new Error("unique"));
    vi.mocked(getPrisma).mockReturnValue({
      processedStripeEvent: { create },
      userSubscription: { upsert: vi.fn() }
    } as never);

    const claimed = await claimStripeEvent({
      id: "evt_dup",
      type: "checkout.session.completed"
    } as never);
    expect(claimed).toBe(false);
  });
  it("should_report_persistence_unavailable_without_a_database", () => {
    expect(isStripePersistenceAvailable()).toBe(false);
  });

  it("should_fail_closed_in_production_when_persistence_is_unavailable", async () => {
    // Regression: previously claimStripeEvent returned true with no database,
    // so replay protection silently vanished and every subscription write was
    // dropped while the route still answered 200.
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
    try {
      const result = await processStripeWebhookEvent({
        id: "evt_prod_nodb",
        type: "checkout.session.completed",
        data: { object: {} }
      } as never);
      expect(result.processed).toBe(false);
      expect("degraded" in result && result.degraded).toBe(true);
      expect("reason" in result && result.reason).toBe("persistence_unavailable");
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("should_fail_closed_without_persistence_even_in_demo_mode", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    try {
      const result = await processStripeWebhookEvent({
        id: "evt_demo_nodb",
        type: "checkout.session.completed",
        data: { object: {} }
      } as never);
      expect(result.processed).toBe(false);
      expect("degraded" in result && result.degraded).toBe(true);
      expect("reason" in result && result.reason).toBe("persistence_unavailable");
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("should_refuse_claim_when_no_database", async () => {
    vi.mocked(getPrisma).mockReturnValue(null);
    const claimed = await claimStripeEvent({
      id: "evt_nodb",
      type: "checkout.session.completed"
    } as never);
    expect(claimed).toBe(false);
  });

  it("should_dispatch_subscription_lifecycle_and_invoice_events_via_prisma", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const upsert = vi.fn().mockResolvedValue({});
    const create = vi.fn().mockResolvedValue({});
    vi.mocked(getPrisma).mockReturnValue({
      processedStripeEvent: { create },
      userSubscription: { updateMany, upsert }
    } as never);

    await dispatchStripeEvent({
      id: "evt_sub_up",
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_1",
          status: "active",
          metadata: { planId: "pro" },
          items: { data: [] }
        }
      }
    } as never);
    expect(updateMany).toHaveBeenCalled();

    await dispatchStripeEvent({
      id: "evt_sub_del",
      type: "customer.subscription.deleted",
      data: { object: { id: "sub_1" } }
    } as never);

    await dispatchStripeEvent({
      id: "evt_inv_fail",
      type: "invoice.payment_failed",
      data: { object: { subscription: "sub_1" } }
    } as never);

    await dispatchStripeEvent({
      id: "evt_inv_ok",
      type: "invoice.payment_succeeded",
      data: { object: { subscription: "sub_1" } }
    } as never);

    await dispatchStripeEvent({
      id: "evt_acct",
      type: "account.updated",
      data: { object: { id: "acct_1" } }
    } as never);
    expect(syncConnectAccountFromStripe).toHaveBeenCalledWith("acct_1");

    await dispatchStripeEvent({
      id: "evt_co",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_1",
          metadata: { kind: "subscription", userId: "u1", planId: "athlete" },
          customer: "cus_1",
          subscription: "sub_new"
        }
      }
    } as never);
    expect(upsert).toHaveBeenCalled();
  });

  it("should_use_pg_persistence_paths_when_available", async () => {
    vi.mocked(isStripePgPersistenceAvailable).mockReturnValue(true);
    vi.mocked(claimStripeEventPg).mockResolvedValue(true);
    vi.mocked(upsertSubscriptionPg).mockResolvedValue(undefined as never);
    vi.mocked(updateSubscriptionByStripeIdPg).mockResolvedValue(undefined as never);
    vi.mocked(recordPaymentTransactionPg).mockResolvedValue(undefined as never);

    expect(isStripePersistenceAvailable()).toBe(true);

    const claimed = await claimStripeEvent({
      id: "evt_pg",
      type: "checkout.session.completed"
    } as never);
    expect(claimed).toBe(true);
    expect(claimStripeEventPg).toHaveBeenCalledWith("evt_pg", "checkout.session.completed");

    await dispatchStripeEvent({
      id: "evt_pg_sub",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_pg",
          metadata: { kind: "subscription", userId: "u_pg", planId: "athlete" },
          customer: "cus_pg",
          subscription: "sub_pg"
        }
      }
    } as never);
    expect(upsertSubscriptionPg).toHaveBeenCalled();

    await dispatchStripeEvent({
      id: "evt_pg_pay",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_pay",
          amount_total: 1000,
          metadata: {
            kind: "session",
            userId: "u_pay",
            coachId: "c1",
            coachShareCents: "850",
            platformFeeCents: "150"
          },
          payment_intent: "pi_1"
        }
      }
    } as never);
    expect(recordPaymentTransactionPg).toHaveBeenCalled();

    await dispatchStripeEvent({
      id: "evt_pg_up",
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_pg",
          status: "active",
          metadata: {},
          items: { data: [{ price: { id: "price_1" } }] }
        }
      }
    } as never);
    expect(updateSubscriptionByStripeIdPg).toHaveBeenCalled();

    await dispatchStripeEvent({
      id: "evt_pg_del",
      type: "customer.subscription.deleted",
      data: { object: { id: "sub_pg" } }
    } as never);

    await dispatchStripeEvent({
      id: "evt_pg_fail",
      type: "invoice.payment_failed",
      data: { object: { subscription: "sub_pg" } }
    } as never);

    await dispatchStripeEvent({
      id: "evt_pg_ok",
      type: "invoice.payment_succeeded",
      data: { object: { subscription: "sub_pg" } }
    } as never);

    vi.mocked(isStripePgPersistenceAvailable).mockReturnValue(false);
  });
});
