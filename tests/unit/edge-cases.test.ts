import { describe, expect, it } from 'vitest';

import { deriveArchiveMonth, extractCompletedAt } from '../../src/core/archive.js';
import {
  extractUncheckedChecklistItems,
  parseCompletedStepNumbers,
  validateDoneMetaContent,
  resolveDoneTargetMatches,
  filterDoneCandidates,
} from '../../src/core/done.js';
import { countPlanSteps } from '../../src/core/plan-approve.js';
import { getCurrentCycle, buildReopenedMeta } from '../../src/core/reopen.js';
import { normalizeSlug, validateSlug, createWorkspaceId } from '../../src/core/start.js';
import { parseMetaText } from '../../src/core/workspace.js';

import type { WorkspaceTaskSummary } from '../../src/core/workspace.js';

// ─── parseMetaText edge cases ───

describe('parseMetaText edge cases', () => {
  it('returns undefined id for "id: " with no value', () => {
    // regex /^id:\s+(.+)$/m requires at least one char after whitespace
    const result = parseMetaText('id: \nstatus: IN_PROGRESS');
    expect(result.id).toBeUndefined();
  });

  it('returns undefined for empty file', () => {
    const result = parseMetaText('');
    expect(result.id).toBeUndefined();
    expect(result.status).toBeUndefined();
  });

  it('trims trailing whitespace from id', () => {
    const result = parseMetaText('id: my-task   \nstatus: DONE');
    expect(result.id).toBe('my-task');
  });

  it('handles "null" string values for branch fields', () => {
    const result = parseMetaText(
      'id: t1\nstatus: DONE\nbranch: null\nbase_branch: null\nworktree_path: null',
    );
    expect(result.id).toBe('t1');
    expect(result.branch).toBeUndefined();
    expect(result.baseBranch).toBeUndefined();
    expect(result.worktreePath).toBeUndefined();
  });

  it('handles multi-line content with extra fields', () => {
    const meta = [
      'id: test-123',
      'type: feature',
      'slug: my-slug',
      'created_at: 2026-03-24T00:00:00Z',
      'status: IN_PROGRESS',
      'unknown_field: something',
    ].join('\n');
    const result = parseMetaText(meta);
    expect(result.id).toBe('test-123');
    expect(result.status).toBe('IN_PROGRESS');
    expect(result.slug).toBe('my-slug');
  });

  it('handles status with trailing spaces', () => {
    const result = parseMetaText('id: t1\nstatus: DONE   ');
    expect(result.status).toBe('DONE');
  });

  it('handles duplicate fields (first match wins)', () => {
    const result = parseMetaText('id: first\nid: second\nstatus: DONE');
    expect(result.id).toBe('first');
  });
});

// ─── done validation edge cases ───

describe('validateDoneMetaContent edge cases', () => {
  const validMeta = (total: string, completed: string) =>
    `status: REVIEW_READY\nsteps:\n  total: ${total}\n  completed: [${completed}]`;

  it('rejects total = 0', () => {
    expect(() => validateDoneMetaContent(validMeta('0', ''))).toThrow('invalid steps.total');
  });

  it('rejects negative total', () => {
    expect(() => validateDoneMetaContent(validMeta('-1', ''))).toThrow('invalid steps.total');
  });

  it('rejects total = null', () => {
    expect(() => validateDoneMetaContent(validMeta('null', ''))).toThrow('steps.total is null');
  });

  it('rejects duplicate completed steps', () => {
    expect(() => validateDoneMetaContent(validMeta('2', '1, 1'))).toThrow(
      'duplicate completed step',
    );
  });

  it('rejects out-of-range completed step', () => {
    expect(() => validateDoneMetaContent(validMeta('2', '1, 3'))).toThrow(
      'out-of-range completed step',
    );
  });

  it('rejects step 0', () => {
    expect(() => validateDoneMetaContent(validMeta('1', '0'))).toThrow(
      'out-of-range completed step',
    );
  });

  it('rejects missing steps block', () => {
    expect(() => validateDoneMetaContent('status: REVIEW_READY')).toThrow(
      'missing a valid steps block',
    );
  });

  it('accepts valid complete steps', () => {
    const result = validateDoneMetaContent(validMeta('3', '1, 2, 3'));
    expect(result.totalSteps).toBe(3);
    expect(result.completedSteps).toEqual([1, 2, 3]);
  });

  it('accepts steps in non-sequential order', () => {
    const result = validateDoneMetaContent(validMeta('3', '3, 1, 2'));
    expect(result.totalSteps).toBe(3);
    expect(result.completedSteps).toEqual([3, 1, 2]);
  });
});

