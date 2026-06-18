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
  content = content.replace(/https:\/\/integrate\.api\.nvidia\.com\/v1\/chat\/completions/g, 'https://api.openai.com/v1/chat/completions');
  content = content.replace(/process\.env\.NVIDIA_API_KEY/g, 'process.env.OPENAI_API_KEY');
  content = content.replace(/"meta\/llama-3\.3-70b-instruct"/g, '"gpt-4o-mini"');
  
  if (file.includes('route.ts')) {
    content = content.replace(/import \{ createOpenAI \} from "@ai-sdk\/openai";/, 'import { openai } from "@ai-sdk/openai";');
    content = content.replace(/const nvidia = createOpenAI\(\{[\s\S]*?\}\);/, '');
    content = content.replace(/model: nvidia\("gpt-4o-mini"\)/, 'model: openai("gpt-4o-mini")');
  }
  fs.writeFileSync(file, content);
}
console.log('Replaced successfully');
