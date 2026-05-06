import { z } from "zod";
import { getDbMetadata, getEntityCountByType } from "../db.js";

export const aboutInputSchema = z.object({}).passthrough();

export type AboutInput = z.infer<typeof aboutInputSchema>;

export interface AboutOutput {
  name: string;
  version: string;
  category: string;
  description: string;
  stats: {
    total_items: number;
    by_type: Record<string, number>;
    schema_version: string;
  };
  freshness: {
    database_built: string;
  };
  disclaimer: string;
  network: {
    name: string;
    directory: string;
  };
}

const DESCRIPTION =
  "Authoritative metadata on data-use licenses, government open-data terms, " +
  "legal regimes, and vendor TOS templates. Pairwise compatibility checks, " +
  "obligation lookups, and citation-ready responses for downstream agents.";

const DISCLAIMER =
  "License metadata is informational, not legal advice. Verify against canonical text before acting.";

export async function about(_input: AboutInput = {}): Promise<AboutOutput> {
  const meta = getDbMetadata();
  const byType = getEntityCountByType();
  return {
    name: meta.mcp_name,
    version: meta.mcp_version,
    category: "compliance",
    description: DESCRIPTION,
    stats: {
      total_items: meta.entity_count,
      by_type: byType,
      schema_version: meta.schema_version,
    },
    freshness: {
      database_built: meta.built_at,
    },
    disclaimer: DISCLAIMER,
    network: {
      name: "Ansvar MCP Network",
      directory: "https://ansvar.ai/mcp",
    },
  };
}
