import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/v1/community/posts/route";
import { resetCommunityPostsForTests } from "@/lib/community/server-posts";

vi.mock("@/lib/api/require-auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/require-auth")>();
  return {
    ...actual,
    requireAuth: vi.fn().mockResolvedValue({
      ok: true,
      user: { id: "demo-user", role: "athlete", email: "demo@fitconnect.app" },
      supabaseUserId: "demo-user",
      demo: true
    })
  };
});

describe("/api/v1/community/posts", () => {
  beforeEach(() => {
    resetCommunityPostsForTests();
  });

  it("lists seed posts from server store", async () => {
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.source).toBe("memory");
    expect(body.posts.length).toBeGreaterThan(0);
  });

  it("creates a user post via POST", async () => {
    const res = await POST(
      new Request("http://localhost/api/v1/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Server-backed check-in", kind: "Check-in" })
      })
    );
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.post.text).toBe("Server-backed check-in");
    expect(body.post.id).toMatch(/^c-user-/);

    const listed = await (await GET()).json();
    expect(listed.posts[0].id).toBe(body.post.id);
  });
});