describe('parseCompletedStepNumbers edge cases', () => {
  it('returns empty array for empty string', () => {
    expect(parseCompletedStepNumbers('')).toEqual([]);
  });

  it('returns empty array for whitespace-only', () => {
    expect(parseCompletedStepNumbers('   ')).toEqual([]);
  });

  it('throws on non-numeric value', () => {
    expect(() => parseCompletedStepNumbers('1, abc, 3')).toThrow('Invalid completed step value');
  });

  it('silently truncates float to integer (parseInt behavior)', () => {
    // parseInt('1.5', 10) returns 1 — not a bug, just parseInt semantics
    expect(parseCompletedStepNumbers('1.5')).toEqual([1]);
  });

  it('handles single step', () => {
    expect(parseCompletedStepNumbers('1')).toEqual([1]);
  });

  it('handles extra whitespace', () => {
    expect(parseCompletedStepNumbers(' 1 ,  2 ,  3 ')).toEqual([1, 2, 3]);
  });
});

// ─── spec checklist edge cases ───

describe('extractUncheckedChecklistItems edge cases', () => {
  it('returns empty for no checklist', () => {
    expect(extractUncheckedChecklistItems('no checklist here')).toEqual([]);
  });

  it('ignores checked items', () => {
    expect(extractUncheckedChecklistItems('- [x] done item')).toEqual([]);
  });

  it('catches unchecked items with indentation', () => {
    const spec = '  - [ ] indented item\n    - [ ] deeper item';
    const items = extractUncheckedChecklistItems(spec);
    expect(items).toEqual(['indented item', 'deeper item']);
  });

  it('handles mixed checked/unchecked', () => {
    const spec = '- [x] done\n- [ ] pending\n- [x] also done\n- [ ] also pending';
    expect(extractUncheckedChecklistItems(spec)).toEqual(['pending', 'also pending']);
  });

  it('returns empty for all checked', () => {
    const spec = '- [x] a\n- [x] b';
    expect(extractUncheckedChecklistItems(spec)).toEqual([]);
  });
});

// ─── slug normalization edge cases ───

describe('normalizeSlug edge cases', () => {
  it('normalizes unicode to hyphens and strips leading hyphens', () => {
    // unicode chars → hyphens → collapsed → leading hyphen stripped
    expect(normalizeSlug('한글-slug')).toBe('slug');
  });

  it('normalizes underscores to hyphens', () => {
    expect(normalizeSlug('my_cool_slug')).toBe('my-cool-slug');
  });

  it('normalizes spaces to hyphens', () => {
    expect(normalizeSlug('my cool slug')).toBe('my-cool-slug');
  });

  it('collapses multiple hyphens', () => {
    expect(normalizeSlug('too---many---hyphens')).toBe('too-many-hyphens');
  });

  it('strips leading/trailing hyphens', () => {
    expect(normalizeSlug('-leading-trailing-')).toBe('leading-trailing');
  });

  it('lowercases', () => {
    expect(normalizeSlug('MySlug')).toBe('myslug');
  });

  it('handles empty after normalization', () => {
    const result = normalizeSlug('!!!');
    expect(result).toBe('');
  });
});

