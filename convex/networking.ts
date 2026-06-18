import { mutation, query, action, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// ─── Referral CRUD ──────────────────────────────────────────────────────────

export const addReferral = mutation({
  args: {
    clerkId: v.string(),
    company: v.string(),
    role: v.string(),
    contactName: v.string(),
    contactLinkedIn: v.optional(v.string()),
    status: v.union(
      v.literal("Requested"),
      v.literal("Accepted"),
      v.literal("Declined"),
      v.literal("Interview Scheduled"),
      v.literal("Hired")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) throw new Error("User not found");

    return await ctx.db.insert("referralTracker", {
      userId: user._id,
      company: args.company,
      role: args.role,
      contactName: args.contactName,
      contactLinkedIn: args.contactLinkedIn,
      status: args.status,
      notes: args.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateReferralStatus = mutation({
  args: {
    id: v.id("referralTracker"),
    status: v.union(
      v.literal("Requested"),
      v.literal("Accepted"),
      v.literal("Declined"),
      v.literal("Interview Scheduled"),
      v.literal("Hired")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      status: args.status,
      ...(args.notes !== undefined && { notes: args.notes }),
      updatedAt: Date.now(),
    });
  },
});

export const listReferrals = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) return [];

    return await ctx.db
      .query("referralTracker")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// ─── Recruiter Contacts CRUD ────────────────────────────────────────────────

export const addRecruiter = mutation({
  args: {
    clerkId: v.string(),
    recruiterName: v.string(),
    company: v.string(),
    role: v.string(),
    source: v.optional(v.string()),
    status: v.union(
      v.literal("New"),
      v.literal("Contacted"),
      v.literal("Responded"),
      v.literal("Interview"),
      v.literal("Closed")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) throw new Error("User not found");

    return await ctx.db.insert("recruiterContacts", {
      userId: user._id,
      recruiterName: args.recruiterName,
      company: args.company,
      role: args.role,
      source: args.source,
      status: args.status,
      notes: args.notes,
      lastContactDate: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateRecruiterStatus = mutation({
  args: {
    id: v.id("recruiterContacts"),
    status: v.union(
      v.literal("New"),
      v.literal("Contacted"),
      v.literal("Responded"),
      v.literal("Interview"),
      v.literal("Closed")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      status: args.status,
      ...(args.notes !== undefined && { notes: args.notes }),
      lastContactDate: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const listRecruiters = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) return [];

    return await ctx.db
      .query("recruiterContacts")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// ─── Networking Goals ───────────────────────────────────────────────────────

export const setNetworkingGoal = mutation({
  args: {
    clerkId: v.string(),
    weeklyGoal: v.string(),
    targetConnections: v.number(),
    targetReferrals: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) throw new Error("User not found");

    const existingGoal = await ctx.db
      .query("networkingGoals")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (existingGoal) {
      return await ctx.db.patch(existingGoal._id, {
        weeklyGoal: args.weeklyGoal,
        targetConnections: args.targetConnections,
        targetReferrals: args.targetReferrals,
        updatedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("networkingGoals", {
        userId: user._id,
        weeklyGoal: args.weeklyGoal,
        currentProgress: 0,
        targetConnections: args.targetConnections,
        targetReferrals: args.targetReferrals,
        updatedAt: Date.now(),
      });
    }
  },
});

export const getNetworkingGoal = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) return null;

    return await ctx.db
      .query("networkingGoals")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
  },
});

export const updateGoalProgress = mutation({
  args: {
    clerkId: v.string(),
    progressIncrease: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) throw new Error("User not found");

    const goal = await ctx.db
      .query("networkingGoals")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (goal) {
      return await ctx.db.patch(goal._id, {
        currentProgress: goal.currentProgress + args.progressIncrease,
        updatedAt: Date.now(),
      });
    }
  },
});

// ─── LinkedIn Optimization ──────────────────────────────────────────────────

export const saveLinkedinProfile = mutation({
  args: {
    clerkId: v.string(),
    profileUrl: v.optional(v.string()),
    linkedinScore: v.number(),
    headlineScore: v.number(),
    aboutScore: v.number(),
    skillsScore: v.number(),
    recommendations: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) throw new Error("User not found");

    const existingProfile = await ctx.db
      .query("linkedinProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (existingProfile) {
      return await ctx.db.patch(existingProfile._id, {
        profileUrl: args.profileUrl !== undefined ? args.profileUrl : existingProfile.profileUrl,
        linkedinScore: args.linkedinScore,
        headlineScore: args.headlineScore,
        aboutScore: args.aboutScore,
        skillsScore: args.skillsScore,
        recommendations: args.recommendations,
        lastAnalyzedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("linkedinProfiles", {
        userId: user._id,
        profileUrl: args.profileUrl,
        linkedinScore: args.linkedinScore,
        headlineScore: args.headlineScore,
        aboutScore: args.aboutScore,
        skillsScore: args.skillsScore,
        recommendations: args.recommendations,
        lastAnalyzedAt: Date.now(),
      });
    }
  },
});

export const getLinkedinProfile = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) return null;

    return await ctx.db
      .query("linkedinProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
  },
});

// ─── Analytics ──────────────────────────────────────────────────────────────

export const getNetworkingAnalytics = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) return null;

    const referrals = await ctx.db
      .query("referralTracker")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const recruiters = await ctx.db
      .query("recruiterContacts")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const goal = await ctx.db
      .query("networkingGoals")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    const linkedin = await ctx.db
      .query("linkedinProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    const snapshots = await ctx.db
      .query("careerSnapshots")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(1);

    const networkingScore = snapshots[0]?.networkingScore || 0;

    const acceptedReferrals = referrals.filter(r => r.status !== "Requested" && r.status !== "Declined").length;
    const interviewReferrals = referrals.filter(r => r.status === "Interview Scheduled" || r.status === "Hired").length;
    
    const responsesReceived = recruiters.filter(r => r.status !== "New" && r.status !== "Contacted" && r.status !== "Closed").length;
    const interviewsGenerated = recruiters.filter(r => r.status === "Interview").length;

    return {
      referrals: {
        totalRequests: referrals.length,
        accepted: acceptedReferrals,
        interviews: interviewReferrals,
        successRate: referrals.length > 0 ? Math.round((acceptedReferrals / referrals.length) * 100) : 0,
        interviewRate: acceptedReferrals > 0 ? Math.round((interviewReferrals / acceptedReferrals) * 100) : 0,
      },
      recruiters: {
        contacted: recruiters.length,
        responses: responsesReceived,
        interviews: interviewsGenerated,
        responseRate: recruiters.length > 0 ? Math.round((responsesReceived / recruiters.length) * 100) : 0,
      },
      networking: {
        networkingScore,
        goalCompletion: goal ? Math.min(100, Math.round((goal.currentProgress / Math.max(1, (goal.targetConnections + goal.targetReferrals))) * 100)) : 0,
        linkedinScore: linkedin?.linkedinScore || 0,
      }
    };
  },
});

// ─── Template Generation (Action) ───────────────────────────────────────────

export const generateOutreachTemplate = action({
  args: {
    clerkId: v.string(),
    type: v.union(
      v.literal("Referral Request"),
      v.literal("Recruiter Outreach"),
      v.literal("Follow-Up Message"),
      v.literal("Networking Introduction")
    ),
    targetCompany: v.optional(v.string()),
    targetRole: v.optional(v.string()),
    contactName: v.optional(v.string()),
    customPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // In a real app, you would fetch user data (resume context, goals) using an internal query
    // and pass it to the prompt. For brevity, we pass basic info.
    
    const prompt = `You are an expert career networking advisor. Generate a highly professional, concise, and effective outreach message.
    
Type: ${args.type}
${args.targetCompany ? `Target Company: ${args.targetCompany}` : ""}
${args.targetRole ? `Target Role: ${args.targetRole}` : ""}
${args.contactName ? `Contact Name: ${args.contactName}` : ""}
${args.customPrompt ? `Additional Instructions: ${args.customPrompt}` : ""}

Ensure the message is short, respectful of the recipient's time, and has a clear call to action. Return ONLY the message text.`;

    if (!process.env.NVIDIA_API_KEY) {
      return "Hi [Name],\n\nI hope this message finds you well. I noticed we share some mutual interests in [Industry/Field] and I would love to connect to learn more about your experience at [Company].\n\nBest regards,\n[Your Name]";
    }

    try {
      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta/llama-3.3-70b-instruct",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "Could not generate template.";
    } catch (e) {
      console.error(e);
      return "Hi [Name],\n\nI hope this message finds you well. I would love to connect to learn more about your experience at [Company].\n\nBest regards,\n[Your Name]";
    }
  },
});
