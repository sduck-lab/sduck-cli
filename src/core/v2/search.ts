// Common short English function words that are >=3 chars and would otherwise pass the length
// filter below. Left unfiltered, a word like "and" matches nearly every English decision and
// drowns out FTS5/LIKE results with unrelated documents (found via sduck-recall-bench against a
// real, mostly-English project).
const ENGLISH_STOPWORDS = new Set([
  'and',
  'the',
  'for',
  'are',
  'was',
  'with',
  'from',
  'into',
  'that',
  'this',
  'has',
  'not',
  'but',
  'can',
  'all',
  'any',
  'its',
  'our',
  'per',
  'use',
  'via',
  'out',
  'off',
  'own',
  'now',
  'new',
  'you',
  'your',
  'they',
  'their',
  'them',
  'then',
  'than',
  'when',
  'what',
  'who',
  'whom',
  'which',
  'where',
  'why',
  'how',
  'will',
  'would',
  'should',
  'could',
  'may',
  'might',
  'must',
  'shall',
  'been',
  'being',
  'were',
  'have',
  'had',
  'let',
  'get',
  'got',
  'one',
  'two',
  'more',
  'most',
  'some',
  'such',
  'only',
  'also',
  'both',
  'each',
  'few',
  'other',
  'same',
  'very',
  'just',
  'once',
  'here',
  'there',
  'these',
  'those',
  'while',
  'after',
  'before',
  'above',
  'below',
  'between',
  'through',
  'during',
  'again',
  'further',
]);

export function searchTerms(query: string): string[] {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9가-힣]+/i)
    .filter((term) => term.length >= 3 || (containsHangul(term) && term.length >= 2))
    .filter((term) => !ENGLISH_STOPWORDS.has(term));
  const candidates = terms.length === 0 ? [query.trim()] : terms;
  return [...new Set(candidates)].filter((term) => term !== '');
}

export function containsLikePattern(value: string): string {
  return `%${value.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')}%`;
}

const FTS_MIN_TERM_LENGTH = 3;

export function ftsMatchQuery(terms: string[]): string | null {
  const phrases = terms
    .filter((term) => term.length >= FTS_MIN_TERM_LENGTH)
    .map((term) => `"${term.replaceAll('"', '""')}"`);
  return phrases.length === 0 ? null : phrases.join(' OR ');
}

function containsHangul(value: string): boolean {
  return /[가-힣]/.test(value);
}

// Cormack, Clarke & Buttcher, "Reciprocal Rank Fusion outperforms Condorcet and Individual Rank
// Learning Methods" (SIGIR/CIKM 2009). k=60 is the paper's standard constant; combining by rank
// position (not raw score) lets differently-scaled signals -- FTS5 bm25, graph hop-distance -- mix
// without normalization.
const RRF_K = 60;

export function reciprocalRankFusion(rankedLists: string[][], k = RRF_K): Map<string, number> {
  const scores = new Map<string, number>();
  for (const list of rankedLists) {
    list.forEach((id, index) => {
      scores.set(id, (scores.get(id) ?? 0) + 1 / (k + index + 1));
    });
  }
  return scores;
}

export function rankByRrf(rankedLists: string[][], k = RRF_K): string[] {
  return [...reciprocalRankFusion(rankedLists, k).entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([id]) => id);
}
