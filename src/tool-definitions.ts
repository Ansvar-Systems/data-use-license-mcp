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
] as const;
