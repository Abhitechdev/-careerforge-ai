import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const f = createUploadthing();

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const ourFileRouter = {
  resumeUploader: f({
    pdf: { maxFileSize: "16MB" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "16MB" },
  })
    .middleware(async ({ req }) => {
      try {
        console.log("UploadThing middleware started");
        
        // Ensure Convex URL is defined
        if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
          console.error("Missing NEXT_PUBLIC_CONVEX_URL");
          throw new Error("Missing NEXT_PUBLIC_CONVEX_URL");
        }

        const { userId } = await auth();
        console.log("Clerk userId:", userId);
        
        if (!userId) throw new Error("Unauthorized");

        // We rely on Clerk for auth. Bypassing Convex query here to prevent failures 
        // if Convex schema isn't synced, since onClientUploadComplete will hit Convex anyway.
        return { userId: userId, clerkId: userId };
      } catch (error) {
        console.error("UploadThing middleware error:", error);
        throw error;
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        fileUrl: file.url,
        fileKey: file.key,
        name: file.name,
        size: file.size,
        type: file.type,
      };
    }),
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
