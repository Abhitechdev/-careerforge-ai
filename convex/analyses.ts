import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const updateStatus = internalMutation({
  args: {
    resumeId: v.id("resumes"),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.resumeId, {
      analysisStatus: args.status,
      analysisError: args.error,
      updatedAt: Date.now(),
    });
  },
});

export const saveAnalysis = internalMutation({
  args: {
    resumeId: v.id("resumes"),
    analysis: v.object({
      overallScore: v.number(),
      atsScore: v.number(),
      skillsScore: v.number(),
      formattingScore: v.number(),
      experienceScore: v.number(),
      skills: v.array(v.string()),
      missingKeywords: v.array(v.string()),
      strengths: v.array(v.string()),
      weaknesses: v.array(v.string()),
      recommendations: v.array(v.string()),
      experienceLevel: v.string(),
      targetRoles: v.array(v.string()),
      extractedText: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    // Check if an analysis already exists for this resume
    const existing = await ctx.db
      .query("atsAnalyses")
      .withIndex("by_resumeId", (q: any) => q.eq("resumeId", args.resumeId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args.analysis,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("atsAnalyses", {
        resumeId: args.resumeId,
        ...args.analysis,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // Update resume status to completed
    await ctx.db.patch(args.resumeId, {
      analysisStatus: "completed",
      lastAnalyzed: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const get = query({
  args: { resumeId: v.id("resumes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const analysis = await ctx.db
      .query("atsAnalyses")
      .withIndex("by_resumeId", (q: any) => q.eq("resumeId", args.resumeId))
      .unique();

    return analysis;
  },
});

export const retryAnalysis = mutation({
  args: { resumeId: v.id("resumes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const resume = await ctx.db.get(args.resumeId);
    if (!resume) throw new Error("Resume not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || resume.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Reset status to pending
    await ctx.db.patch(args.resumeId, {
      analysisStatus: "pending",
      updatedAt: Date.now(),
    });

    return true;
  },
});

export const scheduleAnalysis = mutation({
  args: { resumeId: v.id("resumes") },
  handler: async (ctx, args): Promise<Id<"requestQueue">> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const resume = await ctx.db.get(args.resumeId);
    if (!resume) throw new Error("Resume not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || resume.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Rate Limit check
    const WINDOW_MS = 60 * 60 * 1000;
    const now = Date.now();
    const limit = await ctx.db.query("rateLimits").withIndex("by_user_feature", (q) => q.eq("userId", user._id).eq("feature", "ATS")).first();
    if (limit && limit.requestCount >= 60 && now - limit.windowStart <= WINDOW_MS) {
      throw new Error("RATE_LIMIT_EXCEEDED");
    }

    if (!limit) {
      await ctx.db.insert("rateLimits", { userId: user._id, feature: "ATS", requestCount: 1, windowStart: now });
    } else if (now - limit.windowStart > WINDOW_MS) {
      await ctx.db.patch(limit._id, { requestCount: 1, windowStart: now });
    } else {
      await ctx.db.patch(limit._id, { requestCount: limit.requestCount + 1 });
    }

    // Circuit Breaker check
    const sysState = await ctx.db.query("systemState").withIndex("by_key", (q) => q.eq("key", "CIRCUIT_BREAKER")).first();
    if (sysState && sysState.value.trippedAt && (now - sysState.value.trippedAt < 5 * 60 * 1000)) {
      throw new Error("CIRCUIT_BREAKER_TRIPPED");
    }

    // Enqueue job for visibility
    const jobId = await ctx.db.insert("requestQueue", { 
      userId: user._id, type: "ATS_ANALYSIS", payload: JSON.stringify({ resumeId: args.resumeId }),
      status: "pending", attempts: 0, createdAt: now, updatedAt: now 
    });

    // Schedule the background action
    await ctx.scheduler.runAfter(0, internal.analyzeAction.analyzeResumeBackground, { resumeId: args.resumeId, jobId });

    // Update status
    await ctx.db.patch(args.resumeId, {
      analysisStatus: "pending",
      updatedAt: Date.now(),
    });

    return jobId;
  },
});

// Internal queries to help the Action verify things without needing another file
import { internalQuery } from "./_generated/server";

export const getResumeInternal = internalQuery({
  args: { id: v.id("resumes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getUserInternal = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});
