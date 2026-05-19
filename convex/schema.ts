import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/** Convex schema — deploy with `npx convex dev` when NEXT_PUBLIC_CONVEX_URL is set. */
export default defineSchema({
  presence: defineTable({
    channel: v.string(),
    userId: v.string(),
    role: v.string(),
    lastSeen: v.number()
  }).index("by_channel", ["channel"]),

  nudges: defineTable({
    channel: v.string(),
    kind: v.string(),
    body: v.string(),
    athleteId: v.optional(v.string()),
    coachId: v.optional(v.string()),
    at: v.number()
  }).index("by_channel", ["channel"]),

  messages: defineTable({
    channel: v.string(),
    payload: v.any(),
    at: v.number()
  }).index("by_channel", ["channel"])
});
