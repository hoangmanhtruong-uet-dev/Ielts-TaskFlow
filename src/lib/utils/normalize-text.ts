/**
 * Normalize text cho so sánh dictation:
 * - Lowercase
 * - Xóa dấu câu (giữ apostrophe)
 * - Trim & collapse whitespace
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitWords(text: string): string[] {
  return normalizeText(text).split(" ").filter(Boolean);
}
