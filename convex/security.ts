import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const logSecurityEvent = mutation({
  args: {
    userId: v.optional(v.string()),
    email: v.string(),
    eventType: v.union(v.literal("Disposable Email Attempt"), v.literal("Blocked Registration"), v.literal("Suspicious Activity")),
    severity: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High"), v.literal("Critical")),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("securityEvents", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const getSecurityMetrics = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db.query("securityEvents").order("desc").take(100);
    
    let blockedEmails = 0;
    let failedRegistrations = 0;
    
    for (const event of events) {
      if (event.eventType === "Disposable Email Attempt") blockedEmails++;
      if (event.eventType === "Blocked Registration") failedRegistrations++;
    }

    const verifiedUsers = await ctx.db.query("users").collect();
    
    return {
      blockedEmails,
      failedRegistrations,
      verifiedUsersCount: verifiedUsers.length,
      recentEvents: events.slice(0, 10),
    };
  },
});
