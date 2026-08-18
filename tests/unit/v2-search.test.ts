import { describe, expect, it } from 'vitest';

import { rankByRrf, reciprocalRankFusion } from '../../src/core/v2/search.js';

describe('reciprocal rank fusion', () => {
  it('scores a top-ranked hit in every list higher than one that only appears once', () => {
    const scores = reciprocalRankFusion([
      ['a', 'b', 'c'],
      ['a', 'c', 'b'],
    ]);
    expect(scores.get('a')).toBeCloseTo(1 / 61 + 1 / 61, 10);
    expect(scores.get('b')).toBeCloseTo(1 / 62 + 1 / 63, 10);
    expect(scores.get('a') ?? 0).toBeGreaterThan(scores.get('b') ?? 0);
  });

  it('lets a consistently-mid-ranked item beat one that is first in only one list', () => {
    // "a" tops one list but is absent elsewhere; "b" is #2 in every list. RRF's whole point is
    // that broad, repeated agreement outranks a single strong-but-lonely signal.
    const ranked = rankByRrf([
      ['a', 'b', 'c'],
      ['b', 'c', 'd'],
      ['b', 'd', 'c'],
    ]);
    expect(ranked.indexOf('b')).toBeLessThan(ranked.indexOf('a'));
  });

  it('tolerates empty ranked lists and ties break on id', () => {
    // 'z' and 'a' each rank #1 in their own list -- equal RRF score, so the tiebreaker decides.
    expect(rankByRrf([[], ['z'], ['a']])).toEqual(['a', 'z']);
    expect(rankByRrf([])).toEqual([]);
  });

  it('is order-independent across which list an id appears in', () => {
    const a = rankByRrf([
      ['x', 'y'],
      ['y', 'x'],
    ]);
    const b = rankByRrf([
      ['y', 'x'],
      ['x', 'y'],
    ]);
    expect(a).toEqual(b);
  });
});
