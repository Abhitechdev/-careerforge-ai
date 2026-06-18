import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Helper to calculate activation score
function calculateActivationScore(breakdown: any) {
  let score = 0;
  if (breakdown.accountCreated) score += 10;
  if (breakdown.resumeUploaded) score += 20;
  if (breakdown.atsAnalysis) score += 20;
  if (breakdown.forgeUsed) score += 20;
  if (breakdown.jobMatch) score += 15;
  if (breakdown.interviewPrep) score += 15;
  return score;
}

export const logEvent = mutation({
  args: {
    userId: v.optional(v.string()), // Optional internal convex id or clerk id? Let's assume clerkId or convex id.
    clerkId: v.optional(v.string()), // Providing clerkId is easier from client
    sessionId: v.optional(v.string()),
    eventType: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    let internalUserId: Id<"users"> | undefined;

    if (args.userId) {
      // @ts-ignore
      internalUserId = args.userId as Id<"users">;
    } else if (args.clerkId) {
      const user = await ctx.db.query("users").withIndex("by_clerkId", q => q.eq("clerkId", args.clerkId as string)).first();
      if (user) internalUserId = user._id;
    }

    // 1. Log the event
    await ctx.db.insert("analyticsEvents", {
      userId: internalUserId,
      sessionId: args.sessionId,
      eventType: args.eventType,
      metadata: args.metadata,
      createdAt: Date.now(),
    });

    if (!internalUserId) return;

    // 2. Update user health (last active date)
    const existingHealth = await ctx.db.query("userHealth").withIndex("by_userId", q => q.eq("userId", internalUserId)).first();
    const now = Date.now();
    
    if (existingHealth) {
      await ctx.db.patch(existingHealth._id, {
        lastActiveDate: now,
        daysSinceLastLogin: 0,
        lastUpdated: now,
        status: "Likely Active", // Reset to active on new event
      });
    } else {
      await ctx.db.insert("userHealth", {
        userId: internalUserId,
        lastActiveDate: now,
        daysSinceLastLogin: 0,
        atsUsageFrequency: 0,
        advisorUsageFrequency: 0,
        jobSearchFrequency: 0,
        status: "Likely Active",
        lastUpdated: now,
      });
    }

    // 3. Update Activation Score
    const scoreDoc = await ctx.db.query("activationScores").withIndex("by_userId", q => q.eq("userId", internalUserId)).first();
    
    let breakdown = scoreDoc ? scoreDoc.breakdown : {
      accountCreated: false,
      resumeUploaded: false,
      atsAnalysis: false,
      forgeUsed: false,
      jobMatch: false,
      interviewPrep: false,
    };

    let updated = false;

    if (args.eventType === "Account Created") { breakdown.accountCreated = true; updated = true; }
    if (args.eventType === "Resume Uploaded") { breakdown.resumeUploaded = true; updated = true; }
    if (args.eventType === "ATS Analysis Completed") { breakdown.atsAnalysis = true; updated = true; }
    if (args.eventType === "First Forge Conversation" || args.eventType === "Advisor Chat Started") { breakdown.forgeUsed = true; updated = true; }
    if (args.eventType === "First Job Match" || args.eventType === "Job Match Created") { breakdown.jobMatch = true; updated = true; }
    if (args.eventType === "First Interview Session" || args.eventType === "Mock Interview Started") { breakdown.interviewPrep = true; updated = true; }

    if (updated || !scoreDoc) {
      const newScore = calculateActivationScore(breakdown);
      if (scoreDoc) {
        await ctx.db.patch(scoreDoc._id, { score: newScore, breakdown, lastUpdated: now });
      } else {
        await ctx.db.insert("activationScores", { userId: internalUserId, score: newScore, breakdown, lastUpdated: now });
      }
    }
  },
});

export const getDashboardMetrics = query({
  args: {},
  handler: async (ctx) => {
    // Basic aggregation for MVP. In production, use Convex periodic crons or map-reduce to aggregate.
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const ONE_WEEK = 7 * ONE_DAY;
    const ONE_MONTH = 30 * ONE_DAY;

    const allUsers = await ctx.db.query("users").collect();
    const totalUsers = allUsers.length;

    // Active users
    const healthRecords = await ctx.db.query("userHealth").collect();
    let dau = 0;
    let wau = 0;
    let mau = 0;

    healthRecords.forEach(h => {
      const timeSinceActive = now - h.lastActiveDate;
      if (timeSinceActive <= ONE_DAY) dau++;
      if (timeSinceActive <= ONE_WEEK) wau++;
      if (timeSinceActive <= ONE_MONTH) mau++;
    });

    const dauMauRatio = mau > 0 ? (dau / mau) * 100 : 0;

    // Activation Rate
    const activationScores = await ctx.db.query("activationScores").collect();
    // Assuming activation is score >= 50
    const activatedCount = activationScores.filter(a => a.score >= 50).length;
    const activationRate = totalUsers > 0 ? (activatedCount / totalUsers) * 100 : 0;

    // Retention Rate (simplistic: users active > 7 days after signup)
    let retainedCount = 0;
    allUsers.forEach(u => {
      const health = healthRecords.find(h => h.userId === u._id);
      if (health && (now - u.createdAt > ONE_WEEK) && (health.lastActiveDate - u.createdAt > ONE_WEEK)) {
        retainedCount++;
      }
    });
    const eligibleForRetention = allUsers.filter(u => now - u.createdAt > ONE_WEEK).length;
    const retentionRate = eligibleForRetention > 0 ? (retainedCount / eligibleForRetention) * 100 : 0;

    // Bug Volume (from userFeedback table)
    const feedback = await ctx.db.query("userFeedback").collect();
    const bugCount = feedback.filter(f => f.type === "bug").length;

    // Launch Readiness Score
    // Formula: Activation(35%) + Retention(30%) + Bugs(15%, inverted) + Adoption(10%) + Perf(10%)
    // Let's create a proxy for Bugs and Adoption.
    const bugPenalty = Math.min(15, (bugCount / Math.max(1, totalUsers)) * 50); 
    const bugScore = 15 - bugPenalty; // 0 to 15
    const adoptionScore = 10; // Placeholder until detailed feature adoption is wired fully
    const perfScore = 10; // Placeholder

    const launchReadinessScore = 
      (activationRate * 0.35) + 
      (retentionRate * 0.30) + 
      bugScore + 
      adoptionScore + 
      perfScore;

    return {
      totalUsers,
      dau,
      wau,
      mau,
      dauMauRatio,
      activationRate,
      retentionRate,
      launchReadinessScore: Math.round(launchReadinessScore),
      bugCount,
    };
  },
});
