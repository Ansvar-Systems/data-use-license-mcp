import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "./mcp-server.js";
import { startHttpServer } from "./http-server.js";

async function main() {
  startHttpServer({ port: Number(process.env.PORT ?? 3000) }).catch((e) => { console.error(e); process.exit(1); });
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("data-use-license-mcp running on stdio");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
