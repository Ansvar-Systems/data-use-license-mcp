import { describe, it, expect, beforeAll } from "vitest";
import Database from "better-sqlite3";

describe("seed migration: attribution-licenses 13 entries", () => {
  let db: Database.Database;

  beforeAll(() => {
    db = new Database("./data/database.db", { readonly: true });
  });

  it("entities table has at least 13 rows after seed", () => {
    const row = db.prepare("SELECT COUNT(*) as c FROM entities").get() as { c: number };
    expect(row.c).toBeGreaterThanOrEqual(13);
  });

  it("contains expected canonical IDs", () => {
    const expected = [
      "apache-2.0", "cc-by-4.0", "cc-by-nc-4.0", "cc-by-nc-sa-4.0",
      "cc-by-sa-4.0", "cc0-1.0", "crown-copyright", "custom-vendor",
      "eu-decision-2011-833", "license-unverified", "mit",
      "ogl-3.0", "public-domain"
    ];
    const ids = db.prepare("SELECT id FROM entities").all().map((r: { id: string }) => r.id);
    for (const id of expected) {
      expect(ids).toContain(id);
    }
  });

  it("FTS5 mirror has at least 13 rows", () => {
    const row = db.prepare("SELECT COUNT(*) as c FROM entities_fts").get() as { c: number };
    expect(row.c).toBeGreaterThanOrEqual(13);
  });
});
