import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const heartbeat = mutation({
  args: { channel: v.string(), userId: v.string(), role: v.string() },
  handler: async (ctx, { channel, userId, role }) => {
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_channel", (q) => q.eq("channel", channel))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { lastSeen: Date.now(), role });
      return existing._id;
    }
    return ctx.db.insert("presence", {
      channel,
      userId,
      role,
      lastSeen: Date.now()
    });
  }
});

export const listPresence = query({
  args: { channel: v.string() },
  handler: async (ctx, { channel }) => {
    return ctx.db
      .query("presence")
      .withIndex("by_channel", (q) => q.eq("channel", channel))
      .collect();
  }
});
