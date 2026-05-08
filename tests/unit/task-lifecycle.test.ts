import { describe, expect, it } from 'vitest';

import {
  assertTransition,
  getAllowedStatuses,
  INITIAL_TASK_STATUS,
  transitionStatus,
} from '../../src/core/task-lifecycle.js';

describe('task lifecycle Module', () => {
  it('defines the initial status and valid transition table', () => {
    expect(INITIAL_TASK_STATUS).toBe('PENDING_SPEC_APPROVAL');
    expect(transitionStatus('PENDING_SPEC_APPROVAL', 'approve-spec')).toBe('SPEC_APPROVED');
    expect(transitionStatus('SPEC_APPROVED', 'approve-plan')).toBe('IN_PROGRESS');
    expect(transitionStatus('IN_PROGRESS', 'record-step')).toBe('IN_PROGRESS');
    expect(transitionStatus('IN_PROGRESS', 'mark-review-ready')).toBe('REVIEW_READY');
    expect(transitionStatus('REVIEW_READY', 'mark-done')).toBe('DONE');
    expect(transitionStatus('REVIEW_READY', 'reopen')).toBe('IN_PROGRESS');
    expect(transitionStatus('DONE', 'reopen')).toBe('PENDING_SPEC_APPROVAL');
    expect(transitionStatus('IN_PROGRESS', 'abandon')).toBe('ABANDONED');
  });

  it('rejects direct done from in-progress work', () => {
    expect(() => {
      assertTransition('IN_PROGRESS', 'mark-done', 'work-1');
    }).toThrow('Expected: REVIEW_READY');
  });

  it('keeps abandon status rules in one Module', () => {
    expect(getAllowedStatuses('abandon')).toEqual([
      'PENDING_SPEC_APPROVAL',
      'PENDING_PLAN_APPROVAL',
      'SPEC_APPROVED',
      'IN_PROGRESS',
      'REVIEW_READY',
    ]);
    expect(() => {
      assertTransition('DONE', 'abandon', 'work-1');
    }).toThrow('Cannot abandon');
  });
});
