# Disclaimer

This MCP server provides metadata about data-use licenses, government open-data terms, legal regimes, and commercial vendor TOS templates. The information is informational, not legal advice.

## Reliance and limitations

- **Not legal advice.** Catalog entries summarise license obligations and authority for retrieval and citation purposes. They do not replace counsel review of the canonical text for any specific use.
- **Compatibility verdicts.** `check_compatibility` reports a verdict only when an explicit edge has been recorded between two entities. Absence of an edge is reported as `unknown`, not as evidence of compatibility. The catalog deliberately under-asserts edges; high-stakes decisions require a counsel review of both texts.
- **Vendor templates.** Vendor TOS entries (Westlaw, LexisNexis, Bloomberg, Wolters Kluwer, HeinOnline, vLex, Practical Law, Justia) are reference rows derived from publicly observable commercial terms. Actual customer contracts vary; rely on the executed agreement, not these entries.
- **Jurisdictional regimes.** Statutory frameworks (Crown Copyright, EU Database Directive, French CPI L122-5, etc.) are catalogued at article granularity. They do not capture jurisdiction-specific case law, regulatory guidance, or treaty interactions.
- **Freshness.** Per-entity timestamps reflect the last seed-script run, not the last upstream change at the canonical authority. Use `check_data_freshness` to read the database build age and `_meta.corpus_freshness` per response.

## Authority hierarchy

When acting on data from this MCP:

1. The canonical authority text (license URL in `_citation.source_url`) is authoritative.
2. The catalog summary in this MCP is a structured retrieval aid, not authority.
3. For production licensing decisions, follow the citation back to the canonical text and have counsel review.

## Liability

The Data Use License MCP is provided under Apache-2.0 with no warranty. See [LICENSE](./LICENSE) for the full warranty disclaimer.
