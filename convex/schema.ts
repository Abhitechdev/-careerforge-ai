import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    plan: v.union(v.literal("Free"), v.literal("Pro"), v.literal("Premium")),
    resumeUploadsCount: v.number(),
    atsAnalysisCount: v.number(),
    jobMatchesCount: v.number(),
    onboardingCompleted: v.optional(v.boolean()),
    experienceLevel: v.optional(v.union(v.literal("Student"), v.literal("Fresher"), v.literal("Professional"))),
    createdAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  resumes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    fileUrl: v.string(), // UploadThing URL
    fileKey: v.string(), // UploadThing key
    format: v.string(),
    fileSize: v.number(),
    isPrimary: v.boolean(),
    analysisStatus: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    analysisError: v.optional(v.string()),
    lastAnalyzed: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  resumeVersions: defineTable({
    resumeId: v.id("resumes"),
    versionNumber: v.number(),
    atsScore: v.number(),
    changes: v.array(v.string()),
    createdAt: v.number(),
  }).index("by_resumeId", ["resumeId"]),

  atsAnalyses: defineTable({
    resumeId: v.id("resumes"),
    overallScore: v.number(),
    atsScore: v.number(),
    skillsScore: v.number(),
    formattingScore: v.number(),
    experienceScore: v.number(),
    skills: v.array(v.string()),
    missingKeywords: v.array(v.string()),
    strengths: v.array(v.string()),
    weaknesses: v.array(v.string()),
    recommendations: v.array(v.string()),
    experienceLevel: v.string(),
    targetRoles: v.array(v.string()),
    extractedText: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_resumeId", ["resumeId"]),

  jobMatches: defineTable({
    userId: v.id("users"),
    resumeId: v.id("resumes"),
    company: v.string(),
    role: v.string(),
    location: v.string(),
    jobDescription: v.string(),
    matchScore: v.number(),
    skillsMatch: v.number(),
    experienceMatch: v.number(),
    keywordMatch: v.number(),
    educationMatch: v.number(),
    matchSummary: v.string(),
    scoreReasoning: v.string(),
    missingSkills: v.object({
      critical: v.array(v.string()),
      niceToHave: v.array(v.string()),
      optional: v.array(v.string()),
    }),
    missingKeywords: v.array(v.string()),
    recommendations: v.array(v.string()),
    learningPath: v.array(v.object({
      skill: v.string(),
      resource: v.string(),
    })),
    status: v.union(v.literal("Saved"), v.literal("Analyzed"), v.literal("Ready to Apply"), v.literal("Missing Skills")),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  applications: defineTable({
    userId: v.id("users"),
    company: v.string(),
    role: v.string(),
    location: v.string(),
    matchScore: v.optional(v.number()),
    resumeId: v.optional(v.id("resumes")),
    coverLetterId: v.optional(v.id("coverLetters")),
    interviewId: v.optional(v.id("interviews")),
    opportunityScore: v.optional(v.number()),
    aiStrategy: v.optional(v.string()),
    generationStatus: v.optional(v.union(
      v.literal("idle"),
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed")
    )),
    status: v.union(
      v.literal("Saved"),
      v.literal("Applied"),
      v.literal("Assessment"),
      v.literal("Interview"),
      v.literal("Offer"),
      v.literal("Rejected"),
      v.literal("Withdrawn")
    ),
    appliedDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]).index("by_status", ["status"]),

  interviews: defineTable({
    userId: v.id("users"),
    resumeId: v.optional(v.id("resumes")),
    role: v.string(),
    jobDescription: v.optional(v.string()),
    status: v.union(v.literal("In Progress"), v.literal("Completed")),
    overallScore: v.optional(v.number()),
    technicalScore: v.optional(v.number()),
    behavioralScore: v.optional(v.number()),
    communicationScore: v.optional(v.number()),
    projectScore: v.optional(v.number()),
    confidenceScore: v.optional(v.number()),
    weaknesses: v.optional(v.array(v.string())),
    strengths: v.optional(v.array(v.string())),
    improvementPlan: v.optional(v.array(v.string())),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_resumeId", ["resumeId"]),

  interviewQuestions: defineTable({
    interviewId: v.id("interviews"),
    category: v.union(v.literal("Technical"), v.literal("Behavioral"), v.literal("Project-Based"), v.literal("HR"), v.literal("Resume-Based")),
    difficulty: v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard")),
    question: v.string(),
    sampleAnswer: v.string(),
    userResponse: v.optional(v.string()),
    feedback: v.optional(v.string()),
    score: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_interviewId", ["interviewId"]),

  coverLetters: defineTable({
    userId: v.id("users"),
    resumeId: v.id("resumes"),
    company: v.string(),
    role: v.string(),
    tone: v.string(),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  roadmaps: defineTable({
    userId: v.id("users"),
    targetRole: v.string(),
    currentSkills: v.array(v.string()),
    targetSkills: v.array(v.string()),
    completionPercentage: v.number(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    razorpayCustomerId: v.optional(v.string()),
    razorpaySubscriptionId: v.optional(v.string()),
    plan: v.union(v.literal("Free"), v.literal("Pro"), v.literal("Premium")),
    status: v.string(),
    currentPeriodEnd: v.optional(v.number()),
  }).index("by_userId", ["userId"]),

  careerInsights: defineTable({
    userId: v.id("users"),
    careerHealthScore: v.number(),
    avgAtsScore: v.number(),
    interviewRate: v.number(),
    recommendedNextActions: v.array(
      v.object({
        title: v.string(),
        priority: v.union(v.literal("High"), v.literal("Medium"), v.literal("Low")),
      })
    ),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  advisorChats: defineTable({
    userId: v.id("users"),
    advisor: v.union(v.literal("Forge"), v.literal("Nova")),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  advisorMessages: defineTable({
    chatId: v.id("advisorChats"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    timestamp: v.number(),
  }).index("by_chatId", ["chatId"]),

  careerGoals: defineTable({
    userId: v.id("users"),
    longTermGoals: v.array(v.string()),
    targetRole: v.optional(v.string()),
    targetCompany: v.optional(v.string()),
    targetSalary: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  careerTasks: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    completed: v.boolean(),
    source: v.union(v.literal("user"), v.literal("ai")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  jobActivity: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("viewed"), v.literal("saved"), v.literal("searched")),
    jobId: v.optional(v.string()),
    company: v.optional(v.string()),
    role: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  jobSearchCache: defineTable({
    queryHash: v.string(),
    results: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_queryHash", ["queryHash"]),

  // ── Career Intelligence Engine ──────────────────────────────────────────
  careerSnapshots: defineTable({
    userId: v.id("users"),
    careerHealth: v.number(),
    atsScore: v.number(),
    interviewScore: v.number(),
    hiringProbability: v.number(),
    jobMatchScore: v.number(),
    skillCoverage: v.number(),
    applicationsCount: v.number(),
    applicationsScore: v.optional(v.number()),
    networkingScore: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_createdAt", ["userId", "createdAt"]),

  weeklyReports: defineTable({
    userId: v.id("users"),
    weekStart: v.number(),
    weekEnd: v.number(),
    careerHealthStart: v.number(),
    careerHealthEnd: v.number(),
    atsStart: v.number(),
    atsEnd: v.number(),
    applicationsCount: v.number(),
    interviewsCount: v.number(),
    topRecommendations: v.array(v.string()),
    summary: v.string(),
    highlights: v.array(v.string()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  careerForecasts: defineTable({
    userId: v.id("users"),
    skillsToLearn: v.array(v.string()),
    currentCareerHealth: v.number(),
    predictedCareerHealth: v.number(),
    currentHiringProbability: v.number(),
    predictedHiringProbability: v.number(),
    predictedMatchIncrease: v.number(),
    skillImpacts: v.array(v.object({
      skill: v.string(),
      healthImpact: v.number(),
      hiringImpact: v.number(),
      rolesUnlocked: v.number(),
    })),
    confidenceScore: v.number(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  // ── Phase 15: Networking & Referral Intelligence ───────────────────────
  referralTracker: defineTable({
    userId: v.id("users"),
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
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  networkingGoals: defineTable({
    userId: v.id("users"),
    weeklyGoal: v.string(),
    currentProgress: v.number(),
    targetConnections: v.number(),
    targetReferrals: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  recruiterContacts: defineTable({
    userId: v.id("users"),
    recruiterName: v.string(),
    company: v.string(),
    role: v.string(),
    source: v.optional(v.string()),
    lastContactDate: v.number(),
    status: v.union(
      v.literal("New"),
      v.literal("Contacted"),
      v.literal("Responded"),
      v.literal("Interview"),
      v.literal("Closed")
    ),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  linkedinProfiles: defineTable({
    userId: v.id("users"),
    profileUrl: v.optional(v.string()),
    linkedinScore: v.number(),
    headlineScore: v.number(),
    aboutScore: v.number(),
    skillsScore: v.number(),
    recommendations: v.array(v.string()),
    lastAnalyzedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // ── Phase 16.1: Reliability & Scalability ───────────────────────────
  systemState: defineTable({
    key: v.string(), // "CIRCUIT_BREAKER"
    value: v.any(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  rateLimits: defineTable({
    userId: v.id("users"),
    feature: v.string(), // "ATS", "ADVISOR", "MATCH"
    requestCount: v.number(),
    windowStart: v.number(),
  }).index("by_user_feature", ["userId", "feature"]),

  requestCache: defineTable({
    cacheKey: v.string(),
    data: v.string(), // JSON stringified data
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_cacheKey", ["cacheKey"]),

  requestQueue: defineTable({
    userId: v.id("users"),
    type: v.string(), // "ATS_ANALYSIS", "WEEKLY_REPORT"
    payload: v.string(), // JSON stringified payload
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    attempts: v.number(),
    error: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]).index("by_status", ["status"]),

  // ── Phase 17: Beta Launch & User Validation ──────────────────────────
  userFeedback: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("bug"), v.literal("feature_request"), v.literal("suggestion")),
    category: v.string(), // "Resume", "Interviews", "Job Search", "Networking", "Other"
    content: v.string(),
    screenshotUrl: v.optional(v.string()),
    rating: v.optional(v.number()), // 1-5 stars for features
    severity: v.optional(v.union(v.literal("Low"), v.literal("Medium"), v.literal("High"), v.literal("Critical"))), // For bugs
    upvotes: v.number(), // For feature requests
    status: v.union(v.literal("Open"), v.literal("In Progress"), v.literal("Resolved")),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]).index("by_type", ["type"]),

  feedbackUpvotes: defineTable({
    userId: v.id("users"),
    feedbackId: v.id("userFeedback"),
  }).index("by_user_feedback", ["userId", "feedbackId"]),

  announcements: defineTable({
    title: v.string(),
    content: v.string(),
    type: v.union(v.literal("info"), v.literal("success"), v.literal("warning"), v.literal("new_feature")),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_isActive", ["isActive"]),

  securityEvents: defineTable({
    userId: v.optional(v.string()), // Clerk ID (optional because the user might be deleted)
    email: v.string(),
    eventType: v.union(v.literal("Disposable Email Attempt"), v.literal("Blocked Registration"), v.literal("Suspicious Activity")),
    severity: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High"), v.literal("Critical")),
    timestamp: v.number(),
    ipAddress: v.optional(v.string()),
  }).index("by_email", ["email"]).index("by_timestamp", ["timestamp"]),

  // ── Phase 19: Public Beta Launch & Product Analytics ─────────────────
  analyticsEvents: defineTable({
    userId: v.optional(v.id("users")), // Optional because some events might happen before auth or during auth
    sessionId: v.optional(v.string()), // For session grouping
    eventType: v.string(), // "Session Started", "Account Created", "Resume Uploaded", etc.
    metadata: v.optional(v.any()), // JSON payload containing specific details (e.g. error message)
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_eventType", ["eventType"])
    .index("by_createdAt", ["createdAt"]),

  activationScores: defineTable({
    userId: v.id("users"),
    score: v.number(), // 0 - 100
    breakdown: v.object({
      accountCreated: v.boolean(),
      resumeUploaded: v.boolean(),
      atsAnalysis: v.boolean(),
      forgeUsed: v.boolean(),
      jobMatch: v.boolean(),
      interviewPrep: v.boolean(),
    }),
    lastUpdated: v.number(),
  }).index("by_userId", ["userId"]),

  userHealth: defineTable({
    userId: v.id("users"),
    lastActiveDate: v.number(),
    daysSinceLastLogin: v.number(),
    atsUsageFrequency: v.number(), // events per week
    advisorUsageFrequency: v.number(),
    jobSearchFrequency: v.number(),
    status: v.union(v.literal("Likely Active"), v.literal("At Risk"), v.literal("Inactive")),
    lastUpdated: v.number(),
  }).index("by_userId", ["userId"]).index("by_status", ["status"]),

  emailLogs: defineTable({
    userId: v.id("users"),
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    status: v.union(v.literal("Sent"), v.literal("Failed"), v.literal("Mocked")),
    error: v.optional(v.string()),
    sentAt: v.number(),
  }).index("by_userId", ["userId"]),
});
