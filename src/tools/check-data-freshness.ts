import { z } from "zod";
import { getDbMetadata } from "../db.js";

export const checkDataFreshnessInputSchema = z.object({}).passthrough();

export type CheckDataFreshnessInput = z.infer<typeof checkDataFreshnessInputSchema>;

export type FreshnessStatus = "current" | "due" | "overdue";

export interface CheckDataFreshnessOutput {
  status: FreshnessStatus;
  database_built: string;
  age_days: number;
  refresh_cadence_days: number;
  schema_version: string;
  entity_count: number;
  update_command: string;
  notes: string;
}

const REFRESH_CADENCE_DAYS = 90;

const NOTES =
  "data-use-license has no upstream feed — freshness is the time since the " +
  "DB was last rebuilt and seeded. To refresh, edit the catalog upstream " +
  "(arch-docs license-catalog) and merge a mirror PR.";

export async function checkDataFreshness(
  _input: CheckDataFreshnessInput = {},
): Promise<CheckDataFreshnessOutput> {
  const meta = getDbMetadata();
  const builtAtMs = Date.parse(meta.built_at);
  const ageMs = Date.now() - builtAtMs;
  const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));
  const status: FreshnessStatus =
    ageDays >= REFRESH_CADENCE_DAYS
      ? "overdue"
      : ageDays >= REFRESH_CADENCE_DAYS * 0.8
        ? "due"
        : "current";
  return {
    status,
    database_built: meta.built_at,
    age_days: ageDays,
    refresh_cadence_days: REFRESH_CADENCE_DAYS,
    schema_version: meta.schema_version,
    entity_count: meta.entity_count,
    update_command:
      "Mirror upstream catalog: open a PR in Ansvar-Systems/data-use-license-mcp from feat/mirror-catalog-NN.",
    notes: NOTES,
  };
}
