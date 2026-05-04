import { createServer, type Server as HttpServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer, SERVER_NAME, SERVER_VERSION } from './mcp-server.js';
import { getDb } from './db.js';

export interface HttpServerHandle {
  port: number;
  close(): Promise<void>;
}

export async function startHttpServer(opts: { port: number }): Promise<HttpServerHandle> {
  const transports = new Map<string, StreamableHTTPServerTransport>();

  const httpServer: HttpServer = createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

      if (url.pathname === '/health') {
        return handleHealth(res);
      }

      if (url.pathname === '/mcp' || url.pathname === '/') {
        return handleMcp(req, res, transports);
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    } catch (err) {
      console.error('Request handler error:', err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
      }
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  });

  await new Promise<void>((resolve) => httpServer.listen(opts.port, resolve));
  const address = httpServer.address();
  if (address === null || typeof address === 'string') {
    throw new Error(`Unexpected server address: ${address}`);
  }
  const actualPort = address.port;

  console.error(`${SERVER_NAME} v${SERVER_VERSION} (HTTP) listening on port ${actualPort}`);
  console.error(`MCP endpoint:  http://localhost:${actualPort}/mcp`);
  console.error(`Health check:  http://localhost:${actualPort}/health`);

  const close = async (): Promise<void> => {
    await new Promise<void>((resolve, reject) => {
      httpServer.close((err) => err ? reject(err) : resolve());
    });
  };

  return { port: actualPort, close };
}

export function registerShutdownHandler(handle: HttpServerHandle): () => void {
  const onSigterm = (): void => {
    console.error('SIGTERM received, shutting down...');
    handle.close().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
  };
  process.on('SIGTERM', onSigterm);
  return () => { process.off('SIGTERM', onSigterm); };
}

async function handleMcp(req: import('http').IncomingMessage, res: import('http').ServerResponse, transports: Map<string, StreamableHTTPServerTransport>): Promise<void> {
  const sessionHeader = req.headers['mcp-session-id'];
  const sessionId = Array.isArray(sessionHeader) ? sessionHeader[0] : sessionHeader;

  if (sessionId && transports.has(sessionId)) {
    await transports.get(sessionId)!.handleRequest(req, res);
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Bad request' }));
    return;
  }

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });
  const server = createMcpServer();
  await server.connect(transport);
  transport.onclose = () => {
    if (transport.sessionId) transports.delete(transport.sessionId);
  };
  await transport.handleRequest(req, res);
  if (transport.sessionId) transports.set(transport.sessionId, transport);
}

function handleHealth(res: import('http').ServerResponse): void {
  try {
    const db = getDb();
    const row = db.prepare('SELECT COUNT(*) as count FROM entities').get() as { count: number };
    const status = row.count > 0 ? 'ok' : 'degraded';
    const statusCode = row.count > 0 ? 200 : 503;
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status,
      server: SERVER_NAME,
      version: SERVER_VERSION,
      entities: Number(row.count),
      timestamp: new Date().toISOString(),
    }));
  } catch {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'degraded',
      server: SERVER_NAME,
      version: SERVER_VERSION,
      entities: 0,
      timestamp: new Date().toISOString(),
    }));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 3000);
  startHttpServer({ port }).then((handle) => {
    registerShutdownHandler(handle);
  }).catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
