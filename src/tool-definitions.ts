export const TOOLS = [
  {
    name: "search_entities",
    description: "Search across license / terms / legal_regime / vendor_template entries. Accepts human-readable values.",
    inputSchema: { type: "object", properties: { query: { type: "string" }, entity_type: { type: "string" }, jurisdiction: { type: "string" }, limit: { type: "number" } }, required: ["query"] },
  },
  {
    name: "get_entity",
    description: "Retrieve a single entity by id (accepts human-readable aliases).",
    inputSchema: { type: "object", properties: { entity_id: { type: "string" } }, required: ["entity_id"] },
  },
  {
    name: "check_compatibility",
    description: "Pairwise compatibility check between two licenses or entities.",
    inputSchema: { type: "object", properties: { left_id: { type: "string" }, right_id: { type: "string" } }, required: ["left_id", "right_id"] },
  },
  {
    name: "get_obligations",
    description: "[team tier] Full obligations array with conditional triggers.",
    inputSchema: { type: "object", properties: { entity_id: { type: "string" } }, required: ["entity_id"] },
  },
  {
    name: "search_vendor_templates",
    description: "[team tier] Search vendor TOS templates (Westlaw, LexisNexis, Bloomberg, etc.).",
    inputSchema: { type: "object", properties: { query: { type: "string" }, limit: { type: "number" } }, required: ["query"] },
  },
  {
    name: "list_sources",
    description: "List upstream data sources for this MCP. data-use-license is expert-curated and has no single upstream feed; this tool returns an empty source list with explanatory notes.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "about",
    description: "Server metadata: name, version, category, item counts by entity_type, schema version, database build time.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "check_data_freshness",
    description: "Report DB build age and refresh status (current / due / overdue). data-use-license has no upstream feed; freshness is the time since the catalog mirror was last rebuilt.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
] as const;
