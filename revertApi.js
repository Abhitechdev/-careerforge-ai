const fs = require('fs');

const files = [
  'src/app/api/chat/route.ts',
  'convex/jobMatchActions.ts',
  'convex/interviewActions.ts',
  'convex/coverLetterActions.ts',
  'convex/analyzeAction.ts',
  'convex/advisorActions.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/https:\/\/api\.openai\.com\/v1\/chat\/completions/g, 'https://integrate.api.nvidia.com/v1/chat/completions');
  content = content.replace(/process\.env\.OPENAI_API_KEY/g, 'process.env.NVIDIA_API_KEY');
  content = content.replace(/"gpt-4o-mini"/g, '"meta/llama-3.3-70b-instruct"');
  
  if (file.includes('route.ts')) {
    content = content.replace(/import \{ openai \} from "@ai-sdk\/openai";/, 'import { createOpenAI } from "@ai-sdk/openai";');
    content = content.replace(/model: openai\("meta\/llama-3\.3-70b-instruct"\)/, 'model: nvidia("meta/llama-3.3-70b-instruct")');
    
    if (!content.includes('const nvidia = createOpenAI')) {
      const initCode = `// Create an OpenAI provider instance for NVIDIA
const nvidia = createOpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY,
});

export async function POST(req: Request) {`;
      content = content.replace(/export async function POST\(req: Request\) \{/, initCode);
    }
  }
  fs.writeFileSync(file, content);
}
console.log('Reverted successfully');
