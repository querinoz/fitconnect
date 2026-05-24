import path from "node:path";
import { fileURLToPath } from "node:url";
import { PactV3, MatchersV3 } from "@pact-foundation/pact";

const { like, integer, regex } = MatchersV3;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pactDir = path.resolve(__dirname, "../../pacts");

const provider = new PactV3({
  consumer: "fitconnect-web",
  provider: "fitconnect-api",
  dir: pactDir
});

describe("health contract", () => {
  it("defines GET /api/health response", async () => {
    await provider
      .given("health endpoint is available")
      .uponReceiving("a health check request")
      .withRequest({ method: "GET", path: "/api/health" })
      .willRespondWith({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: {
          status: like("ok"),
          version: like("1.0.0"),
          timestamp: regex(
            "^\\d{4}-\\d{2}-\\d{2}T",
            "2026-05-18T12:00:00.000Z"
          ),
          dependencies: like([])
        }
      })
      .executeTest(async (mockServer) => {
        const res = await fetch(`${mockServer.url}/api/health`);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.status).toBeDefined();
        expect(json.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      });
  });
});

describe("sessions contract", () => {
  it("defines paginated GET /api/v1/sessions response", async () => {
    await provider
      .given("athlete has sessions")
      .uponReceiving("a paginated sessions list request")
      .withRequest({ method: "GET", path: "/api/v1/sessions", query: { page: "1", limit: "20" } })
      .willRespondWith({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: {
          data: like([]),
          meta: {
            total: integer(0),
            page: integer(1),
            limit: integer(20)
          }
        }
      })
      .executeTest(async (mockServer) => {
        const res = await fetch(`${mockServer.url}/api/v1/sessions?page=1&limit=20`);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(Array.isArray(json.data)).toBe(true);
        expect(json.meta.total).toBeGreaterThanOrEqual(json.data.length);
      });
  });
});

describe("readiness compute contract", () => {
  it("defines POST /api/v1/readiness/compute response", async () => {
    await provider
      .given("readiness inputs are valid")
      .uponReceiving("a readiness compute request")
      .withRequest({
        method: "POST",
        path: "/api/v1/readiness/compute",
        headers: { "Content-Type": "application/json" },
        body: { hrvMs: 62 }
      })
      .willRespondWith({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: {
          score: integer(75),
          status: like("good"),
          breakdown: {
            hrv: integer(80),
            sleep: integer(70),
            strain: integer(65)
          }
        }
      })
      .executeTest(async (mockServer) => {
        const res = await fetch(`${mockServer.url}/api/v1/readiness/compute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hrvMs: 62 })
        });
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.score).toBeGreaterThanOrEqual(0);
        expect(json.score).toBeLessThanOrEqual(100);
      });
  });
});

describe("stripe webhook contract", () => {
  it("defines invalid signature response", async () => {
    await provider
      .given("stripe webhook rejects bad signature")
      .uponReceiving("a webhook with invalid signature")
      .withRequest({
        method: "POST",
        path: "/api/stripe/webhook",
        headers: { "stripe-signature": "bad" },
        body: "{}"
      })
      .willRespondWith({ status: 400, body: { error: like("Webhook verification failed") } })
      .executeTest(async (mockServer) => {
        const res = await fetch(`${mockServer.url}/api/stripe/webhook`, {
          method: "POST",
          headers: { "stripe-signature": "bad", "Content-Type": "application/json" },
          body: "{}"
        });
        expect(res.status).toBe(400);
      });
  });
});

describe("strava callback contract", () => {
  it("defines oauth callback token payload", async () => {
    await provider
      .given("strava oauth succeeded")
      .uponReceiving("a strava callback response")
      .withRequest({ method: "GET", path: "/api/v1/integrations/strava/callback", query: { format: "json" } })
      .willRespondWith({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: {
          accessToken: like("token"),
          refreshToken: like("refresh"),
          expiresAt: integer(Math.floor(Date.now() / 1000) + 3600),
          athlete: like({ id: 1 })
        }
      })
      .executeTest(async (mockServer) => {
        const res = await fetch(
          `${mockServer.url}/api/v1/integrations/strava/callback?format=json`
        );
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.refreshToken).toBeTruthy();
        expect(json.expiresAt).toBeGreaterThan(Math.floor(Date.now() / 1000));
      });
  });
});