describe('validateSlug edge cases', () => {
  it('rejects empty slug', () => {
    expect(() => {
      validateSlug('');
    }).toThrow('slug cannot be empty');
  });

  it('rejects uppercase', () => {
    expect(() => {
      validateSlug('MySlug');
    }).toThrow('lowercase kebab-case');
  });

  it('rejects leading hyphen', () => {
    expect(() => {
      validateSlug('-slug');
    }).toThrow('lowercase kebab-case');
  });

  it('rejects trailing hyphen', () => {
    expect(() => {
      validateSlug('slug-');
    }).toThrow('lowercase kebab-case');
  });

  it('accepts valid kebab-case', () => {
    expect(() => {
      validateSlug('my-valid-slug');
    }).not.toThrow();
  });

  it('accepts single word', () => {
    expect(() => {
      validateSlug('slug');
    }).not.toThrow();
  });

  it('accepts numbers', () => {
    expect(() => {
      validateSlug('fix-123');
    }).not.toThrow();
  });
});

// ─── target resolution edge cases ───

describe('resolveDoneTargetMatches edge cases', () => {
  const tasks: WorkspaceTaskSummary[] = [
    { id: 'task-1', path: '.sduck/sduck-workspace/task-1', status: 'REVIEW_READY', slug: 'foo' },
    { id: 'task-2', path: '.sduck/sduck-workspace/task-2', status: 'IN_PROGRESS', slug: 'bar' },
    { id: 'task-3', path: '.sduck/sduck-workspace/task-3', status: 'REVIEW_READY', slug: 'baz' },
  ];

  it('returns only REVIEW_READY for undefined target', () => {
    const result = resolveDoneTargetMatches(tasks, undefined);
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.id)).toEqual(['task-1', 'task-3']);
  });

  it('returns only REVIEW_READY for empty string target', () => {
    const result = resolveDoneTargetMatches(tasks, '');
    expect(result).toHaveLength(2);
  });

  it('returns only REVIEW_READY for whitespace target', () => {
    const result = resolveDoneTargetMatches(tasks, '   ');
    expect(result).toHaveLength(2);
  });

  it('matches by id even if not REVIEW_READY', () => {
    // done workflow will reject non-REVIEW_READY later, but resolution finds it
    const result = resolveDoneTargetMatches(tasks, 'task-2');
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('task-2');
  });

  it('returns empty for non-existent target', () => {
    const result = resolveDoneTargetMatches(tasks, 'nonexistent');
    expect(result).toHaveLength(0);
  });
});

describe('filterDoneCandidates', () => {
  it('filters only REVIEW_READY tasks', () => {
    const tasks: WorkspaceTaskSummary[] = [
      { id: 't1', path: 'p1', status: 'REVIEW_READY' },
      { id: 't2', path: 'p2', status: 'IN_PROGRESS' },
      { id: 't3', path: 'p3', status: 'DONE' },
      { id: 't4', path: 'p4', status: 'ABANDONED' },
    ];
    const result = filterDoneCandidates(tasks);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('t1');
  });
});

// ─── archive edge cases ───

describe('deriveArchiveMonth edge cases', () => {
  it('extracts YYYY-MM from ISO timestamp', () => {
    expect(deriveArchiveMonth('2026-03-24T04:49:19Z')).toBe('2026-03');
  });

  it('extracts from date-only string', () => {
    expect(deriveArchiveMonth('2026-12-01')).toBe('2026-12');
  });
});

describe('extractCompletedAt edge cases', () => {
  it('returns null for "null" value', () => {
    expect(extractCompletedAt('completed_at: null')).toBeNull();
  });

  it('returns null when field is missing', () => {
    expect(extractCompletedAt('status: DONE')).toBeNull();
  });

  it('extracts valid timestamp', () => {
    expect(extractCompletedAt('completed_at: 2026-03-24T04:49:19Z')).toBe('2026-03-24T04:49:19Z');
  });

  it('trims whitespace', () => {
    expect(extractCompletedAt('completed_at:   2026-03-24T04:49:19Z  ')).toBe(
      '2026-03-24T04:49:19Z',
    );
  });
});

