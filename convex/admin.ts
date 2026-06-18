import { v } from "convex/values";
import { query } from "./_generated/server";

export const getBetaMetrics = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // The frontend should verify if this user is an admin.
    // We just return aggregate stats here.

    const users = await ctx.db.query("users").collect();
    const totalUsers = users.length;
    
    let onboardingCompletedCount = 0;
    let resumeUploadsCount = 0;
    let atsAnalysisCount = 0;
    let jobMatchesCount = 0;

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    let dau = 0;
    let wau = 0;

    // Approximate activity by looking at recent snapshots or just user creation if we don't have login tracking
    for (const u of users) {
      if (u.onboardingCompleted) onboardingCompletedCount++;
      resumeUploadsCount += (u.resumeUploadsCount || 0);
      atsAnalysisCount += (u.atsAnalysisCount || 0);
      jobMatchesCount += (u.jobMatchesCount || 0);

      // Simplistic DAU/WAU: since we don't have a dedicated sessions table, we'll check if they were created recently.
      if (u.createdAt > oneDayAgo) dau++;
      if (u.createdAt > oneWeekAgo) wau++;
    }

    const feedback = await ctx.db.query("userFeedback").collect();
    const bugsCount = feedback.filter(f => f.type === "bug").length;
    const featuresCount = feedback.filter(f => f.type === "feature_request").length;

    return {
      totalUsers,
      onboardingCompletedRate: totalUsers > 0 ? Math.round((onboardingCompletedCount / totalUsers) * 100) : 0,
      resumeUploadsCount,
      atsAnalysisCount,
      jobMatchesCount,
      dau,
      wau,
      bugsCount,
      featuresCount,
      feedbackVolume: feedback.length
    };
  },
});
