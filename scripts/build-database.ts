// scripts/build-database.ts
import Database from "better-sqlite3";
import { mkdirSync, rmSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import { execFileSync } from "node:child_process";

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

    CREATE TABLE IF NOT EXISTS edges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      edge_type TEXT NOT NULL CHECK (edge_type IN (
        'compatible_with', 'incompatible_with', 'applies_alongside',
        'subsumes', 'subsumed_by', 'interpreted_by', 'clarified_by', 'cross_corpus_anchor'
      )),
      source_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      metadata TEXT,
      FOREIGN KEY (source_id) REFERENCES entities(id),
      UNIQUE(edge_type, source_id, target_id)
    );
    CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source_id);
    CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target_id);
    CREATE INDEX IF NOT EXISTS idx_edges_type ON edges(edge_type);

    CREATE VIRTUAL TABLE IF NOT EXISTS entities_fts USING fts5(
      id UNINDEXED,
      name,
      short_name,
      aliases,
      description,
      tags,
      tokenize = "unicode61 remove_diacritics 2"
    );
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

  // Run seed migration in a child process. Use execFileSync (no shell) — argv array is hardcoded.
  execFileSync("npx", ["tsx", "scripts/seed-attribution-licenses.ts"], { stdio: "inherit" });

  // Final VACUUM to finalize the post-seed DB
  const db2 = new Database(DB_PATH);
  db2.pragma("journal_mode = DELETE");
  db2.exec("VACUUM;");
  db2.close();

  console.log("Database built at", DB_PATH);
}

main();
