import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";

export const getChat = query({
  args: { clerkId: v.string(), advisor: v.union(v.literal("Forge"), v.literal("Nova")) },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return null;

    let chat = await ctx.db
      .query("advisorChats")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("advisor"), args.advisor))
      .first();

    if (!chat) return null;

    const messages = await ctx.db
      .query("advisorMessages")
      .withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
      .order("asc")
      .collect();

    return { ...chat, messages };
  },
});

export const getGoals = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return null;

    return await ctx.db
      .query("careerGoals")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
  },
});

export const updateGoals = mutation({
  args: {
    clerkId: v.string(),
    targetRole: v.optional(v.string()),
    targetCompany: v.optional(v.string()),
    targetSalary: v.optional(v.string()),
    longTermGoals: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("careerGoals")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        targetRole: args.targetRole,
        targetCompany: args.targetCompany,
        targetSalary: args.targetSalary,
        longTermGoals: args.longTermGoals,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("careerGoals", {
        userId: user._id,
        targetRole: args.targetRole,
        targetCompany: args.targetCompany,
        targetSalary: args.targetSalary,
        longTermGoals: args.longTermGoals,
        updatedAt: Date.now(),
      });
    }
  },
});

export const getTasks = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return [];

    return await ctx.db
      .query("careerTasks")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const createTask = mutation({
  args: {
    clerkId: v.string(),
    title: v.string(),
    description: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    source: v.union(v.literal("user"), v.literal("ai")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    return await ctx.db.insert("careerTasks", {
      userId: user._id,
      title: args.title,
      description: args.description,
      priority: args.priority,
      source: args.source,
      completed: false,
      createdAt: Date.now(),
    });
  },
});

export const toggleTask = mutation({
  args: { taskId: v.id("careerTasks"), completed: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, { completed: args.completed });
  },
});

export const deleteTask = mutation({
  args: { taskId: v.id("careerTasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.taskId);
  },
});

export const saveMessageInternal = internalMutation({
  args: {
    userId: v.id("users"),
    advisor: v.union(v.literal("Forge"), v.literal("Nova")),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    let chat = await ctx.db
      .query("advisorChats")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("advisor"), args.advisor))
      .first();

    if (!chat) {
      const chatId = await ctx.db.insert("advisorChats", {
        userId: args.userId,
        advisor: args.advisor,
        updatedAt: Date.now(),
      });
      chat = await ctx.db.get(chatId);
    } else {
      await ctx.db.patch(chat._id, { updatedAt: Date.now() });
    }

    if (!chat) throw new Error("Chat creation failed");

    await ctx.db.insert("advisorMessages", {
      chatId: chat._id,
      role: args.role,
      content: args.content,
      timestamp: Date.now(),
    });
  },
});

export const saveChatLog = mutation({
  args: {
    clerkId: v.string(),
    advisor: v.union(v.literal("Forge"), v.literal("Nova")),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    let chat = await ctx.db
      .query("advisorChats")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("advisor"), args.advisor))
      .first();

    if (!chat) {
      const chatId = await ctx.db.insert("advisorChats", {
        userId: user._id,
        advisor: args.advisor,
        updatedAt: Date.now(),
      });
      chat = await ctx.db.get(chatId);
    } else {
      await ctx.db.patch(chat._id, { updatedAt: Date.now() });
    }

    if (!chat) throw new Error("Chat creation failed");

    await ctx.db.insert("advisorMessages", {
      chatId: chat._id,
      role: args.role,
      content: args.content,
      timestamp: Date.now(),
    });
  }
});

export const getContextInternal = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return null;

    console.log("Loading resumes");
    const resume = await ctx.db
      .query("resumes")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter(q => q.eq(q.field("analysisStatus"), "completed"))
      .order("desc")
      .first();

    let atsAnalysis = null;
    if (resume) {
      console.log("Loading ATS");
      atsAnalysis = await ctx.db
        .query("atsAnalyses")
        .withIndex("by_resumeId", (q) => q.eq("resumeId", resume._id))
        .order("desc")
        .first();
    }

    console.log("Loading matches");
    const jobMatches = await ctx.db
      .query("jobMatches")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(3);

    console.log("Loading interviews");
    const interviews = await ctx.db
      .query("interviews")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter(q => q.eq(q.field("status"), "Completed"))
      .order("desc")
      .take(3);

    console.log("Loading goals");
    const goals = await ctx.db
      .query("careerGoals")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    console.log("Loading tasks");
    const tasks = await ctx.db
      .query("careerTasks")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return { user, resume, atsAnalysis, jobMatches, interviews, goals, tasks };
  },
});

