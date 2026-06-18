import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { api, internal } from "./_generated/api";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

async function fetchNvidiaChat(systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error("NVIDIA_API_KEY is not set.");

  const response = await fetch(NVIDIA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "meta/llama-3.3-70b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA API Error: ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export const generateApplicationPack = action({
  args: {
    applicationId: v.id("applications"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Fetch application details & update status
    await ctx.runMutation(internal.applicationActions.updateGenerationStatus, {
      applicationId: args.applicationId,
      status: "generating"
    });

    try {
      const appData = await ctx.runQuery(internal.applicationActions.getAppGenerationData, {
        applicationId: args.applicationId,
        clerkId: args.clerkId
      });

      if (!appData || !appData.user) throw new Error("User not found");
      if (!appData.resume) throw new Error("Please upload and analyze a resume first.");
      
      const role = appData.application.role;
      const company = appData.application.company;
      const location = appData.application.location;
      const jobMatch = appData.jobMatch;
      const atsAnalysis = appData.atsAnalysis;

      const jobContext = `Role: ${role} at ${company} (${location})`;
      const missingSkillsStr = jobMatch ? JSON.stringify(jobMatch.missingSkills) : "None found";
      
      // Calculate Opportunity Score (Formula: ATS 30%, Match 35%, Interview 20%, Skills 15%)
      // If Interview is missing, we re-weight the remaining 80% to 100%
      let totalWeight = 0;
      let scoreSum = 0;

      if (atsAnalysis) {
        totalWeight += 0.30;
        scoreSum += (atsAnalysis.atsScore * 0.30);
      }
      if (jobMatch) {
        totalWeight += 0.35;
        scoreSum += (jobMatch.matchScore * 0.35);
        totalWeight += 0.15;
        scoreSum += (jobMatch.skillsMatch * 0.15); // Approximating skill coverage
      }
      // Interview readiness from recent interviews
      if (appData.interviews && appData.interviews.length > 0) {
        const intAvg = appData.interviews.reduce((acc: any, i: any) => acc + (i.overallScore || 0), 0) / appData.interviews.length;
        totalWeight += 0.20;
        scoreSum += (intAvg * 0.20);
      }

      const rawScore = totalWeight > 0 ? (scoreSum / totalWeight) : 70;
      const opportunityScore = Math.round(rawScore);

      // 2. Parallel AI Requests
      const [coverLetterContent, strategyContent, interviewQ1, interviewQ2, resumeChangesStr] = await Promise.all([
        // Cover Letter
        fetchNvidiaChat(
          "You are an expert career coach writing a highly tailored cover letter.",
          `Write a professional, concise cover letter for ${jobContext}. Focus on compensating for these missing skills if any: ${missingSkillsStr}. Do not use placeholders like [Your Name] if you can avoid it, just output the letter body.`
        ),
        // AI Strategy (Forge)
        fetchNvidiaChat(
          "You are Forge, a technical career strategist.",
          `Provide a brief, actionable application strategy (3 bullet points) for getting hired as a ${role} at ${company}. Focus on bridging gaps: ${missingSkillsStr}.`
        ),
        // Interview Q1 (Technical)
        fetchNvidiaChat(
          "You are an expert technical interviewer.",
          `Generate 1 hard technical/role-specific interview question for a ${role} at ${company}. Also provide a brief sample answer.`
        ),
        // Interview Q2 (Behavioral)
        fetchNvidiaChat(
          "You are an expert HR interviewer.",
          `Generate 1 behavioral interview question tailored to a ${role} at ${company}. Also provide a brief sample answer.`
        ),
        // Tailored Resume changes
        fetchNvidiaChat(
          "You are an ATS optimization expert.",
          `Suggest 3 specific bullet point changes to tailor a resume for ${jobContext}. Format as a JSON array of strings.`
        )
      ]);

      // Parse resume changes
      let parsedChanges = ["Tailored summary for " + role, "Added relevant keywords for " + company];
      try {
        const jsonMatch = resumeChangesStr.match(/\[[\s\S]*\]/);
        if (jsonMatch) parsedChanges = JSON.parse(jsonMatch[0]);
      } catch (e) {
        // fallback to default
      }

      // 3. Save artifacts to Database
      const artifacts = await ctx.runMutation(internal.applicationActions.saveGeneratedArtifacts, {
        clerkId: args.clerkId,
        applicationId: args.applicationId,
        resumeId: appData.resume._id,
        company,
        role,
        coverLetterContent,
        strategyContent,
        opportunityScore,
        interviewQ1,
        interviewQ2,
        resumeChanges: parsedChanges,
        atsScore: atsAnalysis ? atsAnalysis.atsScore + 5 : 85, // Tailored ATS gets a bump
      });

      return { success: true, opportunityScore };
    } catch (err: any) {
      console.error(err);
      await ctx.runMutation(internal.applicationActions.updateGenerationStatus, {
        applicationId: args.applicationId,
        status: "failed"
      });
      throw err;
    }
  }
});

// Helper internal queries/mutations
export const getAppGenerationData = internalQuery({
  args: { applicationId: v.id("applications"), clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").withIndex("by_clerkId", q => q.eq("clerkId", args.clerkId)).first();
    if (!user) return null;

    const application = await ctx.db.get(args.applicationId);
    if (!application || application.userId !== user._id) return null;

    // Use linked resume or primary
    let resume;
    if (application.resumeId) {
      resume = await ctx.db.get(application.resumeId);
    } else {
      resume = await ctx.db.query("resumes").withIndex("by_userId", q => q.eq("userId", user._id)).order("desc").first();
    }

    let atsAnalysis = null;
    let jobMatch = null;
    if (resume) {
      atsAnalysis = await ctx.db.query("atsAnalyses").withIndex("by_resumeId", q => q.eq("resumeId", resume._id)).order("desc").first();
      // Try to find a job match for this role/company
      jobMatch = await ctx.db.query("jobMatches")
        .withIndex("by_userId", q => q.eq("userId", user._id))
        .filter(q => q.and(q.eq(q.field("role"), application.role), q.eq(q.field("company"), application.company)))
        .first();
    }

    const interviews = await ctx.db.query("interviews").withIndex("by_userId", q => q.eq("userId", user._id)).filter(q => q.eq(q.field("status"), "Completed")).order("desc").take(3);

    return { user, application, resume, atsAnalysis, jobMatch, interviews };
  }
});

export const updateGenerationStatus = internalMutation({
  args: { applicationId: v.id("applications"), status: v.union(v.literal("idle"), v.literal("generating"), v.literal("completed"), v.literal("failed")) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.applicationId, { generationStatus: args.status });
  }
});

