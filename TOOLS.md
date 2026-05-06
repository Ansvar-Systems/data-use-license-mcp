# Tools — Data Use License MCP

> 8 tools across 2 categories: 5 domain tools + 3 mandatory non-law meta-tools.

## Domain tools

### `search_entities`

Search across all entity types. Accepts human-readable input (`"MIT"`, `"Norwegian open data"`, `"Westlaw"`); the alias resolver normalises display names and SPDX identifiers to canonical IDs.

**Tier:** premium

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | yes | Free-text query against name, short_name, aliases, description |
| `entity_type` | enum | no | `license` \| `terms` \| `legal_regime` \| `vendor_template` |
| `jurisdiction` | string | no | ISO country code or `EU` / `INTERNATIONAL` |
| `limit` | number | no | Default 20, max 100 |

**Returns:**

```json
{
  "results": [
    {
      "id": "mit",
      "entity_type": "license",
      "name": "MIT License",
      "short_name": "MIT",
      "jurisdiction": "INTERNATIONAL",
      "summary": "...",
      "_citation": { "source_url": "...", "publisher": "...", "license": "...", "canonical_ref": "...", "display_text": "..." }
    }
  ],
  "_meta": { "disclaimer": "...", "data_age": "2026-05-06T...", "source_url": null, "jurisdiction": "INTERNATIONAL", "corpus_freshness": "fresh" }
}
```

**Limitations:** FTS5 tokeniser is `unicode61 remove_diacritics`; queries shorter than 3 chars may return many candidates.

---

### `get_entity`

Retrieve a single record by ID (canonical or human-readable).

**Tier:** premium

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `entity_id` | string | yes | Canonical ID (`mit`, `apache-2.0`) or display alias (`"Apache 2.0"`, `"MIT License"`) |

**Returns:** `{ entity: Entity | null, _citation: Citation | null, _meta }` — `entity` is `null` for unknown IDs; `_meta` is still populated with the disclaimer.

---

### `check_compatibility`

Pairwise compatibility verdict between two entities. Reads the `edges` table for `compatible_with` / `incompatible_with` relationships.

**Tier:** premium

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `left_id` | string | yes | First entity (canonical or alias) |
| `right_id` | string | yes | Second entity (canonical or alias) |

**Returns:**

```json
{
  "verdict": "compatible" | "incompatible" | "conditionally_compatible" | "unknown",
  "obligations_triggered": [],
  "edge_metadata": { ... } | null,
  "_citation_left": Citation | null,
  "_citation_right": Citation | null,
  "_meta": { ... }
}
```

**Limitations:** `unknown` is returned when no edge is recorded — absence of evidence, not evidence of compatibility. The catalog deliberately under-reports edges to avoid asserting unverified verdicts; consult counsel for production decisions.

---

### `get_obligations`

Full obligations array with conditional triggers.

**Tier:** team

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `entity_id` | string | yes | Canonical ID or alias |

**Returns:** `{ obligations: Array<{ id, title, text, mandatory, conditional_on }>, _citation, _meta }`

---

### `search_vendor_templates`

Vendor Terms-of-Service template lookup (Westlaw, LexisNexis, Bloomberg, Wolters Kluwer, HeinOnline, vLex, Practical Law, Justia). Results carry `quality_tier: amber` since vendor TOS are reference-only — actual customer terms vary by contract.

**Tier:** team

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | yes | Vendor name or contractual concept |
| `limit` | number | no | Default 10 |

**Returns:** `{ results: Array<VendorResult>, _meta }`

## Meta-tools (mandatory)

### `list_sources`

Source provenance for the catalog. Because data-use-license is expert-curated and has no single upstream feed, `sources` is empty by design; per-entity provenance lives in each entity's `_citation.source_url`.

**Parameters:** none.

**Returns:**

```json
{
  "sources": [],
  "notes": "data-use-license is an expert-curated catalog. Each entry has its own official_text_url ...",
  "_meta": { "disclaimer": "...", "data_age": "2026-05-06T...", "source_url": null, "jurisdiction": "INTERNATIONAL" }
}
```

### `about`

Server identity, item counts, freshness, and network directory link.

**Parameters:** none.

**Returns:**

```json
{
  "name": "data-use-license",
  "version": "0.2.0",
  "category": "compliance",
  "description": "...",
  "stats": {
    "total_items": 61,
    "by_type": { "license": 25, "terms": 17, "legal_regime": 10, "vendor_template": 9 },
    "schema_version": "1.0"
  },
  "freshness": { "database_built": "2026-05-06T..." },
  "disclaimer": "...",
  "network": { "name": "Ansvar MCP Network", "directory": "https://ansvar.ai/mcp" }
}
```

### `check_data_freshness`

Build-time age and refresh status. Default cadence is 90 days from the last `npm run build:db` run (which seeds the catalog from upstream).

**Parameters:** none.

**Returns:**

```json
{
  "status": "current" | "due" | "overdue",
  "database_built": "2026-05-06T...",
  "age_days": 0,
  "refresh_cadence_days": 90,
  "schema_version": "1.0",
  "entity_count": 61,
  "update_command": "Mirror upstream catalog: open a PR ...",
  "notes": "..."
}
```

Status logic:
- `current` — younger than 80% of cadence (≤ 72 days)
- `due` — between 80% and 100% of cadence
- `overdue` — older than the cadence
