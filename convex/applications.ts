import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return applications;
  },
});

export const getById = query({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.id);
    if (!application) {
      throw new Error("Application not found");
    }
    return application;
  },
});

export const updateStatus = mutation({
  args: { 
    id: v.id("applications"), 
    status: v.union(
      v.literal("Saved"),
      v.literal("Applied"),
      v.literal("Assessment"),
      v.literal("Interview"),
      v.literal("Offer"),
      v.literal("Rejected"),
      v.literal("Withdrawn")
    ) 
  },
  handler: async (ctx, args) => {
    const { id, status } = args;
    await ctx.db.patch(id, { status, updatedAt: Date.now() });
  },
});

export const create = mutation({
  args: {
    clerkId: v.string(),
    company: v.string(),
    role: v.string(),
    location: v.string(),
    notes: v.optional(v.string()),
    matchScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const appId = await ctx.db.insert("applications", {
      userId: user._id,
      company: args.company,
      role: args.role,
      location: args.location,
      notes: args.notes,
      matchScore: args.matchScore,
      status: "Saved",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return appId;
  },
});

export const remove = mutation({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
