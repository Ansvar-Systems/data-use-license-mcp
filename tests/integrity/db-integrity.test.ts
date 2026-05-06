import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Database from "better-sqlite3";
import { existsSync } from "node:fs";

describe("database integrity", () => {
  let db: Database.Database;

  beforeAll(() => {
    if (!existsSync("./data/database.db")) {
      throw new Error("Run `npm run build:db` first.");
    }
    db = new Database("./data/database.db", { readonly: true });
  });

  afterAll(() => {
    db?.close();
  });

  it("PRAGMA integrity_check returns 'ok'", () => {
    const result = db.pragma("integrity_check") as Array<{ integrity_check: string }>;
    expect(result[0].integrity_check).toBe("ok");
  });

  it("journal_mode is 'delete'", () => {
    const mode = db.pragma("journal_mode") as Array<{ journal_mode: string }>;
    expect(mode[0].journal_mode).toBe("delete");
  });

  it("entities table exists", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='entities'").get();
    expect(row).toBeDefined();
  });

  it("entities table has required columns", () => {
    const cols = db.prepare("PRAGMA table_info(entities)").all() as Array<{ name: string }>;
    const colNames = cols.map((c) => c.name);
    for (const required of ["id", "entity_type", "name", "jurisdiction", "official_text_url", "official_text_hash", "last_fetched_at", "tier"]) {
      expect(colNames).toContain(required);
    }
  });

  it("edges table exists with required columns", () => {
    const cols = db.prepare("PRAGMA table_info(edges)").all() as Array<{ name: string }>;
    const colNames = cols.map((c) => c.name);
    for (const required of ["id", "edge_type", "source_id", "target_id", "metadata"]) {
      expect(colNames).toContain(required);
    }
  });

  it("FTS5 table entities_fts exists", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='entities_fts'").get();
    expect(row).toBeDefined();
  });

  it("FTS5 health check (MATCH query syntactically valid)", () => {
    expect(() => {
      db.prepare("SELECT id FROM entities_fts WHERE entities_fts MATCH 'x' LIMIT 1").all();
    }).not.toThrow();
  });

  it("db_metadata table exists with required keys (gate 5.3)", () => {
    const rows = db.prepare("SELECT key, value FROM db_metadata").all() as Array<{ key: string; value: string }>;
    const keys = new Set(rows.map((r) => r.key));
    for (const required of ["schema_version", "built_at", "entity_count", "mcp_name", "mcp_version"]) {
      expect(keys).toContain(required);
    }
  });

  it("db_metadata.built_at is a valid ISO-8601 timestamp", () => {
    const row = db.prepare("SELECT value FROM db_metadata WHERE key='built_at'").get() as { value: string };
    expect(row.value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(Number.isFinite(Date.parse(row.value))).toBe(true);
  });

  it("db_metadata.entity_count matches actual entities table", () => {
    const meta = db.prepare("SELECT value FROM db_metadata WHERE key='entity_count'").get() as { value: string };
    const actual = db.prepare("SELECT COUNT(*) AS c FROM entities").get() as { c: number };
    expect(Number(meta.value)).toBe(actual.c);
  });
});
