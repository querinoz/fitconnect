import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const pushNudge = mutation({
  args: {
    channel: v.string(),
    kind: v.string(),
    body: v.string(),
    athleteId: v.optional(v.string()),
    coachId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("nudges", { ...args, at: Date.now() });
  }
});

export const listNudges = query({
  args: { channel: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { channel, limit = 20 }) => {
    const rows = await ctx.db
      .query("nudges")
      .withIndex("by_channel", (q) => q.eq("channel", channel))
      .order("desc")
      .take(limit);
    return rows;
  }
});
