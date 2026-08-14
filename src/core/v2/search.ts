export function searchTerms(query: string): string[] {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9가-힣]+/i)
    .filter((term) => term.length >= 3 || (containsHangul(term) && term.length >= 2));
  const candidates = terms.length === 0 ? [query.trim()] : terms;
  return [...new Set(candidates)].filter((term) => term !== '');
}

export function containsLikePattern(value: string): string {
  return `%${value.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')}%`;
}

function containsHangul(value: string): boolean {
  return /[가-힣]/.test(value);
}
