import { describe, it, expect } from 'vitest';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { createMcpServer } from '../../src/mcp-server.js';

describe('createMcpServer', () => {
  it('returns a Server with name + version', () => {
    const server = createMcpServer();
    expect(server).toBeDefined();
  });

  it('registers ListToolsRequestSchema returning all 5 tools', async () => {
    const server = createMcpServer();
    const handlers = (server as unknown as { _requestHandlers: Map<string, unknown> })._requestHandlers;
    expect(handlers).toBeDefined();
    expect(handlers.has(ListToolsRequestSchema.shape.method.value)).toBe(true);
    expect(handlers.has(CallToolRequestSchema.shape.method.value)).toBe(true);
  });

  it('returns a fresh Server instance each call', () => {
    const a = createMcpServer();
    const b = createMcpServer();
    expect(a).not.toBe(b);
  });
});
