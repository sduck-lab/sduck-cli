import { describe, expect, it } from 'vitest';

import {
  countPlanSteps,
  createPlanApprovedAt,
  filterPlanApprovalCandidates,
  resolvePlanApprovalCandidates,
  validatePlanHasSteps,
} from '../../src/core/plan-approve.js';
import { sortTasksByRecency, type WorkspaceTaskSummary } from '../../src/core/workspace.js';

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

describe('filterPlanApprovalCandidates', () => {
  it('keeps only spec-approved tasks', () => {
    const tasks = filterPlanApprovalCandidates([
      createTask('a', 'SPEC_APPROVED', '2026-03-19T01:00:00Z'),
      createTask('b', 'PENDING_SPEC_APPROVAL', '2026-03-19T02:00:00Z'),
    ]);

    expect(tasks.map((task) => task.id)).toEqual(['a']);
  });
});

describe('resolvePlanApprovalCandidates', () => {
  const tasks = [
    createTask('20260319-0100-feature-login', 'SPEC_APPROVED', '2026-03-19T01:00:00Z', 'login'),
    createTask(
      '20260319-0200-feature-login-api',
      'SPEC_APPROVED',
      '2026-03-19T02:00:00Z',
      'login-api',
    ),
  ];

  it('returns all plan approval candidates when no target is given', () => {
    expect(resolvePlanApprovalCandidates(tasks, undefined)).toHaveLength(2);
  });

  it('matches an exact id', () => {
    expect(
      resolvePlanApprovalCandidates(tasks, '20260319-0100-feature-login').map((task) => task.id),
    ).toEqual(['20260319-0100-feature-login']);
  });

  it('matches by exact slug', () => {
    expect(resolvePlanApprovalCandidates(tasks, 'login').map((task) => task.id)).toEqual([
      '20260319-0100-feature-login',
    ]);
  });

  it('does not match by id suffix', () => {
    expect(resolvePlanApprovalCandidates(tasks, 'feature-login')).toEqual([]);
  });
});

describe('countPlanSteps', () => {
  it('counts only valid titled step headers', () => {
    const content = ['# Plan', '', '## Step 1. First', '## Step 2. Second'].join('\n');
    expect(countPlanSteps(content)).toBe(2);
  });

  it('ignores untitled step headers', () => {
    const content = ['# Plan', '', '## Step 1.', '## Step 2. Second'].join('\n');
    expect(countPlanSteps(content)).toBe(1);
  });
});

describe('validatePlanHasSteps', () => {
  it('accepts valid titled steps', () => {
    expect(() => {
      validatePlanHasSteps('## Step 1. First');
    }).not.toThrow();
  });

  it('rejects plans without valid titled steps', () => {
    expect(() => {
      validatePlanHasSteps('## Step 1.');
    }).toThrow('Plan does not contain any valid');
  });
});

describe('createPlanApprovedAt', () => {
  it('returns a UTC timestamp with trailing Z', () => {
    expect(createPlanApprovedAt(new Date('2026-03-19T03:35:52.123Z'))).toBe('2026-03-19T03:35:52Z');
  });
});

describe('sortTasksByRecency', () => {
  it('sorts plan approval tasks with newest first', () => {
    const tasks = sortTasksByRecency([
      createTask('older', 'SPEC_APPROVED', '2026-03-19T01:00:00Z'),
      createTask('newer', 'SPEC_APPROVED', '2026-03-19T02:00:00Z'),
    ]);

    expect(tasks.map((task) => task.id)).toEqual(['newer', 'older']);
  });
});
