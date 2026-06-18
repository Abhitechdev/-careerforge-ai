import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createFeedback = mutation({
  args: {
    type: v.union(v.literal("bug"), v.literal("feature_request"), v.literal("suggestion")),
    category: v.string(),
    content: v.string(),
    screenshotUrl: v.optional(v.string()),
    rating: v.optional(v.number()),
    severity: v.optional(v.union(v.literal("Low"), v.literal("Medium"), v.literal("High"), v.literal("Critical"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const feedbackId = await ctx.db.insert("userFeedback", {
      userId: user._id,
      type: args.type,
      category: args.category,
      content: args.content,
      screenshotUrl: args.screenshotUrl,
      rating: args.rating,
      severity: args.severity,
      upvotes: 0,
      status: "Open",
      createdAt: Date.now(),
    });

    return feedbackId;
  },
});

export const getFeedback = query({
  args: { 
    type: v.optional(v.union(v.literal("bug"), v.literal("feature_request"), v.literal("suggestion"))) 
  },
  handler: async (ctx, args) => {
    let feedbackQuery = ctx.db.query("userFeedback").order("desc");
    
    if (args.type) {
      feedbackQuery = ctx.db.query("userFeedback").withIndex("by_type", (q) => q.eq("type", args.type as any)).order("desc");
    }

    const items = await feedbackQuery.take(50);
    
    const identity = await ctx.auth.getUserIdentity();
    let user = null;
    if (identity) {
      user = await ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject)).unique();
    }

    const results = [];
    for (const item of items) {
      const author = await ctx.db.get(item.userId);
      let hasUpvoted = false;
      
      if (user) {
        const existingVote = await ctx.db.query("feedbackUpvotes")
          .withIndex("by_user_feedback", (q) => q.eq("userId", user._id).eq("feedbackId", item._id))
          .unique();
        hasUpvoted = !!existingVote;
      }

      results.push({
        ...item,
        authorName: author?.name || author?.email?.split('@')[0] || "Anonymous",
        authorAvatar: author?.avatarUrl,
        hasUpvoted
      });
    }

    return results;
  },
});

export const toggleUpvote = mutation({
  args: { feedbackId: v.id("userFeedback") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const existingVote = await ctx.db.query("feedbackUpvotes")
      .withIndex("by_user_feedback", (q) => q.eq("userId", user._id).eq("feedbackId", args.feedbackId))
      .unique();

    const feedback = await ctx.db.get(args.feedbackId);
    if (!feedback) throw new Error("Feedback not found");

    if (existingVote) {
      // Remove upvote
      await ctx.db.delete(existingVote._id);
      await ctx.db.patch(args.feedbackId, { upvotes: Math.max(0, feedback.upvotes - 1) });
    } else {
      // Add upvote
      await ctx.db.insert("feedbackUpvotes", {
        userId: user._id,
        feedbackId: args.feedbackId,
      });
      await ctx.db.patch(args.feedbackId, { upvotes: feedback.upvotes + 1 });
    }
  },
});
