// Minimal MCP server: JSON-RPC over stdio, one tool, no dependencies.
import { createInterface } from 'node:readline';

const send = (msg) => process.stdout.write(JSON.stringify(msg) + '\n');
const tool = {
  name: 'greet',
  description: 'Returns a fixed greeting.',
  inputSchema: { type: 'object', properties: {} },
};

createInterface({ input: process.stdin }).on('line', (line) => {
  const { id, method, params } = JSON.parse(line);
  if (id === undefined) return; // notification, no reply
  if (method === 'initialize') {
    send({ jsonrpc: '2.0', id, result: {
      protocolVersion: params.protocolVersion,
      capabilities: { tools: {} },
      serverInfo: { name: 'hello', version: '0.1.0' },
    } });
  } else if (method === 'tools/list') {
    send({ jsonrpc: '2.0', id, result: { tools: [tool] } });
  } else if (method === 'tools/call') {
    send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: 'Hello from the shared MCP server.' }] } });
  } else {
    send({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } });
  }
});
