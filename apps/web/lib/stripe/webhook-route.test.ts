import { describe, expect, it, vi, afterEach } from "vitest";
import { POST } from "@/app/api/stripe/webhook/route";

vi.mock("@/lib/security/rate-limit", () => ({
  enforceRateLimit: async () => null
}));

vi.mock("@/lib/stripe/server", () => ({
  isStripeLive: () => false,
  verifyStripeWebhook: vi.fn()
}));

vi.mock("@/lib/stripe/webhook-handler", () => ({
  processStripeWebhookEvent: vi.fn(async () => ({ processed: true }))
}));

describe("stripe webhook fail-closed", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects unsigned events in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
    const response = await POST(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        body: JSON.stringify({ type: "checkout.session.completed" })
      })
    );
    expect(response.status).toBe(503);
  });
});
