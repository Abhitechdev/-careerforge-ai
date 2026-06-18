import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

export const create = mutation({
  args: {
    clerkId: v.string(),
    resumeId: v.id("resumes"),
    company: v.string(),
    role: v.string(),
    tone: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    return await ctx.db.insert("coverLetters", {
      userId: user._id,
      resumeId: args.resumeId,
      company: args.company,
      role: args.role,
      tone: args.tone,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

export const createInternal = internalMutation({
  args: {
    clerkId: v.string(),
    resumeId: v.id("resumes"),
    company: v.string(),
    role: v.string(),
    tone: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    return await ctx.db.insert("coverLetters", {
      userId: user._id,
      resumeId: args.resumeId,
      company: args.company,
      role: args.role,
      tone: args.tone,
      content: args.content,
      createdAt: Date.now(),
    });
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
      .query("coverLetters")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("coverLetters") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const remove = mutation({
  args: { id: v.id("coverLetters") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
