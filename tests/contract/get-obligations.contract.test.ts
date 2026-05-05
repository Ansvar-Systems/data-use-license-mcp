import { describe, it, expect } from "vitest";
import { getObligations } from "../../src/tools/get-obligations.js";

describe("get_obligations contract", () => {
  it("returns obligations array (may include attribution_required)", async () => {
    const out = await getObligations({ entity_id: "apache-2.0" });
    expect(out.obligations).toBeInstanceOf(Array);
  });

  it("includes _citation + _meta", async () => {
    const out = await getObligations({ entity_id: "apache-2.0" });
    expect(out._citation).toBeDefined();
    expect(out._meta).toBeDefined();
  });

  it("returns empty obligations + null citation for unknown id", async () => {
    const out = await getObligations({ entity_id: "zzz-unknown" });
    expect(out.obligations).toEqual([]);
    expect(out._citation).toBeNull();
  });

  it("surfaces share-alike obligation for SA licenses", async () => {
    const out = await getObligations({ entity_id: "cc-by-sa-4.0" });
    const ids = out.obligations.map((o) => o.id);
    expect(ids).toContain("share-alike");
    expect(ids).toContain("attribution");
  });

  it("surfaces non-commercial obligation for NC licenses", async () => {
    const out = await getObligations({ entity_id: "cc-by-nc-4.0" });
    const ids = out.obligations.map((o) => o.id);
    expect(ids).toContain("non-commercial");
  });

  it("does not surface no-derivatives for permissive licenses", async () => {
    const out = await getObligations({ entity_id: "apache-2.0" });
    const ids = out.obligations.map((o) => o.id);
    expect(ids).not.toContain("no-derivatives");
    expect(ids).not.toContain("share-alike");
    expect(ids).not.toContain("non-commercial");
  });

  it("flags database-right-separate for EU-Decision-2011-833", async () => {
    const out = await getObligations({ entity_id: "eu-decision-2011-833" });
    const ids = out.obligations.map((o) => o.id);
    expect(ids).toContain("database-right-separate");
  });
});
