import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

export const create = mutation({
  args: {
    clerkId: v.string(),
    resumeId: v.id("resumes"),
    company: v.string(),
    role: v.string(),
    location: v.string(),
    jobDescription: v.string(),
    matchScore: v.number(),
    skillsMatch: v.number(),
    experienceMatch: v.number(),
    keywordMatch: v.number(),
    educationMatch: v.number(),
    matchSummary: v.string(),
    scoreReasoning: v.string(),
    missingSkills: v.object({
      critical: v.array(v.string()),
      niceToHave: v.array(v.string()),
      optional: v.array(v.string()),
    }),
    missingKeywords: v.array(v.string()),
    recommendations: v.array(v.string()),
    learningPath: v.array(v.object({
      skill: v.string(),
      resource: v.string(),
    })),
    status: v.union(v.literal("Saved"), v.literal("Analyzed"), v.literal("Ready to Apply"), v.literal("Missing Skills")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    const jobMatchId = await ctx.db.insert("jobMatches", {
      userId: user._id,
      resumeId: args.resumeId,
      company: args.company,
      role: args.role,
      location: args.location,
      jobDescription: args.jobDescription,
      matchScore: args.matchScore,
      skillsMatch: args.skillsMatch,
      experienceMatch: args.experienceMatch,
      keywordMatch: args.keywordMatch,
      educationMatch: args.educationMatch,
      matchSummary: args.matchSummary,
      scoreReasoning: args.scoreReasoning,
      missingSkills: args.missingSkills,
      missingKeywords: args.missingKeywords,
      recommendations: args.recommendations,
      learningPath: args.learningPath,
      status: args.status,
      createdAt: Date.now(),
    });

    // Update jobMatchesCount for user
    await ctx.db.patch(user._id, {
      jobMatchesCount: user.jobMatchesCount + 1,
    });

    return jobMatchId;
  },
});

export const createInternal = internalMutation({
  args: {
    clerkId: v.string(),
    resumeId: v.id("resumes"),
    company: v.string(),
    role: v.string(),
    location: v.string(),
    jobDescription: v.string(),
    matchScore: v.number(),
    skillsMatch: v.number(),
    experienceMatch: v.number(),
    keywordMatch: v.number(),
    educationMatch: v.number(),
    matchSummary: v.string(),
    scoreReasoning: v.string(),
    missingSkills: v.object({
      critical: v.array(v.string()),
      niceToHave: v.array(v.string()),
      optional: v.array(v.string()),
    }),
    missingKeywords: v.array(v.string()),
    recommendations: v.array(v.string()),
    learningPath: v.array(v.object({
      skill: v.string(),
      resource: v.string(),
    })),
    status: v.union(v.literal("Saved"), v.literal("Analyzed"), v.literal("Ready to Apply"), v.literal("Missing Skills")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    const jobMatchId = await ctx.db.insert("jobMatches", {
      userId: user._id,
      resumeId: args.resumeId,
      company: args.company,
      role: args.role,
      location: args.location,
      jobDescription: args.jobDescription,
      matchScore: args.matchScore,
      skillsMatch: args.skillsMatch,
      experienceMatch: args.experienceMatch,
      keywordMatch: args.keywordMatch,
      educationMatch: args.educationMatch,
      matchSummary: args.matchSummary,
      scoreReasoning: args.scoreReasoning,
      missingSkills: args.missingSkills,
      missingKeywords: args.missingKeywords,
      recommendations: args.recommendations,
      learningPath: args.learningPath,
      status: args.status,
      createdAt: Date.now(),
    });

    await ctx.db.patch(user._id, {
      jobMatchesCount: user.jobMatchesCount + 1,
    });

    return jobMatchId;
  },
});

export const getByUserId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return [];

    return await ctx.db
      .query("jobMatches")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("jobMatches") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const remove = mutation({
  args: { id: v.id("jobMatches") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
