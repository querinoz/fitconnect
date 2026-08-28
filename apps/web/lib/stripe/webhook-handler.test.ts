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

import { getPrisma } from "@/lib/db/client";

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

  it("should_still_process_in_demo_without_a_database", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    try {
      const result = await processStripeWebhookEvent({
        id: "evt_demo_nodb",
        type: "checkout.session.completed",
        data: { object: {} }
      } as never);
      expect(result.processed).toBe(true);
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
