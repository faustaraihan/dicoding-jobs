export function normalizeSearchKeyword(value: string): string {
  const keyword = value.trim();
  return keyword.length >= 3 ? keyword : "";
}
