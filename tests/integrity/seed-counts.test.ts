import { describe, it, expect, beforeAll } from "vitest";
import Database from "better-sqlite3";

describe("seed migration: attribution-licenses canonical baseline", () => {
  let db: Database.Database;

  beforeAll(() => {
    db = new Database("./data/database.db", { readonly: true });
  });

  it("entities table has at least 22 rows after seed (canonical baseline)", () => {
    const row = db.prepare("SELECT COUNT(*) as c FROM entities").get() as { c: number };
    expect(row.c).toBeGreaterThanOrEqual(22);
  });

  it("contains all 22 canonical IDs from arch-docs license catalog", () => {
    const expected = [
      "apache-2.0", "cc-by-3.0", "cc-by-4.0", "cc-by-nc-4.0", "cc-by-nc-sa-4.0",
      "cc-by-nd-4.0", "cc-by-sa-4.0", "cc0-1.0", "crown-copyright", "custom-vendor",
      "cyprus-psi", "eu-decision-2011-833", "eu-decision-2011-833-commission-only",
      "etalab-2.0", "license-unverified", "mit", "nlod-2.0",
      "norwegian-court-publication", "ogl-3.0", "ogl-uk-2.0", "public-domain",
      "us-federal-pd"
    ];
    const ids = db.prepare("SELECT id FROM entities").all().map((r: { id: string }) => r.id);
    for (const id of expected) {
      expect(ids).toContain(id);
    }
  });

  it("FTS5 mirror has at least 22 rows", () => {
    const row = db.prepare("SELECT COUNT(*) as c FROM entities_fts").get() as { c: number };
    expect(row.c).toBeGreaterThanOrEqual(22);
  });

  it("classifies non-license entries by entity_type correctly", () => {
    const rows = db.prepare(
      "SELECT id, entity_type FROM entities"
    ).all() as { id: string; entity_type: string }[];
    const byId = Object.fromEntries(rows.map(r => [r.id, r.entity_type]));
    expect(byId["crown-copyright"]).toBe("legal_regime");
    expect(byId["norwegian-court-publication"]).toBe("legal_regime");
    expect(byId["us-federal-pd"]).toBe("legal_regime");
    expect(byId["public-domain"]).toBe("legal_regime");
    expect(byId["custom-vendor"]).toBe("vendor_template");
    expect(byId["eu-decision-2011-833"]).toBe("terms");
    expect(byId["cyprus-psi"]).toBe("terms");
    expect(byId["etalab-2.0"]).toBe("terms");
    expect(byId["nlod-2.0"]).toBe("terms");
    expect(byId["ogl-uk-2.0"]).toBe("terms");
  });

  it("assigns country-scoped jurisdictions to non-international entries", () => {
    const rows = db.prepare(
      "SELECT id, jurisdiction FROM entities"
    ).all() as { id: string; jurisdiction: string }[];
    const byId = Object.fromEntries(rows.map(r => [r.id, r.jurisdiction]));
    expect(byId["etalab-2.0"]).toBe("FR");
    expect(byId["nlod-2.0"]).toBe("NO");
    expect(byId["norwegian-court-publication"]).toBe("NO");
    expect(byId["cyprus-psi"]).toBe("CY");
    expect(byId["us-federal-pd"]).toBe("US");
    expect(byId["ogl-uk-2.0"]).toBe("GB");
    expect(byId["crown-copyright"]).toBe("GB");
    expect(byId["eu-decision-2011-833-commission-only"]).toBe("EU");
  });
});
