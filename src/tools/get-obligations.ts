// src/tools/get-obligations.ts
import { z } from "zod";
import { getEntityById } from "../db.js";
import { resolveToCanonicalId } from "../resolvers/alias-resolver.js";
import { buildCitation } from "../resolvers/citation-builder.js";
import { buildMeta } from "../meta/meta-builder.js";
import type { Citation, Meta } from "../types.js";

export const getObligationsInputSchema = z.object({
  entity_id: z.string().min(1),
});

export type GetObligationsInput = z.infer<typeof getObligationsInputSchema>;

export interface Obligation {
  id: string;
  title: string;
  text: string;
  mandatory: boolean;
  conditional_on: string | null;
}

export interface GetObligationsOutput {
  obligations: Obligation[];
  _citation: Citation | null;
  _meta: Meta;
}

export async function getObligations(input: GetObligationsInput): Promise<GetObligationsOutput> {
  const parsed = getObligationsInputSchema.parse(input);
  const canonical = resolveToCanonicalId(parsed.entity_id);
  const entity = getEntityById(canonical);

  if (!entity) {
    const empty: Meta = {
      disclaimer: "License metadata is informational, not legal advice.",
      data_age: new Date(0).toISOString(),
      source_url: null,
      jurisdiction: "INTERNATIONAL",
      corpus_freshness: "stale",
    };
    return { obligations: [], _citation: null, _meta: empty };
  }

  const obligations: Obligation[] = [];
  const ts = entity.type_specific as Record<string, unknown>;
  if (ts.attribution_required === true) {
    obligations.push({
      id: "attribution",
      title: "Attribution required",
      text: "This license/terms requires attribution to the original publisher when redistributing.",
      mandatory: true,
      conditional_on: null,
    });
  }
  if (ts.commercial_allowed === false) {
    obligations.push({
      id: "non-commercial",
      title: "Non-commercial use only",
      text: "This license/terms restricts use to non-commercial purposes.",
      mandatory: true,
      conditional_on: null,
    });
  }
  if (ts.derivatives_allowed === false) {
    obligations.push({
      id: "no-derivatives",
      title: "No derivatives permitted",
      text: "This license/terms forbids modifying, transforming, or building upon the licensed content.",
      mandatory: true,
      conditional_on: null,
    });
  }
  if (ts.share_alike === true) {
    obligations.push({
      id: "share-alike",
      title: "Share-alike obligation",
      text: "Derivative works must be distributed under the same or a compatible license.",
      mandatory: true,
      conditional_on: null,
    });
  }
  if (ts.database_rights_evidence_required === true) {
    obligations.push({
      id: "database-rights-evidence-required",
      title: "Separate database-rights evidence required",
      text: "This license alone does not clear EU sui generis database rights. A separate evidence entry (an ODC-family license, a jurisdictional waiver, or an explicit declaration) is required to satisfy the database-rights gate when redistributing in the EEA.",
      mandatory: false,
      conditional_on: "deployment_in_eea",
    });
  }

  return {
    obligations,
    _citation: buildCitation(entity),
    _meta: buildMeta(entity),
  };
}
