import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const publishMessage = mutation({
  args: {
    channel: v.string(),
    payload: v.any()
  },
  handler: async (ctx, { channel, payload }) => {
    return ctx.db.insert("messages", {
      channel,
      payload,
      at: Date.now()
    });
  }
});

export const listMessagesSince = query({
  args: {
    channel: v.string(),
    since: v.number()
  },
  handler: async (ctx, { channel, since }) => {
    const rows = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channel", channel))
      .filter((q) => q.gt(q.field("at"), since))
      .order("asc")
      .collect();
    return rows;
  }
});
