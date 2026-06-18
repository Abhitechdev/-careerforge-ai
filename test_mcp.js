const { spawn } = require('child_process');

const server = spawn('npx.cmd', ['@testsprite/testsprite-mcp@latest'], {
  shell: true,
  env: { ...process.env, API_KEY: process.env.MCP_API_KEY }
});

server.stdout.on('data', (data) => {
  console.log(`STDOUT: ${data.toString()}`);
});

server.stderr.on('data', (data) => {
  console.error(`STDERR: ${data.toString()}`);
});

const initReq = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test-client", version: "1.0.0" }
  }
};

const toolsReq = {
  jsonrpc: "2.0",
  id: 2,
  method: "tools/list"
};

server.stdin.write(JSON.stringify(initReq) + '\n');

setTimeout(() => {
  server.stdin.write(JSON.stringify(toolsReq) + '\n');
}, 2000);

setTimeout(() => {
  server.kill();
}, 5000);
