import { describe, expect, it } from "vitest";
import { expandMessageBody, messageSubject } from "@/lib/inbox/expand-message";
import type { ThreadMessage } from "@fitconnect/types";

const base: ThreadMessage = {
  id: "1",
  threadId: "t1",
  athleteId: "a1",
  coachId: "c1",
  from: "coach",
  preview: "Great session yesterday.",
  when: "12m",
  unread: true
};

describe("expandMessageBody", () => {
  it("appends coach signature for short previews", () => {
    const body = expandMessageBody(base);
    expect(body).toContain("Great session yesterday.");
    expect(body).toContain("Your coach");
  });
});

describe("messageSubject", () => {
  it("detects plan updates", () => {
    expect(
      messageSubject({ ...base, preview: "Thursday threshold moved in your plan." })
    ).toBe("Plan update");
  });
});
