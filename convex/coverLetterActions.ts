"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { extractTextFromPDF } from "./pdfExtractor";import { Id } from "./_generated/dataModel";

export const generateCoverLetter = action({
  args: { 
    resumeId: v.id("resumes"),
    jobTitle: v.string(),
    companyName: v.string(),
    jobDescription: v.string(),
    style: v.union(v.literal("Professional"), v.literal("Recruiter"), v.literal("Startup"), v.literal("FAANG"), v.literal("Fresher")),
  },
  handler: async (ctx, args): Promise<{ letterId: Id<"coverLetters">, content: string }> => {
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

    let styleInstruction = "";
    switch (args.style) {
      case "Professional":
        styleInstruction = "Write a traditional corporate format cover letter. Focus on formal language and structured achievements.";
        break;
      case "Recruiter":
        styleInstruction = "Write a cover letter that heavily highlights ATS keywords and direct metric-based achievements. Keep it punchy and easy for a recruiter to scan.";
        break;
      case "Startup":
        styleInstruction = "Write a cover letter tailored for a startup. Emphasize adaptability, wearing multiple hats, taking ownership, and passion for the product.";
        break;
      case "FAANG":
        styleInstruction = "Write a cover letter tailored for FAANG/Big Tech companies. Highlight massive scale, technical excellence, and impactful system design.";
        break;
      case "Fresher":
        styleInstruction = "Write a cover letter tailored for a junior or entry-level role. Highlight academic projects, rapid learning ability, enthusiasm, and foundational skills.";
        break;
    }

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
          messages: [
            {
              role: "system",
              content: `You are an expert career coach and professional copywriter. Write a highly tailored cover letter based on the provided resume and job description.
              
              STYLE INSTRUCTION: ${styleInstruction}

              CRITICAL REQUIREMENTS:
              1. Explicitly reference the exact skills found in the resume.
              2. Mention specific projects from the resume.
              3. Highlight the user's specific education and degrees (e.g., M.Tech in Computer Science).
              4. Reference the direct requirements of the company's job description and show how the candidate mitigates any missing skills.
              5. The letter should feel highly personalized and authentic, absolutely NOT like a generic template.
              
              Do not include placeholder brackets like [Your Name] unless absolutely necessary; try to extract the user's name from the resume. Do not output anything except the cover letter text itself.`
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

      // Save to database
      const letterId = await ctx.runMutation(internal.coverLetters.createInternal, {
        clerkId: identity.subject,
        resumeId: args.resumeId,
        company: args.companyName,
        role: args.jobTitle,
        tone: args.style,
        content: content.trim(),
      });

      return { letterId, content: content.trim() };

    } catch (e: any) {
      console.error(e);
      throw new Error(`AI generation failed: ${e.message}`);
    }
  }
});
