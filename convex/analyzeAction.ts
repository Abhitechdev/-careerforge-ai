"use node";

import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { extractTextFromPDF } from "./pdfExtractor";
import { withRetry } from "./retry";

export const analyzeResumeBackground = internalAction({
  args: { resumeId: v.id("resumes"), jobId: v.optional(v.id("requestQueue")) },
  handler: async (ctx, args) => {
    console.log("NVIDIA Key Exists:", !!process.env.NVIDIA_API_KEY);

    // Get the resume
    const resume = await ctx.runQuery(internal.analyses.getResumeInternal, { id: args.resumeId });
    if (!resume) throw new Error("Resume not found");

    if (args.jobId) {
      await ctx.runMutation(internal.queue.updateJobStatus, { jobId: args.jobId, status: "processing" });
    }

    try {
      console.log("Resume:", resume._id);
      console.log("File URL:", resume.fileUrl);
      console.log("File Type:", resume.format);

      // 1. Update status to processing
      await ctx.runMutation(internal.analyses.updateStatus, {
        resumeId: args.resumeId,
        status: "processing",
        error: undefined,
      });

      // 2. Download the file
      let buffer: Buffer;
      try {
        const response = await fetch(resume.fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
        console.log(`[Resume ${args.resumeId}] Fetch successful. Buffer size: ${buffer.length} bytes`);
      } catch (e: any) {
        console.error(`[Resume ${args.resumeId}] File fetch failed:`, e.stack || e);
        throw new Error(`File fetch failed: ${e.message}`);
      }

      // 3. Extract text
      console.log(`[Resume ${args.resumeId}] File Format: ${resume.format}`);
      console.log(`[Resume ${args.resumeId}] File Size: ${buffer.length} bytes`);
      
      let extractedText = "";
      try {
        if (resume.format === "pdf") {
          const { text, pageCount, processingTimeMs } = await extractTextFromPDF(buffer);
          extractedText = text;
          console.log(`[Resume ${args.resumeId}] PDF Pages: ${pageCount} | Processing Time: ${processingTimeMs}ms`);
        } else if (resume.format === "docx") {
          const startTime = Date.now();
          console.log(`[Resume ${args.resumeId}] Extraction Library: mammoth`);
          const mammoth = require("mammoth");
          const result = await mammoth.extractRawText({ buffer });
          extractedText = result.value;
          console.log(`[Resume ${args.resumeId}] DOCX Processing Time: ${Date.now() - startTime}ms`);
        } else {
          throw new Error(`Unsupported format: ${resume.format}`);
        }

        if (!extractedText || extractedText.trim().length === 0) {
          throw new Error("Extracted text is empty. The file might be a scanned image or invalid.");
        }
        console.log(`[Resume ${args.resumeId}] Text extraction successful. Extracted length: ${extractedText.length} characters`);
      } catch (e: any) {
        console.error(`[Resume ${args.resumeId}] Text extraction failed:`, e.stack || e);
        throw new Error(e.message);
      }

      // 4. Send to OpenRouter (NVIDIA Llama) with retry & circuit breaker
      console.log(`[Resume ${args.resumeId}] Starting NVIDIA API request...`);
      let analysisResult;
      try {
        analysisResult = await withRetry(async () => {
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
                content: `You are an expert ATS (Applicant Tracking System) and Career Coach. Analyze the provided resume text thoroughly. Provide scores out of 100, identify skills, find missing keywords commonly expected for the inferred target roles, list strengths and weaknesses, and provide actionable recommendations.

Output strictly as JSON with this exact schema:
{
  "overallScore": <number>,
  "atsScore": <number>,
  "skillsScore": <number>,
  "formattingScore": <number>,
  "experienceScore": <number>,
  "skills": [<string>, ...],
  "missingKeywords": [<string>, ...],
  "strengths": [<string>, ...],
  "weaknesses": [<string>, ...],
  "recommendations": [<string>, ...],
  "experienceLevel": <string>,
  "targetRoles": [<string>, ...]
}`
              },
              {
                role: "user",
                content: `Resume text:\n\n${extractedText}`
              }
            ],
          }),
        });

        if (!apiResponse.ok) {
          const errorBody = await apiResponse.text();
          throw new Error(`NVIDIA API error ${apiResponse.status}: ${errorBody}`);
        }

        const data = await apiResponse.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error("Failed to parse NVIDIA API response: content is empty");
        }
        return JSON.parse(content);
      }, 2, 2000); // 2 retries, 2s base delay

      await ctx.runMutation(internal.system.recordAISuccess);
      console.log(`[Resume ${args.resumeId}] NVIDIA API request successful. Analysis parsed.`);
    } catch (e: any) {
      await ctx.runMutation(internal.system.recordAIFailure);
      console.error(`[Resume ${args.resumeId}] NVIDIA API request/parsing failed:`, e.stack || e);
      throw new Error(`NVIDIA API request/parsing failed: ${e.message}`);
    }

      // 5. Save results and complete
      console.log(`[Resume ${args.resumeId}] Saving analysis to database...`);
      try {
        await ctx.runMutation(internal.analyses.saveAnalysis, {
          resumeId: args.resumeId,
          analysis: {
            ...analysisResult,
            extractedText: extractedText.substring(0, 10000), // store up to 10k chars
          }
        });
        console.log(`[Resume ${args.resumeId}] Save successful.`);
      } catch (e: any) {
        console.error(`[Resume ${args.resumeId}] Save mutation failed:`, e);
        throw new Error(`Save mutation failed: ${e.message}`);
      }

      if (args.jobId) {
        await ctx.runMutation(internal.queue.updateJobStatus, { jobId: args.jobId, status: "completed" });
      }

      return { success: true };
    } catch (error: any) {
      console.error(`[Resume ${args.resumeId}] Analyze resume global error:`, error.stack || error);
      await ctx.runMutation(internal.analyses.updateStatus, {
        resumeId: args.resumeId,
        status: "failed",
        error: error.message,
      });
      if (args.jobId) {
        await ctx.runMutation(internal.queue.updateJobStatus, { jobId: args.jobId, status: "failed", error: error.message });
      }
      return { success: false, error: error.message };
    }
  },
});
