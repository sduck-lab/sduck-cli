import { describe, expect, it } from 'vitest';

import {
  renderMinimalPlan,
  renderMinimalSpec,
  type FastTrackApprovalResult,
  type FastTrackResult,
} from '../../src/core/fast-track.js';

describe('renderMinimalSpec', () => {
  it('renders a minimal spec with required sections and checklist items', () => {
    const spec = renderMinimalSpec('feature', 'login-flow');

    expect(spec).toContain('# [feature] login flow');
    expect(spec).toContain('## 목표');
    expect(spec).toContain('## 범위');
    expect(spec).toContain('## 제외 범위');
    expect(spec).toContain('## 완료 조건');
    expect(spec).toContain('- [ ] 핵심 동작이 구현된다');
  });
});

describe('renderMinimalPlan', () => {
  it('renders a minimal plan with valid step headers', () => {
    const plan = renderMinimalPlan('login-flow');

    expect(plan).toContain('# Plan');
    expect(plan).toContain('## Step 1. login flow 요구사항 반영');
    expect(plan).toContain('## Step 2. 검증과 마무리');
    expect(plan).toContain('npm run build');
  });
});

describe('FastTrackResult', () => {
  it('supports the pending spec state after non-interactive creation', () => {
    const result: FastTrackResult = {
      failed: [],
      nextStatus: 'PENDING_SPEC_APPROVAL',
      path: '.sduck/sduck-workspace/20260319-0900-feature-login-flow',
      planCreated: true,
      specCreated: true,
      succeeded: [
        { note: 'created minimal spec and plan', taskId: '20260319-0900-feature-login-flow' },
      ],
      taskId: '20260319-0900-feature-login-flow',
    };

    expect(result.nextStatus).toBe('PENDING_SPEC_APPROVAL');
    expect(result.specCreated).toBe(true);
    expect(result.planCreated).toBe(true);
  });
});

describe('FastTrackApprovalResult', () => {
  it('supports the in-progress state after bundled approval', () => {
    const result: FastTrackApprovalResult = {
      approved: true,
      failed: [],
      nextStatus: 'IN_PROGRESS',
      succeeded: [{ note: 'approved minimal spec', taskId: '20260319-0900-feature-login-flow' }],
      taskId: '20260319-0900-feature-login-flow',
    };

    expect(result.approved).toBe(true);
    expect(result.nextStatus).toBe('IN_PROGRESS');
  });
});
