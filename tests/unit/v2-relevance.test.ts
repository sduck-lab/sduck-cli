import { describe, expect, it } from 'vitest';

import {
  GRAPH_RELEVANCE_SCORE,
  RELEVANCE_REASONS,
  mergeBestMatches,
  normalizeProjectPath,
  scoreAppliesToEntry,
  scoreDecisionForFiles,
} from '../../src/core/v2/relevance.js';

describe('v2 relevance scoring', () => {
  const root = '/repo';

  it('normalizes root-relative and platform path variants', () => {
    expect(normalizeProjectPath(root, './src\\feature.ts')).toBe('src/feature.ts');
    expect(normalizeProjectPath(root, '/repo/src/feature.ts')).toBe('src/feature.ts');
  });

  it('scores exact, glob, directory, graph, and weak fallback matches', () => {
    expect(scoreAppliesToEntry(root, './src/exact.ts', 'src/exact.ts')).toMatchObject({
      score: 1,
      reason: RELEVANCE_REASONS.appliesToExactPath,
    });
    expect(scoreAppliesToEntry(root, 'src/**/*.ts', 'src/core/example.ts')).toMatchObject({
      score: 0.85,
      reason: RELEVANCE_REASONS.appliesToGlob,
    });
    expect(scoreAppliesToEntry(root, 'src/**/*.ts', 'src/example.ts')).toMatchObject({
      score: 0.85,
      reason: RELEVANCE_REASONS.appliesToGlob,
    });
    expect(scoreAppliesToEntry(root, 'src/core', 'src/core/example.ts')).toMatchObject({
      score: 0.85,
      reason: RELEVANCE_REASONS.appliesToDirectoryPrefix,
    });

    const graphResult = scoreDecisionForFiles(
      root,
      { id: 'DEC-graph', appliesTo: [] },
      ['src/graph-only.ts'],
      [
        {
          source: 'DEC-graph',
          target: 'src/graph-only.ts',
          relation: 'APPLIES_TO',
          decisionId: 'DEC-graph',
          file: 'src/graph-only.ts',
        },
      ],
    );
    expect(graphResult.attached).toEqual([
      expect.objectContaining({
        score: GRAPH_RELEVANCE_SCORE,
        reason: RELEVANCE_REASONS.graphEdge,
      }),
    ]);

    expect(GRAPH_RELEVANCE_SCORE).toBe(0.7);

    const weak = scoreDecisionForFiles(root, { id: 'DEC-weak', appliesTo: ['feature'] }, [
      'src/feature-details.ts',
    ]);
    expect(weak.attached).toEqual([]);
    expect(weak.bestReviewMatch).toMatchObject({
      score: 0.3,
      reason: RELEVANCE_REASONS.weakSubstringFallback,
    });
  });

  it('keeps the strongest reason per file', () => {
    expect(
      mergeBestMatches([
        { file: 'src/a.ts', score: 0.3, reason: RELEVANCE_REASONS.weakSubstringFallback },
        { file: 'src/a.ts', score: 0.7, reason: RELEVANCE_REASONS.graphEdge },
      ]),
    ).toEqual([{ file: 'src/a.ts', score: 0.7, reason: RELEVANCE_REASONS.graphEdge }]);
  });
});
