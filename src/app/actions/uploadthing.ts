"use server";

import { UTApi } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";

const utapi = new UTApi();

export async function deleteUploadThingFile(fileKey: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  await utapi.deleteFiles(fileKey);
}
