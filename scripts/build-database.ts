// scripts/build-database.ts
import Database from "better-sqlite3";
import { mkdirSync, rmSync, existsSync } from "node:fs";
import { dirname } from "node:path";

const DB_PATH = "./data/database.db";

function buildSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS entities (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL CHECK (entity_type IN ('license', 'terms', 'legal_regime', 'vendor_template')),
      name TEXT NOT NULL,
      short_name TEXT,
      aliases TEXT,
      spdx_id TEXT,
      version TEXT,
      predecessor_id TEXT,
      successor_id TEXT,
      jurisdiction TEXT NOT NULL,
      governing_law TEXT,
      authority TEXT,
      effective_date TEXT,
      withdrawn_date TEXT,
      official_text_url TEXT,
      official_text_hash TEXT,
      last_fetched_at TEXT,
      refresh_cadence_days INTEGER NOT NULL DEFAULT 90,
      tier TEXT NOT NULL DEFAULT 'premium' CHECK (tier IN ('premium', 'team', 'company')),
      description TEXT,
      tags TEXT,
      quality_tier TEXT NOT NULL DEFAULT 'green' CHECK (quality_tier IN ('green', 'amber', 'red')),
      notes TEXT,
      type_specific TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(entity_type);
    CREATE INDEX IF NOT EXISTS idx_entities_jurisdiction ON entities(jurisdiction);
    CREATE INDEX IF NOT EXISTS idx_entities_spdx ON entities(spdx_id);
  `);
}

function main() {
  if (existsSync(DB_PATH)) rmSync(DB_PATH);
  mkdirSync(dirname(DB_PATH), { recursive: true });

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = DELETE");
  buildSchema(db);
  db.exec("VACUUM;");
  db.close();
  console.log("Database built at", DB_PATH);
}

main();
