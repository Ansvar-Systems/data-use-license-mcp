// src/resolvers/citation-builder.ts
import type { Entity, Citation } from "../types.js";

const PUBLISHER_BY_DOMAIN: Record<string, { publisher: string; license: string }> = {
  "opensource.org": { publisher: "opensource.org", license: "CC0-1.0" },
  "spdx.org": { publisher: "spdx.org", license: "CC0-1.0" },
  "creativecommons.org": { publisher: "creativecommons.org", license: "CC0-1.0" },
  "opendatacommons.org": { publisher: "opendatacommons.org", license: "CC-BY-SA-4.0" },
  "nationalarchives.gov.uk": { publisher: "nationalarchives.gov.uk", license: "OGL-3.0" },
  "data.norge.no": { publisher: "data.norge.no", license: "CC-BY-4.0" },
  "etalab.gouv.fr": { publisher: "etalab.gouv.fr", license: "CC-BY-4.0" },
  "govdata.de": { publisher: "govdata.de", license: "CC-BY-4.0" },
  "dati.gov.it": { publisher: "dati.gov.it", license: "CC-BY-4.0" },
  "joinup.ec.europa.eu": { publisher: "joinup.ec.europa.eu", license: "EU-Decision-2011-833" },
  "fsf.org": { publisher: "fsf.org", license: "CC-BY-ND-4.0" },
};

function publisherFromUrl(url: string | null): { publisher: string; license: string } {
  if (!url) return { publisher: "Ansvar", license: "Apache-2.0" };
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return PUBLISHER_BY_DOMAIN[host] ?? { publisher: host, license: "License-Unverified" };
  } catch {
    return { publisher: "Ansvar", license: "Apache-2.0" };
  }
}

export function buildCitation(entity: Entity): Citation {
  const { publisher, license } = publisherFromUrl(entity.official_text_url);
  return {
    source_url: entity.official_text_url,
    publisher,
    license,
    canonical_ref: entity.id,
    display_text: entity.short_name
      ? `${entity.short_name} (${publisher})`
      : `${entity.name} (${publisher})`,
    lookup: { tool: "get_entity", args: { entity_id: entity.id } },
    attribution_text: entity.official_text_url
      ? `Reproduced from ${publisher} under ${license}.`
      : null,
  };
}
