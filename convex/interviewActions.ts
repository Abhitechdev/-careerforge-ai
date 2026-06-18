"use node";

import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { v } from "convex/values";
import { extractTextFromPDF } from "./pdfExtractor";
import { Id } from "./_generated/dataModel";

export const generateInterview = action({
  args: { 
    resumeId: v.optional(v.id("resumes")),
    role: v.string(),
    jobDescription: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<"interviews">> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    let extractedText = "";
    if (args.resumeId) {
      const resume = await ctx.runQuery(internal.analyses.getResumeInternal, { id: args.resumeId });
      if (resume) {
        try {
          const response = await fetch(resume.fileUrl);
          if (response.ok) {
            const buffer = Buffer.from(await response.arrayBuffer());
            if (resume.format === "pdf") {
              const { text } = await extractTextFromPDF(buffer);
              extractedText = text;
            } else {
              extractedText = buffer.toString("utf-8");
            }
          }
        } catch (e) {
          console.error("Resume extraction failed:", e);
        }
      }
    }

    const interviewId = await ctx.runMutation(internal.interviews.createInternal, {
      clerkId: identity.subject,
      resumeId: args.resumeId,
      role: args.role,
      jobDescription: args.jobDescription,
    });

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
              content: `You are an expert Technical Recruiter and Hiring Manager. Generate exactly 10 highly personalized interview questions based on the candidate's target role, resume, and job description.
              
              Question Distribution:
              - 3 Technical
              - 3 Behavioral
              - 2 Project-Based
              - 2 HR / Culture Fit

              Each question must have a difficulty of "Easy", "Medium", or "Hard".
              For each question, generate a "sampleAnswer" which is the ideal response using the STAR method where applicable.

              Output strictly as JSON with this exact schema:
              {
                "questions": [
                  {
                    "category": "Technical" | "Behavioral" | "Project-Based" | "HR" | "Resume-Based",
                    "difficulty": "Easy" | "Medium" | "Hard",
                    "question": "<string>",
                    "sampleAnswer": "<string>"
                  }
                ]
              }`
            },
            {
              role: "user",
              content: `TARGET ROLE: ${args.role}\nJOB DESCRIPTION: ${args.jobDescription || "N/A"}\n\nRESUME TEXT:\n${extractedText || "N/A"}`
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

      const result = JSON.parse(content);
      const questions = result.questions || [];

      for (const q of questions) {
        await ctx.runMutation(internal.interviews.createQuestionInternal, {
          interviewId,
          category: q.category,
          difficulty: q.difficulty,
          question: q.question,
          sampleAnswer: q.sampleAnswer,
        });
      }

      return interviewId;

    } catch (e: any) {
      console.error(e);
      throw new Error(`AI Analysis failed: ${e.message}`);
    }
  }
});

export const evaluateAnswer = action({
  args: {
    questionId: v.id("interviewQuestions"),
    question: v.string(),
    sampleAnswer: v.string(),
    userResponse: v.string(),
  },
  handler: async (ctx, args): Promise<{ score: number, feedback: string }> => {
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
              content: `You are an expert Technical Recruiter evaluating an interview response. 
              
              Calculate a score out of 100 based on:
              - Technical Accuracy (30%)
              - Communication (25%)
              - Problem Solving (20%)
              - Confidence (15%)
              - Structure (10%)

              Provide constructive recruiter feedback.

              Output strictly as JSON with this exact schema:
              {
                "score": <number>,
                "feedback": "<string>"
              }`
            },
            {
              role: "user",
              content: `QUESTION: ${args.question}\nIDEAL ANSWER: ${args.sampleAnswer}\n\nCANDIDATE RESPONSE:\n${args.userResponse}`
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

      const result = JSON.parse(content);
      const score = result.score || 0;
      const feedback = result.feedback || "No feedback provided.";

      await ctx.runMutation(internal.interviews.updateQuestionScoreInternal, {
        questionId: args.questionId,
        userResponse: args.userResponse,
        feedback,
        score,
      });

      return { score, feedback };

    } catch (e: any) {
      console.error(e);
      throw new Error(`AI Evaluation failed: ${e.message}`);
    }
  }
});

export const completeInterview = action({
  args: {
    interviewId: v.id("interviews"),
  },
  handler: async (ctx, args): Promise<{ overallScore: number }> => {
    // 1. Fetch all questions for this interview
    const questions = await ctx.runQuery(api.interviews.getQuestions, { interviewId: args.interviewId });
    
    // Fallback scoring logic to prevent crashing if something goes wrong
    let techScores: number[] = [];
    let behavScores: number[] = [];
    let projScores: number[] = [];
    let hrScores: number[] = [];
    
    let allResponses = "";

    questions.forEach((q: any) => {
      const score = q.score || 0;
      if (q.category === "Technical") techScores.push(score);
      else if (q.category === "Behavioral") behavScores.push(score);
      else if (q.category === "Project-Based") projScores.push(score);
      else hrScores.push(score);

      allResponses += `Q: ${q.question}\nA: ${q.userResponse}\nScore: ${score}/100\n\n`;
    });

    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    
    const technicalScore = avg(techScores);
    const behavioralScore = avg(behavScores);
    const projectScore = avg(projScores);
    const communicationScore = avg([...behavScores, ...hrScores]); 
    const confidenceScore = avg(hrScores);

    // AI summary logic
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
              content: `You are an expert Technical Recruiter summarizing a complete interview. Review all questions, candidate responses, and their scores.

              Identify 3-5 key strengths and 3-5 weaknesses. 
              Provide an actionable improvement plan.

              Output strictly as JSON with this exact schema:
              {
                "overallScore": <number>,
                "strengths": ["<string>"],
                "weaknesses": ["<string>"],
                "improvementPlan": ["<string>"]
              }`
            },
            {
              role: "user",
              content: `INTERVIEW TRANSCRIPT:\n${allResponses}`
            }
          ],
        }),
      });

      let overallScore = 0;
      let strengths: string[] = [];
      let weaknesses: string[] = [];
      let improvementPlan: string[] = [];

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const result = JSON.parse(content);
          overallScore = result.overallScore || avg(questions.map((q: any) => q.score || 0));
          strengths = result.strengths || [];
          weaknesses = result.weaknesses || [];
          improvementPlan = result.improvementPlan || [];
        }
      } else {
        overallScore = avg(questions.map((q: any) => q.score || 0));
      }

      await ctx.runMutation(internal.interviews.completeInterviewInternal, {
        interviewId: args.interviewId,
        overallScore,
        technicalScore,
        behavioralScore,
        communicationScore,
        projectScore,
        confidenceScore,
        weaknesses,
        strengths,
        improvementPlan,
      });

      return { overallScore };

    } catch (e: any) {
      console.error(e);
      throw new Error(`AI Summarization failed: ${e.message}`);
    }
  }
});
