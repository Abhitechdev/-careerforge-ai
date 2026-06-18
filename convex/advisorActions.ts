"use node";

import { action, internalQuery } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";
import { extractTextFromPDF } from "./pdfExtractor";

export const sendMessage = action({
  args: {
    advisor: v.union(v.literal("Forge"), v.literal("Nova")),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("START sendMessage");
    console.log("Advisor:", args.advisor);

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    console.log("User:", identity.subject);

    console.log("Retrieving Context");
    // Instead of querying internal, I'll pass clerkId or do a custom internal query to fetch ALL context.
    // Instead of querying internal, I'll pass clerkId or do a custom internal query to fetch ALL context.
    const context = await ctx.runQuery(internal.advisor.getContextInternal, { clerkId: identity.subject });
    
    if (!context || !context.user) throw new Error("User not found");

    // 2. Save User Message
    await ctx.runMutation(internal.advisor.saveMessageInternal, {
      userId: context.user._id,
      advisor: args.advisor,
      role: "user",
      content: args.message,
    });

    // 3. Format Context
    let resumeContext = "No resumes uploaded.";
    if (context.resume) {
      resumeContext = `Latest Resume Title: ${context.resume.title}\nFormat: ${context.resume.format}`;
      // Ideally we would extract text here, but it's expensive to do on every chat.
      // If we have an ATS analysis with extracted text, we use that!
    }

    let atsContext = "No ATS analyses available.";
    if (context.atsAnalysis) {
      const strengths = Array.isArray(context.atsAnalysis.strengths) ? context.atsAnalysis.strengths.join(", ") : "N/A";
      const weaknesses = Array.isArray(context.atsAnalysis.weaknesses) ? context.atsAnalysis.weaknesses.join(", ") : "N/A";
      atsContext = `Latest ATS Score: ${context.atsAnalysis.atsScore}%\nStrengths: ${strengths}\nWeaknesses: ${weaknesses}\nExtracted Text: ${context.atsAnalysis.extractedText?.substring(0, 2000) || "N/A"}`;
    }

    let jobMatchesContext = "No job matches available.";
    if (context.jobMatches.length > 0) {
      jobMatchesContext = context.jobMatches.map((jm: any) => {
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
    if (context.interviews.length > 0) {
      interviewsContext = context.interviews.map((iv: any) => 
        `Role: ${iv.role} | Readiness Score: ${iv.overallScore}% | Weaknesses: ${(iv.weaknesses || []).join(", ")}`
      ).join("\n");
    }

    let goalsContext = "No career goals set.";
    if (context.goals) {
      goalsContext = `Target Role: ${context.goals.targetRole || "N/A"} | Target Company: ${context.goals.targetCompany || "N/A"}\nLong Term Goals: ${context.goals.longTermGoals.join(", ")}`;
    }

    let tasksContext = "No active tasks.";
    if (context.tasks.length > 0) {
      tasksContext = context.tasks.filter((t: any) => !t.completed).map((t: any) => `- ${t.title} (Priority: ${t.priority})`).join("\n");
    }

    // 4. Advisor Persona
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

    // 5. Format Chat History
    const chat = await ctx.runQuery(api.advisor.getChat, {
      clerkId: identity.subject,
      advisor: args.advisor,
    });
    
    const chatHistory = chat?.messages.slice(-10) || [];
    const messages: any[] = [
      { role: "system", content: systemPrompt },
      ...chatHistory.map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: args.message }
    ];

    // 6. Call LLM
    if (!process.env.NVIDIA_API_KEY) {
      console.error("NVIDIA_API_KEY missing");
      return { response: "Advisor temporarily unavailable." };
    }

    try {
      console.log("Calling AI Provider (NVIDIA NIM)");
      console.log("Messages payload:", JSON.stringify(messages).substring(0, 500) + "...");
      
      const aiRequest = fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta/llama-3.3-70b-instruct",
          messages,
        }),
      });

      const timeout = new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 15000)
      );

      const apiResponse = await Promise.race([aiRequest, timeout]);

      if (!apiResponse.ok) {
        throw new Error(`NVIDIA API error: ${await apiResponse.text()}`);
      }

      console.log("Received AI Response");
      const data = await apiResponse.json();
      console.log("AI Provider Result:", data.choices?.[0]?.message);

      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("Failed to parse AI response");

      // 7. Save Assistant Message
      await ctx.runMutation(internal.advisor.saveMessageInternal, {
        userId: context.user._id,
        advisor: args.advisor,
        role: "assistant",
        content,
      });

      console.log("Returning Response");
      return { response: content };

    } catch (e: any) {
      console.error("AI Action Error:", e);
      return { response: "Advisor temporarily unavailable." };
    }
  }
});


