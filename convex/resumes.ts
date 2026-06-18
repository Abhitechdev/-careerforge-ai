import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function getOrCreateUser(ctx: any, identity: any) {
  let user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    console.log("User not found in Convex. Auto-creating user record.");
    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email || "unknown@example.com",
      name: identity.name,
      avatarUrl: identity.pictureUrl,
      plan: "Free",
      resumeUploadsCount: 0,
      atsAnalysisCount: 0,
      jobMatchesCount: 0,
      createdAt: Date.now(),
    });
    user = (await ctx.db.get(userId))!;
  }
  return user;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await getOrCreateUser(ctx, identity);

    return await ctx.db
      .query("resumes")
      .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("resumes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const resume = await ctx.db.get(args.id);
    if (!resume) throw new Error("Resume not found");

    const user = await getOrCreateUser(ctx, identity);
    
    if (resume.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    return resume;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    fileUrl: v.string(),
    fileKey: v.string(),
    format: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log("IDENTITY:", identity);
    if (!identity) throw new Error("Unauthorized");

    const user = await getOrCreateUser(ctx, identity);
    console.log("USER:", user);

    // Enforce subscription limits
    const resumes = await ctx.db
      .query("resumes")
      .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
      .collect();

    const plan = user.plan || "Free";
    const limits: Record<string, number> = {
      "Free": 3,
      "Pro": 20,
      "Premium": Infinity,
    };

    if (resumes.length >= limits[plan]) {
      throw new Error("Resume limit reached. Upgrade your plan to upload additional resumes.");
    }

    // Check if this is the first resume, if so make it primary
    const isPrimary = resumes.length === 0;

    const resumeId = await ctx.db.insert("resumes", {
      userId: user._id,
      title: args.title,
      fileUrl: args.fileUrl,
      fileKey: args.fileKey,
      format: args.format,
      fileSize: args.fileSize,
      isPrimary,
      analysisStatus: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return resumeId;
  },
});

export const remove = mutation({
  args: { id: v.id("resumes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const resume = await ctx.db.get(args.id);
    if (!resume) throw new Error("Resume not found");

    const user = await getOrCreateUser(ctx, identity);

    if (resume.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Delete the Convex record
    await ctx.db.delete(args.id);

    // If it was primary, randomly assign primary to another resume if one exists
    if (resume.isPrimary) {
      const remainingResumes = await ctx.db
        .query("resumes")
        .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
        .collect();
      if (remainingResumes.length > 0) {
        await ctx.db.patch(remainingResumes[0]._id, { isPrimary: true });
      }
    }

    return resume.fileKey; // Return fileKey to allow Next.js to delete from UploadThing
  },
});

export const replace = mutation({
  args: {
    id: v.id("resumes"),
    title: v.string(),
    fileUrl: v.string(),
    fileKey: v.string(),
    format: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const resume = await ctx.db.get(args.id);
    if (!resume) throw new Error("Resume not found");

    const user = await getOrCreateUser(ctx, identity);

    if (resume.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const oldFileKey = resume.fileKey;

    await ctx.db.patch(args.id, {
      title: args.title,
      fileUrl: args.fileUrl,
      fileKey: args.fileKey,
      format: args.format,
      fileSize: args.fileSize,
      analysisStatus: "pending",
      updatedAt: Date.now(),
    });

    return oldFileKey; // Return the old file key to delete from UploadThing
  },
});

export const setPrimary = mutation({
  args: { id: v.id("resumes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await getOrCreateUser(ctx, identity);

    const resume = await ctx.db.get(args.id);
    if (!resume || resume.userId !== user._id) {
      throw new Error("Unauthorized or resume not found");
    }

    // Find the currently primary resume
    const resumes = await ctx.db
      .query("resumes")
      .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
      .collect();

    for (const r of resumes) {
      if (r.isPrimary && r._id !== args.id) {
        await ctx.db.patch(r._id, { isPrimary: false, updatedAt: Date.now() });
      }
    }

    // Set the selected one to primary
    await ctx.db.patch(args.id, { isPrimary: true, updatedAt: Date.now() });

    return true;
  },
});
