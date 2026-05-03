// scripts/normalize-text.ts
export function normalizeForHashing(input: string): string {
  return input
    .replace(/<\/?[a-zA-Z][^<>]{0,200}>/g, "")  // safe non-greedy HTML strip
    .replace(/\s+/g, " ")
    .normalize("NFC")
    .trim();
}
