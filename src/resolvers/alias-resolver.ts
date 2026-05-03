// src/resolvers/alias-resolver.ts

const ALIASES: Record<string, string> = {
  "mit": "mit",
  "mit license": "mit",
  "apache": "apache-2.0",
  "apache 2": "apache-2.0",
  "apache 2.0": "apache-2.0",
  "apache-2": "apache-2.0",
  "apache-2.0": "apache-2.0",
  "creative commons attribution 4.0": "cc-by-4.0",
  "cc by 4.0": "cc-by-4.0",
  "cc-by-4.0": "cc-by-4.0",
  "cc-by": "cc-by-4.0",
  "cc-by-sa-4.0": "cc-by-sa-4.0",
  "cc-by-sa": "cc-by-sa-4.0",
  "cc0": "cc0-1.0",
  "cc0-1.0": "cc0-1.0",
  "ogl": "ogl-3.0",
  "ogl-3.0": "ogl-3.0",
  "open government licence": "ogl-3.0",
  "norwegian open data": "nlod-2.0",
  "norsk lisens for offentlige data": "nlod-2.0",
  "nlod": "nlod-2.0",
  "etalab": "etalab-2.0",
  "licence ouverte": "etalab-2.0",
  "datenlizenz deutschland": "dl-de-by-2.0",
  "iodl": "iodl-2.0",
  "italian open data": "iodl-2.0",
  "odbl": "odbl-1.0",
  "sui generis": "sui-generis-db-rights-eu",
  "database rights": "sui-generis-db-rights-eu",
  "crown copyright": "crown-copyright",
  "westlaw": "vendor-tpl-westlaw-enterprise",
  "lexisnexis": "vendor-tpl-lexisnexis-enterprise",
  "bloomberg law": "vendor-tpl-bloomberg-law",
};

export function resolveToCanonicalId(input: string): string {
  const normalized = input.trim().toLowerCase();
  return ALIASES[normalized] ?? normalized;
}
