import { describe, it, expect, beforeAll } from "vitest";
import Database from "better-sqlite3";

describe("seed migration: attribution-licenses canonical baseline", () => {
  let db: Database.Database;

  beforeAll(() => {
    db = new Database("./data/database.db", { readonly: true });
  });

  it("entities table has at least 61 rows after seed (Phase 1B-2 Groups 1+3+4-GREEN+4-AMBER+5+6+UNCLEAR-triage+czech-PD)", () => {
    const row = db.prepare("SELECT COUNT(*) as c FROM entities").get() as { c: number };
    expect(row.c).toBeGreaterThanOrEqual(61);
  });

  it("contains all 61 canonical IDs from arch-docs license catalog", () => {
    const expected = [
      // Phase 1A canonical baseline (22)
      "apache-2.0", "cc-by-3.0", "cc-by-4.0", "cc-by-nc-4.0", "cc-by-nc-sa-4.0",
      "cc-by-nd-4.0", "cc-by-sa-4.0", "cc0-1.0", "crown-copyright", "custom-vendor",
      "cyprus-psi", "eu-decision-2011-833", "eu-decision-2011-833-commission-only",
      "etalab-2.0", "license-unverified", "mit", "nlod-2.0",
      "norwegian-court-publication", "ogl-3.0", "ogl-uk-2.0", "public-domain",
      "us-federal-pd",
      // Phase 1B-2 Group 1 SPDX (10)
      "agpl-3.0-only", "bsd-2-clause", "bsd-3-clause", "gpl-2.0-only", "gpl-3.0-only",
      "isc", "lgpl-2.1-only", "lgpl-3.0-only", "mpl-2.0", "unlicense",
      // Phase 1B-2 Group 3 ODC (3)
      "odbl-1.0", "odc-by-1.0", "pddl-1.0",
      // Phase 1B-2 Group 4 GREEN (5)
      "dl-de-by-2.0", "dl-de-zero-2.0", "iodl-2.0", "lo-ol-luxembourg", "ogl-canada-2.0",
      // Phase 1B-2 Group 6 vendor RED (8)
      "bloomberg-law-tos", "heinonline-tos", "justia-tos", "lexisnexis-tos",
      "practical-law-tos", "westlaw-tos", "wolterskluwer-tos", "vlex-tos",
      // Phase 1B-2 Group 5 regimes (5)
      "eu-database-directive", "french-cpi-l122-5", "german-urhg-section-5",
      "italian-lda-article-5", "spanish-lpi-article-13",
      // Phase 1B-2 license completers PR-J arch-docs #387 (2)
      "cc-by-nc-nd-4.0", "eupl-1.2",
      // Phase 1B-2 Group 4 AMBER PR-E2 arch-docs #388 (4)
      "flanders-mgh-1.0", "hk-datagov-tos", "kogl-type-1", "singapore-ogl-1.0",
      // Phase 1B-2 Group 4 UNCLEAR triage PR-K arch-docs #389 (1)
      "ogl-rou-1.0",
      // Czech-law fork-A arch-docs PR #390 (1 regime)
      "czech-statutory-pd",
    ];
    const ids = db.prepare("SELECT id FROM entities").all().map((r: { id: string }) => r.id);
    for (const id of expected) {
      expect(ids).toContain(id);
    }
  });

  it("FTS5 mirror has at least 61 rows", () => {
    const row = db.prepare("SELECT COUNT(*) as c FROM entities_fts").get() as { c: number };
    expect(row.c).toBeGreaterThanOrEqual(61);
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
    // Phase 1B-2 Group 4 GREEN — government open-data terms
    expect(byId["dl-de-by-2.0"]).toBe("terms");
    expect(byId["dl-de-zero-2.0"]).toBe("terms");
    expect(byId["iodl-2.0"]).toBe("terms");
    expect(byId["lo-ol-luxembourg"]).toBe("terms");
    expect(byId["ogl-canada-2.0"]).toBe("terms");
    // Phase 1B-2 Group 6 vendor RED — reference rows for negative-matching
    expect(byId["westlaw-tos"]).toBe("vendor_template");
    expect(byId["lexisnexis-tos"]).toBe("vendor_template");
    expect(byId["bloomberg-law-tos"]).toBe("vendor_template");
    expect(byId["wolterskluwer-tos"]).toBe("vendor_template");
    expect(byId["heinonline-tos"]).toBe("vendor_template");
    expect(byId["vlex-tos"]).toBe("vendor_template");
    expect(byId["practical-law-tos"]).toBe("vendor_template");
    expect(byId["justia-tos"]).toBe("vendor_template");
    // Phase 1B-2 Group 5 regimes — arch-docs entry_kind=regime maps to MCP entity_type=legal_regime
    expect(byId["eu-database-directive"]).toBe("legal_regime");
    expect(byId["french-cpi-l122-5"]).toBe("legal_regime");
    expect(byId["german-urhg-section-5"]).toBe("legal_regime");
    expect(byId["italian-lda-article-5"]).toBe("legal_regime");
    expect(byId["spanish-lpi-article-13"]).toBe("legal_regime");
    // Czech-law fork-A regime
    expect(byId["czech-statutory-pd"]).toBe("legal_regime");
    // Phase 1B-2 Group 4 AMBER (PR-E2) — bespoke government open-data terms
    expect(byId["flanders-mgh-1.0"]).toBe("terms");
    expect(byId["hk-datagov-tos"]).toBe("terms");
    expect(byId["kogl-type-1"]).toBe("terms");
    expect(byId["singapore-ogl-1.0"]).toBe("terms");
    // Phase 1B-2 Group 4 UNCLEAR triage (PR-K) — Romanian bespoke
    expect(byId["ogl-rou-1.0"]).toBe("terms");
    // Phase 1B-2 license completers (PR-J) — default classify as license
    expect(byId["eupl-1.2"]).toBe("license");
    expect(byId["cc-by-nc-nd-4.0"]).toBe("license");
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
    // Phase 1B-2 Group 4 GREEN jurisdictions
    expect(byId["dl-de-by-2.0"]).toBe("DE");
    expect(byId["dl-de-zero-2.0"]).toBe("DE");
    expect(byId["iodl-2.0"]).toBe("IT");
    expect(byId["lo-ol-luxembourg"]).toBe("LU");
    expect(byId["ogl-canada-2.0"]).toBe("CA");
    // Phase 1B-2 Group 5 regime jurisdictions
    expect(byId["eu-database-directive"]).toBe("EU");
    expect(byId["french-cpi-l122-5"]).toBe("FR");
    expect(byId["german-urhg-section-5"]).toBe("DE");
    expect(byId["italian-lda-article-5"]).toBe("IT");
    expect(byId["spanish-lpi-article-13"]).toBe("ES");
    expect(byId["us-federal-pd"]).toBe("US");
    expect(byId["ogl-uk-2.0"]).toBe("GB");
    expect(byId["crown-copyright"]).toBe("GB");
    expect(byId["eu-decision-2011-833-commission-only"]).toBe("EU");
    // Czech-law fork-A regime jurisdiction
    expect(byId["czech-statutory-pd"]).toBe("CZ");
    // Phase 1B-2 Group 4 AMBER bespoke gov terms jurisdictions
    expect(byId["flanders-mgh-1.0"]).toBe("BE");
    expect(byId["hk-datagov-tos"]).toBe("HK");
    expect(byId["kogl-type-1"]).toBe("KR");
    expect(byId["singapore-ogl-1.0"]).toBe("SG");
    // Phase 1B-2 Group 4 UNCLEAR triage jurisdiction
    expect(byId["ogl-rou-1.0"]).toBe("RO");
  });
});
