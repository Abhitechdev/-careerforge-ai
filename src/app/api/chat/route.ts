import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

// Create an OpenAI provider instance for NVIDIA


// Create an OpenAI provider instance for NVIDIA
const nvidia = createOpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY,
});

export async function POST(req: Request) {
  // 1. Authenticate user securely
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { messages, advisor } = await req.json();

    if (!messages || messages.length === 0 || !advisor) {
      return new Response("Missing messages or advisor", { status: 400 });
    }

    const latestMessageContent = messages[messages.length - 1].content;

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) throw new Error("NEXT_PUBLIC_CONVEX_URL missing");
    const convex = new ConvexHttpClient(convexUrl);

    // 2. Save user message to database
    console.log("Message Sent");
    await convex.mutation(api.advisor.saveChatLog, {
      clerkId: userId,
      advisor: advisor as "Forge" | "Nova",
      role: "user",
      content: latestMessageContent,
    });

    // 3. Fetch context payload from Convex securely using clerkId
    const payload = await convex.query(api.advisor.getChatPayload, {
      clerkId: userId,
      advisor: advisor as "Forge" | "Nova",
      message: latestMessageContent,
    });

    if (!payload || !payload.messages) {
      throw new Error("Failed to load chat payload from database");
    }

    // 4. Retry wrapper for the AI request
    const maxRetries = 2;
    let streamResult;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log("AI Request Started");

        streamResult = await streamText({
          model: nvidia.chat("meta/llama-3.3-70b-instruct"),
          messages: payload.messages,
          onFinish: async (completion) => {
            console.log("AI Response Received");
            // 5. Save assistant message when stream finishes
            try {
              console.log("Message Saved");
              await convex.mutation(api.advisor.saveChatLog, {
                clerkId: userId,
                advisor: advisor as "Forge" | "Nova",
                role: "assistant",
                content: completion.text,
              });
              console.log("Message Rendered");
            } catch (err) {
              console.error("Failed to save assistant message", err);
            }
          }
        });
        break; // If successful, break out of retry loop
      } catch (err: any) {
        lastError = err;
        console.error(`AI Request Attempt ${attempt + 1} failed:`, err);
        if (attempt === maxRetries) {
          throw new Error("Advisor is temporarily unavailable. Please try again.");
        }
        // Small delay before retry
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    if (!streamResult) {
      throw lastError || new Error("Stream failed");
    }

    // Return the stream directly with proper headers to prevent buffering
    return new Response(streamResult.textStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    console.error("API Chat Error:", error);
    // Return a friendly fallback instead of silently failing
    return new Response("Forge is temporarily unavailable. Please try again.", { status: 503 });
  }
}
