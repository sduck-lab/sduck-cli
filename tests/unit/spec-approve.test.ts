import { describe, expect, it } from 'vitest';

import {
  createSpecApprovedAt,
  filterApprovalCandidates,
  resolveTargetCandidates,
  validateSpecApprovalTargets,
} from '../../src/core/spec-approve.js';
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

describe('sortTasksByRecency', () => {
  it('sorts tasks with newest first', () => {
    const tasks = sortTasksByRecency([
      createTask('older', 'PENDING_SPEC_APPROVAL', '2026-03-19T01:00:00Z'),
      createTask('newer', 'PENDING_SPEC_APPROVAL', '2026-03-19T02:00:00Z'),
    ]);

    expect(tasks.map((task) => task.id)).toEqual(['newer', 'older']);
  });
});

describe('filterApprovalCandidates', () => {
  it('keeps only spec-pending tasks', () => {
    const tasks = filterApprovalCandidates([
      createTask('a', 'PENDING_SPEC_APPROVAL', '2026-03-19T01:00:00Z'),
      createTask('b', 'SPEC_APPROVED', '2026-03-19T02:00:00Z'),
    ]);

    expect(tasks.map((task) => task.id)).toEqual(['a']);
  });
});

describe('resolveTargetCandidates', () => {
  const tasks = [
    createTask(
      '20260319-0100-feature-login',
      'PENDING_SPEC_APPROVAL',
      '2026-03-19T01:00:00Z',
      'login',
    ),
    createTask(
      '20260319-0200-feature-login-api',
      'PENDING_SPEC_APPROVAL',
      '2026-03-19T02:00:00Z',
      'login-api',
    ),
  ];

  it('returns all approval candidates when no target is given', () => {
    expect(resolveTargetCandidates(tasks, undefined)).toHaveLength(2);
  });

  it('matches an exact id', () => {
    expect(
      resolveTargetCandidates(tasks, '20260319-0100-feature-login').map((task) => task.id),
    ).toEqual(['20260319-0100-feature-login']);
  });

  it('matches by exact slug', () => {
    expect(resolveTargetCandidates(tasks, 'login').map((task) => task.id)).toEqual([
      '20260319-0100-feature-login',
    ]);
  });

  it('does not match by id suffix', () => {
    expect(resolveTargetCandidates(tasks, 'feature-login')).toEqual([]);
  });
});

describe('validateSpecApprovalTargets', () => {
  it('accepts pending spec approval tasks', () => {
    expect(() => {
      validateSpecApprovalTargets([
        createTask('a', 'PENDING_SPEC_APPROVAL', '2026-03-19T01:00:00Z'),
      ]);
    }).not.toThrow();
  });

  it('rejects empty task lists', () => {
    expect(() => {
      validateSpecApprovalTargets([]);
    }).toThrow('No approvable spec tasks found.');
  });
});

describe('createSpecApprovedAt', () => {
  it('returns a UTC timestamp with trailing Z', () => {
    expect(createSpecApprovedAt(new Date('2026-03-19T03:19:08.123Z'))).toBe('2026-03-19T03:19:08Z');
  });
});
