import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";

export const getByUserId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return [];

    return await ctx.db
      .query("interviews")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("interviews") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getQuestions = query({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("interviewQuestions")
      .withIndex("by_interviewId", (q) => q.eq("interviewId", args.interviewId))
      .collect();
  },
});

export const createInternal = internalMutation({
  args: {
    clerkId: v.string(),
    resumeId: v.optional(v.id("resumes")),
    role: v.string(),
    jobDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    const interviewId = await ctx.db.insert("interviews", {
      userId: user._id,
      resumeId: args.resumeId,
      role: args.role,
      jobDescription: args.jobDescription,
      status: "In Progress",
      createdAt: Date.now(),
    });

    return interviewId;
  },
});

export const createQuestionInternal = internalMutation({
  args: {
    interviewId: v.id("interviews"),
    category: v.union(v.literal("Technical"), v.literal("Behavioral"), v.literal("Project-Based"), v.literal("HR"), v.literal("Resume-Based")),
    difficulty: v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard")),
    question: v.string(),
    sampleAnswer: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("interviewQuestions", {
      interviewId: args.interviewId,
      category: args.category,
      difficulty: args.difficulty,
      question: args.question,
      sampleAnswer: args.sampleAnswer,
      createdAt: Date.now(),
    });
  },
});

export const updateQuestionScoreInternal = internalMutation({
  args: {
    questionId: v.id("interviewQuestions"),
    userResponse: v.string(),
    feedback: v.string(),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.questionId, {
      userResponse: args.userResponse,
      feedback: args.feedback,
      score: args.score,
    });
  },
});

export const completeInterviewInternal = internalMutation({
  args: {
    interviewId: v.id("interviews"),
    overallScore: v.number(),
    technicalScore: v.number(),
    behavioralScore: v.number(),
    communicationScore: v.number(),
    projectScore: v.number(),
    confidenceScore: v.number(),
    weaknesses: v.array(v.string()),
    strengths: v.array(v.string()),
    improvementPlan: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.interviewId, {
      status: "Completed",
      overallScore: args.overallScore,
      technicalScore: args.technicalScore,
      behavioralScore: args.behavioralScore,
      communicationScore: args.communicationScore,
      projectScore: args.projectScore,
      confidenceScore: args.confidenceScore,
      weaknesses: args.weaknesses,
      strengths: args.strengths,
      improvementPlan: args.improvementPlan,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("interviews") },
  handler: async (ctx, args) => {
    // Delete all associated questions
    const questions = await ctx.db
      .query("interviewQuestions")
      .withIndex("by_interviewId", (q) => q.eq("interviewId", args.id))
      .collect();
    
    for (const q of questions) {
      await ctx.db.delete(q._id);
    }

    // Delete interview
    await ctx.db.delete(args.id);
  },
});
