import { describe, expect, it } from 'vitest';

import {
  approvePlanInMeta,
  approveSpecInMeta,
  completeStepInMeta,
  markDoneInMeta,
  parseTaskMeta,
  renderTaskMeta,
  reopenMeta,
} from '../../src/core/task-meta.js';

const sampleMeta = [
  'id: 20260507-0436-refactor-architecture-deepening',
  'type: refactor',
  'slug: architecture-deepening',
  'created_at: 2026-05-07T04:36:29Z',
  'updated_at: 2026-05-07T04:36:29Z',
  '',
  'branch: work/refactor/architecture-deepening',
  'base_branch: main',
  'worktree_path: .sduck-worktrees/20260507-0436-refactor-architecture-deepening',
  '',
  'status: PENDING_SPEC_APPROVAL',
  '',
  'spec:',
  '  approved: false',
  '  approved_at: null',
  '',
  'plan:',
  '  approved: false',
  '  approved_at: null',
  '',
  'steps:',
  '  total: null',
  '  completed: []',
  '',
  'completed_at: null',
  '',
].join('\n');

describe('task meta Module', () => {
  it('round-trips branch values and null values', () => {
    const meta = parseTaskMeta(sampleMeta);

    expect(meta.branch).toBe('work/refactor/architecture-deepening');
    expect(meta.baseBranch).toBe('main');
    expect(meta.completedAt).toBeNull();
    expect(meta.steps).toEqual({ completed: [], total: null });

    expect(parseTaskMeta(renderTaskMeta(meta))).toEqual(meta);

    const nullMeta = parseTaskMeta(
      sampleMeta
        .replace('branch: work/refactor/architecture-deepening', 'branch: null')
        .replace('base_branch: main', 'base_branch: null')
        .replace(
          'worktree_path: .sduck-worktrees/20260507-0436-refactor-architecture-deepening',
          'worktree_path: null',
        ),
    );

    expect(nullMeta.branch).toBeNull();
    expect(nullMeta.baseBranch).toBeNull();
    expect(nullMeta.worktreePath).toBeNull();
    expect(parseTaskMeta(renderTaskMeta(nullMeta))).toEqual(nullMeta);
  });

  it('mutates spec and plan approval blocks through typed helpers', () => {
    const specApproved = approveSpecInMeta(parseTaskMeta(sampleMeta), '2026-05-07T04:40:00Z');
    expect(specApproved.status).toBe('SPEC_APPROVED');
    expect(specApproved.spec).toEqual({ approved: true, approvedAt: '2026-05-07T04:40:00Z' });

    const planApproved = approvePlanInMeta(specApproved, '2026-05-07T04:41:00Z', 2);
    expect(planApproved.status).toBe('IN_PROGRESS');
    expect(planApproved.plan).toEqual({ approved: true, approvedAt: '2026-05-07T04:41:00Z' });
    expect(planApproved.steps).toEqual({ completed: [], total: 2 });
  });

  it('handles steps completion and invalid completed step values', () => {
    const planned = approvePlanInMeta(
      approveSpecInMeta(parseTaskMeta(sampleMeta), '2026-05-07T04:40:00Z'),
      '2026-05-07T04:41:00Z',
      2,
    );

    const withSteps = completeStepInMeta(
      completeStepInMeta(planned, 2, '2026-05-07T04:42:00Z'),
      1,
      '2026-05-07T04:43:00Z',
    );

    expect(withSteps.steps.completed).toEqual([1, 2]);
    expect(renderTaskMeta(withSteps)).toContain('  completed: [1, 2]');
    expect(() => parseTaskMeta(renderTaskMeta(withSteps).replace('[1, 2]', '[1, nope]'))).toThrow(
      'Invalid completed step value: nope',
    );
  });

  it('sets and resets completed_at across done and reopen transitions', () => {
    const planned = approvePlanInMeta(
      approveSpecInMeta(parseTaskMeta(sampleMeta), '2026-05-07T04:40:00Z'),
      '2026-05-07T04:41:00Z',
      1,
    );
    const done = markDoneInMeta(
      { ...completeStepInMeta(planned, 1, '2026-05-07T04:42:00Z'), status: 'REVIEW_READY' },
      '2026-05-07T04:50:00Z',
    );

    expect(done.completedAt).toBe('2026-05-07T04:50:00Z');
    expect(done.status).toBe('DONE');

    const reopenedDone = reopenMeta(done, 2);
    expect(reopenedDone.status).toBe('PENDING_SPEC_APPROVAL');
    expect(reopenedDone.cycle).toBe(2);
    expect(reopenedDone.completedAt).toBeNull();
    expect(reopenedDone.spec.approved).toBe(false);
    expect(reopenedDone.plan.approved).toBe(false);
    expect(reopenedDone.steps).toEqual({ completed: [], total: null });
  });

  it('preserves approvals and steps when reopening REVIEW_READY work', () => {
    const reviewReady = {
      ...approvePlanInMeta(
        approveSpecInMeta(parseTaskMeta(sampleMeta), '2026-05-07T04:40:00Z'),
        '2026-05-07T04:41:00Z',
        1,
      ),
      status: 'REVIEW_READY',
    };

    const reopened = reopenMeta(reviewReady, 3);
    expect(reopened.status).toBe('IN_PROGRESS');
    expect(reopened.cycle).toBe(3);
    expect(reopened.spec.approved).toBe(true);
    expect(reopened.plan.approved).toBe(true);
    expect(reopened.steps.total).toBe(1);
  });
});
