// src/resolvers/citation-builder.ts
import type { Entity, Citation } from "../types.js";

// Map from authority-text host → canonical publisher display name. Used only
// for the `publisher` and `display_text` fields. The catalog itself is
// Apache-2.0 — every citation's `license` is the catalog license, not the
// upstream authority's license. The `source_url` field is a verification
// pointer back to the canonical authority text, not a re-licensing claim.
const PUBLISHER_BY_DOMAIN: Record<string, string> = {
  "opensource.org": "opensource.org",
  "spdx.org": "spdx.org",
  "creativecommons.org": "creativecommons.org",
  "opendatacommons.org": "opendatacommons.org",
  "nationalarchives.gov.uk": "nationalarchives.gov.uk",
  "data.norge.no": "data.norge.no",
  "etalab.gouv.fr": "etalab.gouv.fr",
  "govdata.de": "govdata.de",
  "dati.gov.it": "dati.gov.it",
  "joinup.ec.europa.eu": "joinup.ec.europa.eu",
  "fsf.org": "fsf.org",
};

const CATALOG_LICENSE = "Apache-2.0";
const VENDOR_TEMPLATE_LICENSE = "Custom-Vendor";

function publisherFromUrl(url: string | null): string {
  if (!url) return "Ansvar";
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return PUBLISHER_BY_DOMAIN[host] ?? host;
  } catch {
    return "Ansvar";
  }
}

function citationLicenseFor(entity: Entity): string {
  // Vendor templates are reference rows describing commercial vendor TOS.
  // They carry the Custom-Vendor sentinel to signal that bilateral contractual
  // terms apply downstream of this catalog row.
  if (entity.entity_type === "vendor_template") return VENDOR_TEMPLATE_LICENSE;
  return CATALOG_LICENSE;
}

export function buildCitation(entity: Entity): Citation {
  const publisher = publisherFromUrl(entity.official_text_url);
  const license = citationLicenseFor(entity);
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
      ? `Catalog row reproduced under ${license}; verify against ${publisher}.`
      : null,
  };
}
