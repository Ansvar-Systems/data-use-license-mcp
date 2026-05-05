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
  safe_for_commercial_serving: boolean;
  applies_to_database_right_separately: boolean;
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

function classifyEntityType(code: string): "license" | "terms" | "legal_regime" | "vendor_template" {
  if (code === "Custom-Vendor") return "vendor_template";
  if (code === "Crown-Copyright") return "legal_regime";
  if (code === "EU-Decision-2011-833") return "terms";
  if (code === "Public-Domain") return "legal_regime";
  return "license";
}

function classifyJurisdiction(code: string): string {
  if (code === "Crown-Copyright") return "GB";
  if (code === "OGL-3.0") return "GB";
  if (code === "EU-Decision-2011-833") return "EU";
  return "INTERNATIONAL";
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
        safe_for_commercial_serving: entry.safe_for_commercial_serving,
        applies_to_database_right_separately: entry.applies_to_database_right_separately,
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
