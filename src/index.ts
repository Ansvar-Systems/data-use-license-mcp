#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer, SERVER_NAME } from './mcp-server.js';

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  const server = createMcpServer();
  await server.connect(transport);
  console.error(`${SERVER_NAME} running on stdio`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
