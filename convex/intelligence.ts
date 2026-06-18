import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// ─── Calculations (Pure Math, No AI) ─────────────────────────────────────────

// Helper to calculate a score from 0-100 based on various factors
function calculateHealth(metrics: any) {
  let availableCategories = 0;
  let totalWeight = 0;
  let scoreSum = 0;

  if (metrics.atsScore !== undefined && metrics.atsScore !== null) {
    availableCategories++;
    totalWeight += 0.25;
    scoreSum += (metrics.atsScore * 0.25);
  }
  
  if (metrics.jobMatchScore !== undefined && metrics.jobMatchScore !== null) {
    availableCategories++;
    totalWeight += 0.20;
    scoreSum += (metrics.jobMatchScore * 0.20);
  }

  if (metrics.interviewScore !== undefined && metrics.interviewScore !== null) {
    availableCategories++;
    totalWeight += 0.20;
    scoreSum += (metrics.interviewScore * 0.20);
  }

  if (metrics.applicationsScore !== undefined && metrics.applicationsScore !== null) {
    availableCategories++;
    totalWeight += 0.15;
    scoreSum += (metrics.applicationsScore * 0.15);
  }

  if (metrics.networkingScore !== undefined && metrics.networkingScore !== null) {
    availableCategories++;
    totalWeight += 0.20;
    scoreSum += (metrics.networkingScore * 0.20);
  }

  if (totalWeight === 0) return 0;
  return Math.round((scoreSum / totalWeight));
}

function calculateProbability(metrics: any) {
  let availableCategories = 0;
  let totalWeight = 0;
  let scoreSum = 0;

  if (metrics.atsScore !== undefined && metrics.atsScore !== null) {
    availableCategories++;
    totalWeight += 0.20;
    scoreSum += (metrics.atsScore * 0.20);
  }
  
  if (metrics.jobMatchScore !== undefined && metrics.jobMatchScore !== null) {
    availableCategories++;
    totalWeight += 0.25;
    scoreSum += (metrics.jobMatchScore * 0.25);
  }

  if (metrics.interviewScore !== undefined && metrics.interviewScore !== null) {
    availableCategories++;
    totalWeight += 0.25;
    scoreSum += (metrics.interviewScore * 0.25);
  }

  if (metrics.skillCoverage !== undefined && metrics.skillCoverage !== null) {
    availableCategories++;
    totalWeight += 0.15;
    scoreSum += (metrics.skillCoverage * 0.15);
  }

  if (metrics.networkingScore !== undefined && metrics.networkingScore !== null) {
    availableCategories++;
    totalWeight += 0.15;
    scoreSum += (metrics.networkingScore * 0.15);
  }

  if (totalWeight === 0) return 0;
  return Math.round((scoreSum / totalWeight));
}

// ─── Snapshot Operations ─────────────────────────────────────────────────────

