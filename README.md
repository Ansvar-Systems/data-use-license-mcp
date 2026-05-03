# Data Use License MCP

[![npm](https://img.shields.io/npm/v/@ansvar/data-use-license-mcp.svg)](https://www.npmjs.com/package/@ansvar/data-use-license-mcp)
[![CI](https://github.com/Ansvar-Systems/data-use-license-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/Ansvar-Systems/data-use-license-mcp/actions/workflows/ci.yml)

MCP server providing authoritative metadata on data-use licenses, government open-data terms, legal regimes (sui generis database rights, Crown Copyright, court-decision public-domain doctrines), and vendor TOS templates. Sibling to `@ansvar/open-source-license-mcp` (which covers software/code licenses).

## Overview

Coverage is structured around four entity types:

- `license` — public licenses (CC family, EUPL, ODbL, etc.)
- `terms` — government open-data portal terms (NLOD, Etalab, IODL, OGL UK, DL-DE, etc.)
- `legal_regime` — sui generis database rights (EU 96/9/EC), Crown Copyright family, court-decision public-domain doctrines
- `vendor_template` — Westlaw / LexisNexis / Bloomberg / Wolters Kluwer / HeinOnline TOS templates

## Installation

### Via npm (stdio)

```bash
npm install -g @ansvar/data-use-license-mcp
```

Then add to your MCP client config:

```json
{
  "mcpServers": {
    "data-use-license": {
      "command": "data-use-license-mcp"
    }
  }
}
```

### Via Ansvar Gateway (recommended for B2B)

Use `https://gateway.ansvar.eu` with OAuth — see [gateway-deployment.md](https://github.com/Ansvar-Systems/Ansvar-Architecture-Documentation/blob/main/docs/runbooks/mcp-gateway-deployment.md).

## Tools

### `search_entities` (premium)

Search across all entity types. Accepts human-readable values (`"MIT"`, `"Norwegian open data"`, `"Westlaw"`).

**Input:** `{ query: string, entity_type?: "license" | "terms" | "legal_regime" | "vendor_template", jurisdiction?: string, limit?: number }`

**Output:** `{ results: Array<{ id, entity_type, name, short_name, jurisdiction, summary, _citation }>, _meta }`

### `get_entity` (premium)

Retrieve full record by id (also accepts human-readable input).

**Input:** `{ entity_id: string }`

**Output:** `{ entity: Entity | null, _citation: Citation | null, _meta }`

### `check_compatibility` (premium)

Pairwise compatibility verdict between two entities.

**Input:** `{ left_id: string, right_id: string }`

**Output:** `{ verdict: "compatible" | "incompatible" | "conditionally_compatible" | "unknown", obligations_triggered, edge_metadata, _citation_left, _citation_right, _meta }`

### `get_obligations` (team)

Full obligations array with conditional triggers.

**Input:** `{ entity_id: string }`

**Output:** `{ obligations: Array<{ id, title, text, mandatory, conditional_on }>, _citation, _meta }`

### `search_vendor_templates` (team)

Vendor TOS template lookup. Results carry `quality_tier: amber` baseline.

**Input:** `{ query: string, limit?: number }`

**Output:** `{ results: Array<VendorResult>, _meta }`

## Source Attribution

Per-item `_citation` includes:
- `source_url` — canonical authority URL
- `publisher` — bare hostname or canonical name
- `license` — SPDX-style code (registered in `infrastructure/attribution-licenses.json` in the Ansvar architecture-docs repo)
- `canonical_ref`, `display_text`, `lookup`, `attribution_text`

Per-response `_meta` includes:
- `disclaimer`, `data_age` (ISO-8601), `source_url`, `jurisdiction`, `corpus_freshness`

## Development

```bash
npm install
export ATTRIBUTION_LICENSES_PATH=/path/to/Ansvar-Architecture-Documentation/infrastructure/attribution-licenses.json
npm run build:db
npm run build
npm test
```

Run locally:
```bash
node dist/server.js
```

## License

Apache-2.0
