import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  claimStripeEvent,
  dispatchStripeEvent,
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
});
