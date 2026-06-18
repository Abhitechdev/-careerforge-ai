import { action, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Resend } from "resend";

export const sendWeeklySummary = action({
  args: {
    userId: v.id("users"),
    to: v.string(),
    summaryHtml: v.string(),
  },
  handler: async (ctx, args) => {
    const resendKey = process.env.RESEND_API_KEY;
    
    if (!resendKey) {
      console.log("No RESEND_API_KEY found, logging mock email to DB.");
      await ctx.runMutation(internal.emails.logEmail, {
        userId: args.userId,
        to: args.to,
        subject: "Your Weekly CareerForge Summary",
        html: args.summaryHtml,
        status: "Mocked",
      });
      return;
    }

    const resend = new Resend(resendKey);
    
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: args.to,
        subject: 'Your Weekly CareerForge Summary',
        html: args.summaryHtml,
      });

      await ctx.runMutation(internal.emails.logEmail, {
        userId: args.userId,
        to: args.to,
        subject: "Your Weekly CareerForge Summary",
        html: args.summaryHtml,
        status: "Sent",
      });
    } catch (error: any) {
      console.error("Failed to send email via Resend:", error);
      await ctx.runMutation(internal.emails.logEmail, {
        userId: args.userId,
        to: args.to,
        subject: "Your Weekly CareerForge Summary",
        html: args.summaryHtml,
        status: "Failed",
        error: error.message || "Unknown error",
      });
    }
  },
});

export const sendWelcomeEmail = action({
  args: {
    userId: v.id("users"),
    to: v.string(),
  },
  handler: async (ctx, args) => {
    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    
    const subject = "Welcome to CareerForge AI!";
    const html = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
        <h2>Welcome to CareerForge AI 🚀</h2>
        <p>You're all set to supercharge your job search.</p>
        <p>Head over to your dashboard to upload your resume, analyze your ATS score, and start discovering job matches tailored to your profile.</p>
        <br/>
        <p>Best regards,</p>
        <p>The CareerForge AI Team</p>
      </div>
    `;

    if (!resendKey) {
      console.log("No RESEND_API_KEY found, logging mock welcome email to DB.");
      await ctx.runMutation(internal.emails.logEmail, {
        userId: args.userId,
        to: args.to,
        subject,
        html,
        status: "Mocked",
      });
      return;
    }

    const resend = new Resend(resendKey);
    
    try {
      await resend.emails.send({
        from: fromEmail,
        to: args.to,
        subject,
        html,
      });

      await ctx.runMutation(internal.emails.logEmail, {
        userId: args.userId,
        to: args.to,
        subject,
        html,
        status: "Sent",
      });
    } catch (error: any) {
      console.error("Failed to send welcome email via Resend:", error);
      await ctx.runMutation(internal.emails.logEmail, {
        userId: args.userId,
        to: args.to,
        subject,
        html,
        status: "Failed",
        error: error.message || "Unknown error",
      });
    }
  },
});

export const logEmail = internalMutation({
  args: {
    userId: v.id("users"),
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    status: v.union(v.literal("Sent"), v.literal("Failed"), v.literal("Mocked")),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("emailLogs", {
      ...args,
      sentAt: Date.now(),
    });
  },
});