export const takeSnapshot = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) throw new Error("User not found");

    // Gather metrics
    // 1. ATS Score (avg of all completed analyses)
      
    const resumes = await ctx.db
      .query("resumes")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
      
    let totalAts = 0;
    let atsCount = 0;
    
    for (const resume of resumes) {
      if (resume.analysisStatus === "completed") {
         const analysis = await ctx.db
            .query("atsAnalyses")
            .withIndex("by_resumeId", (q) => q.eq("resumeId", resume._id))
            .unique();
         if (analysis && analysis.overallScore) {
             totalAts += analysis.overallScore;
             atsCount++;
         }
      }
    }
    const atsScore = atsCount > 0 ? Math.round(totalAts / atsCount) : null;

    // 2. Job Match Score
    const jobMatches = await ctx.db
      .query("jobMatches")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    const jobMatchScore = jobMatches.length > 0 
      ? Math.round(jobMatches.reduce((acc, m) => acc + m.matchScore, 0) / jobMatches.length) 
      : null;

    // 3. Interview Score
    const interviews = await ctx.db
      .query("interviews")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "Completed"))
      .collect();
    const interviewScore = interviews.length > 0
      ? Math.round(interviews.reduce((acc, i) => acc + (i.overallScore || 0), 0) / interviews.length)
      : null;

    // 4. Task Completion
    const tasks = await ctx.db
      .query("careerTasks")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    const taskCompletion = tasks.length > 0
      ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)
      : null;
      
    // 5. Skill Coverage (from roadmaps)
    const roadmaps = await ctx.db
      .query("roadmaps")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    const skillCoverage = roadmaps.length > 0
      ? Math.round(roadmaps.reduce((acc, r) => acc + r.completionPercentage, 0) / roadmaps.length)
      : null;

    // 6. Application Count & Score (Phase 15 Weighted Progression)
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    const applicationsCount = applications.length;
    
    let weightedApps = 0;
    for (const app of applications) {
      if (app.status === "Saved") weightedApps += 0.1;
      else if (app.status === "Interview") weightedApps += 0.8;
      else if (app.status === "Offer") weightedApps += 1.0;
      else if (app.status !== "Withdrawn") weightedApps += 0.5; // Applied, Assessment, Rejected
    }
    
    let applicationsScore = 0;
    if (weightedApps > 30) applicationsScore = 100;
    else if (weightedApps >= 16) applicationsScore = 75;
    else if (weightedApps >= 6) applicationsScore = 50;
    else if (weightedApps > 0) applicationsScore = 25;

    // 7. Networking Score
    const referrals = await ctx.db.query("referralTracker").withIndex("by_userId", (q) => q.eq("userId", user._id)).collect();
    const recruiters = await ctx.db.query("recruiterContacts").withIndex("by_userId", (q) => q.eq("userId", user._id)).collect();
    const goal = await ctx.db.query("networkingGoals").withIndex("by_userId", (q) => q.eq("userId", user._id)).first();
    const linkedinProfile = await ctx.db.query("linkedinProfiles").withIndex("by_userId", (q) => q.eq("userId", user._id)).first();

    const referralScore = Math.min(100, referrals.length * 10 + (referrals.filter(r => r.status !== "Requested" && r.status !== "Declined").length * 20));
    const recruiterScore = Math.min(100, recruiters.length * 10 + (recruiters.filter(r => r.status !== "New" && r.status !== "Contacted" && r.status !== "Closed").length * 20));
    const linkedInScore = linkedinProfile?.linkedinScore || 0;
    const goalScore = goal ? Math.min(100, Math.round((goal.currentProgress / Math.max(1, (goal.targetConnections + goal.targetReferrals))) * 100)) : 0;

    const networkingScore = Math.round((referralScore + recruiterScore + linkedInScore + goalScore) / 4);

    const metrics = { atsScore, jobMatchScore, interviewScore, taskCompletion, skillCoverage, applicationsScore, networkingScore };
    const careerHealth = calculateHealth(metrics);
    const hiringProbability = calculateProbability(metrics);

    const snapshotId = await ctx.db.insert("careerSnapshots", {
      userId: user._id,
      careerHealth,
      atsScore: atsScore || 0,
      interviewScore: interviewScore || 0,
      hiringProbability,
      jobMatchScore: jobMatchScore || 0,
      skillCoverage: skillCoverage || 0,
      applicationsCount,
      applicationsScore,
      networkingScore,
      createdAt: Date.now(),
    });

    return snapshotId;
  },
});

export const getSnapshots = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("careerSnapshots")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(30); // Last 30 snapshots
  },
});

// ─── Current Intelligence Data ───────────────────────────────────────────────

export const getCurrentIntelligence = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) return null;

    const snapshots = await ctx.db
      .query("careerSnapshots")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(2);

    const current = snapshots[0];
    const previous = snapshots.length > 1 ? snapshots[1] : null;

    // If no snapshot exists, generate a pseudo-current one based on raw data
    // Ideally, a cron job would take daily snapshots.
    if (!current) {
        return null;
    }

    const getProbabilityStatus = (score: number) => {
        if (score < 40) return "Needs Improvement";
        if (score < 70) return "Developing Candidate";
        if (score < 85) return "Competitive Candidate";
        return "Strong Candidate";
    };

    return {
      careerHealth: current.careerHealth,
      careerHealthChange: previous ? current.careerHealth - previous.careerHealth : 0,
      hiringProbability: current.hiringProbability,
      hiringProbabilityChange: previous ? current.hiringProbability - previous.hiringProbability : 0,
      hiringStatus: getProbabilityStatus(current.hiringProbability),
      atsScore: current.atsScore,
      atsScoreChange: previous ? current.atsScore - previous.atsScore : 0,
      interviewScore: current.interviewScore,
      applicationsCount: current.applicationsCount,
      applicationsChange: previous ? current.applicationsCount - previous.applicationsCount : 0,
      jobMatchScore: current.jobMatchScore,
      skillCoverage: current.skillCoverage
    };
  },
});

// ─── Weekly Reports ──────────────────────────────────────────────────────────

