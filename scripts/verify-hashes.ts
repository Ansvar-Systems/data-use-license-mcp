// scripts/verify-hashes.ts
import Database from "better-sqlite3";
import { createHash } from "node:crypto";
import { normalizeForHashing } from "./normalize-text.js";

const DB_PATH = process.env.DB_PATH ?? "./data/database.db";
const REPORT_ONLY = process.argv.includes("--report-only");

interface Anchor {
  id: string;
  official_text_url: string;
  official_text_hash: string | null;
  refresh_cadence_days: number;
  last_fetched_at: string | null;
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function sha256(s: string): string {
  return "sha256:" + createHash("sha256").update(s, "utf-8").digest("hex");
}

async function main() {
  const db = new Database(DB_PATH);
  const anchors = db.prepare(`
    SELECT id, official_text_url, official_text_hash, refresh_cadence_days, last_fetched_at
    FROM entities
    WHERE official_text_url IS NOT NULL
    ORDER BY last_fetched_at ASC
    LIMIT 8
  `).all() as Anchor[];

  console.log(`Verifying ${anchors.length} canary anchors...`);
  let mismatches = 0;
  for (const a of anchors) {
    const raw = await fetchText(a.official_text_url);
    if (raw === null) {
      console.log(`  [WARN] ${a.id}: fetch failed (${a.official_text_url})`);
      continue;
    }
    const normalized = normalizeForHashing(raw);
    const currentHash = sha256(normalized);
    if (a.official_text_hash && a.official_text_hash !== currentHash) {
      mismatches++;
      console.log(`  [DRIFT] ${a.id}: stored=${a.official_text_hash} current=${currentHash}`);
    } else if (!a.official_text_hash) {
      console.log(`  [INIT]  ${a.id}: no stored hash; current=${currentHash}`);
      if (!REPORT_ONLY) {
        db.prepare("UPDATE entities SET official_text_hash = ?, last_fetched_at = ? WHERE id = ?")
          .run(currentHash, new Date().toISOString(), a.id);
      }
    } else {
      console.log(`  [OK]    ${a.id}`);
      if (!REPORT_ONLY) {
        db.prepare("UPDATE entities SET last_fetched_at = ? WHERE id = ?")
          .run(new Date().toISOString(), a.id);
      }
    }
  }
  db.close();
  console.log(`Done. ${mismatches} drift mismatches.`);
}

main().catch((err) => {
  console.error("verify-hashes fatal:", err);
  process.exit(1);
});
