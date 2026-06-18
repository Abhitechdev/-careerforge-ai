const apiKey = process.env.NVIDIA_API_KEY;
fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "meta/llama-3.1-8b-instruct",
    messages: [{role: "user", content: "hello"}],
    max_tokens: 10
  })
}).then(async r => {
  console.log(r.status, await r.text());
});
