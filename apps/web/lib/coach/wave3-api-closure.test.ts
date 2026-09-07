/**
 * WAVE 3 API closures — DM, earnings ledger, booking realtime publish contract.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as getMessages, POST as postMessage } from "@/app/api/v1/messages/route";
import { GET as getEarnings } from "@/app/api/v1/coaches/earnings/route";
import { publishSessionBooking } from "@/lib/realtime/publish-booking";
import { publishDirectMessage } from "@/lib/realtime/publish-message";
import { resetDirectMessagesForTests } from "@/lib/db/direct-messages";
import {
  getBroadcastTransport,
  resetBroadcastTransportForTests
} from "@/lib/platform/realtime/broadcast-transport";

vi.mock("@/lib/api/require-auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/require-auth")>();
  return {
    ...actual,
    requireAuth: vi.fn(async (req?: Request) => {
      const roleHeader = req?.headers.get("x-test-role") ?? "athlete";
      const userId = req?.headers.get("x-test-user") ?? "athlete-a";
      return {
        ok: true as const,
        user: {
          id: userId,
          role: roleHeader as "athlete" | "coach" | "admin",
          email: `${userId}@fitconnect.app`
        },
        supabaseUserId: userId,
        accessToken: "test-token",
        demo: false
      };
    }),
    requireAthleteId: vi.fn(async (req: Request) => {
      const auth = await (
        await import("@/lib/api/require-auth")
      ).requireAuth(req);
      if (!auth.ok) return auth;
      return { athleteId: auth.user.id, accessToken: auth.accessToken };
    }),
    requireCoachId: vi.fn(async (req: Request) => {
      const auth = await (
        await import("@/lib/api/require-auth")
      ).requireAuth(req);
      if (!auth.ok) return auth;
      if (auth.user.role !== "coach" && auth.user.role !== "admin") {
        const { NextResponse } = await import("next/server");
        return {
          ok: false as const,
          response: NextResponse.json({ error: "forbidden" }, { status: 403 })
        };
      }
      return { coachId: auth.user.id, accessToken: auth.accessToken };
    })
  };
});

vi.mock("@/lib/db/client", () => ({
  getPrisma: () => null,
  isDatabaseConfigured: () => false
}));

function athleteReq(path: string, method: string, body?: unknown, user = "athlete-a") {
  return new Request(`http://localhost${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-test-user": user,
      "x-test-role": "athlete"
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

function coachReq(path: string, method = "GET", user = "coach-a", body?: unknown) {
  return new Request(`http://localhost${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-test-user": user,
      "x-test-role": "coach"
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

describe("wave3-api-closure", () => {
  beforeEach(() => {
    resetDirectMessagesForTests();
    resetBroadcastTransportForTests();
  });

  it("POST /api/v1/messages creates athlete→coach DM", async () => {
    const res = await postMessage(
      athleteReq("/api/v1/messages", "POST", {
        coachId: "coach-a",
        preview: "Hi coach — Discover DM"
      })
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.message.coachId).toBe("coach-a");
    expect(json.message.from).toBe("athlete");
    expect(json.message.preview).toContain("Discover DM");
  });

  it("GET /api/v1/messages returns memory DM after create", async () => {
    await postMessage(
      athleteReq("/api/v1/messages", "POST", {
        coachId: "coach-a",
        preview: "ping"
      })
    );
    const res = await getMessages(athleteReq("/api/v1/messages", "GET"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.messages.length).toBeGreaterThanOrEqual(1);
    expect(json.messages[0].preview).toBe("ping");
  });

  it("GET /api/v1/coaches/earnings returns honest empty ledger without DB", async () => {
    const res = await getEarnings(coachReq("/api/v1/coaches/earnings"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.earnings.weekCents).toBe(0);
    expect(json.earnings.monthCents).toBe(0);
    expect(json.earnings.stripeLive).toBe(false);
    expect(String(json.earnings.payoutStatus)).toMatch(/BLOCKED_EXTERNAL|empty/i);
  });

  it("publishSessionBooking fans out to fitconnect:booking", () => {
    const received: unknown[] = [];
    const transport = getBroadcastTransport();
    transport.subscribe("fitconnect:booking", (msg) => received.push(msg));
    publishSessionBooking({
      athleteId: "athlete-a",
      athleteName: "A",
      coachId: "coach-a",
      coachName: "C",
      mode: "standard"
    });
    expect(received).toHaveLength(1);
    expect((received[0] as { kind: string }).kind).toBe("session-booking");
  });

  it("publishDirectMessage fans out to fitconnect:message", () => {
    const received: unknown[] = [];
    const transport = getBroadcastTransport();
    transport.subscribe("fitconnect:message", (msg) => received.push(msg));
    publishDirectMessage({
      id: "msg-1",
      athleteId: "athlete-a",
      coachId: "coach-a",
      from: "athlete",
      preview: "hello"
    });
    expect(received).toHaveLength(1);
    expect((received[0] as { kind: string }).kind).toBe("direct-message");
  });
});