export const generateWeeklyReport = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) throw new Error("User not found");

    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Get snapshots to compare start vs end of week
    const recentSnapshots = await ctx.db
      .query("careerSnapshots")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const currentSnapshot = recentSnapshots[0];
    const pastSnapshot = recentSnapshots.find(s => s.createdAt <= oneWeekAgo) || recentSnapshots[recentSnapshots.length - 1];

    if (!currentSnapshot) {
      return null;
    }

    const appsThisWeek = await ctx.db
      .query("applications")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter(q => q.gte(q.field("createdAt"), oneWeekAgo))
      .collect();

    const interviewsThisWeek = await ctx.db
      .query("interviews")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter(q => q.gte(q.field("createdAt"), oneWeekAgo))
      .collect();

    // Generate pseudo-AI summary based on metrics
    let summary = "A solid week of progress. ";
    let topRecommendations = [];
    let highlights = [];

    const healthDiff = currentSnapshot.careerHealth - (pastSnapshot ? pastSnapshot.careerHealth : currentSnapshot.careerHealth);
    
    if (healthDiff > 0) {
      summary += `Your career health improved by ${healthDiff} points. `;
      highlights.push(`Career Health +${healthDiff}`);
    } else if (healthDiff < 0) {
      summary += `Your career health dipped slightly. `;
    }

    if (appsThisWeek.length > 0) {
        summary += `You submitted ${appsThisWeek.length} new applications. `;
        highlights.push(`${appsThisWeek.length} Applications`);
    }

    if (currentSnapshot.atsScore < 70) {
        topRecommendations.push("Optimize your resume for ATS to improve callback rates.");
    }
    if (currentSnapshot.interviewScore < 70) {
        topRecommendations.push("Practice mock interviews to boost your confidence.");
    }
    if (appsThisWeek.length === 0) {
        topRecommendations.push("Apply to at least 3 high-match jobs this week.");
    }
    
    if(topRecommendations.length === 0) {
        topRecommendations.push("Keep up the great work! Continue networking and refining your skills.");
    }

    const reportId = await ctx.db.insert("weeklyReports", {
      userId: user._id,
      weekStart: pastSnapshot ? pastSnapshot.createdAt : now,
      weekEnd: now,
      careerHealthStart: pastSnapshot ? pastSnapshot.careerHealth : currentSnapshot.careerHealth,
      careerHealthEnd: currentSnapshot.careerHealth,
      atsStart: pastSnapshot ? pastSnapshot.atsScore : currentSnapshot.atsScore,
      atsEnd: currentSnapshot.atsScore,
      applicationsCount: appsThisWeek.length,
      interviewsCount: interviewsThisWeek.length,
      topRecommendations,
      summary,
      highlights,
      createdAt: now,
    });

    return reportId;
  },
});

export const getWeeklyReports = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("weeklyReports")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(10);
  },
});

// ─── Career Forecasts ────────────────────────────────────────────────────────

export const generateForecast = mutation({
    args: { 
        clerkId: v.string(),
        skillsToLearn: v.array(v.string())
    },
    handler: async (ctx, args) => {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
        .unique();
  
      if (!user) throw new Error("User not found");

      const snapshots = await ctx.db
      .query("careerSnapshots")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(1);

      const currentHealth = snapshots[0]?.careerHealth || 60;
      const currentProbability = snapshots[0]?.hiringProbability || 50;

      // Simulate forecast logic
      // In a real app, this would query job matches to see how many require these skills
      const skillImpacts = args.skillsToLearn.map(skill => {
          const impact = Math.floor(Math.random() * 5) + 2; // Random 2-6 impact per skill
          return {
              skill,
              healthImpact: impact,
              hiringImpact: impact + 1,
              rolesUnlocked: Math.floor(Math.random() * 20) + 5
          };
      });

      const totalHealthImpact = skillImpacts.reduce((sum, s) => sum + s.healthImpact, 0);
      const totalHiringImpact = skillImpacts.reduce((sum, s) => sum + s.hiringImpact, 0);
      const totalRolesUnlocked = skillImpacts.reduce((sum, s) => sum + s.rolesUnlocked, 0);

      const forecastId = await ctx.db.insert("careerForecasts", {
          userId: user._id,
          skillsToLearn: args.skillsToLearn,
          currentCareerHealth: currentHealth,
          predictedCareerHealth: Math.min(100, currentHealth + totalHealthImpact),
          currentHiringProbability: currentProbability,
          predictedHiringProbability: Math.min(100, currentProbability + totalHiringImpact),
          predictedMatchIncrease: totalRolesUnlocked,
          skillImpacts,
          confidenceScore: 85, // Example static confidence
          createdAt: Date.now()
      });

      return forecastId;
    }
});

export const getForecasts = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
        .unique();
  
      if (!user) return [];
  
      return await ctx.db
        .query("careerForecasts")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .order("desc")
        .take(5);
    },
  });
