/**
 * WAVE 2 API closures — programs enroll, notifications, body metrics, coach settings, tasks.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as getPrograms, POST as enrollProgram } from "@/app/api/v1/athletes/programs/route";
import { GET as getBody, PUT as putBody } from "@/app/api/v1/athletes/body-metrics/route";
import { POST as toggleTask } from "@/app/api/v1/athletes/tasks/toggle/route";
import {
  GET as getNotifications,
  POST as createNotification,
  PUT as markRead
} from "@/app/api/v1/notifications/route";
import { GET as getCoachSettings } from "@/app/api/v1/coaches/settings/route";
import { resetProgramEnrollmentsForTests } from "@/lib/db/program-enrollments";
import { resetNotificationsForTests } from "@/lib/db/user-notifications";
import { resetBodyMetricsForTests } from "@/lib/db/body-metrics";
import { resetAthleteTasksForTests } from "@/lib/db/athlete-tasks";
import { resetCoachSettingsForTests } from "@/lib/db/coach-settings";

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

function coachReq(path: string, method = "GET", user = "coach-a") {
  return new Request(`http://localhost${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-test-user": user,
      "x-test-role": "coach"
    }
  });
}

describe("WAVE 2 API closures", () => {
  beforeEach(() => {
    resetProgramEnrollmentsForTests();
    resetNotificationsForTests();
    resetBodyMetricsForTests();
    resetAthleteTasksForTests();
    resetCoachSettingsForTests();
  });

  it("enrolls athlete in catalog program and is idempotent", async () => {
    const first = await enrollProgram(
      athleteReq("/api/v1/athletes/programs", "POST", { programId: "prog-vo2-8" })
    );
    expect(first.status).toBe(201);
    const json = await first.json();
    expect(json.enrollment.programId).toBe("prog-vo2-8");

    const second = await enrollProgram(
      athleteReq("/api/v1/athletes/programs", "POST", { programId: "prog-vo2-8" })
    );
    expect(second.status).toBe(200);
    expect((await second.json()).idempotent).toBe(true);

    const list = await getPrograms(athleteReq("/api/v1/athletes/programs", "GET"));
    const listed = await list.json();
    expect(listed.enrollments).toHaveLength(1);
    expect(listed.catalog.length).toBeGreaterThanOrEqual(2);
  });

  it("rejects unknown program", async () => {
    const res = await enrollProgram(
      athleteReq("/api/v1/athletes/programs", "POST", { programId: "missing" })
    );
    expect(res.status).toBe(404);
  });

  it("forbids athleteId impersonation on enroll", async () => {
    const res = await enrollProgram(
      athleteReq("/api/v1/athletes/programs", "POST", {
        programId: "prog-vo2-8",
        athleteId: "other"
      })
    );
    expect(res.status).toBe(403);
  });

  it("stores and reads body metrics", async () => {
    const put = await putBody(
      athleteReq("/api/v1/athletes/body-metrics", "PUT", {
        weightKg: 72.5,
        hydrationLiters: 2.1,
        nutritionKcal: 2200
      })
    );
    expect(put.status).toBe(200);
    const get = await getBody(athleteReq("/api/v1/athletes/body-metrics", "GET"));
    const json = await get.json();
    expect(json.metrics.weightKg).toBe(72.5);
  });

  it("toggles athlete tasks", async () => {
    const res = await toggleTask(
      athleteReq("/api/v1/athletes/tasks/toggle", "POST", { taskId: "task-1" })
    );
    expect(res.status).toBe(200);
    expect((await res.json()).task.done).toBe(true);
  });

  it("creates lists and marks notifications", async () => {
    const created = await createNotification(
      athleteReq("/api/v1/notifications", "POST", {
        title: "Session soon",
        body: "Starts in 1h",
        deepLink: "fitconnect://app/athlete/home"
      })
    );
    expect(created.status).toBe(201);
    const id = (await created.json()).notification.id;

    const listed = await getNotifications(athleteReq("/api/v1/notifications", "GET"));
    expect((await listed.json()).notifications).toHaveLength(1);

    const marked = await markRead(
      athleteReq("/api/v1/notifications", "PUT", { id })
    );
    expect(marked.status).toBe(200);
    expect((await marked.json()).notification.read).toBe(true);
  });

  it("returns coach availability and cancellation policy", async () => {
    const res = await getCoachSettings(coachReq("/api/v1/coaches/settings"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.availability.length).toBeGreaterThan(0);
    expect(json.cancellationPolicy.hoursNotice).toBe(24);
    expect(json.documents).toEqual([]);
  });
});
