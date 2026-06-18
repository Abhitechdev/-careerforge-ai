import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getCache = internalQuery({
  args: { cacheKey: v.string() },
  handler: async (ctx, args) => {
    const cache = await ctx.db
      .query("requestCache")
      .withIndex("by_cacheKey", (q) => q.eq("cacheKey", args.cacheKey))
      .first();

    if (!cache) return null;
    if (Date.now() > cache.expiresAt) return null;

    return JSON.parse(cache.data);
  }
});

export const setCache = internalMutation({
  args: { cacheKey: v.string(), data: v.string(), ttlMs: v.number() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("requestCache")
      .withIndex("by_cacheKey", (q) => q.eq("cacheKey", args.cacheKey))
      .first();

    const now = Date.now();
    const expiresAt = now + args.ttlMs;

    if (existing) {
      await ctx.db.patch(existing._id, {
        data: args.data,
        expiresAt,
      });
    } else {
      await ctx.db.insert("requestCache", {
        cacheKey: args.cacheKey,
        data: args.data,
        expiresAt,
        createdAt: now,
      });
    }
  }
});
