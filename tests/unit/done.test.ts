import { describe, expect, it } from 'vitest';

import {
  createTaskCompletedAt,
  extractTaskEvalCriteriaLabels,
  extractUncheckedChecklistItems,
  filterDoneCandidates,
  parseCompletedStepNumbers,
  resolveDoneTargetMatches,
  validateDoneMetaContent,
} from '../../src/core/done.js';

import type { WorkspaceTaskSummary } from '../../src/core/workspace.js';

function createTask(
  id: string,
  status: string,
  createdAt: string,
  slug?: string,
): WorkspaceTaskSummary {
  const task: WorkspaceTaskSummary = {
    createdAt,
    id,
    path: `.sduck/sduck-workspace/${id}`,
    status,
  };

  if (slug !== undefined) {
    task.slug = slug;
  }

  return task;
}

describe('filterDoneCandidates', () => {
  it('keeps only REVIEW_READY tasks', () => {
    const tasks = filterDoneCandidates([
      createTask('a', 'REVIEW_READY', '2026-03-19T01:00:00Z'),
      createTask('b', 'DONE', '2026-03-19T02:00:00Z'),
      createTask('c', 'IN_PROGRESS', '2026-03-19T03:00:00Z'),
    ]);

    expect(tasks.map((task) => task.id)).toEqual(['a']);
  });

  it('rejects IN_PROGRESS tasks (must go through review ready first)', () => {
    const tasks = filterDoneCandidates([createTask('a', 'IN_PROGRESS', '2026-03-19T01:00:00Z')]);

    expect(tasks).toEqual([]);
  });
});

describe('resolveDoneTargetMatches', () => {
  const tasks = [
    createTask('20260319-0100-feature-login', 'REVIEW_READY', '2026-03-19T01:00:00Z', 'login'),
    createTask('20260319-0200-feature-profile', 'DONE', '2026-03-19T02:00:00Z', 'profile'),
  ];

  it('returns REVIEW_READY candidates when no target is given', () => {
    expect(resolveDoneTargetMatches(tasks, undefined).map((task) => task.id)).toEqual([
      '20260319-0100-feature-login',
    ]);
  });

  it('matches an exact id only', () => {
    expect(
      resolveDoneTargetMatches(tasks, '20260319-0100-feature-login').map((task) => task.id),
    ).toEqual(['20260319-0100-feature-login']);
  });

  it('matches an exact slug only', () => {
    expect(resolveDoneTargetMatches(tasks, 'profile').map((task) => task.id)).toEqual([
      '20260319-0200-feature-profile',
    ]);
  });

  it('does not match by suffix', () => {
    expect(resolveDoneTargetMatches(tasks, 'feature-login')).toEqual([]);
  });
});

describe('extractUncheckedChecklistItems', () => {
  it('returns unchecked checklist items', () => {
    const specContent = ['- [x] AC1: done', '- [ ] AC2: pending', '- [ ] AC3: more work'].join(
      '\n',
    );

    expect(extractUncheckedChecklistItems(specContent)).toEqual(['AC2: pending', 'AC3: more work']);
  });
});

describe('extractTaskEvalCriteriaLabels', () => {
  it('returns criteria labels from task eval asset content', () => {
    const taskEvalContent = [
      'task_evaluation:',
      '  criteria:',
      '    - key: spec_alignment',
      '      label: spec alignment',
      '    - key: maintainability',
      '      label: maintainability',
    ].join('\n');

    expect(extractTaskEvalCriteriaLabels(taskEvalContent)).toEqual([
      'spec alignment',
      'maintainability',
    ]);
  });
});

describe('parseCompletedStepNumbers', () => {
  it('parses a single-line step list', () => {
    expect(parseCompletedStepNumbers('1, 2, 3')).toEqual([1, 2, 3]);
  });

  it('returns an empty list for an empty value', () => {
    expect(parseCompletedStepNumbers('')).toEqual([]);
  });

  it('rejects invalid step values', () => {
    expect(() => parseCompletedStepNumbers('1, nope')).toThrow('Invalid completed step value');
  });
});

describe('validateDoneMetaContent', () => {
  it('accepts fully completed steps', () => {
    expect(() => {
      validateDoneMetaContent(['steps:', '  total: 3', '  completed: [1, 2, 3]'].join('\n'));
    }).not.toThrow();
  });

  it('rejects null total', () => {
    expect(() => {
      validateDoneMetaContent(['steps:', '  total: null', '  completed: []'].join('\n'));
    }).toThrow('steps.total is null');
  });

  it('rejects incomplete steps', () => {
    expect(() => {
      validateDoneMetaContent(['steps:', '  total: 3', '  completed: [1, 3]'].join('\n'));
    }).toThrow('Missing steps: 2');
  });

  it('rejects duplicate steps', () => {
    expect(() => {
      validateDoneMetaContent(['steps:', '  total: 3', '  completed: [1, 2, 2]'].join('\n'));
    }).toThrow('duplicate completed step numbers');
  });

  it('rejects out-of-range steps', () => {
    expect(() => {
      validateDoneMetaContent(['steps:', '  total: 2', '  completed: [1, 3]'].join('\n'));
    }).toThrow('out-of-range completed step number: 3');
  });
});

describe('createTaskCompletedAt', () => {
  it('returns a UTC timestamp with trailing Z', () => {
    expect(createTaskCompletedAt(new Date('2026-03-19T08:01:02.999Z'))).toBe(
      '2026-03-19T08:01:02Z',
    );
  });
});
