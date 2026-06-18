import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("announcements")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .order("desc")
      .take(1);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    type: v.union(v.literal("info"), v.literal("success"), v.literal("warning"), v.literal("new_feature")),
  },
  handler: async (ctx, args) => {
    // Basic admin check could be added here
    await ctx.db.insert("announcements", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const deactivate = mutation({
  args: { id: v.id("announcements") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: false });
  },
});