export const getChatPayload = query({
  args: { 
    clerkId: v.string(), 
    advisor: v.union(v.literal("Forge"), v.literal("Nova")),
    message: v.string()
  },
  handler: async (ctx, args) => {
    // We basically copy the payload building logic from advisorActions
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    const resume = await ctx.db
      .query("resumes")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter(q => q.eq(q.field("analysisStatus"), "completed"))
      .order("desc")
      .first();

    let atsAnalysis = null;
    if (resume) {
      atsAnalysis = await ctx.db
        .query("atsAnalyses")
        .withIndex("by_resumeId", (q) => q.eq("resumeId", resume._id))
        .order("desc")
        .first();
    }

    const jobMatches = await ctx.db
      .query("jobMatches")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(3);

    const interviews = await ctx.db
      .query("interviews")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter(q => q.eq(q.field("status"), "Completed"))
      .order("desc")
      .take(3);

    const goals = await ctx.db
      .query("careerGoals")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    const tasks = await ctx.db
      .query("careerTasks")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    let resumeContext = "No resumes uploaded.";
    if (resume) {
      // Opt: only Summary, Skills, Projects, Education if available, but for now we format nicely
      resumeContext = `Latest Resume Title: ${resume.title}\nFormat: ${resume.format}`;
    }

    let atsContext = "No ATS analyses available.";
    if (atsAnalysis) {
      const strengths = Array.isArray(atsAnalysis.strengths) ? atsAnalysis.strengths.join(", ") : "N/A";
      const weaknesses = Array.isArray(atsAnalysis.weaknesses) ? atsAnalysis.weaknesses.join(", ") : "N/A";
      // Don't inject full text to reduce context
      atsContext = `Latest ATS Score: ${atsAnalysis.atsScore}%\nStrengths: ${strengths}\nWeaknesses: ${weaknesses}`;
    }

    let jobMatchesContext = "No job matches available.";
    if (jobMatches.length > 0) {
      jobMatchesContext = jobMatches.map((jm: any) => {
        let missing = "N/A";
        if (jm.missingSkills) {
          missing = Array.isArray(jm.missingSkills) 
            ? jm.missingSkills.join(", ") 
            : (jm.missingSkills.critical ? jm.missingSkills.critical.join(", ") : "N/A");
        }
        return `Role: ${jm.role} at ${jm.company} | Match Score: ${jm.matchScore}% | Missing Skills: ${missing}`;
      }).join("\n");
    }

    let interviewsContext = "No interviews available.";
    if (interviews.length > 0) {
      interviewsContext = interviews.map((iv: any) => 
        `Role: ${iv.role} | Readiness Score: ${iv.overallScore}% | Weaknesses: ${(iv.weaknesses || []).join(", ")}`
      ).join("\n");
    }

    let goalsContext = "No career goals set.";
    if (goals) {
      goalsContext = `Target Role: ${goals.targetRole || "N/A"} | Target Company: ${goals.targetCompany || "N/A"}\nLong Term Goals: ${(goals.longTermGoals || []).join(", ")}`;
    }

    let tasksContext = "No active tasks.";
    if (tasks.length > 0) {
      tasksContext = tasks.filter((t: any) => !t.completed).map((t: any) => `- ${t.title} (Priority: ${t.priority})`).join("\n");
    }

    const persona = args.advisor === "Forge" 
      ? `You are Forge, CareerForge's Technical Career Strategist. You are highly technical, analytical, direct, and data-driven. You focus on resume optimization, ATS improvement, job matching, technical interview prep, and project recommendations.`
      : `You are Nova, CareerForge's Career Growth Advisor. You are strategic, supportive, growth-oriented, and professional. You focus on career planning, learning roadmaps, soft skills, networking, and productivity.`;

    const systemPrompt = `${persona}

### MANDATORY HALLUCINATION PROTECTION RULES
1. Only use the available user data provided below.
2. NEVER fabricate ATS scores, interview results, job matches, or resume content.
3. If the user asks about something and the sufficient context is unavailable below, you MUST say exactly: "I don't have enough information to answer accurately."
4. If ATS Analysis context is "No ATS analyses available.", you MUST state exactly: "I couldn't find a recent ATS analysis."
5. If you suggest a task, make it actionable.
6. Avoid repeating previous advice.
7. Provide actionable recommendations.
8. Keep responses concise. Target response length: 150-250 words.
9. Prioritize highest-impact improvements.
10. If the user asks you to find or search for jobs, DO NOT list fake jobs. Instead, generate a deep link to the Job Search Hub using this markdown format: [Search for {Job Title} Jobs](/dashboard/job-search?q={encoded_title}&location={encoded_location}&remote={true/false}). For example: [Search for Remote React Jobs](/dashboard/job-search?q=React&remote=true).

### USER CONTEXT
--- RESUME ---
${resumeContext}
--- ATS ANALYSIS ---
${atsContext}
--- RECENT JOB MATCHES ---
${jobMatchesContext}
--- RECENT INTERVIEWS ---
${interviewsContext}
--- CAREER GOALS ---
${goalsContext}
--- PENDING TASKS ---
${tasksContext}`;

    let chat = await ctx.db
      .query("advisorChats")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("advisor"), args.advisor))
      .first();

    let chatHistory: any[] = [];
    if (chat) {
      const messages = await ctx.db
        .query("advisorMessages")
        .withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
        .order("asc")
        .collect();
      // Reduced to last 5 messages for performance
      chatHistory = messages.slice(-5);
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory.map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: args.message }
    ];

    return { messages, user: { _id: user._id } };
  }
});