// ─── reopen edge cases ───

describe('getCurrentCycle edge cases', () => {
  it('returns 1 when cycle field is missing', () => {
    expect(getCurrentCycle('status: DONE\nid: t1')).toBe(1);
  });

  it('parses existing cycle', () => {
    expect(getCurrentCycle('cycle: 3\nstatus: DONE')).toBe(3);
  });

  it('returns 1 for non-numeric cycle', () => {
    // regex \d+ won't match non-digits
    expect(getCurrentCycle('cycle: abc\nstatus: DONE')).toBe(1);
  });
});

describe('buildReopenedMeta edge cases', () => {
  const baseMeta = [
    'id: t1',
    'cycle: 1',
    '',
    'status: DONE',
    '',
    'spec:',
    '  approved: true',
    '  approved_at: 2026-03-24T00:00:00Z',
    '',
    'plan:',
    '  approved: true',
    '  approved_at: 2026-03-24T00:00:00Z',
    '',
    'steps:',
    '  total: 5',
    '  completed: [1, 2, 3, 4, 5]',
    '',
    'completed_at: 2026-03-24T04:00:00Z',
  ].join('\n');

  it('resets all fields correctly', () => {
    const result = buildReopenedMeta(baseMeta, 2);
    expect(result).toContain('cycle: 2');
    expect(result).toContain('status: PENDING_SPEC_APPROVAL');
    expect(result).toContain('approved: false');
    expect(result).toContain('approved_at: null');
    expect(result).toContain('total: null');
    expect(result).toContain('completed: []');
    expect(result).toContain('completed_at: null');
  });

  it('inserts cycle field if missing', () => {
    const noCycle = baseMeta.replace('cycle: 1\n\n', '');
    const result = buildReopenedMeta(noCycle, 2);
    expect(result).toContain('cycle: 2');
    expect(result).toContain('status: PENDING_SPEC_APPROVAL');
  });
});

// ─── plan step counting edge cases ───

describe('countPlanSteps edge cases', () => {
  it('counts ## Step headers', () => {
    expect(countPlanSteps('## Step 1. First\n## Step 2. Second')).toBe(2);
  });

  it('counts ### Step headers', () => {
    expect(countPlanSteps('### Step 1. First\n### Step 2. Second')).toBe(2);
  });

  it('ignores # Step (h1)', () => {
    expect(countPlanSteps('# Step 1. First')).toBe(0);
  });

  it('ignores #### Step (h4)', () => {
    expect(countPlanSteps('#### Step 1. First')).toBe(0);
  });

  it('rejects step without period', () => {
    expect(countPlanSteps('## Step 1 No Period')).toBe(0);
  });

  it('rejects untitled step header', () => {
    expect(countPlanSteps('## Step 1.')).toBe(0);
  });

  it('handles non-sequential numbers', () => {
    expect(countPlanSteps('## Step 1. A\n## Step 5. B\n## Step 10. C')).toBe(3);
  });

  it('returns 0 for empty content', () => {
    expect(countPlanSteps('')).toBe(0);
  });
});

// ─── workspace ID generation ───

describe('createWorkspaceId edge cases', () => {
  it('generates correct format', () => {
    const date = new Date('2026-01-05T08:03:00Z');
    const id = createWorkspaceId(date, 'fix', 'my-bug');
    expect(id).toBe('20260105-0803-fix-my-bug');
  });

  it('pads single-digit months and days', () => {
    const date = new Date('2026-03-01T00:00:00Z');
    const id = createWorkspaceId(date, 'feature', 'test');
    expect(id).toBe('20260301-0000-feature-test');
  });
});
