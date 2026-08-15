import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/v1/sessions/route";
import { SEED_ATHLETE_ID, SEED_COACH_ID, buildSessionSummary } from "../fixtures/domain";

vi.mock("@/lib/db/repository", () => ({
  listAthleteSessions: vi.fn(),
  listCoachSessions: vi.fn()
}));

vi.mock("@/lib/api/require-auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/require-auth")>();
  return {
    ...actual,
    requireAuth: vi.fn().mockResolvedValue({
      ok: true,
      user: { id: "demo-user", role: "athlete", email: "demo@fitconnect.app" },
      supabaseUserId: "demo-user",
      demo: true
    }),
    requireAthleteId: vi.fn().mockResolvedValue({ athleteId: "a-ines" }),
    requireCoachId: vi.fn().mockImplementation(async (_req: Request, coachId: string) => ({
      coachId
    }))
  };
});

import { listAthleteSessions, listCoachSessions } from "@/lib/db/repository";

describe("GET /api/v1/sessions", () => {
  beforeEach(() => {
    vi.mocked(listAthleteSessions).mockReset();
    vi.mocked(listCoachSessions).mockReset();
  });

  it("should_return_paginated_athlete_sessions_when_no_coachId_query_param", async () => {
    const sessions = [buildSessionSummary()];
    vi.mocked(listAthleteSessions).mockResolvedValue(sessions);

    const response = await GET(new Request("http://localhost/api/v1/sessions"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe("sess-demo-001");
    expect(body.meta.total).toBe(1);
    expect(listAthleteSessions).toHaveBeenCalledWith(SEED_ATHLETE_ID);
  });

  it("should_return_legacy_sessions_shape_when_legacy_query_param_set", async () => {
    const sessions = [buildSessionSummary()];
    vi.mocked(listAthleteSessions).mockResolvedValue(sessions);

    const response = await GET(new Request("http://localhost/api/v1/sessions?legacy=1"));
    const body = await response.json();

    expect(body.sessions).toHaveLength(1);
    expect(body.data).toBeUndefined();
  });

  it("should_return_coach_sessions_when_coachId_is_provided", async () => {
    const sessions = [
      buildSessionSummary({ id: "sess-coach-001", athleteId: SEED_ATHLETE_ID })
    ];
    vi.mocked(listCoachSessions).mockResolvedValue(sessions);

    const response = await GET(
      new Request(`http://localhost/api/v1/sessions?coachId=${SEED_COACH_ID}`)
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data[0].coachId).toBe(SEED_COACH_ID);
    expect(listCoachSessions).toHaveBeenCalledWith(SEED_COACH_ID);
  });

  it("should_return_empty_array_when_repository_has_no_sessions", async () => {
    vi.mocked(listAthleteSessions).mockResolvedValue([]);

    const response = await GET(new Request("http://localhost/api/v1/sessions"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });
});
