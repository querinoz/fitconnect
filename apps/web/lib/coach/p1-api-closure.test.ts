/**
 * P1 API closure contracts — BOOK / SOCIAL / COACH-CALENDAR.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as createBooking } from "@/app/api/v1/bookings/route";
import { GET as listComments, POST as createComment } from "@/app/api/v1/community/posts/[id]/comments/route";
import {
  DELETE as deleteReaction,
  GET as listReactions,
  POST as upsertReaction
} from "@/app/api/v1/community/posts/[id]/reactions/route";
import { PATCH as mutateSession } from "@/app/api/v1/sessions/[id]/route";
import { resetBookingsForTests } from "@/lib/db/bookings";
import {
  resetSessionMutationsForTests,
  seedMemorySessionForTests
} from "@/lib/db/sessions-mutate";
import { resetPostCommentsForTests } from "@/lib/community/post-comments";
import { resetPostReactionsForTests } from "@/lib/community/post-reactions";
import { createCommunityPost, resetCommunityPostsForTests } from "@/lib/community/server-posts";

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
      const bodyAthlete = undefined;
      void bodyAthlete;
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

function athleteReq(body: unknown, user = "athlete-a") {
  return new Request("http://localhost/api/v1/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-test-user": user,
      "x-test-role": "athlete"
    },
    body: JSON.stringify(body)
  });
}

describe("P1 API closure", () => {
  beforeEach(() => {
    resetBookingsForTests();
    resetSessionMutationsForTests();
    resetPostCommentsForTests();
    resetPostReactionsForTests();
    resetCommunityPostsForTests();
  });

  it("BOOK-001 athlete creates booking", async () => {
    const when = new Date(Date.now() + 86_400_000).toISOString();
    const res = await createBooking(
      athleteReq({
        coachId: "coach-1",
        scheduledAt: when,
        durationMin: 60
      })
    );
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.booking.coachId).toBe("coach-1");
    expect(body.booking.athleteId).toBe("athlete-a");
    expect(body.booking.status).toBe("pending");
    expect(body.source).toBe("memory");
  });

  it("BOOK-002 client athleteId impersonation forbidden", async () => {
    const when = new Date(Date.now() + 86_400_000).toISOString();
    const res = await createBooking(
      athleteReq({
        coachId: "coach-1",
        scheduledAt: when,
        athleteId: "athlete-other"
      })
    );
    expect(res.status).toBe(403);
  });

  it("BOOK-003 duplicate same slot is idempotent", async () => {
    const when = new Date(Date.now() + 172_800_000).toISOString();
    const payload = { coachId: "coach-1", scheduledAt: when };
    const first = await createBooking(athleteReq(payload));
    const second = await createBooking(athleteReq(payload));
    const a = await first.json();
    const b = await second.json();
    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect(b.idempotent).toBe(true);
    expect(b.booking.id).toBe(a.booking.id);
  });

  it("BOOK-004 past scheduledAt rejected", async () => {
    const res = await createBooking(
      athleteReq({
        coachId: "coach-1",
        scheduledAt: new Date(Date.now() - 3_600_000).toISOString()
      })
    );
    expect(res.status).toBe(422);
  });

  it("SOCIAL-COMMENT-001 create + list comment", async () => {
    const post = createCommunityPost({
      id: "11111111-1111-1111-1111-111111111111",
      author: { name: "A", avatar: "x", sport: "Running" },
      kind: "Check-in",
      text: "hello"
    });
    const createRes = await createComment(
      new Request(`http://localhost/api/v1/community/posts/${post.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-test-user": "athlete-a",
          "x-test-role": "athlete"
        },
        body: JSON.stringify({ text: "Nice work" })
      }),
      { params: Promise.resolve({ id: post.id }) }
    );
    expect(createRes.status).toBe(201);
    const listed = await listComments(
      new Request(`http://localhost/api/v1/community/posts/${post.id}/comments`),
      { params: Promise.resolve({ id: post.id }) }
    );
    const body = await listed.json();
    expect(body.comments.length).toBe(1);
    expect(body.comments[0].text).toBe("Nice work");
    expect(body.comments[0].authorId).toBe("athlete-a");
  });

  it("SOCIAL-COMMENT-002 author impersonation forbidden", async () => {
    const post = createCommunityPost({
      id: "22222222-2222-2222-2222-222222222222",
      author: { name: "A", avatar: "x", sport: "Running" },
      kind: "Check-in",
      text: "hello"
    });
    const res = await createComment(
      new Request(`http://localhost/api/v1/community/posts/${post.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-test-user": "athlete-a",
          "x-test-role": "athlete"
        },
        body: JSON.stringify({ text: "x", authorId: "other" })
      }),
      { params: Promise.resolve({ id: post.id }) }
    );
    expect(res.status).toBe(403);
  });

  it("SOCIAL-REACTION-001 upsert is idempotent", async () => {
    const postId = "33333333-3333-3333-3333-333333333333";
    createCommunityPost({
      id: postId,
      author: { name: "A", avatar: "x", sport: "Running" },
      kind: "Check-in",
      text: "hi"
    });
    const req = () =>
      new Request(`http://localhost/api/v1/community/posts/${postId}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-test-user": "athlete-a",
          "x-test-role": "athlete"
        },
        body: JSON.stringify({ emoji: "LIKE" })
      });
    const first = await upsertReaction(req(), {
      params: Promise.resolve({ id: postId })
    });
    const second = await upsertReaction(req(), {
      params: Promise.resolve({ id: postId })
    });
    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect((await second.json()).idempotent).toBe(true);
    const listed = await listReactions(
      new Request(`http://localhost/api/v1/community/posts/${postId}/reactions`),
      { params: Promise.resolve({ id: postId }) }
    );
    const body = await listed.json();
    expect(body.reactions.length).toBe(1);
  });

  it("SOCIAL-REACTION-002 delete removes reaction", async () => {
    const postId = "44444444-4444-4444-4444-444444444444";
    createCommunityPost({
      id: postId,
      author: { name: "A", avatar: "x", sport: "Running" },
      kind: "Check-in",
      text: "hi"
    });
    await upsertReaction(
      new Request(`http://localhost/api/v1/community/posts/${postId}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-test-user": "athlete-a",
          "x-test-role": "athlete"
        },
        body: JSON.stringify({ emoji: "FIRE" })
      }),
      { params: Promise.resolve({ id: postId }) }
    );
    const del = await deleteReaction(
      new Request(
        `http://localhost/api/v1/community/posts/${postId}/reactions?emoji=FIRE`,
        {
          method: "DELETE",
          headers: { "x-test-user": "athlete-a", "x-test-role": "athlete" }
        }
      ),
      { params: Promise.resolve({ id: postId }) }
    );
    expect(del.status).toBe(200);
  });

  it("COACH-RESCHEDULE-001 owner can reschedule", async () => {
    seedMemorySessionForTests({
      id: "sess-1",
      coachId: "coach-1",
      athleteId: "athlete-a",
      when: new Date(Date.now() + 86_400_000).toISOString(),
      status: "scheduled"
    });
    const when = new Date(Date.now() + 172_800_000).toISOString();
    const res = await mutateSession(
      new Request("http://localhost/api/v1/sessions/sess-1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-test-user": "coach-1",
          "x-test-role": "coach"
        },
        body: JSON.stringify({ action: "reschedule", when })
      }),
      { params: Promise.resolve({ id: "sess-1" }) }
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.session.when).toBe(when);
  });

  it("COACH-RESCHEDULE-002 foreign coach forbidden", async () => {
    seedMemorySessionForTests({
      id: "sess-2",
      coachId: "coach-1",
      athleteId: "athlete-a",
      when: new Date(Date.now() + 86_400_000).toISOString(),
      status: "scheduled"
    });
    const res = await mutateSession(
      new Request("http://localhost/api/v1/sessions/sess-2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-test-user": "coach-other",
          "x-test-role": "coach"
        },
        body: JSON.stringify({
          action: "reschedule",
          when: new Date(Date.now() + 200_000_000).toISOString()
        })
      }),
      { params: Promise.resolve({ id: "sess-2" }) }
    );
    expect(res.status).toBe(403);
  });

  it("COACH-CANCEL-001 owner can cancel", async () => {
    seedMemorySessionForTests({
      id: "sess-3",
      coachId: "coach-1",
      athleteId: "athlete-a",
      when: new Date(Date.now() + 86_400_000).toISOString(),
      status: "scheduled"
    });
    const res = await mutateSession(
      new Request("http://localhost/api/v1/sessions/sess-3", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-test-user": "coach-1",
          "x-test-role": "coach"
        },
        body: JSON.stringify({ action: "cancel" })
      }),
      { params: Promise.resolve({ id: "sess-3" }) }
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.session.status).toBe("cancelled");
  });

  it("COACH-CANCEL-002 athlete cannot cancel", async () => {
    seedMemorySessionForTests({
      id: "sess-4",
      coachId: "coach-1",
      athleteId: "athlete-a",
      when: new Date(Date.now() + 86_400_000).toISOString(),
      status: "scheduled"
    });
    const res = await mutateSession(
      new Request("http://localhost/api/v1/sessions/sess-4", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-test-user": "athlete-a",
          "x-test-role": "athlete"
        },
        body: JSON.stringify({ action: "cancel" })
      }),
      { params: Promise.resolve({ id: "sess-4" }) }
    );
    expect(res.status).toBe(403);
  });
});
