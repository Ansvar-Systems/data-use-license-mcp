import { z } from "zod";
import { getDbMetadata } from "../db.js";

export const listSourcesInputSchema = z.object({}).passthrough();

export type ListSourcesInput = z.infer<typeof listSourcesInputSchema>;

export interface ListSource {
  name: string;
  authority: string;
  url: string | null;
  license: string;
  refresh_cadence: string;
  last_refreshed: string;
}

export interface ListSourcesOutput {
  sources: ListSource[];
  notes: string;
  _meta: {
    disclaimer: string;
    data_age: string;
    source_url: null;
    jurisdiction: string;
  };
}

const NOTES =
  "data-use-license is an expert-curated catalog. Each entry has its own " +
  "official_text_url (returned per-entity by get_entity / search_entities). " +
  "There is no single upstream feed; sources is empty by design.";

const DISCLAIMER =
  "License metadata is informational, not legal advice. Verify against canonical text before acting.";

export async function listSources(_input: ListSourcesInput = {}): Promise<ListSourcesOutput> {
  const meta = getDbMetadata();
  return {
    sources: [],
    notes: NOTES,
    _meta: {
      disclaimer: DISCLAIMER,
      data_age: meta.built_at,
      source_url: null,
      jurisdiction: "INTERNATIONAL",
    },
  };
}
