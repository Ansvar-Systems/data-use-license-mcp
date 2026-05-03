# Data Use License MCP

MCP server providing authoritative metadata on data-use licenses, government open-data terms, legal regimes, and vendor TOS templates. Sibling to `@ansvar/open-source-license-mcp`.

**Status:** Phase 1A bootstrap (in development).

## Tools

- `search_entities` — search records (premium)
- `get_entity` — full record (premium)
- `check_compatibility` — pairwise (premium)
- `get_obligations` — obligations array (team)
- `search_vendor_templates` — vendor TOS (team)

## Development

```bash
npm install
export ATTRIBUTION_LICENSES_PATH=$HOME/Projects/Ansvar-Architecture-Documentation/infrastructure/attribution-licenses.json
npm run build:db
npm run build
npm test
```

## License

Apache-2.0
