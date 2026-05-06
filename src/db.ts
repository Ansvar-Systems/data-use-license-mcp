// src/db.ts
import Database from "better-sqlite3";
import type { Entity, Edge, EntityType } from "./types.js";

const DB_PATH = process.env.DB_PATH ?? "./data/database.db";

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_PATH, { readonly: true });
  return _db;
}

interface RawEntity {
  id: string;
  entity_type: EntityType;
  name: string;
  short_name: string | null;
  aliases: string | null;
  spdx_id: string | null;
  version: string | null;
  predecessor_id: string | null;
  successor_id: string | null;
  jurisdiction: string;
  governing_law: string | null;
  authority: string | null;
  effective_date: string | null;
  withdrawn_date: string | null;
  official_text_url: string | null;
  official_text_hash: string | null;
  last_fetched_at: string | null;
  refresh_cadence_days: number;
  tier: Entity["tier"];
  description: string | null;
  tags: string | null;
  quality_tier: Entity["quality_tier"];
  type_specific: string | null;
}

function rowToEntity(r: RawEntity): Entity {
  return {
    id: r.id,
    entity_type: r.entity_type,
    name: r.name,
    short_name: r.short_name,
    aliases: r.aliases ? JSON.parse(r.aliases) : [],
    spdx_id: r.spdx_id,
    version: r.version,
    predecessor_id: r.predecessor_id,
    successor_id: r.successor_id,
    jurisdiction: r.jurisdiction,
    governing_law: r.governing_law,
    authority: r.authority,
    effective_date: r.effective_date,
    withdrawn_date: r.withdrawn_date,
    official_text_url: r.official_text_url,
    official_text_hash: r.official_text_hash,
    last_fetched_at: r.last_fetched_at,
    refresh_cadence_days: r.refresh_cadence_days,
    tier: r.tier,
    description: r.description,
    tags: r.tags ? JSON.parse(r.tags) : [],
    quality_tier: r.quality_tier,
    type_specific: r.type_specific ? JSON.parse(r.type_specific) : {},
  };
}

export function getEntityById(id: string): Entity | null {
  const row = getDb().prepare("SELECT * FROM entities WHERE id = ?").get(id) as RawEntity | undefined;
  return row ? rowToEntity(row) : null;
}

export function searchEntitiesFts(query: string, limit = 20): Entity[] {
  const escaped = query.replace(/"/g, '""');
  const rows = getDb()
    .prepare(`
      SELECT entities.* FROM entities_fts
      JOIN entities ON entities.id = entities_fts.id
      WHERE entities_fts MATCH ?
      LIMIT ?
    `)
    .all(`"${escaped}"`, limit) as RawEntity[];
  return rows.map(rowToEntity);
}

export function getEdgesFor(id: string): Edge[] {
  const rows = getDb()
    .prepare("SELECT * FROM edges WHERE source_id = ? OR target_id = ?")
    .all(id, id) as Array<Edge & { metadata: string | null }>;
  return rows.map((r) => ({
    ...r,
    metadata: r.metadata ? JSON.parse(r.metadata as unknown as string) : null,
  }));
}

export interface DbMetadata {
  schema_version: string;
  built_at: string;
  entity_count: number;
  mcp_name: string;
  mcp_version: string;
}

export function getDbMetadata(): DbMetadata {
  const rows = getDb()
    .prepare("SELECT key, value FROM db_metadata")
    .all() as Array<{ key: string; value: string }>;
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    schema_version: map.schema_version ?? "0.0",
    built_at: map.built_at ?? new Date(0).toISOString(),
    entity_count: Number(map.entity_count ?? 0),
    mcp_name: map.mcp_name ?? "data-use-license",
    mcp_version: map.mcp_version ?? "0.0.0",
  };
}

export function getEntityCountByType(): Record<string, number> {
  const rows = getDb()
    .prepare("SELECT entity_type, COUNT(*) AS c FROM entities GROUP BY entity_type")
    .all() as Array<{ entity_type: string; c: number }>;
  return Object.fromEntries(rows.map((r) => [r.entity_type, r.c]));
}
