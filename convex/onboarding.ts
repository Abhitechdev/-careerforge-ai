import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { api } from "./_generated/api";

export const completeOnboarding = mutation({
  args: {
    experienceLevel: v.union(v.literal("Student"), v.literal("Fresher"), v.literal("Professional")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      experienceLevel: args.experienceLevel,
      onboardingCompleted: true,
    });

    // Schedule Welcome Email
    if (user.email) {
      await ctx.scheduler.runAfter(0, api.emails.sendWelcomeEmail, {
        userId: user._id,
        to: user.email,
      });
    }
  },
});
