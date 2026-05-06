import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { searchEntities, searchEntitiesInputSchema } from "./tools/search-entities.js";
import { getEntity, getEntityInputSchema } from "./tools/get-entity.js";
import { checkCompatibility, checkCompatibilityInputSchema } from "./tools/check-compatibility.js";
import { getObligations, getObligationsInputSchema } from "./tools/get-obligations.js";
import { searchVendorTemplates, searchVendorTemplatesInputSchema } from "./tools/search-vendor-templates.js";
import { listSources, listSourcesInputSchema } from "./tools/list-sources.js";
import { about, aboutInputSchema } from "./tools/about.js";
import { checkDataFreshness, checkDataFreshnessInputSchema } from "./tools/check-data-freshness.js";
import { TOOLS } from "./tool-definitions.js";

export const SERVER_NAME = "data-use-license-mcp";
export const SERVER_VERSION = "0.2.0";

export function createMcpServer(): Server {
  const server = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
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
      case "list_sources":
        return { content: [{ type: "text", text: JSON.stringify(await listSources(listSourcesInputSchema.parse(args ?? {}))) }] };
      case "about":
        return { content: [{ type: "text", text: JSON.stringify(await about(aboutInputSchema.parse(args ?? {}))) }] };
      case "check_data_freshness":
        return { content: [{ type: "text", text: JSON.stringify(await checkDataFreshness(checkDataFreshnessInputSchema.parse(args ?? {}))) }] };
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });

  return server;
}
