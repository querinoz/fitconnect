import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/v1/ingestion/webhook/route";

vi.mock("@/lib/security/rate-limit", () => ({
  enforceRateLimit: async () => null
}));

vi.mock("@/lib/ingestion", () => ({
  ingestOuraWebhook: () => ({ ok: true }),
  ingestStravaWebhook: () => ({ ok: true }),
  ingestWhoopWebhook: () => ({ ok: true })
}));

describe("ingestion webhook fail-closed", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
    vi.stubEnv("INGESTION_WEBHOOK_SECRET", "");
    vi.stubEnv("INTEGRATION_AUTH_SECRET", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 503 when the secret is missing", async () => {
    const response = await POST(
      new Request("http://localhost/api/v1/ingestion/webhook?provider=whoop", {
        method: "POST",
        body: "{}"
      })
    );
    expect(response.status).toBe(503);
  });

  it("rejects a wrong bearer", async () => {
    vi.stubEnv("INGESTION_WEBHOOK_SECRET", "expected");
    const response = await POST(
      new Request("http://localhost/api/v1/ingestion/webhook?provider=whoop", {
        method: "POST",
        headers: { authorization: "Bearer wrong", "Content-Type": "application/json" },
        body: "{}"
      })
    );
    expect(response.status).toBe(401);
  });

  it("accepts a matching bearer", async () => {
    vi.stubEnv("INGESTION_WEBHOOK_SECRET", "expected");
    const response = await POST(
      new Request("http://localhost/api/v1/ingestion/webhook?provider=whoop", {
        method: "POST",
        headers: { authorization: "Bearer expected", "Content-Type": "application/json" },
        body: "{}"
      })
    );
    expect(response.status).toBe(200);
  });
});