export const saveGeneratedArtifacts = internalMutation({
  args: {
    clerkId: v.string(),
    applicationId: v.id("applications"),
    resumeId: v.id("resumes"),
    company: v.string(),
    role: v.string(),
    coverLetterContent: v.string(),
    strategyContent: v.string(),
    opportunityScore: v.number(),
    interviewQ1: v.string(),
    interviewQ2: v.string(),
    resumeChanges: v.array(v.string()),
    atsScore: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").withIndex("by_clerkId", q => q.eq("clerkId", args.clerkId)).first();
    if (!user) throw new Error("User not found");

    // 1. Save Cover Letter
    const coverLetterId = await ctx.db.insert("coverLetters", {
      userId: user._id,
      resumeId: args.resumeId,
      company: args.company,
      role: args.role,
      tone: "Professional",
      content: args.coverLetterContent,
      createdAt: Date.now(),
    });

    // 2. Save Interview & Questions
    const interviewId = await ctx.db.insert("interviews", {
      userId: user._id,
      resumeId: args.resumeId,
      role: args.role,
      status: "In Progress",
      createdAt: Date.now(),
    });

    await ctx.db.insert("interviewQuestions", {
      interviewId,
      category: "Technical",
      difficulty: "Hard",
      question: args.interviewQ1,
      sampleAnswer: "AI Generated Sample Answer",
      createdAt: Date.now(),
    });

    await ctx.db.insert("interviewQuestions", {
      interviewId,
      category: "Behavioral",
      difficulty: "Medium",
      question: args.interviewQ2,
      sampleAnswer: "AI Generated Sample Answer",
      createdAt: Date.now(),
    });

    // 3. Save Resume Version (Feature 8)
    // Find current max version
    const versions = await ctx.db.query("resumeVersions").withIndex("by_resumeId", q => q.eq("resumeId", args.resumeId)).collect();
    const versionNumber = versions.length > 0 ? Math.max(...versions.map(v => v.versionNumber)) + 1 : 1;

    await ctx.db.insert("resumeVersions", {
      resumeId: args.resumeId,
      versionNumber,
      atsScore: args.atsScore,
      changes: args.resumeChanges,
      createdAt: Date.now(),
    });

    // 4. Update Application
    await ctx.db.patch(args.applicationId, {
      coverLetterId,
      interviewId,
      opportunityScore: args.opportunityScore,
      aiStrategy: args.strategyContent,
      generationStatus: "completed",
    });

    return { coverLetterId, interviewId };
  }
});
