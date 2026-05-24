import { describe, expect, it, vi, beforeEach } from "vitest";
import { processStripeWebhookEvent, claimStripeEvent } from "@/lib/stripe/webhook-handler";

vi.mock("@/lib/db/client", () => ({ getPrisma: vi.fn() }));
import { getPrisma } from "@/lib/db/client";

const events = [
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
  "invoice.payment_succeeded"
] as const;

describe("stripe webhooks integration", () => {
  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_PROCESSING = "true";
    vi.clearAllMocks();
  });

  for (const type of events) {
    it(`should_process_${type.replace(/\./g, "_")}_once`, async () => {
      const upsert = vi.fn().mockResolvedValue({});
      const updateMany = vi.fn().mockResolvedValue({ count: 1 });
      const create = vi.fn().mockResolvedValue({});
      vi.mocked(getPrisma).mockReturnValue({
        processedStripeEvent: { create },
        userSubscription: { upsert, updateMany }
      } as never);

      const event = {
        id: `evt_${type}`,
        type,
        data: {
          object: {
            id: "sub_1",
            customer: "cus_1",
            subscription: "sub_1",
            status: "active",
            metadata: { userId: "user-1", kind: "subscription" },
            items: { data: [{ price: { id: "price_1" } }] }
          }
        }
      } as never;

      const first = await processStripeWebhookEvent(event);
      expect(first.processed).toBe(true);

      create.mockRejectedValueOnce(new Error("duplicate"));
      const second = await processStripeWebhookEvent(event);
      expect(second.duplicate).toBe(true);
    });
  }

  it("should_handle_concurrent_claims_with_single_winner", async () => {
    let locked = false;
    const create = vi.fn().mockImplementation(async () => {
      if (locked) throw new Error("duplicate");
      locked = true;
    });
    vi.mocked(getPrisma).mockReturnValue({
      processedStripeEvent: { create },
      userSubscription: { upsert: vi.fn(), updateMany: vi.fn() }
    } as never);

    const event = { id: "evt_race", type: "checkout.session.completed", data: { object: {} } } as never;
    const results = await Promise.all(
      Array.from({ length: 50 }, () => claimStripeEvent(event))
    );
    expect(results.filter(Boolean)).toHaveLength(1);
  });
});
