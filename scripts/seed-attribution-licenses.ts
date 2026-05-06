// scripts/seed-attribution-licenses.ts
import Database from "better-sqlite3";
import { readFileSync } from "node:fs";

const DB_PATH = "./data/database.db";
// Default: in-repo seed file (used in Docker build + CI). Override with
// ATTRIBUTION_LICENSES_PATH for local dev against a sibling arch-docs checkout.
const SOURCE_PATH =
  process.env.ATTRIBUTION_LICENSES_PATH
  ?? "./data/seed/attribution-licenses.json";

interface UpstreamEntry {
  name: string;
  url: string | null;
  spdx: string | null;
  commercial_allowed: boolean;
  attribution_required: boolean;
  derivatives_allowed: boolean;
  share_alike: boolean;
  non_commercial: boolean;
  safe_for_public_ghcr: boolean;
  default_allowed_for_commercial_serving: boolean;
  database_rights_evidence_required: boolean;
  geographic_restrictions?: string[];
  requires_vendor_terms_url?: boolean;
  audit_status?: string;
  notes?: string;
}

interface UpstreamCatalog {
  [code: string]: UpstreamEntry;
}

function codeToId(code: string): string {
  return code.toLowerCase();
}

const ENTITY_TYPE_OVERRIDES: Record<string, "license" | "terms" | "legal_regime" | "vendor_template"> = {
  "Custom-Vendor": "vendor_template",
  "Crown-Copyright": "legal_regime",
  "Norwegian-Court-Publication": "legal_regime",
  "Public-Domain": "legal_regime",
  "US-Federal-PD": "legal_regime",
  "EU-Decision-2011-833": "terms",
  "EU-Decision-2011-833-Commission-Only": "terms",
  "Cyprus-PSI": "terms",
  "Etalab-2.0": "terms",
  "NLOD-2.0": "terms",
  "OGL-3.0": "terms",
  "OGL-UK-2.0": "terms",
  "DL-DE-BY-2.0": "terms",
  "DL-DE-Zero-2.0": "terms",
  "IODL-2.0": "terms",
  "LO-OL-Luxembourg": "terms",
  "OGL-Canada-2.0": "terms",
  "Bloomberg-Law-TOS": "vendor_template",
  "HeinOnline-TOS": "vendor_template",
  "Justia-TOS": "vendor_template",
  "LexisNexis-TOS": "vendor_template",
  "Practical-Law-TOS": "vendor_template",
  "Westlaw-TOS": "vendor_template",
  "WoltersKluwer-TOS": "vendor_template",
  "vLex-TOS": "vendor_template",
  // Phase 1B-2 Group 5 regimes (PR-F arch-docs #384). Catalog uses
  // entry_kind=regime; MCP entity_type uses legal_regime — mapped here
  // until Phase 3 of ADR-031 reads entry_kind directly from catalog.
  "EU-Database-Directive": "legal_regime",
  "French-CPI-L122-5": "legal_regime",
  "German-UrhG-Section-5": "legal_regime",
  "Italian-LDA-Article-5": "legal_regime",
  "Spanish-LPI-Article-13": "legal_regime",
  // Czech statutory PD regime (arch-docs PR #390 czech-law fork-A)
  "Czech-Statutory-PD": "legal_regime",
  // Phase 1B-2 Group 4 AMBER (PR-E2 arch-docs #388) — bespoke gov terms
  "Flanders-MGH-1.0": "terms",
  "HK-DataGov-TOS": "terms",
  "KOGL-Type-1": "terms",
  "Singapore-OGL-1.0": "terms",
  // Phase 1B-2 Group 4 UNCLEAR triage (PR-K arch-docs #389) — Romanian bespoke
  "OGL-ROU-1.0": "terms",
};

