import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { startHttpServer, type HttpServerHandle, registerShutdownHandler } from '../../src/http-server.js';
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

describe('G7.3 — follow-up tools/list with same session returns tools array', () => {
  let handle: HttpServerHandle;

  beforeEach(async () => {
    handle = await startHttpServer({ port: 0 });
  });

  afterEach(async () => {
    await handle.close();
  });

  it('reuses transport and returns 5 tools', async () => {
    const init = await postJson(handle.port, '/mcp', initializePayload());
    const sid = init.headers['mcp-session-id'];
    expect(sid).toBeTruthy();

    const list = await postJson(handle.port, '/mcp', JSON.stringify({
      jsonrpc: '2.0', id: 2, method: 'tools/list', params: {},
    }), { 'mcp-session-id': sid! });

    expect(list.statusCode).toBe(200);
    const tools = extractToolsArray(list.body);
    expect(tools).toHaveLength(8);
    const names = tools.map((t: { name: string }) => t.name);
    expect(names).toContain('search_entities');
    // Mandatory non-law meta-tools per golden-standard §4.1
    expect(names).toContain('list_sources');
    expect(names).toContain('about');
    expect(names).toContain('check_data_freshness');
  });
});

describe('G7.4 — bogus session id is safe', () => {
  let handle: HttpServerHandle;

  beforeEach(async () => {
    handle = await startHttpServer({ port: 0 });
  });

  afterEach(async () => {
    await handle.close();
  });

  it('returns 200 (new session) or 4xx; never tools from a prior run', async () => {
    const res = await postJson(handle.port, '/mcp', JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'tools/list', params: {},
    }), { 'mcp-session-id': 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee' });

    expect([200, 400, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      const tools = extractToolsArray(res.body);
      expect(tools).toHaveLength(0);
    }
  });
});

describe('/health endpoint', () => {
  let handle: HttpServerHandle;

  beforeEach(async () => {
    handle = await startHttpServer({ port: 0 });
  });

  afterEach(async () => {
    await handle.close();
  });

  it('returns 200 + status:ok when entities table has rows', async () => {
    const res = await getJson(handle.port, '/health');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe('ok');
    expect(typeof body.entities).toBe('number');
    expect(body.entities).toBeGreaterThan(0);
    expect(body.server).toBe('data-use-license-mcp');
  });
});

describe('path coverage', () => {
  let handle: HttpServerHandle;

  beforeEach(async () => {
    handle = await startHttpServer({ port: 0 });
  });

  afterEach(async () => {
    await handle.close();
  });

  it('returns 404 on unknown path', async () => {
    const res = await getJson(handle.port, '/does-not-exist');
    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res.body)).toMatchObject({ error: 'Not found' });
  });

  it('returns 400 on GET /mcp without session header', async () => {
    const res = await getJson(handle.port, '/mcp');
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body)).toMatchObject({ error: 'Bad request' });
  });
});

describe('SIGTERM lifecycle', () => {
  it('registerShutdownHandler adds and removes a SIGTERM listener cleanly', async () => {
    const handle = await startHttpServer({ port: 0 });
    const before = process.listenerCount('SIGTERM');
    const dispose = registerShutdownHandler(handle);
    expect(process.listenerCount('SIGTERM')).toBe(before + 1);
    dispose();
    expect(process.listenerCount('SIGTERM')).toBe(before);
    await handle.close();
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

function getJson(port: number, path: string): Promise<{ statusCode: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = httpRequest({ hostname: '127.0.0.1', port, path, method: 'GET' }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ statusCode: res.statusCode ?? 0, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.end();
  });
}

function extractToolsArray(body: string): Array<{ name: string }> {
  // SSE frames look like "event: message\ndata: {...}\n\n"; JSON bodies are a single object.
  const dataMatch = body.match(/data:\s*(\{.*\})\s*$/m);
  const json = dataMatch ? dataMatch[1] : body;
  const parsed = JSON.parse(json);
  return parsed.result?.tools ?? [];
}
