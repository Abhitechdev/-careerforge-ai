import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// 60 requests per hour per feature
const MAX_REQUESTS = 60;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

export const checkRateLimit = internalQuery({
  args: { userId: v.id("users"), feature: v.string() },
  handler: async (ctx, args) => {
    const limit = await ctx.db
      .query("rateLimits")
      .withIndex("by_user_feature", (q) => q.eq("userId", args.userId).eq("feature", args.feature))
      .first();

    if (!limit) return true;

    if (Date.now() - limit.windowStart > WINDOW_MS) {
      return true;
    }

    return limit.requestCount < MAX_REQUESTS;
  }
});

export const recordRequest = internalMutation({
  args: { userId: v.id("users"), feature: v.string() },
  handler: async (ctx, args) => {
    const limit = await ctx.db
      .query("rateLimits")
      .withIndex("by_user_feature", (q) => q.eq("userId", args.userId).eq("feature", args.feature))
      .first();

    const now = Date.now();

    if (!limit) {
      await ctx.db.insert("rateLimits", {
        userId: args.userId,
        feature: args.feature,
        requestCount: 1,
        windowStart: now,
      });
      return;
    }

    if (now - limit.windowStart > WINDOW_MS) {
      await ctx.db.patch(limit._id, {
        requestCount: 1,
        windowStart: now,
      });
    } else {
      await ctx.db.patch(limit._id, {
        requestCount: limit.requestCount + 1,
      });
    }
  }
});