const JURISDICTION_OVERRIDES: Record<string, string> = {
  "Crown-Copyright": "GB",
  "OGL-3.0": "GB",
  "OGL-UK-2.0": "GB",
  "EU-Decision-2011-833": "EU",
  "EU-Decision-2011-833-Commission-Only": "EU",
  "Cyprus-PSI": "CY",
  "Etalab-2.0": "FR",
  "NLOD-2.0": "NO",
  "Norwegian-Court-Publication": "NO",
  "US-Federal-PD": "US",
  "DL-DE-BY-2.0": "DE",
  "DL-DE-Zero-2.0": "DE",
  "IODL-2.0": "IT",
  "LO-OL-Luxembourg": "LU",
  "OGL-Canada-2.0": "CA",
  // Phase 1B-2 Group 5 regime jurisdictions
  "EU-Database-Directive": "EU",
  "French-CPI-L122-5": "FR",
  "German-UrhG-Section-5": "DE",
  "Italian-LDA-Article-5": "IT",
  "Spanish-LPI-Article-13": "ES",
  // Czech statutory PD regime
  "Czech-Statutory-PD": "CZ",
  // Phase 1B-2 Group 4 AMBER bespoke gov terms jurisdictions
  "Flanders-MGH-1.0": "BE",
  "HK-DataGov-TOS": "HK",
  "KOGL-Type-1": "KR",
  "Singapore-OGL-1.0": "SG",
  // Phase 1B-2 Group 4 UNCLEAR triage jurisdiction
  "OGL-ROU-1.0": "RO",
};

function classifyEntityType(code: string): "license" | "terms" | "legal_regime" | "vendor_template" {
  return ENTITY_TYPE_OVERRIDES[code] ?? "license";
}

function classifyJurisdiction(code: string): string {
  return JURISDICTION_OVERRIDES[code] ?? "INTERNATIONAL";
}

function migrate() {
  const raw = readFileSync(SOURCE_PATH, "utf-8");
  const catalog: UpstreamCatalog = JSON.parse(raw);
  const db = new Database(DB_PATH);

  const insertEntity = db.prepare(`
    INSERT OR REPLACE INTO entities (
      id, entity_type, name, short_name, aliases, spdx_id, version,
      jurisdiction, official_text_url, last_fetched_at, refresh_cadence_days,
      tier, description, type_specific, quality_tier
    ) VALUES (
      @id, @entity_type, @name, @short_name, NULL, @spdx_id, NULL,
      @jurisdiction, @official_text_url, @last_fetched_at, @refresh_cadence_days,
      'premium', @description, @type_specific, @quality_tier
    )
  `);

  const insertFts = db.prepare(`
    INSERT INTO entities_fts (id, name, short_name, aliases, description, tags)
    VALUES (@id, @name, @short_name, '', @description, '')
  `);

  const tx = db.transaction((catalog: UpstreamCatalog) => {
    for (const [code, entry] of Object.entries(catalog)) {
      const id = codeToId(code);
      const entity_type = classifyEntityType(code);
      const jurisdiction = classifyJurisdiction(code);
      const type_specific = JSON.stringify({
        commercial_allowed: entry.commercial_allowed,
        attribution_required: entry.attribution_required,
        derivatives_allowed: entry.derivatives_allowed,
        share_alike: entry.share_alike,
        non_commercial: entry.non_commercial,
        safe_for_public_ghcr: entry.safe_for_public_ghcr,
        default_allowed_for_commercial_serving: entry.default_allowed_for_commercial_serving,
        database_rights_evidence_required: entry.database_rights_evidence_required,
        geographic_restrictions: entry.geographic_restrictions ?? [],
        requires_vendor_terms_url: entry.requires_vendor_terms_url ?? false,
        audit_status: entry.audit_status ?? null,
        notes: entry.notes ?? null,
      });
      const quality_tier =
        code === "License-Unverified" ? "amber" :
        code === "Custom-Vendor" ? "amber" :
        "green";

      insertEntity.run({
        id,
        entity_type,
        name: entry.name,
        short_name: code,
        spdx_id: entry.spdx,
        jurisdiction,
        official_text_url: entry.url,
        last_fetched_at: new Date().toISOString(),
        refresh_cadence_days: 90,
        description: entry.name,
        type_specific,
        quality_tier,
      });

      insertFts.run({
        id,
        name: entry.name,
        short_name: code,
        description: entry.name,
      });
    }
  });

  tx(catalog);
  const count = db.prepare("SELECT COUNT(*) as c FROM entities").get() as { c: number };
  console.log(`Migrated ${count.c} entries.`);
  db.close();
}

migrate();
