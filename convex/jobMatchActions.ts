"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { extractTextFromPDF } from "./pdfExtractor";import { Id } from "./_generated/dataModel";

export const analyzeJobMatch = action({
  args: { 
    resumeId: v.id("resumes"),
    jobTitle: v.string(),
    companyName: v.string(),
    location: v.string(),
    jobDescription: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"jobMatches">> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Get the resume
    const resume = await ctx.runQuery(internal.analyses.getResumeInternal, { id: args.resumeId });
    if (!resume) throw new Error("Resume not found");

    // Extract text from resume
    let buffer: Buffer;
    try {
      const response = await fetch(resume.fileUrl);
      if (!response.ok) throw new Error("Failed to download file");
      buffer = Buffer.from(await response.arrayBuffer());
    } catch (e: any) {
      throw new Error(`File fetch failed: ${e.message}`);
    }

    let extractedText = "";
    if (resume.format === "pdf") {
      const { text } = await extractTextFromPDF(buffer);
      extractedText = text;
    } else if (resume.format === "txt" || resume.format === "markdown" || resume.format === "md") {
      extractedText = buffer.toString("utf-8");
    } else {
      throw new Error(`Unsupported format: ${resume.format}`);
    }

    if (!extractedText) throw new Error("Could not extract text from resume");

    // Call NVIDIA NIM API
    try {
      const apiResponse = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta/llama-3.3-70b-instruct",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are an expert ATS (Applicant Tracking System) and Technical Recruiter. Compare the candidate's resume against the provided Job Description.

You MUST calculate match scores out of 100 strictly using this weighted formula:
Overall Match = (Skills * 0.40) + (Keywords * 0.25) + (Experience * 0.20) + (Education * 0.15)

1. Identify explicit skills missing from the resume but present in the JD. Group them into "critical", "niceToHave", and "optional".
2. Provide a "matchSummary" (a short recruiter-style paragraph analyzing the candidate's fit).
3. Provide a "scoreReasoning" explaining why the scores were given.
4. Generate a "learningPath" mapped to the missing skills (suggesting a skill and a resource name like "MDN", "GitHub Skills", etc).

Output strictly as JSON with this exact schema:
{
  "overallMatch": <number>,
  "skillsScore": <number>,
  "experienceScore": <number>,
  "educationScore": <number>,
  "keywordScore": <number>,
  "matchSummary": "<string>",
  "scoreReasoning": "<string>",
  "missingSkills": {
    "critical": [<string>, ...],
    "niceToHave": [<string>, ...],
    "optional": [<string>, ...]
  },
  "learningPath": [
    { "skill": "<string>", "resource": "<string>" }
  ],
  "recommendations": [<string>, ...]
}`
            },
            {
              role: "user",
              content: `JOB DESCRIPTION:\nTitle: ${args.jobTitle}\nCompany: ${args.companyName}\nDescription:\n${args.jobDescription}\n\n=================\n\nRESUME TEXT:\n${extractedText}`
            }
          ],
        }),
      });

      if (!apiResponse.ok) {
        throw new Error(`NVIDIA API error: ${await apiResponse.text()}`);
      }

      const data = await apiResponse.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("Failed to parse AI response");

      const analysisResult = JSON.parse(content);

      // Save to database
      const matchId = await ctx.runMutation(internal.jobMatches.createInternal, {
        clerkId: identity.subject,
        resumeId: args.resumeId,
        company: args.companyName,
        role: args.jobTitle,
        location: args.location,
        jobDescription: args.jobDescription,
        matchScore: analysisResult.overallMatch || 0,
        skillsMatch: analysisResult.skillsScore || 0,
        experienceMatch: analysisResult.experienceScore || 0,
        keywordMatch: analysisResult.keywordScore || 0,
        educationMatch: analysisResult.educationScore || 0,
        matchSummary: analysisResult.matchSummary || "Analysis complete. See match breakdown for details.",
        scoreReasoning: analysisResult.scoreReasoning || "No detailed reasoning provided by the AI.",
        missingSkills: Array.isArray(analysisResult.missingSkills) 
          ? { critical: analysisResult.missingSkills, niceToHave: [], optional: [] } 
          : (analysisResult.missingSkills || { critical: [], niceToHave: [], optional: [] }),
        missingKeywords: analysisResult.missingKeywords || [],
        recommendations: analysisResult.recommendations || [],
        learningPath: analysisResult.learningPath || [],
        status: (analysisResult.overallMatch || 0) >= 80 ? "Ready to Apply" : "Missing Skills"
      });

      return matchId;

    } catch (e: any) {
      console.error(e);
      throw new Error(`AI Analysis failed: ${e.message}`);
    }
  }
});
