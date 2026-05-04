import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { startHttpServer, type HttpServerHandle } from '../../src/http-server.js';
import { request as httpRequest } from 'node:http';

describe('HTTP contract — every tool returns a valid MCP response over HTTP', () => {
  let handle: HttpServerHandle;
  let sessionId: string;

  beforeEach(async () => {
    handle = await startHttpServer({ port: 0 });
    const init = await postJson(handle.port, initializePayload());
    sessionId = init.headers['mcp-session-id']!;
    expect(sessionId).toBeTruthy();
  });

  afterEach(async () => {
    await handle.close();
  });

  it('search_entities returns content array', async () => {
    const res = await callTool(handle.port, sessionId, 'search_entities', { query: 'Apache', limit: 3 });
    expect(res.statusCode).toBe(200);
    const result = parseResult(res.body);
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0]).toMatchObject({ type: 'text' });
  });

  it('get_entity returns content array', async () => {
    const res = await callTool(handle.port, sessionId, 'get_entity', { entity_id: 'apache-2.0' });
    expect(res.statusCode).toBe(200);
    const result = parseResult(res.body);
    expect(Array.isArray(result.content)).toBe(true);
  });

  it('check_compatibility returns content array', async () => {
    const res = await callTool(handle.port, sessionId, 'check_compatibility', { left_id: 'mit', right_id: 'apache-2.0' });
    expect(res.statusCode).toBe(200);
    const result = parseResult(res.body);
    expect(Array.isArray(result.content)).toBe(true);
  });

  it('get_obligations returns content array', async () => {
    const res = await callTool(handle.port, sessionId, 'get_obligations', { entity_id: 'apache-2.0' });
    expect(res.statusCode).toBe(200);
    const result = parseResult(res.body);
    expect(Array.isArray(result.content)).toBe(true);
  });

  it('search_vendor_templates returns content array', async () => {
    const res = await callTool(handle.port, sessionId, 'search_vendor_templates', { query: 'westlaw' });
    expect(res.statusCode).toBe(200);
    const result = parseResult(res.body);
    expect(Array.isArray(result.content)).toBe(true);
  });
});

function initializePayload(): string {
  return JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'http-contract', version: '0' } } });
}

function callTool(port: number, sessionId: string, name: string, args: Record<string, unknown>): Promise<{ statusCode: number; body: string }> {
  return postJson(port, JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method: 'tools/call', params: { name, arguments: args } }), { 'mcp-session-id': sessionId });
}

function postJson(port: number, body: string, extraHeaders: Record<string, string> = {}): Promise<{ statusCode: number; headers: Record<string, string>; body: string }> {
  return new Promise((resolve, reject) => {
    const req = httpRequest({ hostname: '127.0.0.1', port, path: '/mcp', method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream', 'Content-Length': Buffer.byteLength(body), ...extraHeaders } }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ statusCode: res.statusCode ?? 0, headers: Object.fromEntries(Object.entries(res.headers).map(([k, v]) => [k.toLowerCase(), Array.isArray(v) ? v.join(',') : (v ?? '')])), body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function parseResult(body: string): { content: Array<{ type: string; text: string }> } {
  const dataMatch = body.match(/data:\s*(\{.*\})\s*$/m);
  const json = dataMatch ? dataMatch[1] : body;
  const parsed = JSON.parse(json);
  return parsed.result;
}
