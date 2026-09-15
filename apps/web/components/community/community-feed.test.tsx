import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommunityFeed } from "./community-feed";

vi.mock("@/lib/realtime/use-channel", () => ({
  useChannel: () => ({ messages: [], send: vi.fn() })
}));

describe("CommunityFeed", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("does not publish a local fake post when the API fails", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string, init?: RequestInit) => {
        if (init?.method === "POST") {
          return Promise.resolve({
            ok: false,
            status: 401,
            json: async () => ({ error: "unauthorized" })
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ posts: [] })
        });
      })
    );
    render(<CommunityFeed filteredIds={null} />);
    expect(await screen.findByText(/your squad is quiet/i)).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText(/share a pr/i), "New PR");
    await user.click(screen.getByRole("button", { name: /post to feed/i }));
    expect(await screen.findByText(/sign in to post/i)).toBeInTheDocument();
    expect(screen.queryByText(/just now/i)).not.toBeInTheDocument();
  });

  it("does not map clap reactions to comment counts", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (String(url).includes("/comments")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ comments: [] })
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            posts: [
              {
                id: "p1",
                author: { name: "Ines", avatar: "/a.png", sport: "Running" },
                kind: "Check-in",
                text: "Easy miles",
                likes: 2,
                comments: 9,
                ago: "1h"
              }
            ]
          })
        });
      })
    );
    const user = userEvent.setup();
    render(<CommunityFeed filteredIds={null} />);
    expect(await screen.findByText(/easy miles/i)).toBeInTheDocument();
    expect(screen.getByText("🔥 2")).toBeInTheDocument();
    expect(screen.getByText("👏 0")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /comments/i }));
    expect(await screen.findByText(/no comments yet/i)).toBeInTheDocument();
  });
});
