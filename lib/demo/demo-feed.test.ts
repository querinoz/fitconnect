import { describe, it, expect } from "vitest";
import {
  DEMO_FEED_SEQUENCE,
  createDemoFeedPost,
  nextDemoFeedTemplate,
  resetDemoFeedSequence
} from "./demo-feed";
import { DEMO_PERSONAS } from "./demo-personas";

describe("demo-feed", () => {
  it("cycles through 8 event templates", () => {
    resetDemoFeedSequence();
    const types = new Set<string>();
    for (let i = 0; i < 8; i++) {
      types.add(nextDemoFeedTemplate().type);
    }
    expect(types.size).toBe(8);
    expect(DEMO_FEED_SEQUENCE.length).toBe(8);
  });

  it("marks posts as demo with event IDs", () => {
    resetDemoFeedSequence();
    const post = createDemoFeedPost(nextDemoFeedTemplate());
    expect(post.demo).toBe(true);
    expect(post.eventId).toMatch(/^demo-event-/);
    expect(post.meta.demoAsset).toBe(true);
  });

  it("uses fictional personas only", () => {
    for (const persona of Object.values(DEMO_PERSONAS)) {
      expect(persona.meta.synthetic).toBe(true);
      expect(persona.meta.demoAsset).toBe(true);
    }
  });
});
