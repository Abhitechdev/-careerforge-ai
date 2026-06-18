import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const nvidia = createOpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY,
});

async function test() {
  try {
    const result = await streamText({
      model: nvidia.chat("meta/llama-3.3-70b-instruct"),
      messages: [{role: "user", content: "hello"}],
    });
    for await (const chunk of result.textStream) {
      process.stdout.write(chunk);
    }
  } catch (e) {
    console.error(e);
  }
}
test();
