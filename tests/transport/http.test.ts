import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { startHttpServer, type HttpServerHandle } from '../../src/http-server.js';
import { request as httpRequest } from 'node:http';

describe('G7.1 + G7.2 — initialize returns Mcp-Session-Id with v4 UUID', () => {
  let handle: HttpServerHandle;

  beforeEach(async () => {
    handle = await startHttpServer({ port: 0 });
  });

  afterEach(async () => {
    await handle.close();
  });

  it('returns 200 + Mcp-Session-Id header that matches v4 UUID regex', async () => {
    const res = await postJson(handle.port, '/mcp', initializePayload());
    expect(res.statusCode).toBe(200);
    const sid = res.headers['mcp-session-id'];
    expect(typeof sid).toBe('string');
    expect(sid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});

function initializePayload(): string {
  return JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '0' } },
  });
}

function postJson(port: number, path: string, body: string, extraHeaders: Record<string, string> = {}): Promise<{ statusCode: number; headers: Record<string, string>; body: string }> {
  return new Promise((resolve, reject) => {
    const req = httpRequest({
      hostname: '127.0.0.1', port, path, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Content-Length': Buffer.byteLength(body),
        ...extraHeaders,
      },
    }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({
        statusCode: res.statusCode ?? 0,
        headers: Object.fromEntries(Object.entries(res.headers).map(([k, v]) => [k.toLowerCase(), Array.isArray(v) ? v.join(',') : (v ?? '')])),
        body: Buffer.concat(chunks).toString('utf8'),
      }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}
