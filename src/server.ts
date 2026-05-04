import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { searchEntities, searchEntitiesInputSchema } from "./tools/search-entities.js";
import { getEntity, getEntityInputSchema } from "./tools/get-entity.js";
import { checkCompatibility, checkCompatibilityInputSchema } from "./tools/check-compatibility.js";
import { getObligations, getObligationsInputSchema } from "./tools/get-obligations.js";
import { searchVendorTemplates, searchVendorTemplatesInputSchema } from "./tools/search-vendor-templates.js";
import { startHttpServer } from "./http-server.js";
import { TOOLS } from "./tool-definitions.js";

const server = new Server(
  { name: "data-use-license-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  switch (name) {
    case "search_entities":
      return { content: [{ type: "text", text: JSON.stringify(await searchEntities(searchEntitiesInputSchema.parse(args))) }] };
    case "get_entity":
      return { content: [{ type: "text", text: JSON.stringify(await getEntity(getEntityInputSchema.parse(args))) }] };
    case "check_compatibility":
      return { content: [{ type: "text", text: JSON.stringify(await checkCompatibility(checkCompatibilityInputSchema.parse(args))) }] };
    case "get_obligations":
      return { content: [{ type: "text", text: JSON.stringify(await getObligations(getObligationsInputSchema.parse(args))) }] };
    case "search_vendor_templates":
      return { content: [{ type: "text", text: JSON.stringify(await searchVendorTemplates(searchVendorTemplatesInputSchema.parse(args))) }] };
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  startHttpServer(Number(process.env.PORT ?? 3000));
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("data-use-license-mcp running on stdio");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
