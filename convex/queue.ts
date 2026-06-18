import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const enqueueJob = mutation({
  args: { clerkId: v.string(), type: v.string(), payload: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) throw new Error("User not found");

    const jobId = await ctx.db.insert("requestQueue", {
      userId: user._id,
      type: args.type,
      payload: args.payload,
      status: "pending",
      attempts: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return jobId;
  }
});

export const updateJobStatus = internalMutation({
  args: { jobId: v.id("requestQueue"), status: v.string(), error: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const validStatus = args.status as "pending" | "processing" | "completed" | "failed";
    await ctx.db.patch(args.jobId, {
      status: validStatus,
      error: args.error,
      updatedAt: Date.now(),
    });
  }
});

export const incrementJobAttempt = internalMutation({
  args: { jobId: v.id("requestQueue") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (job) {
      await ctx.db.patch(args.jobId, {
        attempts: job.attempts + 1,
        updatedAt: Date.now()
      });
    }
  }
});

export const getJobStatus = query({
  args: { jobId: v.id("requestQueue") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobId);
  }
});

export const getUserJobs = query({
  args: { clerkId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) return [];

    return await ctx.db
      .query("requestQueue")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit || 10);
  }
});
