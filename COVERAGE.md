# Coverage — Data Use License MCP

> Catalog status as of 2026-05-06. Counts are read directly from the seeded SQLite database; this document is regenerated on each Phase 1B-2 catalog mirror.

## What's in scope

**Public licenses** (the things upstream code or data ships *under*):

| Family | Count | Examples |
|--------|-------|----------|
| Creative Commons | 7 | CC0-1.0, CC-BY-4.0, CC-BY-SA-4.0, CC-BY-NC-4.0, CC-BY-ND-4.0, CC-BY-NC-SA-4.0, CC-BY-NC-ND-4.0 |
| Open Source (SPDX) | 13 | MIT, Apache-2.0, BSD-2/3-Clause, MPL-2.0, GPL-2.0/3.0, LGPL-2.1/3.0, AGPL-3.0, ISC, Unlicense, EUPL-1.2 |
| Open Data (ODC) | 3 | ODbL-1.0, ODC-By-1.0, PDDL-1.0 |
| Other | 2 | License-Unverified (sentinel), Custom-Vendor (sentinel) |

**Government open-data terms** (the things upstream public-sector data ships *under*):

| Region | Count | Examples |
|--------|-------|----------|
| EU member states | 11 | DL-DE-BY-2.0 / DL-DE-Zero-2.0 (DE), Etalab-2.0 (FR), IODL-2.0 (IT), NLOD-2.0 (NO), Cyprus-PSI (CY), LO-OL-Luxembourg (LU), Flanders-MGH-1.0 (BE), OGL-ROU-1.0 (RO) |
| UK / British Isles | 2 | OGL-3.0, OGL-UK-2.0 |
| Non-EU OECD | 4 | OGL-Canada-2.0, HK-DataGov-TOS, KOGL-Type-1 (KR), Singapore-OGL-1.0 |
| EU institutions | 2 | EU-Decision-2011-833, EU-Decision-2011-833-Commission-Only |

**Legal regimes** (sui generis rights, public-domain doctrines, statutory frameworks):

| Regime | Jurisdiction |
|--------|--------------|
| EU Database Directive (96/9/EC) | EU |
| Crown Copyright | GB |
| US-Federal-PD (17 USC 105) | US |
| French CPI L122-5 | FR |
| German UrhG §5 | DE |
| Italian LDA Article 5 | IT |
| Spanish LPI Article 13 | ES |
| Czech Statutory PD | CZ |
| Norwegian Court Publication | NO |
| Public-Domain (generic) | INTERNATIONAL |

**Vendor TOS templates** (reference rows for negative-matching against canonical commercial-vendor terms):

Bloomberg Law, HeinOnline, Justia, LexisNexis, Practical Law, Westlaw, Wolters Kluwer, vLex.

## What's out of scope

- **Bilateral contracts** — actual customer agreements with vendors. The vendor_template entries are reference-only baselines.
- **Per-jurisdiction case law on license enforceability** — see the law MCP fleet.
- **Per-licence interpretation guidance** — covered in workflow MCPs (tender-review, dpia, etc.) via citation enrichment, not here.
- **License compatibility verdicts beyond what is recorded in `edges`** — `check_compatibility` returns `unknown` when no edge is asserted. The catalog deliberately under-asserts; consult counsel for production decisions.

## Known gaps

| Gap | Status | Reference |
|-----|--------|-----------|
| Greek open-data portal terms | Deferred | Active portal redesign as of 2026-05 |
| Icelandic open-data portal terms | Deferred | Active portal redesign as of 2026-05 |
| CC-PDM-1.0 entry_kind decision | Open | Per Phase 1B-2 handover (2026-05-06) |
| Norwegian-AVL-Section-9 | Conditional | Ship if an operational gap surfaces |

## Refresh model

- **Cadence:** 90 days. Reported by `check_data_freshness` against the `db_metadata.built_at` timestamp.
- **Trigger:** Catalog edits land first in `Ansvar-Architecture-Documentation` (`infrastructure/attribution-licenses.json`); a mirror PR rebuilds this MCP's seed file under `data/seed/attribution-licenses.json`.
- **Source of truth:** The arch-docs license catalog. This MCP is a read-only mirror; edits made directly here are reverted on next mirror.

## Counts

Run `about` against a live instance for current totals. As of 2026-05-06, the seeded catalog contains 61 entries across 4 entity types: 25 licenses, 17 terms, 10 legal regimes, 9 vendor templates.
